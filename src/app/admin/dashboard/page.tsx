import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") redirect("/admin/login");

  const [productCount, orderCount, lowStockCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true, stockQuantity: { lt: 3 } } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-burgundy text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-serif text-xl font-bold">VirasatJewels Admin</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/products" className="hover:text-gold transition-colors">Products</Link>
            <Link href="/admin/orders" className="hover:text-gold transition-colors">Orders</Link>
            <Link href="/" className="hover:text-gold transition-colors">View Store</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-charcoal-light">Active Products</p>
            <p className="text-3xl font-bold text-charcoal mt-1">{productCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-charcoal-light">Total Orders</p>
            <p className="text-3xl font-bold text-charcoal mt-1">{orderCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-charcoal-light">Low Stock Items</p>
            <p className={`text-3xl font-bold mt-1 ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {lowStockCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-lg shadow-sm border hover:border-gold transition-colors"
          >
            <h3 className="font-serif text-lg font-bold text-charcoal">Manage Products</h3>
            <p className="text-sm text-charcoal-light mt-1">Add, edit, or remove jewelry items</p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-lg shadow-sm border hover:border-gold transition-colors"
          >
            <h3 className="font-serif text-lg font-bold text-charcoal">Manage Orders</h3>
            <p className="text-sm text-charcoal-light mt-1">View and update order statuses</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
