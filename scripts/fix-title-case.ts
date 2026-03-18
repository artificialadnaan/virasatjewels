/**
 * Fix Title Case for Product Names
 * Usage: DATABASE_URL="..." npx tsx scripts/fix-title-case.ts
 *
 * - Lowercases minor words (with, and, of, the, etc.) when not the first word
 * - Fixes HTML entity leftovers like "&earring" -> "& Earring"
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const MINOR_WORDS = new Set([
  "with", "and", "of", "the", "in", "for", "on", "at", "to", "a", "an", "or",
]);

function fixTitleCase(name: string): string {
  // Fix HTML entity leftovers: "&earring" -> "& Earring", "&ring" -> "& Ring", etc.
  let fixed = name.replace(/&([a-zA-Z])/g, (_match, letter) => {
    return "& " + letter.toUpperCase();
  });

  // Fix title case for minor words
  const words = fixed.split(" ");
  const result = words.map((word, i) => {
    // Never change the first word
    if (i === 0) return word;
    // Check if the lowercase version is a minor word
    if (MINOR_WORDS.has(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word;
  });

  return result.join(" ");
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  let updated = 0;
  const changes: { before: string; after: string }[] = [];

  for (const product of products) {
    const newName = fixTitleCase(product.name);
    if (newName !== product.name) {
      await prisma.product.update({
        where: { id: product.id },
        data: { name: newName },
      });
      changes.push({ before: product.name, after: newName });
      updated++;
    }
  }

  console.log(`\nScanned ${products.length} products, updated ${updated}.\n`);
  if (changes.length > 0) {
    console.log("Changes:");
    for (const c of changes) {
      console.log(`  "${c.before}"\n    -> "${c.after}"\n`);
    }
  } else {
    console.log("No changes needed.");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
