/**
 * Etsy CSV Import Script
 * Usage: npx tsx scripts/import-etsy.ts --file data/etsy-export.csv
 *
 * Reads an Etsy CSV export, uploads images to Cloudinary, and seeds the database.
 * Idempotent: skips products that already exist (by etsyListingId).
 */

import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import https from "https";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const args = process.argv.slice(2);
const fileIdx = args.indexOf("--file");
const csvPath = fileIdx !== -1 ? args[fileIdx + 1] : "data/etsy-export.csv";

interface EtsyRow {
  TITLE: string;
  DESCRIPTION: string;
  PRICE: string;
  CURRENCY_CODE: string;
  QUANTITY: string;
  TAGS: string;
  MATERIALS: string;
  LISTING_ID: string;
  STATE: string;
  SKU: string;
  SECTION: string;
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
  [key: string]: string | undefined;
}

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(dest);
            return downloadImage(redirectUrl, dest).then(resolve).catch(reject);
          }
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
  });
}

async function uploadToCloudinary(
  filePath: string,
  slug: string,
  position: number
): Promise<{ url: string; cloudinaryId: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `virasatjewels/products/${slug}`,
    public_id: `${slug}-${position}`,
    resource_type: "image",
  });
  return { url: result.secure_url, cloudinaryId: result.public_id };
}

function generateSlug(title: string, existingSlugs: Set<string>): string {
  let slug = slugify(title, { lower: true, strict: true });
  let counter = 1;
  const baseSlug = slug;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

function inferCategory(
  section: string,
  tags: string,
  title: string
): string | null {
  const text = `${section} ${tags} ${title}`.toLowerCase();
  if (text.includes("necklace") || text.includes("pendant") || text.includes("choker")) return "necklaces";
  if (text.includes("earring") || text.includes("jhumka") || text.includes("jhumki")) return "earrings";
  if (text.includes("bangle") || text.includes("kangan")) return "bangles";
  if (text.includes("ring") && !text.includes("earring") && !text.includes("nose ring")) return "rings";
  if (text.includes("bracelet")) return "bracelets";
  if (text.includes("maang tikka") || text.includes("tikka") || text.includes("matha patti")) return "maang-tikka";
  if (text.includes("nose ring") || text.includes("nath") || text.includes("nose pin")) return "nose-rings";
  return null;
}

function inferCollection(tags: string, title: string): string | null {
  const text = `${tags} ${title}`.toLowerCase();
  if (text.includes("bridal") || text.includes("wedding") || text.includes("dulhan")) return "bridal";
  if (text.includes("festive") || text.includes("festival") || text.includes("diwali") || text.includes("eid")) return "festive";
  if (text.includes("everyday") || text.includes("daily") || text.includes("casual")) return "everyday";
  if (text.includes("statement") || text.includes("bold") || text.includes("heavy")) return "statement";
  return null;
}

function inferMaterial(materials: string, tags: string): string | null {
  const text = `${materials} ${tags}`.toLowerCase();
  if (text.includes("kundan")) return "Kundan";
  if (text.includes("polki")) return "Polki";
  if (text.includes("meenakari")) return "Meenakari";
  if (text.includes("gold plated")) return "Gold Plated";
  if (text.includes("gold")) return "Gold";
  if (text.includes("silver")) return "Silver";
  if (text.includes("pearl")) return "Pearl";
  return materials.split(",")[0]?.trim() || null;
}

function inferKarat(materials: string, tags: string): string | null {
  const text = `${materials} ${tags}`.toLowerCase();
  if (text.includes("22k") || text.includes("22 karat")) return "22K";
  if (text.includes("18k") || text.includes("18 karat")) return "18K";
  if (text.includes("14k") || text.includes("14 karat")) return "14K";
  return null;
}

async function main() {
  console.log("=== VirasatJewels Etsy Import ===\n");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    console.log("Usage: npx tsx scripts/import-etsy.ts --file path/to/etsy-export.csv");
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows: EtsyRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  console.log(`Found ${rows.length} listings in CSV\n`);

  const tmpDir = "/tmp/etsy-import";
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // Load existing data
  const categories = await prisma.category.findMany();
  const collections = await prisma.collection.findMany();
  const existingProducts = await prisma.product.findMany({ select: { etsyListingId: true, slug: true } });
  const existingListingIds = new Set(existingProducts.map((p) => p.etsyListingId).filter(Boolean));
  const existingSlugs = new Set(existingProducts.map((p) => p.slug));

  const stats: ImportStats = { total: rows.length, imported: 0, skipped: 0, errors: 0, errorDetails: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const listingId = row.LISTING_ID?.trim();

    if (!listingId) {
      stats.skipped++;
      continue;
    }

    if (existingListingIds.has(listingId)) {
      console.log(`[${i + 1}/${rows.length}] Skipped (already imported): ${row.TITLE?.slice(0, 50)}`);
      stats.skipped++;
      continue;
    }

    try {
      const title = row.TITLE?.trim() || `Product ${listingId}`;
      const slug = generateSlug(title, existingSlugs);
      const price = parseFloat(row.PRICE?.replace(/[^0-9.]/g, "") || "0");
      const quantity = parseInt(row.QUANTITY || "0", 10);
      const isActive = row.STATE?.toLowerCase() === "active";
      const tags = row.TAGS || "";
      const materials = row.MATERIALS || "";
      const section = row.SECTION || "";

      // Infer metadata
      const categorySlug = inferCategory(section, tags, title);
      const collectionSlug = inferCollection(tags, title);
      const material = inferMaterial(materials, tags);
      const karat = inferKarat(materials, tags);

      const category = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
      const collection = collectionSlug ? collections.find((c) => c.slug === collectionSlug) : null;

      // Download and upload images
      const imageUrls: string[] = [];
      for (let imgIdx = 1; imgIdx <= 10; imgIdx++) {
        const imgUrl = row[`IMAGE${imgIdx}`]?.trim();
        if (!imgUrl) continue;

        const tmpPath = path.join(tmpDir, `${slug}-${imgIdx}.jpg`);
        try {
          await downloadImage(imgUrl, tmpPath);
          const uploaded = await uploadToCloudinary(tmpPath, slug, imgIdx - 1);
          imageUrls.push(JSON.stringify(uploaded));
          fs.unlinkSync(tmpPath);
          await delay(500); // Rate limit
        } catch (imgErr) {
          console.warn(`  Warning: Failed to upload image ${imgIdx} for ${title}`);
          stats.errorDetails.push(`Image ${imgIdx} failed for listing ${listingId}: ${imgErr}`);
        }
      }

      // Create product
      await prisma.product.create({
        data: {
          name: title,
          slug,
          description: row.DESCRIPTION?.replace(/<[^>]*>/g, "") || "",
          price,
          stockQuantity: quantity,
          isActive,
          etsyListingId: listingId,
          material,
          karat,
          categoryId: category?.id || null,
          collectionId: collection?.id || null,
          images: {
            create: imageUrls.map((imgJson, pos) => {
              const img = JSON.parse(imgJson);
              return {
                url: img.url,
                cloudinaryId: img.cloudinaryId,
                position: pos,
              };
            }),
          },
        },
      });

      stats.imported++;
      console.log(
        `[${i + 1}/${rows.length}] Imported: ${title.slice(0, 50)} (${imageUrls.length} images)`
      );
    } catch (err) {
      stats.errors++;
      stats.errorDetails.push(`Listing ${listingId}: ${err}`);
      console.error(`[${i + 1}/${rows.length}] Error: ${row.TITLE?.slice(0, 50)} — ${err}`);
    }
  }

  // Print summary
  console.log("\n=== Import Summary ===");
  console.log(`Total rows:  ${stats.total}`);
  console.log(`Imported:    ${stats.imported}`);
  console.log(`Skipped:     ${stats.skipped}`);
  console.log(`Errors:      ${stats.errors}`);

  if (stats.errorDetails.length > 0) {
    const reportPath = "data/import-errors.json";
    fs.writeFileSync(reportPath, JSON.stringify(stats.errorDetails, null, 2));
    console.log(`\nError details saved to ${reportPath}`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
