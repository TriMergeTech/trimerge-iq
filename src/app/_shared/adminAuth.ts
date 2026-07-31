export const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_TRIMERGE_PROJECTS_API_BASE_URL?.trim() ||
  "https://api.trimergeiq.com";

let DEV = process.env.NEXT_PUBLIC_DEV;
const PROFILE_SERVICE = DEV
  ? "http://localhost:4000"
  : "https://profile-api.savvyaisolution.com";

const API_BASE_URL = DEV
  ? "http://localhost:8005"
  : "https://api.trimergeiq.com";

export { PROFILE_SERVICE, API_BASE_URL };

const ACCESS_TOKEN_STORAGE_KEY = "trimerge_admin_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "trimerge_admin_refresh_token";
const AUTH_STORAGE_KEY = "trimerge_admin_auth";

interface AuthTokenPayload {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
  data?: AuthTokenPayload;
}

interface AuthenticatedFetchOptions extends RequestInit {
  onTokenRefresh?: (accessToken: string) => void;
}

let refreshPromise: Promise<string> | null = null;

function buildAdminApiUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/api/")) return pathOrUrl;
  return `${ADMIN_API_BASE_URL.replace(/\/+$/, "")}/${pathOrUrl.replace(/^\/+/, "")}`;
}

function getStoredAccessToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim() ?? "";
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)?.trim() ?? "";
}

function storeTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }
}

function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function expireStoredSession() {
  clearStoredSession();
  window.dispatchEvent(new Event("trimerge_admin_session_expired"));
}

export async function parseJsonSafely<T = unknown>(
  response: Response,
): Promise<T | null> {
  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return null;
  }
}

async function requestFreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    expireStoredSession();
    throw new Error("Session expired. Sign in again.");
  }

  const refreshEndpoints = ["/auth/refresh", "/auth/refresh-token"];

  for (const endpoint of refreshEndpoints) {
    const response = await fetch(buildAdminApiUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        refreshToken,
      }),
    });

    const payload = await parseJsonSafely<AuthTokenPayload>(response);
    const nextAccessToken =
      payload?.access_token ??
      payload?.accessToken ??
      payload?.data?.access_token ??
      payload?.data?.accessToken;
    const nextRefreshToken =
      payload?.refresh_token ??
      payload?.refreshToken ??
      payload?.data?.refresh_token ??
      payload?.data?.refreshToken;

    if (response.ok && nextAccessToken) {
      storeTokens(nextAccessToken, nextRefreshToken);
      return nextAccessToken;
    }

    if (response.status !== 404) break;
  }

  expireStoredSession();
  throw new Error("Session expired. Sign in again.");
}

async function refreshAccessToken() {
  refreshPromise ??= requestFreshAccessToken().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function buildAuthenticatedInit(
  init: RequestInit,
  accessToken: string,
): RequestInit {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", `Bearer ${accessToken}`);

  return {
    ...init,
    headers,
  };
}

export async function authenticatedAdminFetch(
  pathOrUrl: string,
  init: AuthenticatedFetchOptions = {},
) {
  const { onTokenRefresh, ...requestInit } = init;
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    throw new Error("Sign in before using admin tools.");
  }

  const url = buildAdminApiUrl(pathOrUrl);
  const response = await fetch(
    url,
    buildAuthenticatedInit(requestInit, accessToken),
  );

  if (response.status !== 401) {
    return response;
  }

  const refreshedAccessToken = await refreshAccessToken();
  onTokenRefresh?.(refreshedAccessToken);

  return fetch(url, buildAuthenticatedInit(requestInit, refreshedAccessToken));
}
