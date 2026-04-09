"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { post_request } from "../utils/services";

const initialValues = {
  otp: "",
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

function KeyIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.6 2.8a5.3 5.3 0 0 0-5.3 5.3c0 .7.1 1.4.4 2l-5 5v2h2v2h2l.9-.9h2v-2l2-2c.6.2 1.2.4 1.9.4a5.3 5.3 0 1 0 0-10.6Zm0 3.1a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z" />
    </svg>
  );
}

function SuccessCheckIcon() {
  return (
    <svg
      className="h-14 w-14"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="#EAF1FF"
        stroke="#5E94EA"
        strokeWidth="2"
      />
      <path
        d="M20.5 33.5l8 8 15-15"
        stroke="#3E74D3"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InputField({ name, type, label, value, onChange, icon, error }) {
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

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams?.get("email") ?? "";
  const email = emailFromUrl;
  const profileFromUrl = searchParams?.get("profile") ?? "";

  const isDev = false && process.env.NODE_ENV !== "production";
  const previewMode = searchParams.get("preview") || "";

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(10);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const hasAnyError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  useEffect(() => {
    if (!isVerified) {
      return;
    }

    setRedirectSeconds(10);

    const timer = setInterval(() => {
      setRedirectSeconds((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerified]);

  useEffect(() => {
    if (!isVerified || redirectSeconds !== 0) {
      return;
    }

    router.push("/login");
  }, [isVerified, redirectSeconds, router]);

  useEffect(() => {
    if (!isDev) {
      return;
    }

    if (previewMode === "success") {
      setStatusMessage("Account verified successfully.");
      setStatusType("success");
      setIsVerified(true);
    }
  }, [isDev, previewMode]);

  function validate(values) {
    const nextErrors = {};

    if (!email.trim())
      nextErrors.email = "Missing signup email. Please sign up again.";
    if (!values.otp.trim()) nextErrors.otp = "Verification code is required.";

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
    setStatusMessage("");
    setStatusType("");

    try {
      let res = await post_request(`$PROFILE/verify_profile`, {
        code: formValues.otp,
        email: emailFromUrl,
        profile: profileFromUrl,
      });

      let payload = res;

      if (res.ok) {
        setStatusMessage(payload?.message || "Account verified successfully.");
        setStatusType("success");
        setIsVerified(true);
        return;
      }

      setStatusMessage(
        payload?.message ||
          "Verification failed. Please check the code and try again.",
      );
      setStatusType("error");
    } catch (error) {
      console.error("OTP verify failed:", error);
      setStatusMessage("Unable to connect. Please try again.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    const nextErrors = validate(formValues);
    setErrors(nextErrors);

    if (nextErrors.email) {
      return;
    }

    setIsResending(true);

    try {
      const endpoints = ["/auth/resend-otp", "/auth/resend"];
      let response = null;

      for (const endpoint of endpoints) {
        const currentResponse = await fetch(
          `https://trimerge-iq.onrender.com${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          },
        );

        if (currentResponse.status === 404 || currentResponse.status === 405) {
          continue;
        }

        response = currentResponse;
        break;
      }

      if (!response) {
        setStatusMessage(
          "Unable to resend code right now. Please try again later.",
        );
        setStatusType("error");
        return;
      }

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok) {
        setStatusMessage(
          payload?.message ||
            "A new verification code has been sent to your email.",
        );
        setStatusType("success");
        return;
      }

      setStatusMessage(
        payload?.message || "Unable to resend code. Please try again.",
      );
      setStatusType("error");
    } catch (error) {
      console.error("Resend code failed:", error);
      setStatusMessage("Unable to connect. Please try again.");
      setStatusType("error");
    } finally {
      setIsResending(false);
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
          <h2 className="mb-2 text-center text-2xl font-semibold text-[#334E8A]">
            Verify Account
          </h2>
          <p className="mb-6 text-center text-sm text-slate-600">
            Check your email and enter the verification code.
          </p>

          {isVerified ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <SuccessCheckIcon />
                <h3 className="mt-4 text-xl font-semibold text-[#334E8A]">
                  Account verified successfully
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Your account is now active. Redirecting to login in{" "}
                  {redirectSeconds}s...
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-4 rounded-xl bg-gradient-to-r from-[#5E94EA] to-[#4A82DE] px-4 py-2 text-sm font-semibold text-white transition-all hover:from-[#4F88E3] hover:to-[#3E74D3]"
                >
                  Go to Login Now
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="text-center">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0FF] text-[#4A82DE]">
                  <MailIcon />
                </div>
                <p className="text-sm text-slate-500">Code sent to</p>
                <p className="mt-1 text-base font-semibold text-[#334E8A] break-all">
                  {emailFromUrl || "your email address"}
                </p>
              </div>

              {errors.email ? (
                <p className="-mt-2 text-sm text-rose-500">{errors.email}</p>
              ) : null}

              <InputField
                name="otp"
                type="text"
                label="Verification Code"
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
                disabled={isSubmitting || isResending}
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
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>

              {statusType === "error" ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || isSubmitting}
                  className="w-full rounded-xl border border-[#4A82DE] bg-white px-4 py-3 text-base font-semibold text-[#4A82DE] transition-colors hover:bg-[#F2F7FF] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isResending ? "Resending..." : "Resend Code"}
                </button>
              ) : null}

              {isDev ? (
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage("Account verified successfully.");
                    setStatusType("success");
                    setIsVerified(true);
                  }}
                  className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                >
                  Preview Success Screen (Dev)
                </button>
              ) : null}
            </form>
          )}

          {/* <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">Have an account? </span>
            <Link
              href="/login"
              className="text-base font-semibold text-[#4A82DE] transition-colors hover:text-[#396FC5]"
            >
              Log In
            </Link>
          </div> */}
        </section>
      </div>
    </main>
  );
}
