import { type ChangeEvent, useState } from "react";

import { extractRfpFromFile } from "./chatApi";
import type { UploadedFile } from "./chatPageTypes";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export function useRfpAttachments() {
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      extractionStatus: isPdfFile(file) ? ("pending" as const) : undefined,
    }));

    setAttachedFiles((current) => [...current, ...selectedFiles]);
    event.target.value = "";

    selectedFiles.forEach((selectedFile) => {
      if (!selectedFile.file || selectedFile.extractionStatus !== "pending") return;

      void extractRfpFromFile(selectedFile.file)
        .then((extractedRfpData) => {
          setAttachedFiles((current) =>
            current.map((file) =>
              file.name === selectedFile.name && file.size === selectedFile.size
                ? {
                    ...file,
                    extractedRfpData,
                    extractionError: undefined,
                    extractionStatus: "ready" as const,
                  }
                : file,
            ),
          );
        })
        .catch((error) => {
          setAttachedFiles((current) =>
            current.map((file) =>
              file.name === selectedFile.name && file.size === selectedFile.size
                ? {
                    ...file,
                    extractionError: error instanceof Error ? error.message : "RFP extraction failed.",
                    extractionStatus: "error" as const,
                  }
                : file,
            ),
          );
        });
    });
  };

  const removeAttachedFile = (fileToRemove: UploadedFile) => {
    setAttachedFiles((current) =>
      current.filter((file) => file.name !== fileToRemove.name || file.size !== fileToRemove.size),
    );
  };

  return {
    attachedFiles,
    handleFileSelect,
    removeAttachedFile,
    setAttachedFiles,
  };
}
