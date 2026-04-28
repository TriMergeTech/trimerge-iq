"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { post_request } from "../utils/services";
import { useRouter, useSearchParams } from "next/navigation";

const initialValues = {
  email: "",
  password: "",
};

function ShieldCheckIcon() {
  return (
    <svg
      className="h-12 w-12"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
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
        <linearGradient
          id="shieldGradient"
          x1="12"
          y1="6"
          x2="52"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5C94F0" />
          <stop offset="1" stopColor="#3F73D7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2.5 5A2.5 2.5 0 0 1 5 2.5h10A2.5 2.5 0 0 1 17.5 5v10a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 15V5Zm2 .6v.2l5.2 3.7a.5.5 0 0 0 .6 0l5.2-3.7v-.2a.5.5 0 0 0-.5-.6H5a.5.5 0 0 0-.5.6Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.4 8.1V6.7a3.6 3.6 0 1 1 7.2 0V8h.9A2.4 2.4 0 0 1 17 10.5v5.1a2.4 2.4 0 0 1-2.5 2.4h-9A2.4 2.4 0 0 1 3 15.6v-5A2.4 2.4 0 0 1 5.5 8h.9Zm1.8-.1h3.6V6.7a1.8 1.8 0 1 0-3.6 0V8Z" />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 10c1.7-3 4.4-5 8-5s6.3 2 8 5c-1.7 3-4.4 5-8 5s-6.3-2-8-5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle
          cx="10"
          cy="10"
          r="2.3"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2 10c1.7-3 4.4-5 8-5s6.3 2 8 5c-1.7 3-4.4 5-8 5s-6.3-2-8-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 4l12 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.4L18.2 5C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.1-1.6H12Z"
      />
      <path
        fill="#34A853"
        d="M2.7 7.6l3.2 2.3c.9-1.8 2.8-3 5.1-3 1.8 0 3 .8 3.7 1.4L18.2 5C16.7 3.6 14.6 2.7 12 2.7c-3.6 0-6.7 2-8.3 4.9Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.3c2.5 0 4.7-.8 6.2-2.2l-2.9-2.3c-.8.6-1.9 1.1-3.3 1.1-3.8 0-5.1-2.6-5.4-3.9l-3.2 2.5c1.6 3 4.8 4.8 8.6 4.8Z"
      />
      <path
        fill="#4285F4"
        d="M20.9 12.2c0-.6-.1-1.1-.1-1.6H12v3.9h5.4c-.2 1.1-.9 2-2 2.8l2.9 2.3c1.7-1.6 2.6-4 2.6-7.4Z"
      />
    </svg>
  );
}

function GoogleAuthButton({ mode }) {
  return (
    <a
      href={`/api/auth/google?mode=${mode}`}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
    >
      <GoogleIcon />
      Continue with Google
    </a>
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
  rightAction,
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
        {rightAction}
      </div>
      {error ? <p className="mt-1 text-sm text-rose-500">{error}</p> : null}
    </label>
  );
}

export default function LoginPage({}) {
  let searchParams = useSearchParams();
  const [formValues, setFormValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [redirect, set_redirect] = useState(searchParams.get("redirect"));

  const [role, setRole] = useState(redirect || "staff");

  const router = useRouter();

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function validate(values) {
    const nextErrors = {};
    if (!values.email.trim()) nextErrors.email = "Email is required.";
    if (!values.password) nextErrors.password = "Password is required.";
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

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const res = await post_request(`$PROFILE/signin`, {
        email: formValues.email,
        password: formValues.password,

        profile:
          role === "admin"
            ? "52a1d68b-87d6-4adf-8d38-777656a427d6"
            : "98260a6c-e1d5-46f1-8ab3-4f30a062b52a",
      });

      if (res?.ok) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("profile", JSON.stringify(res.data));
        window.location.href = "/";
        return;
      }

      setStatusMessage(res?.message || "Login failed. Please try again.");
    } catch (err) {
      console.error(err);
      setStatusMessage("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <p className="mt-3 text-sm text-[#6E8EAC]">
            In-House AI Knowledge Tool
          </p>
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-[0_12px_35px_rgba(26,61,130,0.12)] ring-1 ring-white/70 sm:p-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-[#334E8A]">
            {`${redirect === "home" ? "" : redirect} Log In`.trim()}
          </h2>

          <div className="mb-6 flex w-full rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                role === "staff"
                  ? "bg-white text-[#334E8A] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Staff
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                role === "admin"
                  ? "bg-white text-[#334E8A] shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {false && (
              <>
                <GoogleAuthButton mode="login" />
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    or continue with email
                  </p>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </>
            )}

            <InputField
              name="email"
              type="email"
              label="Email"
              value={formValues.email}
              onChange={handleChange}
              icon={<MailIcon />}
              error={errors.email}
            />

            <InputField
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={formValues.password}
              onChange={handleChange}
              icon={<LockIcon />}
              error={errors.password}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            {statusMessage ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {statusMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5E94EA] to-[#4A82DE] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_20px_rgba(64,123,220,0.25)] transition-all hover:from-[#4F88E3] hover:to-[#3E74D3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeOpacity="0.25"
                      strokeWidth="4"
                    />
                    <path
                      d="M22 12a10 10 0 0 1-10 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href={`/forgot-password?redirect=${role}&email=${formValues.email}`}
              className="text-base font-semibold text-[#4A82DE]"
            >
              Forgot password?
            </Link>
          </div>

          {false && (
            <div className="mt-7 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-500">Don't have an account?</p>
              <Link
                href="/signup"
                className="mt-2 inline-block font-semibold text-[#4A82DE]"
              >
                Sign up
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
