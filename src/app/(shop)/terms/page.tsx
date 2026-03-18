import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "VirasatJewels terms of service — the rules and conditions governing use of our website and purchase of our products.",
};

export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-16 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          Legal
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream mb-4">
          Terms of Service
        </h1>
        <div className="flex justify-center">
          <div className="h-px w-16 bg-gold/40" />
        </div>
        <p className="text-cream/60 text-xs mt-4">
          Last updated: March 2025
        </p>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">

          <PolicySection title="Agreement to Terms">
            <p>
              By accessing and using the VirasatJewels website
              (virasatjewels.com), you agree to be bound by these Terms of
              Service and all applicable laws and regulations. If you do not
              agree with any of these terms, you are prohibited from using this
              site.
            </p>
          </PolicySection>

          <PolicySection title="Use of the Website">
            <p>You agree to use this website only for lawful purposes and in a way that does not:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>Infringe the rights of others</li>
              <li>Restrict or inhibit anyone else&apos;s use of the website</li>
              <li>
                Transmit unsolicited commercial communications or &ldquo;spam&rdquo;
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the website
                or its related systems
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Products &amp; Pricing">
            <p>
              We reserve the right to modify or discontinue any product at any
              time without notice. Prices are displayed in US Dollars (USD) and
              are subject to change. We make every effort to display product
              colours and images accurately, but we cannot guarantee that your
              screen display will be accurate.
            </p>
            <p>
              We reserve the right to refuse or cancel any order if a product
              is listed at an incorrect price due to a typographical error or
              system error.
            </p>
          </PolicySection>

          <PolicySection title="Orders &amp; Payment">
            <p>
              By placing an order, you warrant that you are legally capable of
              entering into binding contracts and are at least 18 years old.
              All orders are subject to acceptance and availability.
            </p>
            <p>
              Payment is processed via Stripe. By providing payment information,
              you represent that you are authorised to use the payment method
              provided. All prices are inclusive of applicable taxes unless
              otherwise stated.
            </p>
          </PolicySection>

          <PolicySection title="Shipping &amp; Delivery">
            <p>
              Estimated delivery times are provided in good faith but are not
              guaranteed. VirasatJewels is not responsible for delays caused by
              carriers, customs, or other circumstances outside our control.
              Risk of loss and title for purchased items passes to you upon
              delivery.
            </p>
          </PolicySection>

          <PolicySection title="Intellectual Property">
            <p>
              All content on this website — including text, images, graphics,
              logos, and product descriptions — is the property of VirasatJewels
              and is protected by applicable intellectual property laws. You may
              not reproduce, distribute, or create derivative works without our
              express written permission.
            </p>
          </PolicySection>

          <PolicySection title="Disclaimer of Warranties">
            <p>
              This website and its contents are provided on an &ldquo;as is&rdquo; and
              &ldquo;as available&rdquo; basis without any warranties of any kind, express
              or implied. VirasatJewels does not warrant that the website will
              be uninterrupted, error-free, or free of viruses or other harmful
              components.
            </p>
          </PolicySection>

          <PolicySection title="Limitation of Liability">
            <p>
              To the fullest extent permitted by law, VirasatJewels shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of your use of, or inability to use,
              this website or any products purchased from it.
            </p>
          </PolicySection>

          <PolicySection title="Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the United States, without regard to its conflict of
              law provisions. Any disputes arising under these Terms shall be
              subject to the exclusive jurisdiction of the courts located in the
              United States.
            </p>
          </PolicySection>

          <PolicySection title="Changes to Terms">
            <p>
              We reserve the right to update these Terms of Service at any time.
              Changes will be effective immediately upon posting to the website.
              Your continued use of the website after any changes constitutes
              your acceptance of the new terms.
            </p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>
              For questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@virasatjewels.com"
                className="text-burgundy underline hover:text-burgundy-dark"
              >
                legal@virasatjewels.com
              </a>
              .
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
