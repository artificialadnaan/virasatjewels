import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/product/ProductGrid";
import NewsletterSection from "@/components/home/NewsletterSection";
import type { ProductWithImages } from "@/types";

export const metadata: Metadata = {
  title: "VirasatJewels — Heritage Crafted, Timeless Beauty",
  description:
    "Discover exquisite South Asian jewelry handcrafted with centuries-old traditions. Kundan, meenakari, polki, and gold pieces by master artisans.",
};

export default async function HomePage() {
  const [newArrivals, collections] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: true, category: true, collection: true },
    }),
    prisma.collection.findMany({
      orderBy: { name: "asc" },
      take: 3,
    }),
  ]);

  // Static fallback collection cards when DB has fewer than 3
  const collectionCards = [
    {
      id: "bridal",
      name: "Bridal Collection",
      description:
        "Exquisite pieces crafted for the most cherished occasions — adorned with kundan and polki.",
      href: "/products?collection=bridal",
      gradient: "from-burgundy to-burgundy-dark",
    },
    {
      id: "everyday",
      name: "Everyday Elegance",
      description:
        "Refined gold and silver pieces for the woman who carries heritage in every moment.",
      href: "/products?collection=everyday",
      gradient: "from-charcoal to-[#1a1a1a]",
    },
    {
      id: "heritage",
      name: "Heritage Heirlooms",
      description:
        "Timeless designs passed down through generations — now available to discerning collectors.",
      href: "/products",
      gradient: "from-[#4a3520] to-[#2a1f10]",
    },
  ];

  const displayCollections =
    collections.length > 0
      ? collections.map((col, i) => ({
          id: col.id,
          name: col.name,
          description:
            col.description ??
            "Curated heritage pieces for the discerning collector.",
          href: `/collection/${col.slug}`,
          gradient: collectionCards[i % collectionCards.length].gradient,
        }))
      : collectionCards;

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative bg-burgundy overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #C9A84C 0%, transparent 40%)`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-44 text-center">
          {/* Decorative top ornament */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gold/50" />
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-gold opacity-70"
            >
              <path
                d="M10 2L12.09 7.26L17.5 7.27L13.25 10.74L14.75 16L10 13L5.25 16L6.75 10.74L2.5 7.27L7.91 7.26L10 2Z"
                fill="currentColor"
              />
            </svg>
            <div className="h-px w-12 bg-gold/50" />
          </div>

          <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">
            Est. with Tradition
          </p>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-cream leading-tight mb-6 max-w-4xl mx-auto">
            Heritage Crafted,
            <br />
            <span className="text-gold">Timeless Beauty</span>
          </h1>

          <p className="text-cream/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Discover exquisite South Asian jewelry handcrafted with
            centuries-old traditions — where every piece tells a story of
            artistry and devotion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-block px-10 py-4 bg-gold text-charcoal text-sm font-medium uppercase tracking-widest rounded-sm hover:bg-gold-light transition-colors duration-300"
            >
              Explore Collection
            </Link>
            <Link
              href="/about"
              className="inline-block px-10 py-4 border border-gold/50 text-gold text-sm font-medium uppercase tracking-widest rounded-sm hover:border-gold hover:bg-gold/10 transition-colors duration-300"
            >
              Our Story
            </Link>
          </div>

          {/* Bottom gold divider */}
          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="h-px w-24 bg-gold/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <div className="h-px w-24 bg-gold/30" />
          </div>
        </div>
      </section>

      {/* ─── Featured Collections ─── */}
      <section className="bg-cream py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-xs uppercase tracking-widest mb-2">
              Curated For You
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              Featured Collections
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="h-px w-16 bg-gold/40" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCollections.map((col) => (
              <Link
                key={col.id}
                href={col.href}
                className="group relative overflow-hidden rounded-sm aspect-[4/5] flex flex-col justify-end hover:shadow-2xl transition-shadow duration-500"
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${col.gradient}`}
                />
                {/* Gold border on hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/60 transition-colors duration-500 rounded-sm" />
                {/* Decorative pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle at 70% 30%, #C9A84C, transparent 60%)`,
                  }}
                />
                {/* Content */}
                <div className="relative z-10 p-6">
                  <h3 className="font-serif text-cream text-xl mb-2">
                    {col.name}
                  </h3>
                  <p className="text-cream/70 text-sm leading-relaxed mb-4">
                    {col.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                    Shop Now
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M1 6h10M7 2l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ─── */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-xs uppercase tracking-widest mb-2">
              Just Arrived
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              New Arrivals
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="h-px w-16 bg-gold/40" />
            </div>
          </div>

          <ProductGrid products={newArrivals as ProductWithImages[]} />

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-block px-10 py-3.5 border border-burgundy text-burgundy text-sm font-medium uppercase tracking-widest rounded-sm hover:bg-burgundy hover:text-cream transition-colors duration-300"
            >
              View All Jewelry
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Brand Story ─── */}
      <section className="bg-cream py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: text */}
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-3">
                Our Heritage
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-6">
                The Virasat Legacy
              </h2>
              <div className="h-px w-12 bg-gold/40 mb-8" />
              <div className="space-y-4 text-charcoal-light leading-relaxed text-sm sm:text-base">
                <p>
                  Virasat — meaning{" "}
                  <em className="text-charcoal">"heritage"</em> in Urdu — was
                  born from a profound reverence for the jewellery traditions
                  of South Asia. For centuries, master artisans in the
                  workshops of Jaipur, Hyderabad, and Lahore have perfected
                  techniques that turn precious metals and gemstones into
                  wearable poetry.
                </p>
                <p>
                  Each piece in our collection is handcrafted using traditional
                  techniques: the intricate setting of uncut diamonds in
                  kundan, the vibrant enamel work of meenakari, the organic
                  lustre of polki. These are not merely ornaments — they are
                  conversations between the past and the present.
                </p>
                <p>
                  We work directly with generational artisan families to ensure
                  that every piece you receive carries the full weight of
                  tradition — and the promise of enduring beauty.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-burgundy text-sm font-medium uppercase tracking-widest hover:gap-3 transition-all duration-300"
                >
                  Read Our Story
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M1 7h12M8 2l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: decorative panel */}
            <div className="relative">
              <div className="aspect-square max-w-sm mx-auto lg:max-w-none">
                <div className="relative w-full h-full min-h-[360px]">
                  {/* Outer frame */}
                  <div className="absolute inset-0 border-2 border-gold/30 rounded-sm" />
                  {/* Inner frame offset */}
                  <div className="absolute inset-4 border border-gold/20 rounded-sm" />
                  {/* Centered content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-burgundy/5">
                    {/* Ornamental diamond */}
                    <div className="w-16 h-16 border-2 border-gold/50 rotate-45 mb-6 flex items-center justify-center">
                      <div className="w-6 h-6 bg-gold/30" />
                    </div>
                    <p className="font-serif text-burgundy text-lg text-center leading-relaxed">
                      &ldquo;Every piece a poem,
                      <br />
                      every jewel a memory.&rdquo;
                    </p>
                    <div className="mt-6 flex gap-2">
                      <div className="h-px w-8 bg-gold/40 self-center" />
                      <span className="text-gold text-xs uppercase tracking-widest">
                        Virasat
                      </span>
                      <div className="h-px w-8 bg-gold/40 self-center" />
                    </div>
                    {/* Corner ornaments */}
                    <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-gold/40" />
                    <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-gold/40" />
                    <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-gold/40" />
                    <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-gold/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Craft Highlights ─── */}
      <section className="bg-burgundy py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "200+", label: "Handcrafted Pieces" },
              { number: "4", label: "Master Artisan Families" },
              { number: "100%", label: "Ethically Sourced" },
              { number: "∞", label: "Generations of Heritage" },
            ].map((stat) => (
              <div key={stat.label} className="py-4">
                <p className="font-serif text-3xl sm:text-4xl text-gold mb-2">
                  {stat.number}
                </p>
                <p className="text-cream/70 text-xs uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <NewsletterSection />
    </div>
  );
}
