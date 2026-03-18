"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-gold text-xs uppercase tracking-widest mb-4">
        Something went wrong
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-4">
        An error occurred
      </h1>
      <p className="text-charcoal-light text-sm max-w-md mb-8 leading-relaxed">
        {error.message ||
          "We encountered an unexpected error. Please try again or return to the shop."}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="px-8 py-3 bg-burgundy text-cream text-sm font-medium uppercase tracking-widest hover:bg-burgundy-dark transition-colors rounded-sm"
        >
          Try Again
        </button>
        <Link
          href="/products"
          className="px-8 py-3 border border-burgundy text-burgundy text-sm font-medium uppercase tracking-widest hover:bg-burgundy hover:text-cream transition-colors rounded-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
