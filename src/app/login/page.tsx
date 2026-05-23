"use client";

import { useState, useCallback, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button, Input } from "@/components/ui";

type Step = "phone" | "otp" | "done";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const getRecaptcha = () => {
    if (!recaptchaRef.current) {
      const auth = getFirebaseAuth();
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    }
    return recaptchaRef.current;
  };

  const sendOTP = useCallback(async () => {
    setError("");
    const formatted = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
    if (formatted.length < 12) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const result = await signInWithPhoneNumber(auth, formatted, getRecaptcha());
      confirmationRef.current = result;
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const verifyOTP = useCallback(async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await confirmationRef.current!.confirm(otp);
      setStep("done");
      window.location.href = "/dashboard";
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-[var(--font-display)] text-[28px] tracking-[-0.84px] text-deep-midnight">
            Go2GST
          </h1>
          <p className="text-[14px] text-muted-stone mt-2 tracking-[-0.02em]">
            {step === "phone" && "Enter your phone number to get started"}
            {step === "otp" && "Enter the OTP sent to your phone"}
            {step === "done" && "Redirecting..."}
          </p>
        </div>

        {step === "phone" && (
          <div className="space-y-6">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
              autoFocus
            />
            <Button variant="primary" size="lg" className="w-full" onClick={sendOTP} loading={loading}>
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <Input
              label="OTP"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              error={error}
              autoFocus
            />
            <Button variant="primary" size="lg" className="w-full" onClick={verifyOTP} loading={loading}>
              Verify & Login
            </Button>
            <button
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              className="w-full text-[13px] text-deep-space-violet hover:underline"
            >
              ← Change number
            </button>
          </div>
        )}

        <div id="recaptcha-container" />
      </div>
    </main>
  );
}
