"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { getImageUrl } from "@/lib/cloudinary-url";
import type { ProductImage } from "@prisma/client";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = sorted[activeIndex];

  const mainSrc = activeImage?.url
    ? getImageUrl(activeImage.url, "detail")
    : "/placeholder-jewelry.jpg";
  const zoomSrc = activeImage?.url
    ? getImageUrl(activeImage.url, "zoom")
    : "/placeholder-jewelry.jpg";

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div
          className="relative aspect-square bg-cream rounded-sm overflow-hidden cursor-zoom-in group"
          onClick={openLightbox}
        >
          <Image
            src={mainSrc}
            alt={activeImage?.altText ?? productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
          </div>
        </div>

        {/* Thumbnail strip */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {sorted.map((img, idx) => {
              const thumbSrc = img.url
                ? getImageUrl(img.url, "thumbnail")
                : "/placeholder-jewelry.jpg";
              const isActive = idx === activeIndex;
              return (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                    isActive
                      ? "border-gold"
                      : "border-transparent hover:border-gold/50"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={thumbSrc}
                    alt={img.altText ?? `${productName} ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-cream hover:text-gold transition-colors"
            aria-label="Close lightbox"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="relative w-full max-w-3xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={zoomSrc}
              alt={activeImage?.altText ?? productName}
              fill
              sizes="(max-width: 768px) 100vw, 75vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
