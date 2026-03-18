"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface ExistingImage {
  id: string;
  url: string;
  cloudinaryId?: string;
  altText?: string;
  position: number;
}

interface NewImage {
  url: string;
  cloudinaryId: string;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    material: "",
    karat: "",
    craftsmanshipType: "",
    occasion: "",
    stockQuantity: "0",
    categoryId: "",
    collectionId: "",
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/collections").then((r) => r.json()).catch(() => []),
    ]).then(([product, cats, cols]) => {
      if (product?.id) {
        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          price: String(product.price ?? ""),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          material: product.material ?? "",
          karat: product.karat ?? "",
          craftsmanshipType: product.craftsmanshipType ?? "",
          occasion: product.occasion ?? "",
          stockQuantity: String(product.stockQuantity ?? 0),
          categoryId: product.categoryId ?? "",
          collectionId: product.collectionId ?? "",
          isActive: product.isActive ?? true,
        });
        setExistingImages(product.images ?? []);
      }
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(cols)) setCollections(cols);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load product");
      setLoading(false);
    });
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: async (files) => {
      setUploading(true);
      try {
        const uploaded: NewImage[] = [];
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          uploaded.push(data);
        }
        setNewImages((prev) => [...prev, ...uploaded]);
      } catch {
        setError("Image upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
  });

  function removeExistingImage(imageId: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          stockQuantity: parseInt(form.stockQuantity, 10),
          existingImageIds: existingImages.map((img) => img.id),
          newImages,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update product");
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/admin/products");
    } catch {
      setError("Failed to delete product");
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

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Edit Product</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare At Price
              </label>
              <input
                name="compareAtPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              name="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
            />
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Product Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "material", label: "Material" },
              { name: "karat", label: "Karat" },
              { name: "craftsmanshipType", label: "Craftsmanship Type" },
              { name: "occasion", label: "Occasion" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  name={name}
                  value={(form as unknown as Record<string, string>)[name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Organization</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
              <select
                name="collectionId"
                value={form.collectionId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6B2737]"
              >
                <option value="">None</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? "bg-[#6B2737]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">Active (visible in store)</span>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Images</h2>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Existing images</p>
              <div className="grid grid-cols-4 gap-3">
                {existingImages.map((img, i) => (
                  <div key={img.id} className="relative group aspect-square rounded-md overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.altText ?? ""} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-[#6B2737] text-white text-xs px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload new */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-[#6B2737] bg-[#6B2737]/5" : "border-gray-300 hover:border-[#6B2737]"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-[#6B2737] animate-spin" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? "Drop images here..." : "Add more images"}
                </p>
              </div>
            )}
          </div>

          {newImages.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">New images</p>
              <div className="grid grid-cols-4 gap-3">
                {newImages.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Delete */}
          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Product
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Are you sure?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Yes, delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2 bg-[#6B2737] text-white text-sm rounded-md hover:bg-[#5a1f2e] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
