import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Information",
  description:
    "Learn about VirasatJewels shipping policies, processing times, and delivery options.",
};

export default function ShippingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-16 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          Delivery
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream mb-4">
          Shipping Information
        </h1>
        <div className="flex justify-center">
          <div className="h-px w-16 bg-gold/40" />
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">

          <PolicySection title="Processing Times">
            <p>
              Each VirasatJewels piece is carefully inspected, cleaned, and
              packaged by hand before dispatch. Please allow <strong>2–3
              business days</strong> for order processing. Orders placed on
              weekends or public holidays will be processed on the next business
              day.
            </p>
            <p>
              Made-to-order or customised pieces may require additional
              processing time — typically <strong>7–14 business days</strong>.
              You will be informed of the extended lead time at the time of
              purchase.
            </p>
          </PolicySection>

          <PolicySection title="Shipping Methods &amp; Rates">
            <Table
              headers={["Method", "Estimated Delivery", "Cost"]}
              rows={[
                ["Standard Shipping (US)", "5–7 business days", "Free on orders over $150; $9.99 otherwise"],
                ["Expedited Shipping (US)", "2–3 business days", "$24.99"],
                ["Overnight Shipping (US)", "Next business day", "$49.99"],
                ["International Standard", "10–21 business days", "Calculated at checkout"],
                ["International Express", "5–7 business days", "Calculated at checkout"],
              ]}
            />
          </PolicySection>

          <PolicySection title="International Shipping">
            <p>
              We ship worldwide. International orders are subject to customs
              duties and taxes levied by the destination country. These charges
              are the responsibility of the recipient and are not included in the
              order total or shipping cost.
            </p>
            <p>
              VirasatJewels is not responsible for delays caused by customs
              clearance. For high-value international orders, we recommend
              selecting express shipping for faster and more reliable delivery.
            </p>
          </PolicySection>

          <PolicySection title="Order Tracking">
            <p>
              Once your order has been dispatched, you will receive a shipping
              confirmation email containing a tracking number. You can use this
              number to track your parcel via the carrier&apos;s website.
            </p>
            <p>
              If you have not received a shipping confirmation within 5 business
              days of placing your order, please contact us at{" "}
              <a
                href="mailto:support@virasatjewels.com"
                className="text-burgundy underline hover:text-burgundy-dark"
              >
                support@virasatjewels.com
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection title="Packaging">
            <p>
              All orders are shipped in our signature heritage packaging — a
              keepsake box that befits the jewel within. We use eco-conscious
              materials wherever possible, without compromising the luxury
              unboxing experience our customers deserve.
            </p>
          </PolicySection>

          <PolicySection title="Lost or Damaged Shipments">
            <p>
              If your order arrives damaged or is lost in transit, please contact
              us within <strong>48 hours</strong> of the expected delivery date.
              We will work with the carrier to resolve the issue as quickly as
              possible. For orders over $500, we strongly recommend selecting a
              shipping option with full insurance.
            </p>
          </PolicySection>

        </div>
      </section>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl sm:text-2xl text-charcoal mb-4 pb-2 border-b border-gold/20">
        {title}
      </h2>
      <div className="space-y-3 text-charcoal-light leading-relaxed text-sm sm:text-base">
        {children}
      </div>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-burgundy/5">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 font-medium text-charcoal border border-gold/20"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-white odd:bg-cream/50">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-charcoal-light border border-gold/20"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
