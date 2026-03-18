import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary-url";
import { Plus, Search, Pencil } from "lucide-react";

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const search = params.search ?? "";
  const categoryFilter = params.category ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(categoryFilter && { categoryId: categoryFilter }),
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B2737] text-white text-sm font-medium rounded-md hover:bg-[#5a1f2e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by product name..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737] focus:border-transparent"
            />
          </div>
          <select
            name="category"
            defaultValue={categoryFilter}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-[#6B2737] text-white text-sm rounded-md hover:bg-[#5a1f2e] transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const thumb = product.images[0];
                  return (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                            {thumb ? (
                              <Image
                                src={getImageUrl(thumb.url, "thumbnail")}
                                alt={thumb.altText ?? product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 leading-tight">{product.name}</div>
                            <div className="text-gray-400 text-xs">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {formatPrice(Number(product.price))}
                        {product.compareAtPrice && (
                          <div className="text-gray-400 text-xs line-through">
                            {formatPrice(Number(product.compareAtPrice))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stockQuantity < 3 ? "text-red-600" : "text-gray-900"}`}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 text-[#6B2737] hover:text-[#5a1f2e] font-medium"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?search=${search}&category=${categoryFilter}&page=${page - 1}`}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?search=${search}&category=${categoryFilter}&page=${page + 1}`}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
