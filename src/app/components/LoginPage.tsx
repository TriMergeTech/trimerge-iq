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
import styles from "./LoginPage.module.css";

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
    <div className={styles.canvas}>
      <section className={styles.auth}>
        {/* Shield */}
        <div className={styles.shieldWrap}>
          <div className={styles.shield}>
            <Shield className={styles.shieldIcon} />
          </div>
        </div>

        <h1 className={styles.title}>
          {viewMode === "login" && "Admin Access"}
          {viewMode === "signup" && "Create Staff Account"}
          {viewMode === "verify" && "Verify Your Account"}
          {viewMode === "forgotPassword" && "Reset Password"}
          {viewMode === "resetSent" && "Check Your Email"}
        </h1>
        <p className={styles.subtitle}>
          {viewMode === "login" && "Sign in with a real backend account to access admin tools."}
          {viewMode === "signup" && "Create a staff account first so you can manage skills and positions."}
          {viewMode === "verify" && "Enter the OTP sent to your email to activate your account."}
          {viewMode === "forgotPassword" && "Enter your email to receive a password reset OTP."}
          {viewMode === "resetSent" && "We sent password reset instructions to your email address."}
        </p>

        {successMessage && <InlineMessage tone="success" message={successMessage} />}
        {error && <InlineMessage tone="error" message={error} />}

        {viewMode === "login" && (
          <form onSubmit={handleLoginSubmit}>
            <div className={styles.field}>
              <div className={styles.fieldHead}>
                <label className={styles.label} htmlFor="email">Email Address</label>
              </div>
              <div className={styles.inputWrap}>
                <User className={styles.lead} />
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="staff@trimerge.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHead}>
                <label className={styles.label} htmlFor="password">Password</label>
                <button
                  type="button"
                  className={styles.forgot}
                  onClick={() => { setViewMode("forgotPassword"); setError(""); setSuccessMessage(""); }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className={styles.inputWrap}>
                <Lock className={styles.lead} />
                <input
                  id="password"
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.trail}
                  aria-label="Show password"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.signin} disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <button
              type="button"
              className={styles.signup}
              onClick={() => { setViewMode("signup"); setError(""); setSuccessMessage(""); }}
            >
              Create New Staff Account
            </button>
            <div className={styles.protected}>Protected by TriMerge Security</div>
          </form>
        )}

        {viewMode === "signup" && (
          <>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => { setViewMode("login"); setError(""); setSuccessMessage(""); }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>

            <form onSubmit={handleSignupSubmit}>
              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>Full Name</label>
                </div>
                <div className={styles.inputWrap}>
                  <User className={styles.lead} />
                  <input
                    className={styles.input}
                    type="text"
                    value={signupFullName}
                    onChange={(event) => setSignupFullName(event.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>Email Address</label>
                </div>
                <div className={styles.inputWrap}>
                  <Mail className={styles.lead} />
                  <input
                    className={styles.input}
                    type="email"
                    value={signupEmail}
                    onChange={(event) => setSignupEmail(event.target.value)}
                    placeholder="staff@trimerge.com"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>Profile</label>
                </div>
                <select
                  className={styles.select}
                  value={signupProfile}
                  onChange={(event) => setSignupProfile(event.target.value as SignupProfile)}
                >
                  <option value="staff">Staff</option>
                  <option value="client">Client</option>
                </select>
                <p className={styles.profileHint}>
                  Use &ldquo;staff&rdquo; if you want access to protected admin skills actions.
                </p>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>Password</label>
                </div>
                <div className={styles.inputWrap}>
                  <Lock className={styles.lead} />
                  <input
                    className={styles.input}
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className={styles.trail}
                    onClick={() => setShowSignupPassword((current) => !current)}
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.signin} disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </>
        )}

        {viewMode === "verify" && (
          <>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => { setViewMode("signup"); setError(""); setSuccessMessage(""); }}
            >
              <ArrowLeft size={14} />
              Back to Signup
            </button>

            <form onSubmit={handleVerifySubmit}>
              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>Email Address</label>
                </div>
                <div className={styles.inputWrap}>
                  <Mail className={styles.lead} />
                  <input
                    className={styles.input}
                    type="email"
                    value={verifyEmail}
                    onChange={(event) => setVerifyEmail(event.target.value)}
                    placeholder="staff@trimerge.com"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>OTP Code</label>
                </div>
                <div className={styles.inputWrap}>
                  <Shield className={styles.lead} />
                  <input
                    className={styles.input}
                    type="text"
                    value={verifyOtp}
                    onChange={(event) => setVerifyOtp(event.target.value)}
                    placeholder="123456"
                  />
                </div>
              </div>

              <button type="submit" className={styles.signin} disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify and Sign In"}
              </button>
            </form>
          </>
        )}

        {viewMode === "forgotPassword" && (
          <>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => { setViewMode("login"); setError(""); setSuccessMessage(""); }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>

            <form onSubmit={handleForgotPassword}>
              <div className={styles.field}>
                <div className={styles.fieldHead}>
                  <label className={styles.label}>Email Address</label>
                </div>
                <div className={styles.inputWrap}>
                  <Mail className={styles.lead} />
                  <input
                    className={styles.input}
                    type="email"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    placeholder="staff@trimerge.com"
                  />
                </div>
              </div>

              <button type="submit" className={styles.signin} disabled={isLoading}>
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        {viewMode === "resetSent" && (
          <div>
            <div className={styles.successIcon}>
              <div className={styles.successCircle}>
                <CheckCircle size={28} color="#fff" />
              </div>
            </div>
            <p className={styles.resetEmailHint}>{resetEmail}</p>

            <div className={styles.nextSteps}>
              <strong>Next Steps:</strong>
              <ul>
                <li>Check your email inbox</li>
                <li>Use the OTP or instructions from the backend email</li>
                <li>Reset your password from the backend flow</li>
                <li>Then sign in again here</li>
              </ul>
            </div>

            <button
              type="button"
              className={styles.signin}
              onClick={() => { setViewMode("login"); setResetEmail(""); setSuccessMessage(""); }}
            >
              Back to Login
            </button>
          </div>
        )}
      </section>

      <div className={styles.help}>
        Need help? Contact{" "}
        <a href="mailto:support@trimerge.com">support@trimerge.com</a>
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
  return (
    <div className={tone === "error" ? styles.msgError : styles.msgSuccess}>
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}


