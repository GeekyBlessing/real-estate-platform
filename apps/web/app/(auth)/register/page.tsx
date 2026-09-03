"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const ROLE_OPTIONS = [
  { value: "tenant", label: "Tenant" },
  { value: "buyer", label: "Buyer" },
  { value: "landlord", label: "Landlord" },
  { value: "agent", label: "Agent" },
];

export default function RegisterPage() {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPhoneError("");
    if (phone && !/^0\d{10}$/.test(phone)) {
      setPhoneError("Enter a valid 11 digit Nigerian number.");
      return;
    }
    setSubmitting(true);
    // Phase 3 wires this to POST /auth/register, followed by the
    // email and phone verification flow (Section 8 of the
    // architecture). Simulated here so the flow is real to review.
    setTimeout(() => {
      setSubmitting(false);
      showToast("Account created. Check your email to verify your address.", "success");
    }, 700);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Create an account</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Search, save properties, and message agents directly.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Input
          label="Full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="max-w-none"
          required
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="max-w-none"
          required
        />
        <Input
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          error={phoneError || undefined}
          hint={phoneError ? undefined : "Used to verify your account and for agents to reach you."}
          className="max-w-none"
          required
        />
        <Select
          label="I am a"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="max-w-none"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="At least 8 characters."
          className="max-w-none"
          required
        />

        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            required
            className="mt-0.5"
          />
          I agree to the <Link href="/terms" className="font-semibold text-patina hover:text-patina-deep">terms of service</Link> and{" "}
          <Link href="/privacy" className="font-semibold text-patina hover:text-patina-deep">privacy policy</Link>.
        </label>

        <Button type="submit" loading={submitting} disabled={!agreed} className="w-full justify-center">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="font-semibold text-patina hover:text-patina-deep">Sign in</Link>
      </p>
    </div>
  );
}
