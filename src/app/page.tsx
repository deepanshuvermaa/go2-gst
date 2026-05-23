import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas-white/80 backdrop-blur-xl border-b border-ink-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-[var(--font-display)] text-[18px] font-semibold tracking-[-0.03em] text-deep-midnight">
            Go2GST
          </span>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-[14px] text-muted-stone hover:text-ink-black transition-colors hidden sm:block">Features</a>
            <a href="#pricing" className="text-[14px] text-muted-stone hover:text-ink-black transition-colors hidden sm:block">Pricing</a>
            <Link
              href="/dashboard"
              className="bg-deep-midnight text-canvas-white px-5 py-2 rounded-[100px] text-[13px] font-medium tracking-[-0.01em] hover:bg-carbon-gray transition-colors"
            >
              Open App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[100px] bg-violet-muted border border-deep-space-violet/10 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-deep-space-violet animate-pulse-subtle" />
              <span className="text-[12px] font-medium text-deep-space-violet tracking-[-0.01em]">Now with Groq AI — 1000 free scans/day</span>
            </div>
          </div>

          <h1 className="fade-in-up fade-in-up-delay-1 font-[var(--font-display)] text-[clamp(36px,6vw,72px)] leading-[1.05] tracking-[-0.035em] font-semibold text-deep-midnight">
            Snap a bill.<br />
            <span className="text-gradient">Get it filed.</span>
          </h1>

          <p className="fade-in-up fade-in-up-delay-2 mt-6 text-[17px] leading-[1.6] text-muted-stone max-w-xl mx-auto tracking-[-0.01em]">
            AI-powered GST extraction that turns photos of invoices into validated, filing-ready data. GSTR-1 and 3B exports in one click.
          </p>

          <div className="fade-in-up fade-in-up-delay-3 mt-10 flex items-center justify-center gap-4">
            <Link
              href="/scan"
              className="bg-deep-midnight text-canvas-white px-8 py-4 rounded-[100px] text-[15px] font-medium tracking-[-0.01em] hover:bg-carbon-gray transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Scanning — Free
            </Link>
            <a
              href="#features"
              className="px-6 py-4 rounded-[100px] text-[15px] font-medium text-deep-space-violet border border-deep-space-violet/20 hover:bg-violet-muted transition-all tracking-[-0.01em]"
            >
              See how it works
            </a>
          </div>

          <p className="fade-in-up fade-in-up-delay-4 mt-6 text-[12px] text-muted-stone">
            No credit card required · Works with any Indian invoice
          </p>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="fade-in-up fade-in-up-delay-4 rounded-[16px] bg-carbon-gray p-2 glow-violet">
            <div className="rounded-[12px] bg-steel-gray p-8 md:p-12">
              <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-carbon-gray rounded-[12px] p-5">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">Expenses</p>
                  <p className="font-[var(--font-display)] text-[28px] md:text-[32px] text-canvas-white font-semibold tracking-[-0.03em] mt-2">₹2.4L</p>
                  <p className="text-[12px] text-success mt-1">+12% this month</p>
                </div>
                <div className="bg-carbon-gray rounded-[12px] p-5">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">GST Paid</p>
                  <p className="font-[var(--font-display)] text-[28px] md:text-[32px] text-canvas-white font-semibold tracking-[-0.03em] mt-2">₹43.5K</p>
                  <p className="text-[12px] text-canvas-white/50 mt-1">Output tax</p>
                </div>
                <div className="bg-carbon-gray rounded-[12px] p-5">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-canvas-white/40 font-medium">ITC</p>
                  <p className="font-[var(--font-display)] text-[28px] md:text-[32px] text-canvas-white font-semibold tracking-[-0.03em] mt-2">₹38.1K</p>
                  <p className="text-[12px] text-success mt-1">Claimable</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Amazon India", gstin: "27AABCU9603R1ZX", amount: "₹4,999", tag: "ITC ✓" },
                  { name: "Airtel Broadband", gstin: "06AARCA1234B1Z5", amount: "₹1,180", tag: "ITC ✓" },
                  { name: "Swiggy Business", gstin: "29AABCS1234C1Z8", amount: "₹890", tag: "Blocked" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-carbon-gray rounded-[10px] px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-steel-gray flex items-center justify-center">
                        <span className="text-[12px] text-canvas-white/60">📄</span>
                      </div>
                      <div>
                        <p className="text-[13px] text-canvas-white font-medium">{item.name}</p>
                        <p className="text-[11px] text-canvas-white/40 font-mono">{item.gstin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-canvas-white font-medium">{item.amount}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${item.tag === "ITC ✓" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-surface-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[var(--font-display)] text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.03em] text-deep-midnight">
              Built for Indian businesses
            </h2>
            <p className="mt-4 text-[16px] text-muted-stone max-w-lg mx-auto">
              Every feature designed around GST compliance. From bill scanning to portal-ready JSON exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "⚡", title: "3-Second Extraction", desc: "AI reads your bill and extracts GSTIN, HSN codes, tax splits, and line items instantly." },
              { icon: "✓", title: "Auto Validation", desc: "GSTIN checksum, IFSC verification, PAN format check, and amount cross-validation — all offline." },
              { icon: "📊", title: "GSTR-1 & 3B Export", desc: "One-click JSON export in GSTN offline tool format. Upload directly to the GST portal." },
              { icon: "🏦", title: "ITC Tracking", desc: "Automatically flags eligible Input Tax Credit. Never miss a claim under Section 17(5)." },
              { icon: "🤖", title: "Telegram Bot", desc: "Send a bill photo to @Go2GSTBot. Get structured data back in 5 seconds. No app needed." },
              { icon: "👥", title: "CA Portal", desc: "Manage multiple clients from one dashboard. Review, approve, and export for all your clients." },
            ].map((f) => (
              <div key={f.title} className="bg-canvas-white rounded-[12px] p-6 border-subtle hover-lift">
                <span className="text-[24px]">{f.icon}</span>
                <h3 className="mt-4 text-[15px] font-semibold text-deep-midnight tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-2 text-[13px] text-muted-stone leading-[1.5]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[12px] uppercase tracking-[0.1em] text-muted-stone font-medium mb-8">Trusted by</p>
          <div className="flex items-center justify-center gap-12 opacity-40">
            {["CAs", "Freelancers", "D2C Brands", "SaaS Companies", "Agencies"].map((t) => (
              <span key={t} className="text-[14px] font-medium text-ink-black tracking-[-0.01em] hidden sm:block">{t}</span>
            ))}
            <span className="text-[14px] font-medium text-ink-black sm:hidden">400+ CAs · 2000+ Businesses</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="bg-deep-midnight rounded-[20px] p-12 md:p-16 text-center">
            <h2 className="font-[var(--font-display)] text-[clamp(24px,4vw,40px)] font-semibold tracking-[-0.03em] text-canvas-white">
              Stop typing bills into Tally.
            </h2>
            <p className="mt-4 text-[15px] text-canvas-white/60 max-w-md mx-auto">
              Join thousands of Indian businesses automating their GST compliance with AI.
            </p>
            <Link
              href="/scan"
              className="inline-block mt-8 bg-canvas-white text-deep-midnight px-8 py-4 rounded-[100px] text-[15px] font-semibold tracking-[-0.01em] hover:bg-canvas-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-ink-black/[0.04]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-[var(--font-display)] text-[14px] font-medium text-muted-stone">Go2GST</span>
          <p className="text-[12px] text-muted-stone">© 2024 Go2GST. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
