"use client";

import Link from "next/link";
import Head from "next/head";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyOtp } from "@/lib/api";

const initialValues = {
  email: "",
  otp: "",
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

function KeyIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M12.6 2.8a5.3 5.3 0 0 0-5.3 5.3c0 .7.1 1.4.4 2l-5 5v2h2v2h2l.9-.9h2v-2l2-2c.6.2 1.2.4 1.9.4a5.3 5.3 0 1 0 0-10.6Zm0 3.1a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z" />
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

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [formValues, setFormValues] = useState({
    ...initialValues,
    email: initialEmail,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function validate(values) {
    const nextErrors = {};

    if (!values.email.trim()) nextErrors.email = "Email is required.";
    if (!values.otp.trim()) nextErrors.otp = "OTP code is required.";

    return nextErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...formValues, [name]: value };
    setFormValues(nextValues);

    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }

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

    setIsSubmitting(true);

    try {
      const result = await verifyOtp(formValues.email, formValues.otp);
      console.log("OTP verify result:", result);

      if (result?.message) {
        setStatusMessage(result.message);
        setStatusType("success");
      } else {
        setStatusMessage("OTP submitted. Please continue to log in.");
        setStatusType("success");
      }
    } catch (error) {
      console.error("OTP verify failed:", error);
      setStatusMessage("Verification failed. Please try again.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Verify OTP | TriMerge IQ</title>
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
          <h2 className="mb-2 text-center text-2xl font-semibold text-[#334E8A]">Verify OTP</h2>
          <p className="mb-6 text-center text-sm text-slate-600">Enter the OTP code sent to your email after sign up.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              name="otp"
              type="text"
              label="OTP Code"
              value={formValues.otp}
              onChange={handleChange}
              icon={<KeyIcon />}
              error={errors.otp}
            />

            {statusMessage ? (
              <p
                className={[
                  "rounded-lg px-3 py-2 text-sm",
                  statusType === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {statusMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#5E94EA] to-[#4A82DE] px-4 py-3 text-base font-semibold text-white shadow-[0_10px_20px_rgba(64,123,220,0.25)] transition-all hover:from-[#4F88E3] hover:to-[#3E74D3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">Already verified? </span>
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
