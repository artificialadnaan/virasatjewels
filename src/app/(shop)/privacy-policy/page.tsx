import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "VirasatJewels privacy policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-16 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          Your Privacy Matters
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream mb-4">
          Privacy Policy
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

          <PolicySection title="Introduction">
            <p>
              VirasatJewels (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;) is committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              describes how we collect, use, and share information when you
              visit our website or make a purchase from us.
            </p>
            <p>
              By using our website, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </PolicySection>

          <PolicySection title="Information We Collect">
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>
                <strong className="text-charcoal">Account information:</strong>{" "}
                Name, email address, and password (hashed) when you create an
                account.
              </li>
              <li>
                <strong className="text-charcoal">Order information:</strong>{" "}
                Billing and shipping address, phone number, and order history.
              </li>
              <li>
                <strong className="text-charcoal">Payment information:</strong>{" "}
                Payment is processed securely by Stripe. We do not store your
                full card details on our servers.
              </li>
              <li>
                <strong className="text-charcoal">
                  Communications:
                </strong>{" "}
                Emails or messages you send us, including support enquiries.
              </li>
              <li>
                <strong className="text-charcoal">Newsletter:</strong> Your
                email address if you subscribe to marketing communications.
              </li>
              <li>
                <strong className="text-charcoal">Usage data:</strong>{" "}
                Pages visited, time on site, and other analytics data (via
                Google Analytics 4, where consented).
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="How We Use Your Information">
            <p>We use your personal information to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>Process and fulfil your orders</li>
              <li>Send order confirmations and shipping notifications</li>
              <li>Provide customer support</li>
              <li>Send marketing emails (only with your consent)</li>
              <li>Improve our website and product offerings</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </PolicySection>

          <PolicySection title="Payment Processing (Stripe)">
            <p>
              We use <strong>Stripe</strong> as our payment processor. When you
              make a purchase, your payment information is transmitted directly
              to Stripe and is subject to their{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-burgundy underline hover:text-burgundy-dark"
              >
                Privacy Policy
              </a>
              . VirasatJewels never has access to your full card number, CVV,
              or other sensitive payment details.
            </p>
          </PolicySection>

          <PolicySection title="Sharing Your Information">
            <p>
              We do not sell or rent your personal information to third parties.
              We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>
                Shipping carriers to fulfil your orders
              </li>
              <li>
                Stripe for payment processing
              </li>
              <li>
                Email service providers for transactional and marketing emails
              </li>
              <li>
                Analytics providers (Google Analytics) to understand site usage
              </li>
              <li>
                Law enforcement or regulatory bodies when required by law
              </li>
            </ul>
          </PolicySection>

          <PolicySection title="Cookies">
            <p>
              We use cookies and similar tracking technologies to enhance your
              experience on our website. These include:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>
                <strong className="text-charcoal">Essential cookies:</strong>{" "}
                Required for the site to function (e.g., shopping cart, session
                management).
              </li>
              <li>
                <strong className="text-charcoal">Analytics cookies:</strong>{" "}
                Used to understand how visitors interact with our site (Google
                Analytics).
              </li>
            </ul>
            <p>
              You can disable cookies in your browser settings, although this
              may affect the functionality of certain parts of the site.
            </p>
          </PolicySection>

          <PolicySection title="Data Retention">
            <p>
              We retain your personal data for as long as necessary to fulfil
              the purposes outlined in this policy, including for legal,
              accounting, or reporting requirements. Order data is retained for
              a minimum of 7 years in accordance with accounting regulations.
            </p>
          </PolicySection>

          <PolicySection title="Your Rights">
            <p>
              Depending on your location, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-charcoal-light">
              <li>The right to access the data we hold about you</li>
              <li>The right to correct inaccurate data</li>
              <li>
                The right to request deletion of your data (&ldquo;right to be
                forgotten&rdquo;)
              </li>
              <li>The right to opt out of marketing communications</li>
              <li>
                The right to data portability (receive your data in a portable
                format)
              </li>
            </ul>
            <p>
              To exercise any of these rights, please email us at{" "}
              <a
                href="mailto:privacy@virasatjewels.com"
                className="text-burgundy underline hover:text-burgundy-dark"
              >
                privacy@virasatjewels.com
              </a>
              .
            </p>
          </PolicySection>

          <PolicySection title="Contact Us">
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@virasatjewels.com"
                className="text-burgundy underline hover:text-burgundy-dark"
              >
                privacy@virasatjewels.com
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
