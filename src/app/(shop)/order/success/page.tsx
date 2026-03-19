import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
    select: { orderNumber: true, email: true },
  });

  if (!order) {
    notFound();
  }

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
        <h1 className="font-serif text-3xl text-charcoal mb-2">
          Order #{order.orderNumber} confirmed!
        </h1>
        <p className="text-charcoal-light">
          A receipt has been sent to{" "}
          <span className="text-charcoal font-medium">{order.email}</span>.
        </p>
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
