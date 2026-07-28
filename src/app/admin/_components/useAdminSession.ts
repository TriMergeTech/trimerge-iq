import { useCallback, useEffect, useMemo, useState } from "react";

import {
  API_BASE_URL,
  authenticatedAdminFetch,
} from "../../_shared/adminAuth";
import {
  extractUserRecords,
  mapUserFromApi,
  parseJsonSafely,
  uniqueById,
  type StaffMember,
} from "./adminTypes";

interface UseAdminSessionInput {
  setAdminMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  setStaffMembers: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  setUserError: React.Dispatch<React.SetStateAction<string>>;
}

export function useAdminSession({
  setAdminMembers,
  setStaffMembers,
  setUserError,
}: UseAdminSessionInput) {
  const [loggedInEmail, setLoggedInEmail] = useState("admin@trimerge.com");
  const [loggedInProfile, setLoggedInProfile] = useState("checking");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("trimerge_admin_email");
    const storedAccessToken = localStorage.getItem("trimerge_admin_access_token");
    const storedProfile = localStorage.getItem("trimerge_admin_profile");

    if (storedEmail) setLoggedInEmail(storedEmail);
    if (storedAccessToken) setAccessToken(storedAccessToken);
    if (storedProfile) setLoggedInProfile(storedProfile);
  }, []);

  const adminFetch = useCallback(
    (pathOrUrl: string, init?: RequestInit) =>
      authenticatedAdminFetch(pathOrUrl, {
        ...init,
        onTokenRefresh: setAccessToken,
      }),
    [],
  );

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadCurrentUser = async () => {
      try {
        const response = await adminFetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to verify current user (${response.status})`);
        }

        const payload = await parseJsonSafely(response);
        const currentUser = extractUserRecords(payload)[0];
        const currentProfile = (currentUser?.profile ?? currentUser?.role ?? "unknown").toLowerCase();
        const currentEmail = currentUser?.email;
        const currentStaffMember = currentUser ? mapUserFromApi(currentUser) : null;

        if (!ignore) {
          setLoggedInProfile(currentProfile);
          localStorage.setItem("trimerge_admin_profile", currentProfile);

          if (currentEmail) {
            setLoggedInEmail(currentEmail);
            localStorage.setItem("trimerge_admin_email", currentEmail);
          }

          if (currentStaffMember && currentProfile === "admin") {
            setAdminMembers((current) => uniqueById([currentStaffMember, ...current]));
          } else if (currentStaffMember && currentProfile === "staff") {
            setStaffMembers((current) => uniqueById([currentStaffMember, ...current]));
          }
        }
      } catch (error) {
        if (!ignore) {
          setLoggedInProfile("unknown");
          setUserError(error instanceof Error ? error.message : "Unable to verify current user.");
        }
      }
    };

    void loadCurrentUser();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch, setAdminMembers, setStaffMembers, setUserError]);

  const loggedInName = useMemo(() => {
    const localPart = loggedInEmail.split("@")[0] ?? "";
    const normalizedParts = localPart
      .replace(/[0-9]+/g, " ")
      .split(/[._-]+|\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (normalizedParts.length === 0) return "Admin User";

    return normalizedParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }, [loggedInEmail]);

  return {
    accessToken,
    adminFetch,
    loggedInEmail,
    loggedInName,
    loggedInProfile,
    setAccessToken,
  };
}
