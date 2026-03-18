"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import CartItem from "./CartItem";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { items, getTotal } = useCartStore();
  const total = getTotal();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Click outside to close
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-modal="true"
      role="dialog"
      aria-label="Shopping cart"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/50 transition-opacity" />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white flex flex-col shadow-2xl h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20 bg-burgundy">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-lg text-gold tracking-wide">
              Your Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-cream/80 hover:text-gold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-gold/40" />
              <p className="font-serif text-lg text-charcoal">
                Your cart is empty
              </p>
              <p className="text-sm text-charcoal-light">
                Discover our heritage jewelry collection.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-2 px-6 py-2 border border-burgundy text-burgundy text-sm font-medium rounded hover:bg-burgundy hover:text-cream transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gold/20 bg-cream">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-charcoal-light font-medium uppercase tracking-wide">
                Subtotal
              </span>
              <span className="font-serif text-lg text-charcoal">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-charcoal-light mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="flex gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex-1 text-center py-2.5 border border-burgundy text-burgundy text-sm font-medium rounded hover:bg-burgundy hover:text-cream transition-colors"
              >
                View Cart
              </Link>
              <button
                onClick={() => {
                  onClose();
                  router.push("/cart");
                }}
                className="flex-1 py-2.5 bg-burgundy text-cream text-sm font-medium rounded hover:bg-burgundy-dark transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
