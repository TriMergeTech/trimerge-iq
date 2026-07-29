import { type Dispatch, type RefObject, type SetStateAction, useEffect, useState } from "react";

import {
  readStoredAdminPeople,
  writeStoredAdminPeople,
} from "../../_shared/adminRegistryState";
import { fetchProjectFormOptions } from "./chatApi";
import type { ProjectFormOption } from "./chatPageTypes";

interface UseProjectFormStateProps {
  isCreateProjectModalOpen: boolean;
  projectNameInputRef: RefObject<HTMLInputElement>;
  setLastChatError: Dispatch<SetStateAction<string>>;
}

export function useProjectFormState({
  isCreateProjectModalOpen,
  projectNameInputRef,
  setLastChatError,
}: UseProjectFormStateProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectService, setNewProjectService] = useState("");
  const [newProjectTeam, setNewProjectTeam] = useState<string[]>([]);
  const [newProjectManager, setNewProjectManager] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [projectClientOptions, setProjectClientOptions] = useState<ProjectFormOption[]>([]);
  const [projectServiceOptions, setProjectServiceOptions] = useState<ProjectFormOption[]>([]);
  const [projectStaffOptions, setProjectStaffOptions] = useState<ProjectFormOption[]>([]);
  const [isLoadingProjectOptions, setIsLoadingProjectOptions] = useState(false);

  const addProjectStaffOption = () => {
    const staffName = window.prompt("Staff member name")?.trim();
    if (!staffName) return;

    const newStaff = {
      id: `local-person-${Date.now()}`,
      name: staffName,
      email: "",
      role: "staff" as const,
      createdAt: new Date(),
    };

    writeStoredAdminPeople([...readStoredAdminPeople(), newStaff]);
    setProjectStaffOptions((current) => [...current, { id: newStaff.id, label: newStaff.name }]);
    setNewProjectManager((current) => current || newStaff.id);
    setNewProjectTeam((current) => (current.includes(newStaff.id) ? current : [...current, newStaff.id]));
  };

  useEffect(() => {
    let isCancelled = false;

    if (!isCreateProjectModalOpen) return;

    const loadProjectOptions = async () => {
      setIsLoadingProjectOptions(true);

      try {
        const options = await fetchProjectFormOptions();
        if (isCancelled) return;

        setProjectClientOptions(options.clients);
        setProjectServiceOptions(options.services);
        setProjectStaffOptions(options.staff);
        setLastChatError("");
      } catch (error) {
        if (!isCancelled) {
          setLastChatError(error instanceof Error ? error.message : "Unable to load project options right now.");
        }
      } finally {
        if (!isCancelled) setIsLoadingProjectOptions(false);
      }
    };

    void loadProjectOptions();

    return () => {
      isCancelled = true;
    };
  }, [isCreateProjectModalOpen, setLastChatError]);

  useEffect(() => {
    if (!isCreateProjectModalOpen) return;

    if (!newProjectService && projectServiceOptions[0]) setNewProjectService(projectServiceOptions[0].id);
    if (!newProjectClient && projectClientOptions[0]) setNewProjectClient(projectClientOptions[0].id);
    if (!newProjectManager && projectStaffOptions[0]) setNewProjectManager(projectStaffOptions[0].id);
  }, [
    isCreateProjectModalOpen,
    newProjectClient,
    newProjectManager,
    newProjectService,
    projectClientOptions,
    projectServiceOptions,
    projectStaffOptions,
  ]);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = isCreateProjectModalOpen ? "hidden" : previousHtmlOverflow;
    document.body.style.overflow = isCreateProjectModalOpen ? "hidden" : previousBodyOverflow;

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isCreateProjectModalOpen]);

  useEffect(() => {
    if (!isCreateProjectModalOpen) return;
    const timeoutId = window.setTimeout(() => projectNameInputRef.current?.focus(), 30);
    return () => window.clearTimeout(timeoutId);
  }, [isCreateProjectModalOpen, projectNameInputRef]);

  return {
    addProjectStaffOption,
    isLoadingProjectOptions,
    newProjectClient,
    newProjectDescription,
    newProjectManager,
    newProjectName,
    newProjectService,
    newProjectTeam,
    projectClientOptions,
    projectServiceOptions,
    projectStaffOptions,
    setNewProjectClient,
    setNewProjectDescription,
    setNewProjectManager,
    setNewProjectName,
    setNewProjectService,
    setNewProjectTeam,
    setProjectClientOptions,
  };
}
