"use client";

import { Card, Input, Button } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[var(--font-display)] text-[28px] leading-[1.13] tracking-[-0.84px] text-deep-midnight">
          Settings
        </h1>
        <p className="text-[14px] text-muted-stone mt-1 tracking-[-0.02em]">
          Manage your account and organization
        </p>
      </div>

      <Card surface="light" padding="lg" className="space-y-6 max-w-lg">
        <h2 className="text-[16px] font-medium text-ink-black tracking-[-0.02em]">
          Business Details
        </h2>
        <Input label="Business Name" placeholder="Your business name" />
        <Input label="GSTIN" placeholder="27AABCU9603R1ZX" hint="15-character GST Identification Number" />
        <Input label="PAN" placeholder="AABCU9603R" />
        <Input label="Phone" placeholder="+91 98765 43210" type="tel" />
        <Button variant="primary" size="md">Save Changes</Button>
      </Card>

      <Card surface="light" padding="lg" className="space-y-4 max-w-lg">
        <h2 className="text-[16px] font-medium text-ink-black tracking-[-0.02em]">
          Telegram Bot
        </h2>
        <p className="text-[13px] text-muted-stone tracking-[-0.02em]">
          Connect your Telegram account to scan bills via chat.
        </p>
        <Button variant="ghost" size="md">Connect @Go2GSTBot</Button>
      </Card>
    </div>
  );
}
