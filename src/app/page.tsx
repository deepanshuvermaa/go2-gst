import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(252,252,252,0.92)] backdrop-blur-[16px] border-b border-[#e2e8f0]">
        <div className="max-w-[1120px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-[var(--font-heading)] text-[17px] font-semibold text-[#1a1a2e]">Go2GST</span>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-[13px] text-[#4a5568] hover:text-[#1a1a2e] transition-colors">Features</a>
              <a href="#how" className="text-[13px] text-[#4a5568] hover:text-[#1a1a2e] transition-colors">How it works</a>
              <a href="#pricing" className="text-[13px] text-[#4a5568] hover:text-[#1a1a2e] transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-[#4a5568] hover:text-[#1a1a2e] transition-colors px-3 py-2">
              Log in
            </Link>
            <Link href="/dashboard" className="h-[36px] px-4 bg-[#3b5bdb] text-white text-[13px] font-medium rounded-[10px] inline-flex items-center hover:bg-[#4c6ef5] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-[140px] pb-[80px] px-6">
        <div className="max-w-[640px] mx-auto text-center">
          <div className="fade-in-up">
            <span className="inline-flex items-center gap-2 h-[30px] px-3.5 rounded-full bg-[#eef2fb] border border-[#d6e4ff] text-[12px] font-medium text-[#3b5bdb]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b5bdb]" />
              AI-powered GST compliance
            </span>
          </div>

          <h1 className="fade-in-up delay-1 font-[var(--font-heading)] text-[42px] font-bold leading-[1.1] text-[#1a1a2e] mt-6">
            Snap a bill,<br />get it filed.
          </h1>

          <p className="fade-in-up delay-2 text-[16px] leading-[1.6] text-[#4a5568] mt-5 max-w-[460px] mx-auto">
            AI extracts GSTIN, HSN codes, and tax splits from any invoice photo. Export GSTR-1 and 3B in one click.
          </p>

          <div className="fade-in-up delay-3 flex items-center justify-center gap-3 mt-8">
            <Link href="/scan" className="h-[48px] px-[22px] bg-[#3b5bdb] text-white text-[14px] font-medium rounded-[12px] inline-flex items-center hover:bg-[#4c6ef5] transition-all hover:shadow-[0_4px_16px_rgba(59,91,219,0.2)]">
              Start Scanning — Free
            </Link>
            <a href="#how" className="h-[48px] px-[22px] text-[14px] font-medium text-[#4a5568] rounded-[12px] inline-flex items-center border border-[#e2e8f0] hover:border-[#94a3b8] hover:bg-[#eef2fb] transition-all">
              See how it works
            </a>
          </div>

          <p className="fade-in-up delay-4 text-[12px] text-[#94a3b8] mt-5">
            No credit card · 1000 free scans/day · Works with any Indian invoice
          </p>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 pb-[100px]">
        <div className="fade-in-up delay-5 max-w-[900px] mx-auto rounded-[20px] bg-[#eef2fb] border border-[#d6e4ff] p-3 shadow-[0_8px_30px_rgba(26,26,46,0.08)]">
          <div className="rounded-[16px] bg-[#fcfcfc] border border-[#e2e8f0] p-6 md:p-8">
            {/* Mini dashboard preview */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Expenses", value: "₹2,41,800", trend: "+12%", up: true },
                { label: "GST Paid", value: "₹43,524", trend: "Output", up: false },
                { label: "ITC Claimable", value: "₹38,190", trend: "+15%", up: true },
              ].map((c) => (
                <div key={c.label} className="bg-[#eef2fb] rounded-[12px] p-4">
                  <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-[0.04em]">{c.label}</p>
                  <p className="font-[var(--font-heading)] text-[22px] md:text-[26px] font-semibold text-[#1a1a2e] mt-1.5">{c.value}</p>
                  {c.up && <span className="text-[11px] font-medium text-[#22c55e] mt-1 inline-block">{c.trend}</span>}
                  {!c.up && <span className="text-[11px] text-[#94a3b8] mt-1 inline-block">{c.trend}</span>}
                </div>
              ))}
            </div>
            {/* Mini bill list */}
            <div className="space-y-1.5">
              {[
                { name: "Amazon India", amount: "₹4,999", itc: true },
                { name: "Airtel Broadband", amount: "₹1,180", itc: true },
                { name: "Swiggy Business", amount: "₹890", itc: false },
              ].map((b) => (
                <div key={b.name} className="flex items-center justify-between px-4 py-3 rounded-[10px] bg-[#fcfcfc] border border-[#e2e8f0]">
                  <span className="text-[13px] font-medium text-[#1a1a2e]">{b.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[13px] font-medium text-[#1a1a2e] tabular-nums">{b.amount}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${b.itc ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#ef4444]/10 text-[#ef4444]"}`}>
                      {b.itc ? "ITC ✓" : "Blocked"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-[80px]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-[var(--font-heading)] text-[28px] font-semibold text-[#1a1a2e]">Built for Indian businesses</h2>
            <p className="text-[15px] text-[#4a5568] mt-3 max-w-[420px] mx-auto">Every feature designed around GST compliance, from scanning to filing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "⚡", title: "3s Extraction", desc: "AI reads GSTIN, HSN, tax splits, and line items from any photo." },
              { icon: "✓", title: "Auto Validation", desc: "GSTIN checksum, IFSC, PAN format — all verified offline instantly." },
              { icon: "📊", title: "GSTR Export", desc: "One-click JSON in GSTN format. Upload directly to the portal." },
              { icon: "🏦", title: "ITC Tracking", desc: "Auto-flags eligible Input Tax Credit. Never miss a claim." },
              { icon: "🤖", title: "Telegram Bot", desc: "Send a photo to @Go2GSTBot. Get data back in 5 seconds." },
              { icon: "👥", title: "CA Portal", desc: "Manage all clients from one dashboard. Review and export." },
            ].map((f) => (
              <div key={f.title} className="rounded-[14px] border border-[#e2e8f0] bg-[#fcfcfc] p-5 hover:border-[#d6e4ff] hover:bg-[#eef2fb] transition-all duration-200">
                <span className="text-[22px]">{f.icon}</span>
                <h3 className="font-[var(--font-heading)] text-[14px] font-semibold text-[#1a1a2e] mt-3">{f.title}</h3>
                <p className="text-[13px] text-[#4a5568] leading-[1.5] mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-[80px] bg-[#eef2fb]">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="font-[var(--font-heading)] text-[28px] font-semibold text-[#1a1a2e]">How it works</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Snap or upload", desc: "Take a photo or drop a PDF of any Indian invoice." },
              { step: "2", title: "AI extracts", desc: "GSTIN, HSN, amounts, tax splits — validated in 3 seconds." },
              { step: "3", title: "Export & file", desc: "Download GSTR-1/3B JSON. Upload to GST portal directly." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#3b5bdb] text-white text-[14px] font-semibold inline-flex items-center justify-center">{s.step}</div>
                <h3 className="font-[var(--font-heading)] text-[14px] font-semibold text-[#1a1a2e] mt-4">{s.title}</h3>
                <p className="text-[13px] text-[#4a5568] mt-2 leading-[1.5]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-[80px]">
        <div className="max-w-[560px] mx-auto text-center">
          <h2 className="font-[var(--font-heading)] text-[28px] font-semibold text-[#1a1a2e]">Stop typing bills into Tally.</h2>
          <p className="text-[15px] text-[#4a5568] mt-3">Join thousands of Indian businesses automating GST compliance.</p>
          <Link href="/scan" className="inline-flex items-center h-[48px] px-[22px] bg-[#3b5bdb] text-white text-[14px] font-medium rounded-[12px] mt-7 hover:bg-[#4c6ef5] transition-all hover:shadow-[0_4px_16px_rgba(59,91,219,0.2)]">
            Start Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-[#e2e8f0]">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <span className="font-[var(--font-heading)] text-[13px] font-medium text-[#94a3b8]">Go2GST</span>
          <span className="text-[12px] text-[#94a3b8]">© 2024 Go2GST. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
