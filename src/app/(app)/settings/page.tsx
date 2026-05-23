"use client";

import { Input, Button } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[var(--font-heading)] text-[24px] font-semibold text-[#1a1a2e]">Settings</h1>
        <p className="text-[13px] text-[#94a3b8] mt-1">Manage your account and organization</p>
      </div>

      <div className="max-w-[520px] space-y-6 rounded-[14px] border border-[#e2e8f0] p-6">
        <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e]">Business Details</h2>
        <Input label="Business Name" placeholder="Your business name" />
        <Input label="GSTIN" placeholder="27AABCU9603R1ZX" hint="15-character GST Identification Number" />
        <Input label="PAN" placeholder="AABCU9603R" />
        <Input label="Phone" placeholder="+91 98765 43210" type="tel" />
        <Button variant="primary" size="md">Save Changes</Button>
      </div>

      <div className="max-w-[520px] space-y-4 rounded-[14px] border border-[#e2e8f0] p-6">
        <h2 className="font-[var(--font-heading)] text-[15px] font-semibold text-[#1a1a2e]">Telegram Bot</h2>
        <p className="text-[13px] text-[#94a3b8]">Connect your Telegram account to scan bills via chat.</p>
        <Button variant="secondary" size="md">Connect @Go2GSTBot</Button>
      </div>
    </div>
  );
}
