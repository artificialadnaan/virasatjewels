import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Heritage",
  description:
    "Discover the story behind VirasatJewels — a celebration of South Asian craftsmanship, generational artistry, and timeless beauty.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-20 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          Who We Are
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream mb-4">
          Our Heritage
        </h1>
        <div className="flex justify-center">
          <div className="h-px w-16 bg-gold/40" />
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-cream py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-sm sm:prose-base">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            The Virasat Story
          </h2>
          <div className="space-y-5 text-charcoal-light leading-relaxed">
            <p>
              <em className="text-charcoal">Virasat</em> — the Urdu word for
              heritage — is more than a name. It is a promise. A promise to
              preserve the extraordinary jewellery traditions of South Asia for
              the generations who wear them today, and the generations who will
              inherit them tomorrow.
            </p>
            <p>
              Our journey began in the historic jewellery bazaars of Jaipur,
              where master <em>karigars</em> (artisans) have been perfecting
              their craft for centuries. In narrow workshops illuminated by
              single bulbs, skilled hands set uncut diamonds into 22-karat gold
              using the ancient kundan technique — unchanged for 2,500 years.
              The same hands paint vivid meenakari enamel onto silver, creating
              colours so vibrant they seem to hold sunlight within them.
            </p>
            <p>
              We founded VirasatJewels with one mission: to bring these
              extraordinary pieces — and the stories behind them — to a global
              audience that values craftsmanship over mass production.
            </p>
          </div>

          <div className="my-12 border-l-2 border-gold/40 pl-6">
            <p className="font-serif text-lg text-burgundy italic">
              &ldquo;Every piece is a conversation between the artisan and
              eternity.&rdquo;
            </p>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            Our Craft Traditions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose mb-8">
            {[
              {
                name: "Kundan",
                desc: "The ancient art of setting uncut gemstones — typically diamonds, rubies, and emeralds — into refined gold. Originating in Rajasthan, kundan jewellery is synonymous with Mughal-era opulence.",
              },
              {
                name: "Meenakari",
                desc: "Vibrantly coloured enamel fused into precious metal, often used to adorn the reverse side of kundan pieces. Each colour requires a separate firing — a painstaking process of extraordinary beauty.",
              },
              {
                name: "Polki",
                desc: "Diamonds in their most natural form — uncut, unpolished, and set to reveal the raw beauty of the stone. Polki pieces carry a luminous, organic quality that no modern cut can replicate.",
              },
              {
                name: "Filigree",
                desc: "Delicate threads of gold and silver twisted and soldered into intricate lace-like patterns. A tradition with deep roots in the workshops of Lucknow and Cuttack.",
              },
            ].map((craft) => (
              <div
                key={craft.name}
                className="bg-white border border-gold/20 rounded-sm p-5"
              >
                <h3 className="font-serif text-charcoal text-base mb-2">
                  {craft.name}
                </h3>
                <p className="text-charcoal-light text-sm leading-relaxed">
                  {craft.desc}
                </p>
              </div>
            ))}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            Our Commitment
          </h2>
          <div className="space-y-4 text-charcoal-light leading-relaxed">
            <p>
              We work directly with a small circle of artisan families, ensuring
              fair wages, dignified working conditions, and the continuity of
              traditional skills. When you purchase from VirasatJewels, you are
              not merely buying jewellery — you are participating in the
              preservation of a living heritage.
            </p>
            <p>
              All our gold and gemstones are ethically sourced. We provide
              certificates of authenticity with every significant piece, and our
              team is available to answer any questions about provenance,
              materials, or craftsmanship.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <Link
            href="/products"
            className="inline-block px-10 py-3.5 bg-burgundy text-cream text-sm font-medium uppercase tracking-widest rounded-sm hover:bg-burgundy-dark transition-colors"
          >
            Explore the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
