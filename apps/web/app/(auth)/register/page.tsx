"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

const ROLE_OPTIONS = [
  { value: "tenant", label: "Tenant" },
  { value: "buyer", label: "Buyer" },
  { value: "landlord", label: "Landlord" },
  { value: "agent", label: "Agent" },
];

export default function RegisterPage() {
  const { showToast } = useToast();
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPhoneError("");
    setFormError("");
    if (phone && !/^0\d{10}$/.test(phone)) {
      setPhoneError("Enter a valid 11 digit Nigerian number.");
      return;
    }
    setSubmitting(true);
    try {
      // Real registration now (apps/api's /auth/register): email and
      // phone verification gating "full standing" (architecture doc
      // section 8) isn't built yet, so the account can sign in right
      // away rather than waiting on a verification email that doesn't
      // exist to send.
      await register({ fullName, email, phone, role, password });
      showToast("Account created.", "success");
      router.push("/");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Create an account</h1>
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
          error={formError || undefined}
          hint={formError ? undefined : "At least 8 characters."}
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
