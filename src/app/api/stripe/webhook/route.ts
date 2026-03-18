import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { generateOrderNumber } from "@/lib/utils";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Idempotency: skip if already processed
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  // Parse items from metadata
  let metaItems: { productId: string; quantity: number }[] = [];
  try {
    metaItems = JSON.parse(session.metadata?.items ?? "[]");
  } catch {
    console.error("[webhook] failed to parse session metadata items");
    return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
  }

  if (metaItems.length === 0) {
    return NextResponse.json({ error: "No items in session metadata" }, { status: 400 });
  }

  // Fetch products
  const productIds = metaItems.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Retrieve line items for accurate prices
  const lineItemsPage = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  });
  const lineItems = lineItemsPage.data;

  // Build shipping address from Stripe
  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = {
    line1: shipping?.address?.line1 ?? "",
    line2: shipping?.address?.line2 ?? "",
    city: shipping?.address?.city ?? "",
    state: shipping?.address?.state ?? "",
    postal_code: shipping?.address?.postal_code ?? "",
    country: shipping?.address?.country ?? "",
  };

  const customerName = shipping?.name ?? session.customer_details?.name ?? "";
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? "";

  // Calculate financials (in dollars)
  const amountTotal = (session.amount_total ?? 0) / 100;
  const shippingCost = (session.shipping_cost?.amount_total ?? 0) / 100;
  const subtotal = amountTotal - shippingCost;

  const orderNumber = generateOrderNumber();

  // Transaction: create order + items + decrement stock
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        email: customerEmail,
        name: customerName,
        phone: session.customer_details?.phone ?? null,
        shippingAddress,
        subtotal,
        shippingCost,
        total: amountTotal,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        stripeSessionId: session.id,
        stripePaymentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
        items: {
          create: metaItems.map((meta) => {
            const product = productMap.get(meta.productId);
            // Find the price from Stripe line items for this product
            const stripeItem = lineItems.find((li) =>
              li.description === product?.name
            );
            const priceAtTime =
              stripeItem
                ? (stripeItem.amount_total / (stripeItem.quantity ?? 1)) / 100
                : parseFloat(product?.price?.toString() ?? "0");

            return {
              productId: meta.productId,
              quantity: meta.quantity,
              priceAtTime,
              name: product?.name ?? "Unknown product",
              image: product?.images[0]?.url ?? null,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Decrement stock with gte guard
    for (const meta of metaItems) {
      await tx.product.updateMany({
        where: {
          id: meta.productId,
          stockQuantity: { gte: meta.quantity },
        },
        data: {
          stockQuantity: { decrement: meta.quantity },
        },
      });
    }

    return newOrder;
  });

  // Fire-and-forget: send confirmation email
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "orders@virasatjewels.com",
      to: customerEmail,
      subject: `Order Confirmed — ${order.orderNumber}`,
      html: buildOrderEmailHtml(order, shippingAddress),
    });
  } catch (emailErr) {
    console.error("[webhook] failed to send confirmation email:", emailErr);
  }

  return NextResponse.json({ received: true });
}

function buildOrderEmailHtml(
  order: {
    orderNumber: string;
    total: number | { toString(): string };
    items: {
      name: string;
      quantity: number;
      priceAtTime: number | { toString(): string };
    }[];
  },
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }
): string {
  const total =
    typeof order.total === "number"
      ? order.total
      : parseFloat(order.total.toString());

  const itemRows = order.items
    .map((item) => {
      const price =
        typeof item.priceAtTime === "number"
          ? item.priceAtTime
          : parseFloat(item.priceAtTime.toString());
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8d8;text-align:right;">$${(price * item.quantity).toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;background:#FFF8F0;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8d8b0;">
    <div style="background:#800020;padding:24px 32px;">
      <h1 style="color:#C9A84C;font-family:serif;margin:0;font-size:24px;">VirasatJewels</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#2D2D2D;font-family:serif;">Order Confirmed</h2>
      <p style="color:#4A4A4A;">Thank you for your order! We'll notify you when it ships.</p>
      <p style="color:#2D2D2D;"><strong>Order Number:</strong> ${order.orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="border-bottom:2px solid #C9A84C;">
            <th style="text-align:left;padding:8px 0;color:#2D2D2D;">Item</th>
            <th style="text-align:center;padding:8px 0;color:#2D2D2D;">Qty</th>
            <th style="text-align:right;padding:8px 0;color:#2D2D2D;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="text-align:right;color:#2D2D2D;font-size:16px;"><strong>Total: $${total.toFixed(2)}</strong></p>
      <hr style="border:none;border-top:1px solid #f0e8d8;margin:24px 0;"/>
      <h3 style="color:#2D2D2D;font-family:serif;">Shipping To</h3>
      <p style="color:#4A4A4A;line-height:1.6;">
        ${shippingAddress.line1}<br/>
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br/>
        ${shippingAddress.country}
      </p>
    </div>
    <div style="background:#FFF8F0;padding:16px 32px;text-align:center;">
      <p style="color:#4A4A4A;font-size:12px;margin:0;">© ${new Date().getFullYear()} VirasatJewels. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
