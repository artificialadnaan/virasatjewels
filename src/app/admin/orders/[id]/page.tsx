"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  priceAtTime: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  name: string;
  phone?: string;
  shippingAddress: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.status);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order");
        setLoading(false);
      });
  }, [id]);

  async function handleStatusUpdate() {
    if (!order || selectedStatus === order.status) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setOrder(updated);
    } catch {
      setError("Failed to update order status");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#6B2737]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-500">
        Order not found.{" "}
        <Link href="/admin/orders" className="text-[#6B2737] underline">Back to orders</Link>
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          Order {order.orderNumber}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-medium text-gray-900">Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2 text-gray-600 font-medium">Product</th>
                  <th className="text-center px-4 py-2 text-gray-600 font-medium">Qty</th>
                  <th className="text-right px-4 py-2 text-gray-600 font-medium">Price</th>
                  <th className="text-right px-4 py-2 text-gray-600 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatPrice(Number(item.priceAtTime))}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPrice(Number(item.priceAtTime) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium text-gray-900 mb-3">Customer</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.name}</p>
              <p>{order.email}</p>
              {order.phone && <p>{order.phone}</p>}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium text-gray-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              {addr.line1 && <p>{addr.line1}</p>}
              {addr.line2 && <p>{addr.line2}</p>}
              {(addr.city || addr.state || addr.postal_code) && (
                <p>
                  {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}
                </p>
              )}
              {addr.country && <p>{addr.country}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order summary */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium text-gray-900 mb-3">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payment</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-0.5 ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Status update */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-medium text-gray-900 mb-3">Order Status</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737] mb-3"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || selectedStatus === order.status}
              className="w-full py-2 bg-[#6B2737] text-white text-sm rounded-md hover:bg-[#5a1f2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
