import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CartItem, CartValidationResult } from "@/types";

interface ValidateRequestItem {
  productId: string;
  price: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: ValidateRequestItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    const productIds = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const validItems: CartItem[] = [];
    const removedItems: CartValidationResult["removedItems"] = [];
    const priceChanges: CartValidationResult["priceChanges"] = [];
    const quantityAdjustments: CartValidationResult["quantityAdjustments"] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product || !product.isActive) {
        removedItems.push({
          productId: item.productId,
          name: product?.name ?? "Unknown product",
          reason: product ? "Product is no longer available" : "Product not found",
        });
        continue;
      }

      if (product.stockQuantity === 0) {
        removedItems.push({
          productId: item.productId,
          name: product.name,
          reason: "Out of stock",
        });
        continue;
      }

      const currentPrice = parseFloat(product.price.toString());
      const cartPrice = item.price;

      if (Math.abs(currentPrice - cartPrice) > 0.01) {
        priceChanges.push({
          productId: item.productId,
          name: product.name,
          oldPrice: cartPrice,
          newPrice: currentPrice,
        });
      }

      const maxQty = product.stockQuantity;
      let finalQty = item.quantity;

      if (finalQty > maxQty) {
        quantityAdjustments.push({
          productId: item.productId,
          name: product.name,
          oldQty: item.quantity,
          newQty: maxQty,
        });
        finalQty = maxQty;
      }

      const image = product.images[0]?.url ?? "";

      validItems.push({
        productId: product.id,
        name: product.name,
        price: currentPrice,
        image,
        quantity: finalQty,
        maxQuantity: maxQty,
      });
    }

    const result: CartValidationResult = {
      validItems,
      removedItems,
      priceChanges,
      quantityAdjustments,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[cart/validate]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
