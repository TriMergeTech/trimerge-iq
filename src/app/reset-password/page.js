"use client";

import Link from "next/link";
import Head from "next/head";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api";

const initialValues = {
  password: "",
  confirmPassword: "",
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

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.4 8.1V6.7a3.6 3.6 0 1 1 7.2 0V8h.9A2.4 2.4 0 0 1 17 10.5v5.1a2.4 2.4 0 0 1-2.5 2.4h-9A2.4 2.4 0 0 1 3 15.6v-5A2.4 2.4 0 0 1 5.5 8h.9Zm1.8-.1h3.6V6.7a1.8 1.8 0 1 0-3.6 0V8Z" />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 10c1.7-3 4.4-5 8-5s6.3 2 8 5c-1.7 3-4.4 5-8 5s-6.3-2-8-5Z" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10c1.7-3 4.4-5 8-5s6.3 2 8 5c-1.7 3-4.4 5-8 5s-6.3-2-8-5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 4l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function InputField({ name, type, label, value, onChange, icon, error, rightAction }) {
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
        {rightAction}
      </div>
      {error ? <p className="mt-1 text-sm text-rose-500">{error}</p> : null}
    </label>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [formValues, setFormValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  function validate(values) {
    const nextErrors = {};

    if (!values.password) {
      nextErrors.password = "New password is required.";
    } else if (values.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

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
      await resetPassword(token, formValues.password);
      setSuccess(true);
    } catch (error) {
      console.error("Reset password failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password | TriMerge IQ</title>
      </Head>
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
          <h2 className="mb-2 text-center text-2xl font-semibold text-[#334E8A]">Reset Password</h2>
          <p className="mb-6 text-center text-sm text-slate-600">Enter your new password below.</p>

          {success ? (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-emerald-700">Password updated successfully. Redirecting to login…</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <InputField
              name="password"
              type={showPassword ? "text" : "password"}
              label="New Password"
              value={formValues.password}
              onChange={handleChange}
              icon={<LockIcon />}
              error={errors.password}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            <InputField
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              value={formValues.confirmPassword}
              onChange={handleChange}
              icon={<LockIcon />}
              error={errors.confirmPassword}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="shrink-0 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              }
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5E94EA] to-[#4A82DE] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_20px_rgba(64,123,220,0.25)] transition-all hover:from-[#4F88E3] hover:to-[#3E74D3] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
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
    </>
  );
}
