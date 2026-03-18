import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@virasatjewels.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-in-production";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user created: ${adminEmail}`);

  // Create categories
  const categories = [
    { name: "Necklaces", slug: "necklaces" },
    { name: "Earrings", slug: "earrings" },
    { name: "Bangles", slug: "bangles" },
    { name: "Rings", slug: "rings" },
    { name: "Bracelets", slug: "bracelets" },
    { name: "Maang Tikka", slug: "maang-tikka" },
    { name: "Nose Rings", slug: "nose-rings" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Create collections
  const collections = [
    {
      name: "Bridal",
      slug: "bridal",
      description: "Exquisite pieces for the most special day of your life",
    },
    {
      name: "Festive",
      slug: "festive",
      description: "Celebrate every occasion with timeless elegance",
    },
    {
      name: "Everyday",
      slug: "everyday",
      description: "Subtle heritage pieces for daily wear",
    },
    {
      name: "Statement",
      slug: "statement",
      description: "Bold, show-stopping pieces that command attention",
    },
  ];

  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: col,
    });
  }
  console.log(`Created ${collections.length} collections`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
