import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getImageUrl } from "@/lib/cloudinary-url";
import { formatPrice } from "@/lib/utils";
import ProductGallery from "@/components/product/ProductGallery";
import ProductCard from "@/components/product/ProductCard";
import AddToCartButton from "@/components/product/AddToCartButton";
import type { ProductWithImages } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true },
  });
  if (!product) return { title: "Product Not Found" };

  const primaryImage = product.images.sort((a, b) => a.position - b.position)[0];
  const ogImage = primaryImage?.url
    ? getImageUrl(primaryImage.url, "og")
    : undefined;

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { images: true, category: true, collection: true },
  });

  if (!product) notFound();

  const typedProduct = product as ProductWithImages;

  // Fetch related products from same category
  const relatedProducts = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          id: { not: product.id },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { images: true, category: true, collection: true },
      })
    : [];

  const isSoldOut = product.stockQuantity === 0;
  const hasDiscount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price);

  const primaryImage = product.images.sort((a, b) => a.position - b.position)[0];
  const ogImageUrl = primaryImage?.url
    ? getImageUrl(primaryImage.url, "og")
    : "";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: ogImageUrl || undefined,
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(product.price).toFixed(2),
      availability: isSoldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `https://virasatjewels.com/product/${product.slug}`,
    },
    ...(product.material && { material: product.material }),
    ...(product.category && { category: product.category.name }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-charcoal-light mb-6 flex items-center gap-1.5">
          <a href="/products" className="hover:text-burgundy transition-colors">
            All Products
          </a>
          {product.category && (
            <>
              <span>/</span>
              <a
                href={`/category/${product.category.slug}`}
                className="hover:text-burgundy transition-colors"
              >
                {product.category.name}
              </a>
            </>
          )}
          <span>/</span>
          <span className="text-charcoal truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            {/* Meta */}
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              {product.material && (
                <span className="text-xs text-charcoal-light uppercase tracking-widest">
                  {product.material}
                  {product.karat ? ` · ${product.karat}` : ""}
                </span>
              )}
              {product.craftsmanshipType && (
                <>
                  <span className="text-gold/40">|</span>
                  <span className="text-xs text-charcoal-light uppercase tracking-widest">
                    {product.craftsmanshipType}
                  </span>
                </>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-medium text-charcoal">
                {formatPrice(product.price.toString())}
              </span>
              {hasDiscount && (
                <span className="text-charcoal-light text-base line-through">
                  {formatPrice(product.compareAtPrice!.toString())}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {isSoldOut ? (
                <span className="px-3 py-1 bg-charcoal text-cream text-xs uppercase tracking-widest rounded-sm">
                  Sold Out
                </span>
              ) : (
                <span className="px-3 py-1 bg-gold/20 text-charcoal text-xs uppercase tracking-widest rounded-sm">
                  In Stock
                </span>
              )}
              {product.occasion && (
                <span className="px-3 py-1 border border-gold/40 text-charcoal-light text-xs uppercase tracking-widest rounded-sm">
                  {product.occasion}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gold/20 mb-6" />

            {/* Add to cart */}
            <AddToCartButton product={typedProduct} />

            {/* Divider */}
            <div className="h-px bg-gold/20 my-6" />

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-serif text-lg text-charcoal mb-3">
                  About This Piece
                </h2>
                <p className="text-charcoal-light text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="mt-6 space-y-2">
              {product.material && (
                <DetailRow label="Material" value={product.material} />
              )}
              {product.karat && (
                <DetailRow label="Karat" value={product.karat} />
              )}
              {product.craftsmanshipType && (
                <DetailRow
                  label="Craftsmanship"
                  value={product.craftsmanshipType}
                />
              )}
              {product.occasion && (
                <DetailRow label="Occasion" value={product.occasion} />
              )}
              {product.collection && (
                <DetailRow
                  label="Collection"
                  value={product.collection.name}
                />
              )}
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-8">
              <p className="text-gold text-xs uppercase tracking-widest mb-1">
                Explore More
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p as ProductWithImages} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-charcoal-light w-28 flex-shrink-0">{label}</span>
      <span className="text-charcoal">{value}</span>
    </div>
  );
}
