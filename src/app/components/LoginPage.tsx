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

import { ADMIN_API_BASE_URL } from "./adminAuth";

const API_BASE_URL = ADMIN_API_BASE_URL;

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

function getHeading(viewMode: ViewMode) {
  switch (viewMode) {
    case "signup":
      return "Create Staff Account";
    case "verify":
      return "Verify Your Account";
    case "forgotPassword":
      return "Reset Password";
    case "resetSent":
      return "Check Your Email";
    default:
      return "Admin Access";
  }
}

function getSubtitle(viewMode: ViewMode) {
  switch (viewMode) {
    case "signup":
      return "Create a backend account so you can manage admin tools.";
    case "verify":
      return "Enter the OTP sent to your email to activate your account.";
    case "forgotPassword":
      return "Enter your email to receive password reset instructions.";
    case "resetSent":
      return "We sent password reset instructions to your email address.";
    default:
      return "Sign in with a real backend account to access admin tools.";
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

  const inputClass =
    "interactive-input w-full rounded-[10px] border border-white/[0.18] bg-white/[0.04] py-[13px] pl-10 pr-4 font-sans text-[14.5px] text-white outline-none placeholder:text-white/45 focus:border-[#2e2bff] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#2e2bff]/25";
  const primaryButtonClass =
    "interactive-button w-full rounded-[10px] bg-[#2e2bff] px-4 py-3.5 font-display text-base font-bold text-white shadow-[0_10px_30px_rgba(46,43,255,0.35)] hover:bg-[#2120e0] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
  const secondaryButtonClass =
    "interactive-button w-full rounded-[10px] border border-white/[0.18] bg-transparent px-4 py-3 font-display text-[15px] font-semibold text-white hover:border-white/35 hover:bg-white/[0.05]";

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

  const goToLogin = () => {
    setViewMode("login");
    setError("");
    setSuccessMessage("");
  };

  return (
    <section className="relative flex min-h-[calc(100vh-89px)] flex-col overflow-hidden bg-[#050b22]">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(46,43,255,0.28)_0%,transparent_65%),radial-gradient(ellipse_80%_60%_at_20%_100%,rgba(31,40,88,0.55)_0%,transparent_60%),linear-gradient(180deg,#04081e_0%,#0a1742_100%)] px-6 py-12">
        <div className="pointer-events-none absolute -left-28 top-20 h-[360px] w-[360px] opacity-25 [background-image:radial-gradient(circle,rgba(255,255,255,0.12)_1.2px,transparent_1.4px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-28 bottom-10 h-[360px] w-[360px] rotate-6 opacity-25 [background-image:radial-gradient(circle,rgba(255,255,255,0.12)_1.2px,transparent_1.4px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,#000_0%,transparent_70%)]" />

        <div className="relative z-10 w-full max-w-[460px] rounded-[18px] border border-white/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-6 py-8 shadow-[0_30px_60px_rgba(4,8,30,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:px-[38px] sm:py-9">
          <div className="mb-7 text-center">
            <div className="mb-[18px] flex justify-center">
              <div className="relative grid h-[68px] w-[68px] place-items-center rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(239,176,26,0.18)_0%,rgba(46,43,255,0.18)_60%,transparent_75%)]">
                <span className="absolute inset-2.5 rounded-full border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
                <Shield className="relative z-10 h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="font-display text-[28px] font-bold tracking-normal text-white">
              {getHeading(viewMode)}
            </h1>
            <p className="mx-auto mt-2 max-w-80 font-sans text-sm leading-6 text-[#9aa2c4]">
              {getSubtitle(viewMode)}
            </p>
          </div>

          {successMessage && <InlineMessage tone="success" message={successMessage} />}
          {error && <InlineMessage tone="error" message={error} />}

          {viewMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-[18px]">
              <Field label="Email Address" icon={User}>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  placeholder="staff@trimerge.com"
                  autoComplete="email"
                />
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-sans text-[13px] font-semibold text-white">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("forgotPassword");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="interactive-base font-sans text-[13px] font-semibold text-[#c7cdee] hover:text-white"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2c4]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="interactive-base absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa2c4] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-1.5`}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("signup");
                  setError("");
                  setSuccessMessage("");
                }}
                className={secondaryButtonClass}
              >
                Create New Staff Account
              </button>
            </form>
          )}

          {viewMode === "signup" && (
            <>
              <BackButton onClick={goToLogin} label="Back to Login" />

              <form onSubmit={handleSignupSubmit} className="space-y-[18px]">
                <Field label="Full Name" icon={User}>
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(event) => setSignupFullName(event.target.value)}
                    className={inputClass}
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    className={inputClass}
                    placeholder="staff@trimerge.com"
                    autoComplete="email"
                  />
                </Field>

                <div>
                  <label className="mb-2 block font-sans text-[13px] font-semibold text-white">Profile</label>
                  <select
                    value={signupProfile}
                    onChange={(event) => setSignupProfile(event.target.value as SignupProfile)}
                    className="interactive-input w-full rounded-[10px] border border-white/[0.18] bg-white/[0.04] px-4 py-[13px] font-sans text-[14.5px] text-white outline-none focus:border-[#2e2bff] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#2e2bff]/25"
                  >
                    <option value="staff" className="bg-[#050b22]">
                      Staff
                    </option>
                    <option value="client" className="bg-[#050b22]">
                      Client
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-sans text-[13px] font-semibold text-white">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2c4]" />
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      className={`${inputClass} pr-11`}
                      placeholder="Create a password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowSignupPassword((current) => !current)}
                      className="interactive-base absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa2c4] hover:text-white"
                    >
                      {showSignupPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {viewMode === "verify" && (
            <>
              <BackButton
                onClick={() => {
                  setViewMode("signup");
                  setError("");
                  setSuccessMessage("");
                }}
                label="Back to Signup"
              />

              <form onSubmit={handleVerifySubmit} className="space-y-[18px]">
                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={verifyEmail}
                    onChange={(event) => setVerifyEmail(event.target.value)}
                    className={inputClass}
                    placeholder="staff@trimerge.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="OTP Code" icon={Shield}>
                  <input
                    type="text"
                    value={verifyOtp}
                    onChange={(event) => setVerifyOtp(event.target.value)}
                    className={inputClass}
                    placeholder="123456"
                    inputMode="numeric"
                  />
                </Field>

                <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                  {isLoading ? "Verifying..." : "Verify and Sign In"}
                </button>
              </form>
            </>
          )}

          {viewMode === "forgotPassword" && (
            <>
              <BackButton onClick={goToLogin} label="Back to Login" />

              <form onSubmit={handleForgotPassword} className="space-y-[18px]">
                <Field label="Email Address" icon={Mail}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    className={inputClass}
                    placeholder="staff@trimerge.com"
                    autoComplete="email"
                  />
                </Field>

                <button type="submit" disabled={isLoading} className={primaryButtonClass}>
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {viewMode === "resetSent" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="relative mb-4 inline-grid h-16 w-16 place-items-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
                <p className="font-sans text-sm text-[#c7cdee]">{resetEmail}</p>
              </div>

              <div className="rounded-[10px] border border-green-400/35 bg-green-400/10 p-4 font-sans text-sm leading-6 text-green-100">
                Check your inbox, use the reset instructions from the backend email, then return here to sign in.
              </div>

              <button type="button" onClick={goToLogin} className={primaryButtonClass}>
                Back to Login
              </button>
            </div>
          )}

          <div className="mt-[22px] text-center font-sans text-xs text-[#9aa2c4]">
            Protected by TriMerge Security
          </div>
        </div>
      </div>

      <div className="bg-[#050b22] px-6 pb-10 text-center font-sans text-[13.5px] text-[#9aa2c4]">
        Need help? Contact{" "}
        <a href="mailto:support@trimerge.com" className="interactive-base font-semibold text-[#c7cdee] hover:text-white">
          support@trimerge.com
        </a>
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
      <label className="mb-2 block font-sans text-[13px] font-semibold text-white">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2c4]" />
        {children}
      </div>
    </div>
  );
}

function BackButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="interactive-base mb-4 inline-flex items-center gap-2 font-sans text-sm font-semibold text-[#c7cdee] hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
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
      ? "border-red-400/35 bg-red-500/12 text-red-100"
      : "border-green-400/35 bg-green-500/12 text-green-100";

  return (
    <div className={`animate-fade-rise mb-5 flex items-start gap-2 rounded-[10px] border p-4 font-sans ${toneClasses}`}>
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="text-sm leading-5">{message}</p>
    </div>
  );
}
