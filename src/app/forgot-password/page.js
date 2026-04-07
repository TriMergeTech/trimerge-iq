"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/api";

const initialValues = {
  email: "",
};

function ShieldCheckIcon() {
  return (
    <svg className="h-12 w-12" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M32 6L12 14V31c0 14 9.4 24 20 27 10.6-3 20-13 20-27V14L32 6Z"
        fill="url(#shieldGradient)"
      />
      <path
        d="M32 6L12 14V31c0 14 9.4 24 20 27 10.6-3 20-13 20-27V14L32 6Z"
        stroke="#4F7ED9"
        strokeWidth="1.5"
      />
      <path
        d="M24 32.5l6 6.2L41 27.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="shieldGradient" x1="12" y1="6" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5C94F0" />
          <stop offset="1" stopColor="#3F73D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2.5 5A2.5 2.5 0 0 1 5 2.5h10A2.5 2.5 0 0 1 17.5 5v10a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 15V5Zm2 .6v.2l5.2 3.7a.5.5 0 0 0 .6 0l5.2-3.7v-.2a.5.5 0 0 0-.5-.6H5a.5.5 0 0 0-.5.6Z" />
    </svg>
  );
}

function EmailConfirmationIcon() {
  return (
    <svg className="h-24 w-24" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* Envelope */}
      <rect x="16" y="24" width="64" height="48" rx="4" fill="#D9E8F7" stroke="#B0D4F1" strokeWidth="2" />
      <path d="M16 24L48 48L80 24" stroke="#B0D4F1" strokeWidth="2" fill="none" />
      
      {/* Checkmark circle */}
      <circle cx="64" cy="56" r="20" fill="#5E94EA" />
      <path d="M56 56l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InputField({
  name,
  type,
  label,
  value,
  onChange,
  icon,
  error,
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div
        className={[
          "flex items-center gap-3 rounded-xl border bg-white px-4 py-3",
          error ? "border-rose-300" : "border-slate-200",
        ].join(" ")}
      >
        <span className="text-slate-400">{icon}</span>
        <input
          name={name}
          type={type}
          placeholder={label}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 outline-none"
          autoComplete={name}
        />
      </div>
      {error ? <p className="mt-1 text-sm text-rose-500">{error}</p> : null}
    </label>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function validate(values) {
    const nextErrors = {};

    if (!values.email.trim()) nextErrors.email = "Email is required.";

    return nextErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...formValues, [name]: value };
    setFormValues(nextValues);

    if (hasAnyError) {
      setErrors(validate(nextValues));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(formValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(formValues.email);
      router.push("/reset-password");
    } catch (error) {
      console.error("Forgot password request failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#ECEFF6] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <section className="mb-8 text-center sm:mb-10">
          <div className="mb-3 flex justify-center">
            <ShieldCheckIcon />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#334E8A]">
            TriMerge <span className="text-[#5D8FE7]">IQ</span>
          </h1>
          <p className="mt-3 text-sm text-[#6E8EAC]">In-House AI Knowledge Tool</p>
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-[0_12px_35px_rgba(26,61,130,0.12)] ring-1 ring-white/70 sm:p-8">
          <h2 className="mb-2 text-center text-2xl font-semibold text-[#334E8A]">Forgot Password</h2>
          <p className="mb-6 text-center text-sm text-slate-600">Enter your email and we'll send you a password reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <InputField
              name="email"
              type="email"
              label="Email"
              value={formValues.email}
              onChange={handleChange}
              icon={<MailIcon />}
              error={errors.email}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5E94EA] to-[#4A82DE] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_20px_rgba(64,123,220,0.25)] transition-all hover:from-[#4F88E3] hover:to-[#3E74D3] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">Back to </span>
            <Link
              href="/login"
              className="text-base font-semibold text-[#4A82DE] transition-colors hover:text-[#396FC5]"
            >
              Log In
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
