import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the VirasatJewels team — we're here to help with enquiries about our jewellery, orders, and craftsmanship.",
};

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-16 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          We&apos;d Love to Hear From You
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-cream mb-4">
          Contact Us
        </h1>
        <div className="flex justify-center">
          <div className="h-px w-16 bg-gold/40" />
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Contact info */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
                Get in Touch
              </h2>
              <p className="text-charcoal-light text-sm sm:text-base leading-relaxed mb-8">
                Whether you have a question about a specific piece, need help
                with your order, or simply want to know more about our
                craftsmanship traditions — we&apos;re here for you.
              </p>

              <div className="space-y-5">
                <ContactDetail
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  }
                  label="Email"
                  value="support@virasatjewels.com"
                  href="mailto:support@virasatjewels.com"
                />
                <ContactDetail
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 11.11 19.79 19.79 0 0 1 1.27 2.33 2 2 0 0 1 3.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  }
                  label="Phone"
                  value="+1 (555) 123-4567"
                  href="tel:+15551234567"
                />
                <ContactDetail
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  }
                  label="Response Time"
                  value="Within 1–2 business days"
                />
              </div>

              <div className="mt-10 bg-white border border-gold/20 rounded-sm p-5">
                <h3 className="font-serif text-base text-charcoal mb-2">
                  Bespoke Orders
                </h3>
                <p className="text-charcoal-light text-sm leading-relaxed">
                  Interested in a custom or bespoke piece? We work with a
                  select number of clients each season to create truly unique
                  heirloom jewellery. Please reach out to begin the
                  conversation.
                </p>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
                Send a Message
              </h2>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

function ContactDetail({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gold flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-widest text-charcoal-light mb-0.5">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="text-charcoal text-sm hover:text-burgundy transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="text-charcoal text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}
