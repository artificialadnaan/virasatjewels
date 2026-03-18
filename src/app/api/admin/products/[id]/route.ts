import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  material: z.string().nullable().optional(),
  karat: z.string().nullable().optional(),
  craftsmanshipType: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  categoryId: z.string().nullable().optional().transform((v) => v || null),
  collectionId: z.string().nullable().optional().transform((v) => v || null),
  isActive: z.boolean().optional(),
  existingImageIds: z.array(z.string()).optional(),
  newImages: z
    .array(z.object({ url: z.string().url(), cloudinaryId: z.string() }))
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true } },
      collection: { select: { id: true, name: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation error" },
      { status: 400 }
    );
  }

  const { existingImageIds, newImages, ...fields } = parsed.data;

  // Delete images not in existingImageIds
  if (existingImageIds !== undefined) {
    await prisma.productImage.deleteMany({
      where: {
        productId: id,
        id: { notIn: existingImageIds },
      },
    });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...fields,
      ...(newImages && newImages.length > 0 && {
        images: {
          create: newImages.map((img, i) => ({
            url: img.url,
            cloudinaryId: img.cloudinaryId,
            position: (existingImageIds?.length ?? 0) + i,
          })),
        },
      }),
    },
    include: { images: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json(product);
}
