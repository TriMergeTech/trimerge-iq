"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type ViewMode = "login" | "forgotPassword" | "resetSent";

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      localStorage.setItem("trimerge_admin_auth", "true");
      localStorage.setItem("trimerge_admin_email", email);
      onLoginSuccess();
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      setViewMode("resetSent");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="page-shell min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-900 via-[#0f3d7a] to-[#1e5ba8] px-4 py-12">
      <div className="relative mx-auto w-full max-w-md">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-[#d4af37] opacity-20 blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#1e5ba8] opacity-20 blur-[128px]" />
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl page-section">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1e5ba8] to-[#d4af37] opacity-60 blur-2xl" />
                <div className="relative rounded-2xl bg-white/95 p-4 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/trimerge-logo.png"
                    alt="TriMerge Consulting Group"
                    className="h-auto w-[220px]"
                  />
                </div>
              </div>
            </div>
            <div className="relative mb-4 inline-block">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1e5ba8] to-[#d4af37] opacity-50 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1e5ba8] to-[#d4af37] shadow-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              {viewMode === "login" ? "Admin Access" : viewMode === "forgotPassword" ? "Reset Password" : "Check Your Email"}
            </h1>
            <p className="text-blue-200">
              {viewMode === "login" && "Sign in to access the admin dashboard"}
              {viewMode === "forgotPassword" &&
                "Enter your email to receive a password reset link"}
              {viewMode === "resetSent" &&
                "We've sent a password reset link to your email address"}
            </p>
          </div>

          {viewMode === "login" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Email Address" icon={User}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                  placeholder="admin@trimerge.com"
                />
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-blue-100">Password</span>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("forgotPassword");
                      setError("");
                    }}
                    className="interactive-base text-sm text-[#d4af37] hover:text-white"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="interactive-base absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <InlineMessage tone="error" message={error} />}

              <button
                type="submit"
                disabled={isLoading}
                className="interactive-button w-full rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#d4af37] py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {viewMode === "forgotPassword" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                }}
                className="interactive-base mb-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="admin@trimerge.com"
                  />
                </Field>

                {error && <InlineMessage tone="error" message={error} />}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="interactive-button w-full rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#d4af37] py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {viewMode === "resetSent" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative mb-4 inline-block">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-[#d4af37] opacity-50 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-[#d4af37] shadow-xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <p className="text-sm text-[#d4af37]">{resetEmail}</p>
              </div>

              <div className="rounded-xl border border-green-500/50 bg-green-500/20 p-4">
                <p className="mb-2 text-sm text-green-200">
                  <strong>Next Steps:</strong>
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-green-200">
                  <li>Check your email inbox</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                  <li>Sign in with your new password</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setResetEmail("");
                }}
                className="interactive-button flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#d4af37] py-3 font-medium text-white shadow-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Login
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-blue-300">Protected by TriMerge Security</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200">
            Need help? Contact{" "}
            <a
              href="mailto:support@trimerge.com"
              className="interactive-base text-[#d4af37] hover:text-white"
            >
              support@trimerge.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-blue-100">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-300" />
        {children}
      </div>
    </div>
  );
}

function InlineMessage({
  tone,
  message,
}: {
  tone: "error";
  message: string;
}) {
  return (
    <div className="animate-fade-rise flex items-start gap-2 rounded-xl border border-red-500/50 bg-red-500/20 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
      <p className="text-sm text-red-200">{message}</p>
    </div>
  );
}
