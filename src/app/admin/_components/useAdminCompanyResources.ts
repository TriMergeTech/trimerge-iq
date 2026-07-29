import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { API_BASE_URL } from "../../_shared/adminAuth";
import type { CreateModal } from "./adminTypes";

interface UseAdminCompanyResourcesProps {
  accessToken: string | null;
  setOpenModal: Dispatch<SetStateAction<CreateModal>>;
}

export function useAdminCompanyResources({
  accessToken,
  setOpenModal,
}: UseAdminCompanyResourcesProps) {
  const [company_details, set_company_details] = useState<any[]>([]);
  const [platforms, set_platforms] = useState<any[]>([]);
  const [editing_detail, set_editing_detail] = useState<any>(null);
  const [editing_platform, set_editing_platform] = useState<any>(null);
  const [is_loading_platforms, set_is_loading_platforms] = useState(false);
  const [is_saving_platform, set_is_saving_platform] = useState(false);
  const [is_saving_detail, set_is_saving_detail] = useState(false);
  const [is_loading_detail, set_is_loading_detail] = useState(false);
  const [tools_error, set_platform_error] = useState("");
  const [detail_error, set_detail_error] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const load_company_details = async () => {
      try {
        set_is_loading_detail(true);
        set_detail_error("");

        const response = await fetch(`${API_BASE_URL}/get_company_details`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = await response.json();

        if (!payload.ok) {
          throw new Error(payload.message);
        }

        if (!ignore && payload.ok) {
          set_company_details(payload.data);
        }
      } catch (error) {
        if (!ignore) {
          set_detail_error(
            error instanceof Error ? error.message : "Unable to load skills.",
          );
        }
      } finally {
        if (!ignore) {
          set_is_loading_detail(false);
        }
      }
    };

    void load_company_details();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadPlatforms = async () => {
      try {
        set_is_loading_platforms(true);
        set_platform_error("");

        const response = await fetch(`${API_BASE_URL}/get_platforms`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = await response.json();

        if (!payload.ok) {
          throw new Error(payload.message);
        }

        if (!ignore && payload.ok) {
          set_platforms(payload.data);
        }
      } catch (error) {
        if (!ignore) {
          set_platform_error(
            error instanceof Error ? error.message : "Unable to load platforms.",
          );
        }
      } finally {
        if (!ignore) {
          set_is_loading_platforms(false);
        }
      }
    };

    void loadPlatforms();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  const save_platform = async (payload: {
    name: string;
    url: string;
    description: string;
  }) => {
    try {
      set_is_saving_platform(true);
      set_platform_error("");

      if (!accessToken) throw new Error("Sign in before saving Tools.");

      if (editing_platform) {
        const response = await fetch(`${API_BASE_URL}/update_platform`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            platform: editing_platform._id,
            name: payload.name,
            description: payload.description,
            url: payload.url,
          }),
        });
        const reply = await response.json();

        if (reply.ok) {
          set_platforms((current) =>
            current.map((detail) =>
              detail._id === editing_platform._id ? reply.data : detail,
            ),
          );
        } else {
          set_platforms((current) =>
            current.map((detail) =>
              detail._id === editing_platform._id
                ? { ...editing_platform }
                : detail,
            ),
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_platform`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: payload.name,
            description: payload.description,
            url: payload.url,
          }),
        });

        const reply = await response.json();

        if (reply.ok) {
          set_platforms((current) => [...current, reply.data]);
        } else throw new Error(reply.message);
      }

      set_editing_platform(null);
      setOpenModal(null);
    } catch (error) {
      set_platform_error(
        error instanceof Error ? error.message : "Unable to save skill.",
      );
    } finally {
      set_is_saving_platform(false);
    }
  };

  const remove_platform = async (tool_id: string) => {
    try {
      set_platform_error("");
      if (!accessToken) throw new Error("Sign in before deleting platform.");

      const response = await fetch(`${API_BASE_URL}/remove_platform`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ platform: tool_id }),
      });

      const repl = await response.json();
      if (repl?.ok) {
        set_platforms((current) =>
          current.filter((item) => item._id !== tool_id),
        );
      } else {
        throw new Error(repl.message);
      }
    } catch (error) {
      set_platform_error(
        error instanceof Error ? error.message : "Unable to delete platform.",
      );
    }
  };

  const save_detail = async (payload: { name: string; description: string }) => {
    try {
      set_is_saving_detail(true);
      set_detail_error("");

      if (!accessToken) throw new Error("Sign in before saving details.");

      if (editing_detail) {
        const response = await fetch(`${API_BASE_URL}/update_detail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            detail: editing_detail._id,
            title: payload.name,
            description: payload.description,
          }),
        });
        const reply = await response.json();

        if (reply.ok) {
          set_company_details((current) =>
            current.map((detail) =>
              detail._id === editing_detail._id ? reply.data : detail,
            ),
          );
        } else {
          set_company_details((current) =>
            current.map((detail) =>
              detail._id === editing_detail._id ? { ...editing_detail } : detail,
            ),
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_detail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: payload.name,
            detail: payload.description,
          }),
        });

        const reply = await response.json();

        if (reply.ok) {
          set_company_details((current) => [...current, reply.data]);
        } else throw new Error(reply.message);
      }

      set_editing_detail(null);
      setOpenModal(null);
    } catch (error) {
      set_detail_error(
        error instanceof Error ? error.message : "Unable to save skill.",
      );
    } finally {
      set_is_saving_detail(false);
    }
  };

  const remove_detail = async (detail_id: string) => {
    try {
      set_detail_error("");
      if (!accessToken) throw new Error("Sign in before deleting details.");

      const response = await fetch(`${API_BASE_URL}/remove_detail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ detail: detail_id }),
      });

      const repl = await response.json();
      if (repl?.ok) {
        set_company_details((current) =>
          current.filter((item) => item._id !== detail_id),
        );
      } else {
        throw new Error(repl.message);
      }
    } catch (error) {
      set_detail_error(
        error instanceof Error ? error.message : "Unable to delete detail.",
      );
    }
  };

  const open_edit_detail_modal = async (detail: any) => {
    try {
      set_is_loading_detail(true);
      set_detail_error("");
      if (!accessToken) throw new Error("Sign in before loading details.");

      set_editing_detail(detail);
      setOpenModal("company_overview");
    } catch (error) {
      set_detail_error(
        error instanceof Error ? error.message : "Unable to load detail.",
      );
    } finally {
      set_is_loading_detail(false);
    }
  };

  const open_edit_platform_modal = async (platform: any) => {
    try {
      set_is_loading_platforms(true);
      set_platform_error("");
      if (!accessToken) throw new Error("Sign in before loading details.");

      set_editing_platform(platform);
      setOpenModal("platforms");
    } catch (error) {
      set_platform_error(
        error instanceof Error ? error.message : "Unable to load platform.",
      );
    } finally {
      set_is_loading_platforms(false);
    }
  };

  const closeDetailModal = () => {
    setOpenModal(null);
    set_editing_detail(null);
    set_detail_error("");
  };

  const closePlatformModal = () => {
    setOpenModal(null);
    set_editing_platform(null);
    set_platform_error("");
  };

  return {
    closeDetailModal,
    closePlatformModal,
    company_details,
    detail_error,
    editing_detail,
    editing_platform,
    is_loading_detail,
    is_loading_platforms,
    is_saving_detail,
    is_saving_platform,
    open_edit_detail_modal,
    open_edit_platform_modal,
    platforms,
    remove_detail,
    remove_platform,
    save_detail,
    save_platform,
    tools_error,
  };
}
