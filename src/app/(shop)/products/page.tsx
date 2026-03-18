import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductWithImages } from "@/types";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse our complete collection of heritage South Asian jewelry — kundan, polki, meenakari, and gold pieces.",
};

interface SearchParams {
  category?: string;
  collection?: string;
  material?: string;
  sort?: string;
  page?: string;
}

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const PAGE_SIZE = 24;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, collection, material, sort = "newest", page = "1" } = params;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  // Build where clause
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category) where.category = { slug: category };
  if (collection) where.collection = { slug: collection };
  if (material) where.material = { contains: material, mode: "insensitive" };

  // Build orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };

  const [products, total, categories, collections, materials] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: PAGE_SIZE,
        include: { images: true, category: true, collection: true },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.collection.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({
        where: { isActive: true, material: { not: null } },
        select: { material: true },
        distinct: ["material"],
        orderBy: { material: "asc" },
      }),
    ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const uniqueMaterials = materials
    .map((p) => p.material)
    .filter(Boolean) as string[];

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const p = { ...params, ...overrides };
    const qs = new URLSearchParams();
    if (p.category) qs.set("category", p.category);
    if (p.collection) qs.set("collection", p.collection);
    if (p.material) qs.set("material", p.material);
    if (p.sort && p.sort !== "newest") qs.set("sort", p.sort);
    if (p.page && p.page !== "1") qs.set("page", p.page);
    const str = qs.toString();
    return `/products${str ? `?${str}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-2">
          All Jewelry
        </h1>
        <p className="text-charcoal-light text-sm">
          {total} {total === 1 ? "piece" : "pieces"} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white border border-gold/20 rounded-sm p-5 space-y-6">
            {/* Sort */}
            <div>
              <h3 className="font-serif text-sm text-charcoal mb-3 uppercase tracking-widest">
                Sort By
              </h3>
              <div className="space-y-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ sort: opt.value, page: "1" })}
                    className={`block text-sm py-1 transition-colors ${
                      sort === opt.value
                        ? "text-burgundy font-medium"
                        : "text-charcoal-light hover:text-burgundy"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="font-serif text-sm text-charcoal mb-3 uppercase tracking-widest">
                  Category
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href={buildUrl({ category: undefined, page: "1" })}
                    className={`block text-sm py-1 transition-colors ${
                      !category
                        ? "text-burgundy font-medium"
                        : "text-charcoal-light hover:text-burgundy"
                    }`}
                  >
                    All
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={buildUrl({ category: cat.slug, page: "1" })}
                      className={`block text-sm py-1 transition-colors ${
                        category === cat.slug
                          ? "text-burgundy font-medium"
                          : "text-charcoal-light hover:text-burgundy"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Collections */}
            {collections.length > 0 && (
              <div>
                <h3 className="font-serif text-sm text-charcoal mb-3 uppercase tracking-widest">
                  Collection
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href={buildUrl({ collection: undefined, page: "1" })}
                    className={`block text-sm py-1 transition-colors ${
                      !collection
                        ? "text-burgundy font-medium"
                        : "text-charcoal-light hover:text-burgundy"
                    }`}
                  >
                    All
                  </Link>
                  {collections.map((col) => (
                    <Link
                      key={col.id}
                      href={buildUrl({ collection: col.slug, page: "1" })}
                      className={`block text-sm py-1 transition-colors ${
                        collection === col.slug
                          ? "text-burgundy font-medium"
                          : "text-charcoal-light hover:text-burgundy"
                      }`}
                    >
                      {col.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Materials */}
            {uniqueMaterials.length > 0 && (
              <div>
                <h3 className="font-serif text-sm text-charcoal mb-3 uppercase tracking-widest">
                  Material
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href={buildUrl({ material: undefined, page: "1" })}
                    className={`block text-sm py-1 transition-colors ${
                      !material
                        ? "text-burgundy font-medium"
                        : "text-charcoal-light hover:text-burgundy"
                    }`}
                  >
                    All
                  </Link>
                  {uniqueMaterials.map((mat) => (
                    <Link
                      key={mat}
                      href={buildUrl({ material: mat, page: "1" })}
                      className={`block text-sm py-1 transition-colors ${
                        material === mat
                          ? "text-burgundy font-medium"
                          : "text-charcoal-light hover:text-burgundy"
                      }`}
                    >
                      {mat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products as ProductWithImages[]} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildUrl({ page: String(currentPage - 1) })}
                  className="px-4 py-2 text-sm border border-gold/40 text-charcoal hover:border-gold hover:text-burgundy transition-colors rounded-sm"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-charcoal-light px-3">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={buildUrl({ page: String(currentPage + 1) })}
                  className="px-4 py-2 text-sm border border-gold/40 text-charcoal hover:border-gold hover:text-burgundy transition-colors rounded-sm"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
