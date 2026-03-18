"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("You've joined the Virasat family. Welcome!");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <section className="bg-burgundy py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Decorative top rule */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-gold/40" />
          <div className="w-2 h-2 rounded-full bg-gold/60" />
          <div className="h-px w-16 bg-gold/40" />
        </div>

        <p className="text-gold text-xs uppercase tracking-widest mb-3">
          Exclusive Access
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-cream mb-4">
          Join the Virasat Family
        </h2>
        <p className="text-cream/70 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
          Be the first to discover new arrivals, heritage stories, and members-only
          offers. No spam — only beauty.
        </p>

        {status === "success" ? (
          <div className="bg-gold/20 border border-gold/40 rounded-sm px-6 py-4 text-cream text-sm">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              disabled={status === "loading"}
              className="flex-1 px-4 py-3 bg-white/10 border border-gold/40 text-cream placeholder-cream/40 text-sm rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-gold text-charcoal text-sm font-medium uppercase tracking-widest rounded-sm hover:bg-gold-light transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-xs text-red-300">{message}</p>
        )}

        <p className="mt-4 text-cream/40 text-xs">
          Your privacy is respected. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
