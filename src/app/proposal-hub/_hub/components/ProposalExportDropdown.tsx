import { useEffect, useRef, useState } from "react";
import { ChevronRight, Download, FileText, Table2 } from "lucide-react";
import { BACKEND } from "../utils/services";
import type { FeedbackType } from "./feedback/types";

interface ProposalExportDropdownProps {
  proposalId?: string;
  pushFeedback: (message: string, type?: FeedbackType, duration?: number) => void;
  post_request: (endpoint: string, body?: any) => Promise<any>;
}

export default function ProposalExportDropdown({
  proposalId,
  pushFeedback,
  post_request,
}: ProposalExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleExport = async (format: string) => {
    if (!proposalId) {
      pushFeedback("Please save the proposal before exporting.", "error");
      return;
    }

    setExporting(format);

    try {
      const response = await fetch(`${BACKEND}/export_to_document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposal: proposalId,
          export_type: format,
        }),
      });

      const res = await response.json();

      if (!res.ok) {
        pushFeedback(res.message || `Failed to export ${format}`, "error");
      } else {
        if (res.data?.url) {
          window.open(res.data.url, "_blank");
        }

        pushFeedback(res.message || `Exported as ${format}`, "success");
      }
    } catch (err: any) {
      console.error(err);

      pushFeedback(err?.message || "Export failed", "error");
    }

    setExporting(null);
    setOpen(false);
  };

  return (
    <div className="export-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="proposal-ws__ghost"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download size={15} />
        Export
        <ChevronRight
          size={14}
          style={{
            marginLeft: 6,
            transition: "0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div className="export-dropdown__menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
          >
            <FileText size={14} />
            PDF
            {exporting === "pdf" ? "..." : ""}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("word")}
            disabled={!!exporting}
          >
            <Table2 size={14} />
            Word
            {exporting === "word" ? "..." : ""}
          </button>

          {/* <button
            type="button"
            role="menuitem"
            onClick={() => handleExport("json")}
            disabled={!!exporting}
          >
            <FileText size={14} />
            JSON
            {exporting === "json" ? "..." : ""}
          </button> */}
        </div>
      )}
    </div>
  );
}
