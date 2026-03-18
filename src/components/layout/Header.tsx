"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, ChevronDown } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { Category } from "@prisma/client";

interface HeaderProps {
  categories?: Category[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Shop", href: "/products" },
    { label: "About", href: "/about" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      {/* Desktop header */}
      <div className="hidden md:block bg-burgundy">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl text-gold tracking-wide hover:text-gold-light transition-colors"
          >
            VirasatJewels
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-8">
            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-cream/90 hover:text-gold transition-colors text-sm font-medium py-5">
                Categories
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-0 w-52 bg-white shadow-xl border border-gold/20 rounded-b-md overflow-hidden">
                  {categories.length > 0 ? (
                    <>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="block px-4 py-3 text-sm text-charcoal hover:bg-cream hover:text-burgundy transition-colors border-b border-gold/10 last:border-0"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        className="block px-4 py-3 text-sm font-medium text-burgundy hover:bg-cream transition-colors"
                      >
                        All Products
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/products"
                      className="block px-4 py-3 text-sm text-charcoal hover:bg-cream transition-colors"
                    >
                      All Products
                    </Link>
                  )}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-cream/90 hover:text-gold transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-cream/90 hover:text-gold transition-colors"
            aria-label={`Cart, ${mounted ? cartCount : 0} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-charcoal text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gold/20">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl text-burgundy tracking-wide"
          >
            VirasatJewels
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative text-charcoal"
              aria-label={`Cart, ${mounted ? cartCount : 0} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-charcoal text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="text-charcoal p-1"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <nav className="bg-white border-t border-gold/20 pb-4">
            <div className="px-4 py-2">
              <p className="text-xs uppercase tracking-widest text-charcoal-light font-medium py-2">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-charcoal hover:text-burgundy transition-colors border-b border-gold/10"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-charcoal hover:text-burgundy transition-colors border-b border-gold/10"
              >
                All Products
              </Link>
            </div>
            <div className="px-4 py-2 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-charcoal hover:text-burgundy transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
