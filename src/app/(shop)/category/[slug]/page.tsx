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
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: `Browse our ${category.name} collection — heritage South Asian jewelry crafted with centuries-old tradition.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { images: true, category: true, collection: true },
      },
    },
  });

  if (!category) notFound();

  const products = category.products as ProductWithImages[];

  return (
    <div>
      {/* Category hero */}
      <div className="bg-burgundy py-14 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold/70 text-xs uppercase tracking-widest mb-2">
          Collection
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream">
          {category.name}
        </h1>
        <p className="text-cream/60 text-sm mt-3">
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
