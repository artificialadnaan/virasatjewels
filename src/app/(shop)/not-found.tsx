import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-gold text-xs uppercase tracking-widest mb-4">
        404 &mdash; Page Not Found
      </p>
      <h1 className="font-serif text-4xl sm:text-5xl text-charcoal mb-4">
        This page doesn&apos;t exist
      </h1>
      <p className="text-charcoal-light text-sm max-w-md mb-8 leading-relaxed">
        The page you&apos;re looking for may have been moved, renamed, or no
        longer exists. Let&apos;s get you back to something beautiful.
      </p>
      <Link
        href="/products"
        className="px-8 py-3 bg-burgundy text-cream text-sm font-medium uppercase tracking-widest hover:bg-burgundy-dark transition-colors rounded-sm"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
