"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { ProductWithImages } from "@/types";

interface ProductGridProps {
  products: ProductWithImages[];
  pageSize?: number;
  showLoadMore?: boolean;
}

export default function ProductGrid({
  products,
  pageSize = 24,
  showLoadMore = false,
}: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visible = products.slice(0, visibleCount);
  const hasMore = products.length > visibleCount;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-serif text-2xl text-charcoal mb-3">
          No products found
        </p>
        <p className="text-charcoal-light text-sm">
          Try adjusting your filters or browse all collections.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {showLoadMore && hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + pageSize)}
            className="px-8 py-3 border border-burgundy text-burgundy text-sm font-medium uppercase tracking-widest hover:bg-burgundy hover:text-cream transition-colors duration-300 rounded-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
