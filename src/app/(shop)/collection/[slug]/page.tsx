import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductWithImages } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  if (!collection) return { title: "Collection Not Found" };
  return {
    title: collection.name,
    description:
      collection.description ??
      `Explore the ${collection.name} collection — curated heritage jewelry pieces.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;

  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { images: true, category: true, collection: true },
      },
    },
  });

  if (!collection) notFound();

  const products = collection.products as ProductWithImages[];

  return (
    <div>
      {/* Collection hero */}
      <div className="bg-burgundy py-14 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold/70 text-xs uppercase tracking-widest mb-2">
          Curated Collection
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-cream/80 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            {collection.description}
          </p>
        )}
        <p className="text-cream/50 text-xs mt-3">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductGrid products={products} showLoadMore />
      </div>
    </div>
  );
}
