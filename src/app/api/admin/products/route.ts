import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import slugify from "slugify";

const PAGE_SIZE = 20;

const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().nullable().optional(),
  material: z.string().optional(),
  karat: z.string().optional(),
  craftsmanshipType: z.string().optional(),
  occasion: z.string().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  categoryId: z.string().optional().transform((v) => v || undefined),
  collectionId: z.string().optional().transform((v) => v || undefined),
  isActive: z.boolean().default(true),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        cloudinaryId: z.string(),
      })
    )
    .optional()
    .default([]),
});

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(categoryId && { categoryId }),
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" } },
        category: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pageSize: PAGE_SIZE });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Generate unique slug
  let baseSlug = slugify(data.name, { lower: true, strict: true });
  let slug = baseSlug;
  let attempt = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ?? null,
      material: data.material ?? null,
      karat: data.karat ?? null,
      craftsmanshipType: data.craftsmanshipType ?? null,
      occasion: data.occasion ?? null,
      stockQuantity: data.stockQuantity,
      isActive: data.isActive,
      categoryId: data.categoryId ?? null,
      collectionId: data.collectionId ?? null,
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          cloudinaryId: img.cloudinaryId,
          position: i,
        })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(product, { status: 201 });
}
