"use client";

import { FileText, Image as ImageIcon, X } from "lucide-react";

import type { UploadedFile } from "./chatPageTypes";

interface AttachmentStatusListProps {
  attachedFiles: UploadedFile[];
  onRemoveFile: (file: UploadedFile) => void;
}

export default function AttachmentStatusList({
  attachedFiles,
  onRemoveFile,
}: AttachmentStatusListProps) {
  if (attachedFiles.length === 0) return null;

  return (
    <div className="px-6 pb-3 lg:px-12">
      <div className="mx-auto flex max-w-[1160px] flex-wrap gap-2">
        {attachedFiles.map((file) => (
          <div
            key={`${file.name}-${file.size}`}
            className="flex items-center gap-3 rounded-2xl border border-[#7c5cff]/22 bg-[#101827]/80 px-3 py-2 text-white/88"
          >
            {file.type.startsWith("image/") ? (
              <ImageIcon className="h-4 w-4 shrink-0" />
            ) : (
              <FileText className="h-4 w-4 shrink-0" />
            )}
            <span className="min-w-0">
              <span className="block max-w-[220px] truncate text-sm font-medium">{file.name}</span>
              {file.extractionStatus === "pending" && (
                <span className="block text-xs text-[#f0d98a]/75">Extracting RFP...</span>
              )}
              {file.extractionStatus === "ready" && (
                <span className="block text-xs text-emerald-200/80">RFP ready.</span>
              )}
              {file.extractionStatus === "error" && (
                <span className="block text-xs text-red-200/80">
                  {file.extractionError ?? "RFP extraction failed."}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onRemoveFile(file)}
              className="interactive-button rounded-full p-1 hover:bg-[#7c5cff]/12"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
