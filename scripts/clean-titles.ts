/**
 * Clean Product Titles Script
 * Usage: DATABASE_URL="..." npx tsx scripts/clean-titles.ts
 *
 * Cleans SEO-stuffed Etsy titles like:
 *   "Pacchi kundan nose ring/ Pearl Nose Ring with Chain | No piercing Required | Indian Jewelry"
 * Down to a clean product name like:
 *   "Pacchi Kundan Nose Ring With Pearl Chain"
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

/** Title-case a string: capitalize the first letter of each word */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Clean a single product title */
function cleanTitle(raw: string): string {
  // Split on / or | delimiters
  const segments = raw.split(/[\/|]/).map((s) => s.trim()).filter(Boolean);

  if (segments.length === 0) return raw.trim();

  // Take the first segment
  let cleaned = segments[0];

  // If the first segment is too short (< 10 chars), combine with the second
  if (cleaned.length < 10 && segments.length > 1) {
    cleaned = `${segments[0]} ${segments[1]}`;
  }

  // Trim whitespace
  cleaned = cleaned.trim();

  // Title-case
  cleaned = toTitleCase(cleaned);

  // Truncate to 80 characters (break at word boundary)
  if (cleaned.length > 80) {
    cleaned = cleaned.slice(0, 80);
    const lastSpace = cleaned.lastIndexOf(" ");
    if (lastSpace > 40) {
      cleaned = cleaned.slice(0, lastSpace);
    }
  }

  return cleaned.trim();
}

async function main() {
  console.log("=== VirasatJewels Title Cleanup ===\n");

  // Fetch all products
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${products.length} products\n`);

  let updated = 0;
  let skipped = 0;
  const changes: Array<{ id: string; before: string; after: string }> = [];

  for (const product of products) {
    const cleaned = cleanTitle(product.name);

    if (cleaned === product.name) {
      skipped++;
      continue;
    }

    // Update in database
    await prisma.product.update({
      where: { id: product.id },
      data: { name: cleaned },
    });

    changes.push({
      id: product.id,
      before: product.name,
      after: cleaned,
    });
    updated++;
  }

  // Print detailed changes
  if (changes.length > 0) {
    console.log("--- Changes ---\n");
    for (const change of changes) {
      console.log(`  BEFORE: ${change.before}`);
      console.log(`  AFTER:  ${change.after}`);
      console.log();
    }
  }

  // Print summary
  console.log("=== Summary ===");
  console.log(`Total products: ${products.length}`);
  console.log(`Updated:        ${updated}`);
  console.log(`Skipped (same): ${skipped}`);
  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
