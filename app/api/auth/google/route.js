export async function GET(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const mode = url.searchParams.get("mode") === "signup" ? "signup" : "login";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const fallback = new URL(mode === "signup" ? "/signup" : "/login", origin);
    fallback.searchParams.set("oauth", "google-not-configured");
    return Response.redirect(fallback, 302);
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
  const state = mode;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  return Response.redirect(authUrl, 302);
}
