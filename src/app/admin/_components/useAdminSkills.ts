import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { API_BASE_URL } from "../../_shared/adminAuth";
import type { CreateModal, SkillItem } from "./adminTypes";

interface UseAdminSkillsProps {
  accessToken: string | null;
  adminFetch: (pathOrUrl: string, init?: RequestInit) => Promise<Response>;
  setOpenModal: Dispatch<SetStateAction<CreateModal>>;
}

export function useAdminSkills({
  accessToken,
  adminFetch,
  setOpenModal,
}: UseAdminSkillsProps) {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingSkillDetails, setIsLoadingSkillDetails] = useState(false);
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [skillError, setSkillError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let ignore = false;

    const loadSkills = async () => {
      try {
        setIsLoadingSkills(true);
        setSkillError("");

        const response = await fetch(`${API_BASE_URL}/get_skills`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load skills (${response.status})`);
        }

        const payload = await response.json();

        if (!ignore && payload.ok) {
          setSkills(payload.data);
        }
      } catch (error) {
        if (!ignore) {
          setSkillError(
            error instanceof Error ? error.message : "Unable to load skills.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingSkills(false);
        }
      }
    };

    void loadSkills();

    return () => {
      ignore = true;
    };
  }, [accessToken, adminFetch]);

  const saveSkill = async (payload: { name: string; description: string }) => {
    try {
      setIsSavingSkill(true);
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before saving skills.");

      if (editingSkill) {
        const response = await adminFetch(`${API_BASE_URL}/update_skill`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            skill: editingSkill._id,
            title: payload.name,
            description: payload.description,
          }),
        });
        const reply = await response.json();

        if (reply.ok) {
          setSkills((current) =>
            current.map((skill) =>
              skill._id === editingSkill._id ? reply.data : skill,
            ),
          );
        } else {
          setSkills((current) =>
            current.map((skill) =>
              skill._id === editingSkill._id ? { ...editingSkill } : skill,
            ),
          );
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/add_skill`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: payload.name,
            description: payload.description,
          }),
        });

        const reply = await response.json();

        if (reply.ok) {
          setSkills((current) => [...current, reply.data]);
        }
      }

      setEditingSkill(null);
      setOpenModal(null);
    } catch (error) {
      setSkillError(
        error instanceof Error ? error.message : "Unable to save skill.",
      );
    } finally {
      setIsSavingSkill(false);
    }
  };

  const openEditSkillModal = async (skill: SkillItem) => {
    try {
      setIsLoadingSkillDetails(true);
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before loading skills.");

      setEditingSkill(skill);
      setOpenModal("skills");
    } catch (error) {
      setSkillError(
        error instanceof Error ? error.message : "Unable to load skill.",
      );
    } finally {
      setIsLoadingSkillDetails(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      setSkillError("");
      if (!accessToken) throw new Error("Sign in before deleting skills.");

      const response = await fetch(`${API_BASE_URL}/remove_skill`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ skill: skillId }),
      });

      const reply = await response.json();

      if (reply.ok) {
        setSkills((current) => current.filter((item) => item._id !== skillId));
      } else throw new Error(reply.message);
    } catch (error) {
      setSkillError(
        error instanceof Error ? error.message : "Unable to delete skill.",
      );
    }
  };

  const closeSkillModal = () => {
    setOpenModal(null);
    setEditingSkill(null);
    setSkillError("");
  };

  return {
    closeSkillModal,
    editingSkill,
    isLoadingSkillDetails,
    isLoadingSkills,
    isSavingSkill,
    openEditSkillModal,
    removeSkill,
    saveSkill,
    skillError,
    skills,
  };
}
