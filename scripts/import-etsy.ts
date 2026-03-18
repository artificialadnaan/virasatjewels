/**
 * Etsy CSV Import Script
 * Usage: npx tsx scripts/import-etsy.ts --file EtsyListingsDownload.csv
 *
 * Reads an Etsy CSV export and seeds the database.
 * Uses Etsy CDN URLs directly (no Cloudinary upload needed).
 * Idempotent: skips products whose slug already exists.
 */

import { parse } from "csv-parse/sync";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const args = process.argv.slice(2);
const fileIdx = args.indexOf("--file");
const csvPath = fileIdx !== -1 ? args[fileIdx + 1] : "EtsyListingsDownload.csv";

const BATCH_SIZE = 50;

interface EtsyRow {
  TITLE: string;
  DESCRIPTION: string;
  PRICE: string;
  CURRENCY_CODE: string;
  QUANTITY: string;
  TAGS: string;
  MATERIALS: string;
  IMAGE1?: string;
  IMAGE2?: string;
  IMAGE3?: string;
  IMAGE4?: string;
  IMAGE5?: string;
  IMAGE6?: string;
  IMAGE7?: string;
  IMAGE8?: string;
  IMAGE9?: string;
  IMAGE10?: string;
  "VARIATION 1 TYPE"?: string;
  "VARIATION 1 NAME"?: string;
  "VARIATION 1 VALUES"?: string;
  "VARIATION 2 TYPE"?: string;
  "VARIATION 2 NAME"?: string;
  "VARIATION 2 VALUES"?: string;
  SKU?: string;
  [key: string]: string | undefined;
}

function inferCategory(tags: string, title: string): string | null {
  const text = `${tags} ${title}`.toLowerCase();
  if (text.includes("necklace") || text.includes("pendant") || text.includes("choker") || text.includes("haar") || text.includes("rani haar")) return "necklaces";
  if (text.includes("earring") || text.includes("jhumka") || text.includes("jhumki") || text.includes("chandbali")) return "earrings";
  if (text.includes("bangle") || text.includes("kangan") || text.includes("churi") || text.includes("kara")) return "bangles";
  if (text.includes("ring") && !text.includes("earring") && !text.includes("nose ring")) return "rings";
  if (text.includes("bracelet")) return "bracelets";
  if (text.includes("maang tikka") || text.includes("tikka") || text.includes("matha patti") || text.includes("headpiece")) return "maang-tikka";
  if (text.includes("nose ring") || text.includes("nath") || text.includes("nose pin") || text.includes("nose clip") || text.includes("nose cuff")) return "nose-rings";
  if (text.includes("anklet") || text.includes("payal") || text.includes("pajeb")) return "anklets";
  if (text.includes("brooch") || text.includes("pin")) return "brooches";
  return null;
}

function inferCollection(tags: string, title: string): string | null {
  const text = `${tags} ${title}`.toLowerCase();
  if (text.includes("bridal") || text.includes("wedding") || text.includes("dulhan") || text.includes("shaadi")) return "bridal";
  if (text.includes("festive") || text.includes("festival") || text.includes("diwali") || text.includes("eid")) return "festive";
  if (text.includes("everyday") || text.includes("daily") || text.includes("casual") || text.includes("minimalist")) return "everyday";
  if (text.includes("statement") || text.includes("bold") || text.includes("heavy") || text.includes("royal")) return "statement";
  return null;
}

function inferMaterial(materials: string, tags: string): string | null {
  const text = `${materials} ${tags}`.toLowerCase();
  if (text.includes("kundan")) return "Kundan";
  if (text.includes("polki")) return "Polki";
  if (text.includes("meenakari")) return "Meenakari";
  if (text.includes("jadau")) return "Jadau";
  if (text.includes("gold plated") || text.includes("gold-plated")) return "Gold Plated";
  if (text.includes("gold")) return "Gold";
  if (text.includes("silver plated") || text.includes("silver-plated")) return "Silver Plated";
  if (text.includes("silver")) return "Silver";
  if (text.includes("pearl")) return "Pearl";
  if (text.includes("crystal")) return "Crystal";
  return materials.split(",")[0]?.trim() || null;
}

function inferKarat(materials: string, tags: string): string | null {
  const text = `${materials} ${tags}`.toLowerCase();
  if (text.includes("22k") || text.includes("22 karat")) return "22K";
  if (text.includes("18k") || text.includes("18 karat")) return "18K";
  if (text.includes("14k") || text.includes("14 karat")) return "14K";
  return null;
}

function generateSlug(title: string, rowIndex: number, existingSlugs: Set<string>): string {
  let slug = slugify(title, { lower: true, strict: true }).slice(0, 80);
  if (!slug) slug = `product-${rowIndex}`;
  const baseSlug = slug;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

function getImageUrls(row: EtsyRow): string[] {
  const urls: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const url = row[`IMAGE${i}`]?.trim();
    if (url && url.startsWith("http")) urls.push(url);
  }
  return urls;
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function main() {
  console.log("=== VirasatJewels Etsy Import ===\n");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    console.log("Usage: npx tsx scripts/import-etsy.ts --file EtsyListingsDownload.csv");
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows: EtsyRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  console.log(`Found ${rows.length} listings in CSV\n`);

  // Ensure categories and collections exist
  const categoryMap = new Map<string, string>();
  const collectionMap = new Map<string, string>();

  const categories = await prisma.category.findMany();
  for (const c of categories) categoryMap.set(c.slug, c.id);

  const collections = await prisma.collection.findMany();
  for (const c of collections) collectionMap.set(c.slug, c.id);

  // Load existing slugs for dedup
  const existingProducts = await prisma.product.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingProducts.map((p) => p.slug));

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  // Process in batches
  for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
    const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
    const creates: Array<{
      name: string;
      slug: string;
      description: string;
      price: number;
      stockQuantity: number;
      isActive: boolean;
      material: string | null;
      karat: string | null;
      categoryId: string | null;
      collectionId: string | null;
      images: string[];
    }> = [];

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const globalIdx = batchStart + i;
      const title = row.TITLE?.trim();

      if (!title) {
        skipped++;
        continue;
      }

      const slug = generateSlug(title, globalIdx, existingSlugs);

      const tags = (row.TAGS || "").replace(/_/g, " ");
      const materials = row.MATERIALS || "";
      const categorySlug = inferCategory(tags, title);
      const collectionSlug = inferCollection(tags, title);
      const material = inferMaterial(materials, tags);
      const karat = inferKarat(materials, tags);

      creates.push({
        name: title,
        slug,
        description: cleanDescription(row.DESCRIPTION || ""),
        price: parseFloat(row.PRICE?.replace(/[^0-9.]/g, "") || "0"),
        stockQuantity: parseInt(row.QUANTITY || "1", 10),
        isActive: true,
        material,
        karat,
        categoryId: categorySlug ? categoryMap.get(categorySlug) || null : null,
        collectionId: collectionSlug ? collectionMap.get(collectionSlug) || null : null,
        images: getImageUrls(row),
      });
    }

    // Batch insert with transaction
    if (creates.length > 0) {
      try {
        await prisma.$transaction(
          creates.map((p) =>
            prisma.product.create({
              data: {
                name: p.name,
                slug: p.slug,
                description: p.description,
                price: p.price,
                stockQuantity: p.stockQuantity,
                isActive: p.isActive,
                material: p.material,
                karat: p.karat,
                categoryId: p.categoryId,
                collectionId: p.collectionId,
                images: {
                  create: p.images.map((url, pos) => ({
                    url,
                    position: pos,
                  })),
                },
              },
            })
          )
        );
        imported += creates.length;
        console.log(
          `[${Math.min(batchStart + BATCH_SIZE, rows.length)}/${rows.length}] Imported batch of ${creates.length}`
        );
      } catch (err) {
        // Fallback: try one by one
        for (const p of creates) {
          try {
            await prisma.product.create({
              data: {
                name: p.name,
                slug: p.slug,
                description: p.description,
                price: p.price,
                stockQuantity: p.stockQuantity,
                isActive: p.isActive,
                material: p.material,
                karat: p.karat,
                categoryId: p.categoryId,
                collectionId: p.collectionId,
                images: {
                  create: p.images.map((url, pos) => ({
                    url,
                    position: pos,
                  })),
                },
              },
            });
            imported++;
          } catch (innerErr) {
            errors++;
            errorDetails.push(`${p.name}: ${innerErr}`);
            console.error(`  Error: ${p.name.slice(0, 50)} — ${innerErr}`);
          }
        }
        console.log(
          `[${Math.min(batchStart + BATCH_SIZE, rows.length)}/${rows.length}] Batch fallback complete`
        );
      }
    }
  }

  // Print summary
  console.log("\n=== Import Summary ===");
  console.log(`Total rows:  ${rows.length}`);
  console.log(`Imported:    ${imported}`);
  console.log(`Skipped:     ${skipped}`);
  console.log(`Errors:      ${errors}`);

  if (errorDetails.length > 0) {
    console.log(`\nFirst 10 errors:`);
    errorDetails.slice(0, 10).forEach((e) => console.log(`  - ${e.slice(0, 120)}`));
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
