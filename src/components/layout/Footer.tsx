import Link from "next/link";
import type { Category } from "@prisma/client";

interface FooterProps {
  categories?: Category[];
}

export default function Footer({ categories = [] }: FooterProps) {
  const quickLinks = [
    { label: "About", href: "/about" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <footer className="bg-cream border-t-2 border-gold/30">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-serif text-2xl text-burgundy tracking-wide block mb-3"
            >
              VirasatJewels
            </Link>
            <p className="text-sm text-charcoal-light leading-relaxed">
              Preserving centuries of South Asian craftsmanship — one piece at a
              time. Heritage jewelry for modern souls.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-serif text-base text-charcoal mb-4 border-b border-gold/30 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-light hover:text-burgundy transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-base text-charcoal mb-4 border-b border-gold/30 pb-2">
              Collections
            </h3>
            <ul className="space-y-2">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-sm text-charcoal-light hover:text-burgundy transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-charcoal-light hover:text-burgundy transition-colors"
                  >
                    All Jewelry
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-base text-charcoal mb-4 border-b border-gold/30 pb-2">
              Stay Connected
            </h3>
            <p className="text-sm text-charcoal-light mb-4">
              Receive new arrivals, heritage stories, and exclusive offers.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-charcoal-light">
            &copy; {new Date().getFullYear()} VirasatJewels. All rights
            reserved.
          </p>
          <p className="text-xs text-charcoal-light">
            Crafted with care &mdash; shipped with love.
          </p>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  return (
    <form
      action="/api/newsletter/subscribe"
      method="POST"
      className="flex flex-col gap-2"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="w-full px-3 py-2 text-sm border border-gold/40 rounded bg-white text-charcoal placeholder-charcoal-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition"
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-burgundy text-cream text-sm font-medium rounded hover:bg-burgundy-dark transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
}
