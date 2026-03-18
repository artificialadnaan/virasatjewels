import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCheckoutRateLimit, rateLimit } from "@/lib/rate-limit";

interface CreateSessionItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success } = await rateLimit(getCheckoutRateLimit(), ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { items, email } = body as { items: CreateSessionItem[]; email: string };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Fetch fresh product data
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found or unavailable`, productId: item.productId },
          { status: 400 }
        );
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} available.`,
            productId: item.productId,
            available: product.stockQuantity,
          },
          { status: 400 }
        );
      }
    }

    // Build Stripe line items
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const priceInCents = Math.round(parseFloat(product.price.toString()) * 100);
      const image = product.images[0]?.url;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            ...(image ? { images: [image] } : {}),
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    });

    // Shipping flat rate
    const shippingRateCents = Math.round(
      parseFloat(process.env.SHIPPING_FLAT_RATE ?? "9.99") * 100
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: email,
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingRateCents, currency: "usd" },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/create-session]", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
