import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ClearCartOnMount from "./ClearCartOnMount";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: session_id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  const subtotal = parseFloat(order.subtotal.toString());
  const shippingCost = parseFloat(order.shippingCost.toString());
  const total = parseFloat(order.total.toString());

  const shippingAddress = order.shippingAddress as {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Client component to clear cart */}
      <ClearCartOnMount />

      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-charcoal mb-2">Order Confirmed!</h1>
        <p className="text-charcoal-light">
          Thank you for your order. We&apos;ll send a confirmation to{" "}
          <span className="text-charcoal font-medium">{order.email}</span>.
        </p>
      </div>

      {/* Order card */}
      <div className="bg-white rounded-lg border border-gold/20 overflow-hidden">
        {/* Order number */}
        <div className="bg-burgundy px-6 py-4 flex items-center justify-between">
          <span className="text-cream/80 text-sm">Order Number</span>
          <span className="font-serif text-gold tracking-wide">{order.orderNumber}</span>
        </div>

        {/* Items */}
        <div className="divide-y divide-gold/10">
          {order.items.map((item) => {
            const price = parseFloat(item.priceAtTime.toString());
            return (
              <div key={item.id} className="flex gap-4 px-6 py-4">
                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-cream border border-gold/20">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-cream" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal-light mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-charcoal flex-shrink-0">
                  {formatPrice(price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-gold/20 px-6 py-4 space-y-2 bg-cream/40">
          <div className="flex justify-between text-sm text-charcoal">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-charcoal">
            <span>Shipping</span>
            <span>{formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-serif text-base text-charcoal border-t border-gold/20 pt-2 mt-2">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Shipping address */}
        {(shippingAddress.line1 || shippingAddress.city) && (
          <div className="border-t border-gold/20 px-6 py-4">
            <p className="text-xs uppercase tracking-widest text-charcoal-light font-medium mb-2">
              Ships To
            </p>
            <address className="not-italic text-sm text-charcoal leading-relaxed">
              {order.name && <p>{order.name}</p>}
              {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              {(shippingAddress.city || shippingAddress.state || shippingAddress.postal_code) && (
                <p>
                  {[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {shippingAddress.country && <p>{shippingAddress.country}</p>}
            </address>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="inline-block px-8 py-3 bg-burgundy text-cream font-medium rounded hover:bg-burgundy-dark transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
