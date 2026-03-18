import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description:
    "VirasatJewels returns and exchanges policy — hassle-free returns within 14 days.",
};

export default function ReturnsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-16 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          Our Promise
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream mb-4">
          Returns &amp; Exchanges
        </h1>
        <div className="flex justify-center">
          <div className="h-px w-16 bg-gold/40" />
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">

          <PolicySection title="Return Policy">
            <p>
              We want you to love every piece you receive. If for any reason you
              are not completely satisfied, we accept returns within{" "}
              <strong>14 days</strong> of delivery for a full refund of the item
              price (excluding original shipping costs).
            </p>
            <p>
              To be eligible for a return, items must be:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>Unworn and in original condition</li>
              <li>In original packaging with all tags attached</li>
              <li>Accompanied by the original receipt or proof of purchase</li>
              <li>Free from perfume, chemicals, or signs of wear</li>
            </ul>
          </PolicySection>

          <PolicySection title="Non-Returnable Items">
            <p>
              The following items are not eligible for return:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>Custom or personalised pieces (engraved, resized, etc.)</li>
              <li>Earrings (for hygiene reasons)</li>
              <li>Sale items marked as final sale</li>
              <li>Items returned after the 14-day window</li>
            </ul>
          </PolicySection>

          <PolicySection title="Exchanges">
            <p>
              We are happy to exchange items for a different size or style within
              the 14-day window, subject to availability. To request an exchange,
              please follow the same process as a return and specify the item you
              would like in exchange. If the replacement item is of a different
              value, you will be charged or refunded the difference.
            </p>
          </PolicySection>

          <PolicySection title="How to Initiate a Return">
            <ol className="list-decimal list-inside space-y-2 pl-2 text-charcoal-light">
              <li>
                Email{" "}
                <a
                  href="mailto:returns@virasatjewels.com"
                  className="text-burgundy underline hover:text-burgundy-dark"
                >
                  returns@virasatjewels.com
                </a>{" "}
                with your order number and reason for return.
              </li>
              <li>
                Our team will respond within 2 business days with a Return
                Merchandise Authorisation (RMA) number and return address.
              </li>
              <li>
                Pack the item securely in its original packaging and include the
                RMA number on the outside of the parcel.
              </li>
              <li>
                Ship the item using a tracked and insured service. We recommend
                keeping proof of postage. VirasatJewels is not responsible for
                items lost in return transit.
              </li>
              <li>
                Once we receive and inspect the item, we will process your
                refund or exchange within <strong>5–7 business days</strong>.
              </li>
            </ol>
          </PolicySection>

          <PolicySection title="Refunds">
            <p>
              Approved refunds will be credited to your original payment method
              within <strong>5–7 business days</strong> of us receiving the
              returned item. Please note that your bank or card provider may
              require additional time to process the refund.
            </p>
            <p>
              Shipping costs are non-refundable unless the return is due to a
              defective or incorrectly shipped item.
            </p>
          </PolicySection>

          <PolicySection title="Damaged or Incorrect Items">
            <p>
              If you receive a damaged or incorrect item, please contact us
              within <strong>48 hours</strong> of delivery at{" "}
              <a
                href="mailto:support@virasatjewels.com"
                className="text-burgundy underline hover:text-burgundy-dark"
              >
                support@virasatjewels.com
              </a>{" "}
              with photographs of the damage. We will arrange a replacement or
              full refund at no cost to you, including return shipping.
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
