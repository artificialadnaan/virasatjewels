"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="flex gap-3 py-4 border-b border-gold/20 last:border-0">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-cream border border-gold/20">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="80px"
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
          <p className="font-serif text-sm text-charcoal leading-snug line-clamp-2">
            {item.name}
          </p>
          <button
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name}`}
            className="flex-shrink-0 text-charcoal-light hover:text-burgundy transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gold font-medium mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-7 h-7 rounded border border-gold/30 flex items-center justify-center text-charcoal hover:border-burgundy hover:text-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm text-charcoal w-6 text-center font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.maxQuantity}
            aria-label="Increase quantity"
            className="w-7 h-7 rounded border border-gold/30 flex items-center justify-center text-charcoal hover:border-burgundy hover:text-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
          </button>
          <span className="text-sm text-charcoal-light ml-auto">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
