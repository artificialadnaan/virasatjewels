import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/cloudinary-url";
import { formatPrice } from "@/lib/utils";
import type { ProductWithImages } from "@/types";

interface ProductCardProps {
  product: ProductWithImages;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.sort((a, b) => a.position - b.position)[0];
  const imageSrc = primaryImage?.url
    ? getImageUrl(primaryImage.url, "thumbnail")
    : null;
  const altText = primaryImage?.altText ?? product.name;

  const isSoldOut = product.stockQuantity === 0;
  const hasDiscount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white rounded-sm overflow-hidden border border-transparent hover:border-gold/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={altText.length > 80 ? altText.slice(0, 80) + "…" : altText}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cream">
            <span className="text-xs italic text-gold">Image Coming Soon</span>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center">
            <span className="bg-charcoal text-cream text-xs font-medium uppercase tracking-widest px-3 py-1.5">
              Sold Out
            </span>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && !isSoldOut && (
          <div className="absolute top-2 left-2">
            <span className="bg-burgundy text-cream text-xs font-medium px-2 py-1 rounded-sm">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        {/* Material badge */}
        {product.material && (
          <p className="text-xs text-charcoal-light uppercase tracking-widest mb-1.5">
            {product.material}
            {product.karat ? ` · ${product.karat}` : ""}
          </p>
        )}

        {/* Name */}
        <h3 className="font-serif text-charcoal text-base leading-snug mb-2 group-hover:text-burgundy transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-charcoal font-medium text-sm">
            {formatPrice(product.price.toString())}
          </span>
          {hasDiscount && (
            <span className="text-charcoal-light text-xs line-through">
              {formatPrice(product.compareAtPrice!.toString())}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
