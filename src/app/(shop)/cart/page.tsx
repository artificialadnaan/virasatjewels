"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = getTotal();
  const shippingCost = parseFloat(process.env.NEXT_PUBLIC_SHIPPING_FLAT_RATE ?? "9.99");
  const shipping = subtotal === 0 ? 0 : shippingCost;
  const total = subtotal + shipping;

  function validateEmail(value: string) {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return "";
  }

  async function handleCheckout() {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }
    setEmailError("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to start checkout. Please try again.");
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-gold/40" />
          <h1 className="font-serif text-3xl text-charcoal">Your cart is empty</h1>
          <p className="text-charcoal-light max-w-sm">
            Explore our heritage jewelry collection and add pieces you love.
          </p>
          <Link
            href="/products"
            className="mt-2 px-8 py-3 bg-burgundy text-cream font-medium rounded hover:bg-burgundy-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl text-charcoal mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gold/20 divide-y divide-gold/10">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 sm:p-5">
                {/* Image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-md overflow-hidden bg-cream border border-gold/20">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-light text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-serif text-base text-charcoal leading-snug">
                      {item.name}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="text-charcoal-light hover:text-burgundy transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gold font-medium mt-1">
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 rounded border border-gold/30 flex items-center justify-center text-charcoal hover:border-burgundy hover:text-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm text-charcoal w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        aria-label="Increase quantity"
                        className="w-8 h-8 rounded border border-gold/30 flex items-center justify-center text-charcoal hover:border-burgundy hover:text-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/products"
              className="text-sm text-burgundy hover:underline"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gold/20 p-5 sm:p-6 sticky top-24">
            <h2 className="font-serif text-xl text-charcoal mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-charcoal">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal">
                <span>Shipping</span>
                <span>
                  {subtotal === 0 ? "—" : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-gold/20 pt-3 flex justify-between font-medium text-charcoal text-base">
                <span className="font-serif">Total</span>
                <span className="font-serif">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Email input */}
            <div className="mt-6">
              <label
                htmlFor="checkout-email"
                className="block text-sm font-medium text-charcoal mb-1"
              >
                Email address
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(validateEmail(e.target.value));
                }}
                placeholder="you@example.com"
                className={`w-full px-3 py-2.5 rounded border text-sm text-charcoal placeholder:text-charcoal-light/60 focus:outline-none focus:ring-2 focus:ring-burgundy/30 transition-colors ${
                  emailError ? "border-red-400" : "border-gold/30 focus:border-burgundy"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
              <p className="mt-1 text-xs text-charcoal-light">
                Order confirmation will be sent here.
              </p>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-500 bg-red-50 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-5 w-full py-3 bg-burgundy text-cream font-medium rounded hover:bg-burgundy-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Redirecting to checkout..." : "Proceed to Checkout"}
            </button>

            <p className="mt-3 text-xs text-charcoal-light text-center">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
