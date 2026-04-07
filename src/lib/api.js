const API_BASE = "https://trimerge-iq.onrender.com";

// LOGIN: sends a POST request to /auth/login
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

// SIGN UP: sends a POST request to /auth/signup
export async function signup(email, profile, password) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, profile }),
  });

  return res.json();
}

// FORGOT PASSWORD: sends a POST request to /auth/forgot-password
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return res.json();
}

// VERIFY OTP: sends a POST request to /auth/verify
export async function verifyOtp(email, otp) {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  return res.json();
}

// RESET PASSWORD: sends a POST request to /auth/reset-password
export async function resetPassword(token, password) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  return res.json();
}
