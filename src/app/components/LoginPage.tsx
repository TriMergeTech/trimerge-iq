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

const API_BASE_URL = "https://trimerge-iq.onrender.com";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type ViewMode = "login" | "signup" | "verify" | "forgotPassword" | "resetSent";
type SignupProfile = "staff" | "client";

interface AuthResponsePayload {
  access_token?: string;
  refresh_token?: string;
  message?: string;
  data?: {
    access_token?: string;
    refresh_token?: string;
    message?: string;
  };
}

async function parseJsonSafely(response: Response): Promise<AuthResponsePayload | null> {
  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as AuthResponsePayload;
  } catch {
    return null;
  }
}

function storeSession(email: string, accessToken: string, refreshToken?: string) {
  localStorage.setItem("trimerge_admin_auth", "true");
  localStorage.setItem("trimerge_admin_email", email);
  localStorage.setItem("trimerge_admin_access_token", accessToken);

  if (refreshToken) {
    localStorage.setItem("trimerge_admin_refresh_token", refreshToken);
  } else {
    localStorage.removeItem("trimerge_admin_refresh_token");
  }
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupProfile, setSignupProfile] = useState<SignupProfile>("staff");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const loginWithCredentials = async (nextEmail: string, nextPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: nextEmail.trim(),
        password: nextPassword,
      }),
    });

    const payload = await parseJsonSafely(response);
    const accessToken = payload?.access_token ?? payload?.data?.access_token;
    const refreshToken = payload?.refresh_token ?? payload?.data?.refresh_token;

    if (!response.ok || !accessToken) {
      if (response.status === 401) {
        throw new Error("Invalid email or password.");
      }

      if (response.status === 403) {
        throw new Error("Your account is not verified yet.");
      }

      throw new Error(payload?.message ?? payload?.data?.message ?? `Login failed (${response.status}).`);
    }

    storeSession(nextEmail.trim(), accessToken, refreshToken);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      await loginWithCredentials(email, password);
      onLoginSuccess();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!signupFullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!emailRegex.test(signupEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: signupFullName.trim(),
          email: signupEmail.trim(),
          profile: signupProfile,
          password: signupPassword,
        }),
      });

      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("This email is already registered.");
        }

        throw new Error(payload?.message ?? payload?.data?.message ?? `Signup failed (${response.status}).`);
      }

      setVerifyEmail(signupEmail.trim());
      setVerifyPassword(signupPassword);
      setVerifyOtp("");
      setViewMode("verify");
      setSuccessMessage("We sent an OTP to your email. Enter it below to activate your account.");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!emailRegex.test(verifyEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!verifyOtp.trim()) {
      setError("Please enter the OTP code.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verifyEmail.trim(),
          otp: verifyOtp.trim(),
        }),
      });

      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.data?.message ?? `Verification failed (${response.status}).`);
      }

      await loginWithCredentials(verifyEmail, verifyPassword);
      onLoginSuccess();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!emailRegex.test(resetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail.trim(),
        }),
      });

      const payload = await parseJsonSafely(response);

      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.data?.message ?? `Request failed (${response.status}).`);
      }

      setViewMode("resetSent");
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : "Unable to send reset instructions.");
    } finally {
      setIsLoading(false);
    }
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
              {viewMode === "login" && "Admin Access"}
              {viewMode === "signup" && "Create Staff Account"}
              {viewMode === "verify" && "Verify Your Account"}
              {viewMode === "forgotPassword" && "Reset Password"}
              {viewMode === "resetSent" && "Check Your Email"}
            </h1>
            <p className="text-blue-200">
              {viewMode === "login" && "Sign in with a real backend account to access admin tools."}
              {viewMode === "signup" && "Create a staff account first so you can manage skills and positions."}
              {viewMode === "verify" && "Enter the OTP sent to your email to activate your account."}
              {viewMode === "forgotPassword" && "Enter your email to receive a password reset OTP."}
              {viewMode === "resetSent" && "We sent password reset instructions to your email address."}
            </p>
          </div>

          {successMessage && <InlineMessage tone="success" message={successMessage} />}
          {error && <InlineMessage tone="error" message={error} />}

          {viewMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <Field label="Email Address" icon={User}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                  placeholder="staff@trimerge.com"
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
                      setSuccessMessage("");
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

              <button
                type="submit"
                disabled={isLoading}
                className="interactive-button w-full rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#d4af37] py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("signup");
                  setError("");
                  setSuccessMessage("");
                }}
                className="interactive-button w-full rounded-xl border border-white/20 bg-white/8 py-3 font-medium text-white hover:bg-white/12"
              >
                Create New Staff Account
              </button>
            </form>
          )}

          {viewMode === "signup" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                  setSuccessMessage("");
                }}
                className="interactive-base mb-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>

              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <Field label="Full Name" icon={User}>
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(event) => setSignupFullName(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="Jane Doe"
                  />
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="staff@trimerge.com"
                  />
                </Field>

                <div>
                  <label className="mb-2 block text-sm text-blue-100">Profile</label>
                  <select
                    value={signupProfile}
                    onChange={(event) => setSignupProfile(event.target.value as SignupProfile)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="staff" className="bg-slate-900">Staff</option>
                    <option value="client" className="bg-slate-900">Client</option>
                  </select>
                  <p className="mt-2 text-xs text-blue-200/80">
                    Use `staff` if you want access to protected admin skills actions.
                  </p>
                </div>

                <div className="relative">
                  <label className="mb-2 block text-sm text-blue-100">Password</label>
                  <Lock className="pointer-events-none absolute left-4 top-[46px] h-5 w-5 text-blue-300" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-12 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((current) => !current)}
                    className="interactive-base absolute right-4 top-[46px] text-blue-300 hover:text-white"
                  >
                    {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="interactive-button w-full rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#d4af37] py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {viewMode === "verify" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewMode("signup");
                  setError("");
                  setSuccessMessage("");
                }}
                className="interactive-base mb-4 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Signup
              </button>

              <form onSubmit={handleVerifySubmit} className="space-y-5">
                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={verifyEmail}
                    onChange={(event) => setVerifyEmail(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="staff@trimerge.com"
                  />
                </Field>

                <Field label="OTP Code" icon={Shield}>
                  <input
                    type="text"
                    value={verifyOtp}
                    onChange={(event) => setVerifyOtp(event.target.value)}
                    className="interactive-input w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white outline-none placeholder:text-blue-300 focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="123456"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="interactive-button w-full rounded-xl bg-gradient-to-r from-[#1e5ba8] to-[#d4af37] py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  {isLoading ? "Verifying..." : "Verify and Sign In"}
                </button>
              </form>
            </>
          )}

          {viewMode === "forgotPassword" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                  setSuccessMessage("");
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
                    placeholder="staff@trimerge.com"
                  />
                </Field>

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
                  <li>Use the OTP or instructions from the backend email</li>
                  <li>Reset your password from the backend flow</li>
                  <li>Then sign in again here</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setResetEmail("");
                  setSuccessMessage("");
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
  tone: "error" | "success";
  message: string;
}) {
  const toneClasses =
    tone === "error"
      ? "border-red-500/50 bg-red-500/20 text-red-200"
      : "border-green-500/50 bg-green-500/20 text-green-200";

  return (
    <div className={`animate-fade-rise mb-5 flex items-start gap-2 rounded-xl border p-4 ${toneClasses}`}>
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
