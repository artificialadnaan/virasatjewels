"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { ProductWithImages } from "@/types";

interface AddToCartButtonProps {
  product: ProductWithImages;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const isSoldOut = product.stockQuantity === 0;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function addToCart() {
    if (isSoldOut || processing) return;

    setProcessing(true);

    try {
      const primaryImage = product.images.sort(
        (a, b) => a.position - b.position
      )[0];

      addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: primaryImage?.url ?? "",
        quantity,
        maxQuantity: product.stockQuantity,
      });

      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setProcessing(false);
      }, 2000);
    } catch {
      setProcessing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity selector */}
      {!isSoldOut && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-charcoal-light">Quantity</span>
          <div className="flex items-center border border-gold/40 rounded-sm overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-cream transition-colors text-lg leading-none"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className="w-10 text-center text-sm text-charcoal select-none">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity((q) => Math.min(product.stockQuantity, q + 1))
              }
              className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-cream transition-colors text-lg leading-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-xs text-charcoal-light">
            {product.stockQuantity} available
          </span>
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={addToCart}
        disabled={isSoldOut || processing}
        className={`flex items-center justify-center gap-2 w-full py-3.5 text-sm font-medium uppercase tracking-widest rounded-sm transition-all duration-300 ${
          isSoldOut
            ? "bg-charcoal/20 text-charcoal-light cursor-not-allowed"
            : added
            ? "bg-gold text-charcoal"
            : "bg-burgundy text-cream hover:bg-burgundy-dark"
        }`}
      >
        <ShoppingBag className="w-4 h-4" />
        {isSoldOut ? "Sold Out" : added ? "Added to Cart" : "Add to Cart"}
      </button>
    </div>
  );
}
