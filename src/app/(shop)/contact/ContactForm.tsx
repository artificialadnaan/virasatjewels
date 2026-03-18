"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Unable to send message. Please try again later.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-sm p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="font-serif text-lg text-charcoal mb-2">
          Message Received
        </h3>
        <p className="text-charcoal-light text-sm">
          Thank you for reaching out. We&apos;ll get back to you within 1–2
          business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-xs uppercase tracking-widest text-charcoal mb-1.5"
          >
            Name <span className="text-burgundy">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your full name"
            disabled={status === "loading"}
            className="w-full px-4 py-3 bg-white border border-gold/30 text-charcoal placeholder-charcoal-light/60 text-sm rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition disabled:opacity-60"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest text-charcoal mb-1.5"
          >
            Email <span className="text-burgundy">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            disabled={status === "loading"}
            className="w-full px-4 py-3 bg-white border border-gold/30 text-charcoal placeholder-charcoal-light/60 text-sm rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-xs uppercase tracking-widest text-charcoal mb-1.5"
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="How can we help?"
          disabled={status === "loading"}
          className="w-full px-4 py-3 bg-white border border-gold/30 text-charcoal placeholder-charcoal-light/60 text-sm rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-xs uppercase tracking-widest text-charcoal mb-1.5"
        >
          Message <span className="text-burgundy">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us about your enquiry…"
          disabled={status === "loading"}
          className="w-full px-4 py-3 bg-white border border-gold/30 text-charcoal placeholder-charcoal-light/60 text-sm rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition resize-none disabled:opacity-60"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-8 py-3.5 bg-burgundy text-cream text-sm font-medium uppercase tracking-widest rounded-sm hover:bg-burgundy-dark transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
