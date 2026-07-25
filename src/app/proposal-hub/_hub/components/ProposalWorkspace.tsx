import "../styles/proposals.css";
import {
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useFeedback, { FeedbackStack } from "./feedback/useFeedback";
import ProposalExportDropdown from "./ProposalExportDropdown";
import {
  ArrowLeft,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronRight,
  Eraser,
  Download,
  FileText,
  GripVertical,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link,
  List,
  ListOrdered,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  PenLine,
  Rocket,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import "./proposal-workspace.css";
import { Box } from "@mui/material";
import { post_request, TRIMERGE_BACKEND } from "../utils/services";
import type { Proposal, ProposalStatus, Section } from "../types";

interface ProposalWorkspaceProps {
  proposal: Proposal | null;
  onBack: () => void;
  onSave: (proposal: Proposal) => void;
  onDeleteSection: (proposalId?: string) => void;
  onSubmitForReview?: (proposal: Proposal) => void;
  isNew?: boolean;
}

export default function ProposalWorkspace({
  proposal,
  onBack,
  onSave,
  onDeleteSection,
  onSubmitForReview,
  isNew = false,
}: ProposalWorkspaceProps) {
  if (proposal) proposal = { ...proposal, title: proposal?.opportunity_title };

  const [title, setTitle] = useState(proposal?.title || "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adding_section, set_adding_section] = useState(false);
  const [proposal_id, set_proposal_id] = useState(proposal?._id);
  const [tool_data, set_tool_data] = useState<any>(null);
  const [saving_proposal_data, set_saving_proposal_data] = useState(false);
  const { feedbacks, pushFeedback, removeFeedback } = useFeedback();

  useEffect(() => {
    const new_proposal = async () => {
      if (proposal) return;

      let res;
      try {
        let ftch = await fetch(`${TRIMERGE_BACKEND}/get_tool`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tool: "9a4e0485-4796-4cc8-9567-be1be91640f6",
          }),
        });
        res = await ftch.json();
        res = res?.ok ? res.data : null;
      } catch (e) {}
      if (!res?.arguments) {
        res = {
          _id: "6a0f6fb93995d6cbe80d82e9",
          name: "Proposal Creation",
          description:
            "Creates professional business proposals using client requirements, project goals, pricing, staffing, timelines, and organizational data to generate structured, accurate, and submission-ready proposals.",
          arguments: {
            opportunity_title: {
              type: "string",
              description: "Name of the opportunity or solicitation",
            },

            agency: {
              type: "string",
              description: "Customer or issuing agency",
            },

            solicitation_number: {
              type: "string",
              description: "Solicitation or notice identifier",
            },

            scope_of_work: {
              type: "string",
              description: "Required services, objectives, or capabilities",
            },

            compliance_requirements: {
              type: "string",
              description:
                "Proposal instructions, mandatory requirements, or evaluation criteria",
            },

            staffing_requirements: {
              type: "string",
              description:
                "Required labor categories, certifications, or personnel",
            },

            pricing_structure: {
              type: "string",
              description:
                "Pricing model, budget expectations, or cost structure",
            },

            win_themes: {
              type: "string",
              description:
                "Key differentiators, customer pain points, and strategic positioning",
            },

            past_performance: {
              type: "string",
              description: "Relevant past performance references or experience",
            },

            knowledge_tags: {
              type: "string",
              description:
                "Keywords, industries, NAICS, functional areas, or reusable proposal tags",
            },
          },
          created_at: "2026-05-21T20:48:57.462Z",
        };
      }

      set_tool_data(res);
      let propss: Record<string, string> = {};
      for (let p in res.arguments) {
        let arg = res.arguments[p];

        propss[p] = "";
      }

      setProposalData(propss);
    };

    new_proposal();
  }, []);

  const clean_proposal = (proposal: Proposal | null) => {
    let pp: Proposal = { ...proposal };

    delete pp._id;
    delete pp.created;
    delete pp.sections;
    delete pp.updated;

    return pp;
  };

  const [proposalData, setProposalData] = useState(clean_proposal(proposal));

  const [fabPosition, setFabPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef({
    active: false,
    dragging: false,
    suppressClick: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const editorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const selectionRefs = useRef<Record<string, Range | null>>({});
  const [savedAt, setSavedAt] = useState(
    isNew ? "Unsaved draft" : "Autosaved 2 min ago",
  );
  const [sections, setSections] = useState<Section[] | null>(null);

  useEffect(() => {
    let get_sections = async () => {
      let secs = await post_request("get_sections", { proposal: proposal_id });

      console.log(secs);
      if (secs.ok) {
        setSections(secs.data);
      }
    };

    get_sections();
  }, []);

  const addSection = async () => {
    if (adding_section) return;

    set_adding_section(true);

    let sec = await post_request("add_section", { proposal: proposal_id });

    set_adding_section(false);
    if (!sec.ok) {
      return;
    }

    sec = {
      title: "New section",
      body: "",
      _id: sec.data._id,
      created: sec.data.created,
    };
    setSections((current) => [...(current || []), sec]);

    let sections = (proposal?.sections || 0) + 1;
    onSave({ ...proposal, sections });
  };

  const deleteSection = async (id: string) => {
    setSections((current) =>
      (current || []).filter((section) => section._id !== id),
    );

    await post_request("delete_section", {
      section: id,
      proposal: proposal_id,
    });

    onDeleteSection(proposal_id);
  };

  const moveSection = (id: string) => {
    setSections((current) => {
      const list = current || [];
      const index = list.findIndex((section) => section._id === id);
      if (index < 0 || list.length < 2) return list;
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index === list.length - 1 ? 0 : index + 1, 0, item);
      return next;
    });
  };

  const buildProposalPayload = (
    status: ProposalStatus = proposal?.status || "draft",
  ): Proposal => {
    return { ...proposal, status };
  };

  const saveDraft = () => {
    onSave(buildProposalPayload("draft"));
    setSavedAt("Draft saved just now");
  };

  const validate_proposal_data = (proposalData: Record<string, any>) => {
    // If no tool metadata is available, do a minimal check
    if (!tool_data || !tool_data.arguments) {
      // ensure at least one field exists
      const hasAny = Object.keys(proposalData || {}).length > 0;
      if (!hasAny) {
        pushFeedback("Proposal data is empty.", "error");
        return false;
      }
      return true;
    }

    const args = tool_data.arguments;
    const errors: string[] = [];
    const parsed: Record<string, any> = { ...proposalData };

    for (const [argName, argSpec] of Object.entries(args)) {
      const expectedType = (argSpec as any).type || "string";
      const raw = parsed[argName];

      // Treat empty string / undefined / null as missing
      const isMissing =
        raw === undefined ||
        raw === null ||
        (typeof raw === "string" && raw.trim() === "");

      // Require all tool arguments by default
      if (isMissing) {
        errors.push(`${argName} is required`);
        continue;
      }

      // Type coercion & validation
      if (expectedType === "string") {
        if (typeof raw !== "string") {
          parsed[argName] = String(raw);
        }
      } else if (
        expectedType === "number" ||
        expectedType === "integer" ||
        expectedType === "float"
      ) {
        const n = Number(raw);
        if (Number.isNaN(n)) {
          errors.push(`${argName} must be a valid number`);
        } else {
          parsed[argName] = n;
          if (expectedType === "integer") parsed[argName] = Math.trunc(n);
        }
      } else if (expectedType === "boolean") {
        if (typeof raw === "boolean") {
          // ok
        } else if (typeof raw === "string") {
          const v = raw.trim().toLowerCase();
          if (v === "true" || v === "false") {
            parsed[argName] = v === "true";
          } else {
            errors.push(`${argName} must be a boolean (true/false)`);
          }
        } else {
          errors.push(`${argName} must be a boolean`);
        }
      } else {
        // unknown/complex types: attempt basic validation
        if (expectedType === "array") {
          if (!Array.isArray(raw)) {
            errors.push(`${argName} must be an array`);
          }
        } else {
          // accept other types (object, etc.) without strict checking
        }
      }
    }

    if (errors.length > 0) {
      // Surface errors to the user
      const message = `Please fix the following fields:\n- ${errors.join("\n- ")}`;
      // use alert for quick feedback; keep console for developers
      pushFeedback(message, "error");
      console.error("Proposal validation errors:", errors);
      return false;
    }

    // Update proposal data with any parsed/coerced values
    try {
      setProposalData((prev) => ({ ...(prev || {}), ...parsed }));
    } catch (e) {
      // ignore if setProposalData not available for some reason
    }

    return true;
  };

  const saveProposal = async () => {
    let proposal_ = proposalData,
      res;

    let ans = validate_proposal_data(proposalData);

    console.log(ans);
    if (!ans) {
      return;
    }

    console.log("HAPENING");

    set_saving_proposal_data(true);

    if (!proposal?._id) {
      res = await post_request("add_proposal", { proposal: proposal_ });
      proposal = res.data;

      set_proposal_id(proposal?._id);
    } else {
      res = await post_request("update_proposal", { proposal: proposal_ });
    }

    if (res.ok) {
      pushFeedback(res.message, "success");
    } else {
      pushFeedback(res.message, "error");
    }

    onSave({ ...proposal, ...proposalData });
    setSavedAt("Saved just now");
    set_saving_proposal_data(false);
  };

  const saveEditorSelection = (sectionId: string) => {
    const editor = editorRefs.current[sectionId];
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      selectionRefs.current[sectionId] = range.cloneRange();
    }
  };

  const restoreEditorSelection = (sectionId: string) => {
    const editor = editorRefs.current[sectionId];
    if (!editor) return;

    const savedRange = selectionRefs.current[sectionId];
    const selection = window.getSelection();
    if (!selection) return;

    editor.focus();

    if (savedRange && editor.contains(savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    selectionRefs.current[sectionId] = range.cloneRange();
  };

  const moveCaretToFirstTableCell = (sectionId: string) => {
    const editor = editorRefs.current[sectionId];
    if (!editor) return;

    const firstCell = editor.querySelector("td");
    if (!firstCell) return;

    const range = document.createRange();
    range.selectNodeContents(firstCell);
    range.collapse(true);

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);
    selectionRefs.current[sectionId] = range.cloneRange();
  };

  const syncSectionBody = (sectionId: string) => {
    const editor = editorRefs.current[sectionId];
    if (!editor) return;

    const nextBody = editor.innerHTML;
    setSections((current) =>
      (current || []).map((item) =>
        item.id === sectionId
          ? item.body === nextBody
            ? item
            : { ...item, body: nextBody }
          : item,
      ),
    );
  };

  useLayoutEffect(() => {
    sections?.forEach((section) => {
      const editor = editorRefs.current[section._id];
      if (!editor) return;
      if (document.activeElement === editor) return;

      const expectedHTML = section.body || "<br>";
      if (editor.innerHTML !== expectedHTML) {
        editor.innerHTML = expectedHTML;
      }
    });
  }, [sections]);

  const runEditorCommand = (
    sectionId: string,
    command: string,
    value?: string,
  ) => {
    restoreEditorSelection(sectionId);
    document.execCommand(command, false, value);
    saveEditorSelection(sectionId);
    syncSectionBody(sectionId);
  };

  const createEditorLink = (sectionId: string) => {
    const url = window.prompt("Enter URL", "https://");
    if (url) runEditorCommand(sectionId, "createLink", url);
  };

  const insertEditorTable = (sectionId: string) => {
    restoreEditorSelection(sectionId);
    document.execCommand(
      "insertHTML",
      false,
      "<table><thead><tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr></thead><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table><p><br></p>",
    );
    moveCaretToFirstTableCell(sectionId);
    syncSectionBody(sectionId);
  };

  const moveFab = (clientX: number, clientY: number) => {
    const size = fabRef.current?.offsetWidth || 56;
    const padding = 12;
    const x = Math.min(
      Math.max(clientX - dragRef.current.offsetX, padding),
      window.innerWidth - size - padding,
    );
    const y = Math.min(
      Math.max(clientY - dragRef.current.offsetY, padding),
      window.innerHeight - size - padding,
    );
    setFabPosition({ x, y });
  };

  const startFabDrag = (clientX: number, clientY: number) => {
    const rect = fabRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      active: true,
      dragging: false,
      suppressClick: false,
      startX: clientX,
      startY: clientY,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const handleFabClick = () => {
    if (dragRef.current.suppressClick) {
      dragRef.current.suppressClick = false;
      return;
    }
    setDrawerOpen(true);
  };

  const handleFabMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    startFabDrag(event.clientX, event.clientY);
  };

  const handleFabTouchStart = (event: ReactTouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    startFabDrag(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const dragThreshold = 6;

    const updateDrag = (clientX: number, clientY: number) => {
      if (!dragRef.current.active) return;

      const distance = Math.hypot(
        clientX - dragRef.current.startX,
        clientY - dragRef.current.startY,
      );
      if (!dragRef.current.dragging && distance < dragThreshold) return;

      dragRef.current.dragging = true;
      dragRef.current.suppressClick = true;
      moveFab(clientX, clientY);
    };

    const finishDrag = () => {
      dragRef.current.active = false;
      dragRef.current.dragging = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateDrag(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      finishDrag();
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      updateDrag(touch.clientX, touch.clientY);
      if (dragRef.current.dragging) event.preventDefault();
    };

    const handleTouchEnd = () => {
      finishDrag();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  });

  const dirtySectionsRef = useRef<Record<string, boolean>>({});
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      syncDirtySections();
    }, 5000); // X seconds (5s example)

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [sections]);

  const [syncing_dirty, set_syncing_dirty] = useState(false);

  const syncDirtySections = async () => {
    const dirtyIds = Object.keys(dirtySectionsRef.current);

    if (dirtyIds.length === 0) return;

    const payload = sections?.filter((s) => dirtySectionsRef.current[s._id]);

    if (!payload || payload.length === 0) return;

    set_syncing_dirty(true);
    const res = await post_request("update_sections", {
      sections: payload,
      proposal_id: proposal?._id,
    });
    set_syncing_dirty(false);
    if (res.ok) {
      // clear dirty flags only if successful
      dirtyIds.forEach((id) => {
        delete dirtySectionsRef.current[id];
      });
    }
  };

  const [show_bulk_sections, toggle_bulk_sections] = useState(false);
  const [bulk_json, set_bulk_json] = useState("");
  const [saving_bulk, set_saving_bulk] = useState(false);

  const add_bulk_sections = async () => {
    if (!proposal_id) {
      pushFeedback(
        "Please save the proposal before importing sections.",
        "error",
      );
      return;
    }

    try {
      let sections = JSON.parse(bulk_json?.trim());
      if (!Array.isArray(sections))
        throw new Error("Content must be an object array");

      set_saving_bulk(true);
      let res = await post_request("add_bulk_sections", {
        proposal: proposal?._id,
        sections,
      });

      if (res.ok) {
        pushFeedback(res.message, "success");
        setSections((prev) => [...(prev || []), ...res.data.sections]);
        let secs = (proposal?.sections || 0) + res.data.length;
        onSave({ ...proposal, sections: secs });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error(err);
      pushFeedback(err instanceof Error ? err.message : "Something went wrong", "error");
    }
    set_saving_bulk(false);
  };

  return (
    <div className="proposal-ws">
      <FeedbackStack feedbacks={feedbacks} onRemove={removeFeedback} />

      <main className="proposal-ws__main">
        <div className="proposal-ws__sky" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <span
              key={index}
              style={{
                left: `${(index * 37) % 100}%`,
                top: `${(index * 19) % 100}%`,
                animationDelay: `${(index % 7) * 0.35}s`,
              }}
            />
          ))}
        </div>

        <header className="proposal-ws__header">
          <div className="proposal-ws__nav-left">
            <button
              className="proposal-ws__back"
              type="button"
              onClick={onBack}
            >
              <ArrowLeft size={15} />
              All proposals
            </button>
          </div>
          <div className="proposal-ws__actions">
            {/* <button type="button" className="proposal-ws__ghost">
              <Share2 size={15} />
              Share
            </button> */}

            <ProposalExportDropdown
              proposalId={proposal_id || proposal?._id}
              pushFeedback={pushFeedback}
              post_request={post_request}
            />
            {/* <button
              type="button"
              className="proposal-ws__primary"
              onClick={saveProposal}
            >
              <Save size={15} />
              Save
            </button> */}
          </div>
        </header>

        <div className="proposal-ws__body">
          <section className="proposal-doc">
            <div className="proposal-doc__tag">
              <span />
              Workspace
            </div>
            <h1
              className="proposal-doc__title-input"
              suppressContentEditableWarning
              data-placeholder="Proposal title"
            >
              {title}
            </h1>
            <div className="proposal-doc__meta">
              <span>{sections?.length} sections</span>
            </div>
            <div className="proposal-doc__progress">
              {/* {sections?.map((section) => (
                <span
                  key={section._id}
                  className={
                    section.body.replace(/<[^>]+>/g, "").trim() ? "is-done" : ""
                  }
                />
              ))} */}
            </div>

            <Box>
              <div className="proposal-step__grid">
                {Object.entries(proposalData).map(([key, value]) => (
                  <div className="proposal-field" key={key}>
                    <label style={{ textTransform: "capitalize" }}>
                      {key.charAt(0).toUpperCase() +
                        key.replace(/_/g, " ").slice(1)}
                    </label>

                    <input
                      name={key}
                      value={value}
                      placeholder={`Enter ${key.replace(/_/g, " ")}`}
                      onChange={(event) =>
                        setProposalData((prev) => ({
                          ...prev,
                          [event.target.name]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}

                <div className="proposal-step__footer">
                  <button
                    onClick={saveProposal}
                    className="proposal-save-btn"
                    disabled={saving_proposal_data}
                    aria-busy={saving_proposal_data}
                    aria-label={
                      saving_proposal_data ? "Saving proposal" : "Save proposal"
                    }
                  >
                    {saving_proposal_data ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 50 50"
                          aria-hidden="true"
                          style={{ display: "block" }}
                        >
                          <g>
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray="31.4 31.4"
                            />
                            <animateTransform
                              attributeName="transform"
                              type="rotate"
                              from="0 25 25"
                              to="360 25 25"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </g>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Save size={14} />
                        Save Proposal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Box>

            <div className="proposal-search-row">
              <label className="proposal-search">
                <Search size={16} />
                <input placeholder="Search sections..." />
              </label>
            </div>

            {sections ? (
              sections.map((section, index) => (
                <article className="proposal-section" key={section._id}>
                  <div className="proposal-section__head">
                    <span className="proposal-section__num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <input
                      value={section.title}
                      placeholder={`Section ${index + 1} title`}
                      onChange={(event) => {
                        const value = event.target.value;

                        setSections((current) =>
                          (current || []).map((item) =>
                            item._id === section._id
                              ? { ...item, title: value }
                              : item,
                          ),
                        );

                        dirtySectionsRef.current[section._id] = true;
                      }}
                    />
                    <div className="proposal-section__tools">
                      <button
                        type="button"
                        title="Ask AI"
                        onClick={() => setDrawerOpen(true)}
                      >
                        <Sparkles size={15} />
                      </button>
                      <button
                        type="button"
                        title="Move"
                        onClick={() => moveSection(section._id)}
                      >
                        <GripVertical size={15} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => deleteSection(section._id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="proposal-section__status">
                    {(() => {
                      const unsaved = Object.keys(
                        dirtySectionsRef.current || {},
                      );
                      const isDirty = unsaved.includes(section._id);
                      return (
                        <>
                          <span className={isDirty ? "" : "is-done"} />
                          {isDirty
                            ? syncing_dirty
                              ? "Saving..."
                              : "In progress"
                            : section.body?.replace(/<[^>]+>/g, "").trim()
                              ? "Saved"
                              : "Empty"}
                        </>
                      );
                    })()}
                  </div>
                  <div
                    className="proposal-toolbar"
                    onMouseDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (!target.closest("select")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <select
                      className="proposal-toolbar__select"
                      defaultValue="p"
                      title="Text style"
                      onChange={(event) =>
                        runEditorCommand(
                          section._id,
                          "formatBlock",
                          event.target.value,
                        )
                      }
                    >
                      <option value="p">Paragraph</option>
                      <option value="h2">Heading 1</option>
                      <option value="h3">Heading 2</option>
                    </select>
                    <span className="proposal-toolbar__divider" />
                    <button
                      type="button"
                      title="Bold"
                      onClick={() => runEditorCommand(section._id, "bold")}
                    >
                      <Bold size={14} />
                    </button>
                    <button
                      type="button"
                      title="Italic"
                      onClick={() => runEditorCommand(section._id, "italic")}
                    >
                      <Italic size={14} />
                    </button>
                    <button
                      type="button"
                      title="Underline"
                      onClick={() => runEditorCommand(section._id, "underline")}
                    >
                      <Underline size={14} />
                    </button>
                    <button
                      type="button"
                      title="Strikethrough"
                      onClick={() =>
                        runEditorCommand(section._id, "strikeThrough")
                      }
                    >
                      <Strikethrough size={14} />
                    </button>
                    <span className="proposal-toolbar__divider" />
                    <button
                      type="button"
                      title="Bullet list"
                      onClick={() =>
                        runEditorCommand(section._id, "insertUnorderedList")
                      }
                    >
                      <List size={14} />
                    </button>
                    <button
                      type="button"
                      title="Numbered list"
                      onClick={() =>
                        runEditorCommand(section._id, "insertOrderedList")
                      }
                    >
                      <ListOrdered size={14} />
                    </button>
                    <button
                      type="button"
                      title="Decrease indent"
                      onClick={() => runEditorCommand(section._id, "outdent")}
                    >
                      <IndentDecrease size={14} />
                    </button>
                    <button
                      type="button"
                      title="Increase indent"
                      onClick={() => runEditorCommand(section._id, "indent")}
                    >
                      <IndentIncrease size={14} />
                    </button>
                    <span className="proposal-toolbar__divider" />
                    <button
                      type="button"
                      title="Align left"
                      onClick={() =>
                        runEditorCommand(section._id, "justifyLeft")
                      }
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      type="button"
                      title="Align center"
                      onClick={() =>
                        runEditorCommand(section._id, "justifyCenter")
                      }
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      type="button"
                      title="Align right"
                      onClick={() =>
                        runEditorCommand(section._id, "justifyRight")
                      }
                    >
                      <AlignRight size={14} />
                    </button>
                    <span className="proposal-toolbar__divider" />
                    <button
                      type="button"
                      title="Quote"
                      onClick={() =>
                        runEditorCommand(
                          section._id,
                          "formatBlock",
                          "blockquote",
                        )
                      }
                    >
                      <Quote size={14} />
                    </button>
                    <button
                      type="button"
                      title="Link"
                      onClick={() => createEditorLink(section._id)}
                    >
                      <Link size={14} />
                    </button>
                    <button
                      type="button"
                      title="Insert table"
                      onClick={() => insertEditorTable(section._id)}
                    >
                      <Table2 size={14} />
                    </button>
                    <button
                      type="button"
                      title="Mark complete"
                      onClick={() =>
                        runEditorCommand(
                          section._id,
                          "insertHTML",
                          "<strong>Done:</strong> ",
                        )
                      }
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      title="Clear formatting"
                      onClick={() => {
                        runEditorCommand(section._id, "removeFormat");
                        runEditorCommand(section._id, "unlink");
                      }}
                    >
                      <Eraser size={14} />
                    </button>
                  </div>
                  <div
                    ref={(element) => {
                      editorRefs.current[section._id] = element;
                    }}
                    className="proposal-section__body"
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Start writing or paste content..."
                    onFocus={() => saveEditorSelection(section._id)}
                    onMouseUp={() => saveEditorSelection(section._id)}
                    onKeyUp={() => saveEditorSelection(section._id)}
                    onInput={(event) => {
                      const nextBody = event.currentTarget.innerHTML;

                      setSections((current) =>
                        (current || []).map((item) =>
                          item._id === section._id
                            ? { ...item, body: nextBody }
                            : item,
                        ),
                      );

                      dirtySectionsRef.current[section._id] = true;
                    }}
                  />
                </article>
              ))
            ) : (
              <>
                <div className="proposal-sections__loader" aria-live="polite">
                  <div className="skeleton-grid">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <article className="proposal-section skeleton" key={i}>
                        <div className="proposal-section__head">
                          <span className="proposal-section__num skeleton-block" />
                          <div className="skeleton-line skeleton-title" />
                          <div className="proposal-section__tools">
                            <span className="skeleton-icon" />
                            <span className="skeleton-icon" />
                            <span className="skeleton-icon" />
                          </div>
                        </div>
                        <div className="proposal-section__status">
                          <span className="skeleton-dot" />
                          <span className="skeleton-text short" />
                        </div>
                        <div className="proposal-section__body skeleton-block" />
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              className="proposal-doc__add"
              type="button"
              onClick={addSection}
            >
              <Plus size={18} />
              {adding_section ? "Adding section..." : "Add Section"}
            </button>

            <div
              className={`proposal-bulk ${show_bulk_sections ? "is-open" : ""}`}
            >
              <button
                className="proposal-doc__add proposal-doc__import"
                type="button"
                onClick={() => toggle_bulk_sections(!show_bulk_sections)}
              >
                <FileText size={18} />

                <span>
                  {show_bulk_sections
                    ? "Close Bulk Import"
                    : "Import Multiple Sections"}
                </span>
              </button>

              {show_bulk_sections && (
                <div className="proposal-bulk__panel">
                  <div className="proposal-bulk__head">
                    <div>
                      <h3>Bulk Section Import</h3>

                      <p>
                        Paste a JSON array of proposal sections to instantly
                        generate multiple sections at once.
                      </p>
                    </div>
                  </div>

                  <div className="proposal-bulk__example">
                    <strong>Expected Format</strong>

                    <pre>
                      {`[
  {
    "title": "Executive Summary",
    "body": "<p>Project overview...</p>"
  },
  {
    "title": "Scope of Work",
    "body": "<ul><li>...</li></ul>"
  }
]`}
                    </pre>
                  </div>

                  <label
                    htmlFor="bulk-json-input"
                    className="proposal-bulk__label"
                  >
                    Section JSON
                  </label>

                  <textarea
                    id="bulk-json-input"
                    className="proposal-bulk__textarea"
                    value={bulk_json}
                    onChange={(e) => set_bulk_json(e.target.value)}
                    placeholder="Paste proposal sections JSON here..."
                    rows={12}
                    spellCheck={false}
                    aria-label="Bulk sections JSON"
                  />

                  <div className="proposal-bulk__footer">
                    <div className="proposal-bulk__meta">
                      {bulk_json?.trim()
                        ? `${bulk_json.length} characters`
                        : "No content pasted"}
                    </div>

                    <div className="proposal-bulk__actions">
                      <button
                        type="button"
                        className="proposal-bulk__ghost"
                        onClick={() => set_bulk_json("")}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        className="proposal-bulk__submit"
                        onClick={() => add_bulk_sections()}
                      >
                        <Plus size={16} />
                        {!saving_bulk ? "Send Sections" : "Sending..."}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <button
        ref={fabRef}
        className="proposal-ai-fab"
        type="button"
        onMouseDown={handleFabMouseDown}
        onTouchStart={handleFabTouchStart}
        onClick={handleFabClick}
        style={
          fabPosition
            ? {
                left: fabPosition.x,
                top: fabPosition.y,
                right: "auto",
                bottom: "auto",
              }
            : undefined
        }
        aria-label="Ask TriMerge IQ"
      >
        <Sparkles size={22} />
      </button>
      <div
        className={`proposal-scrim ${drawerOpen ? "is-open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`proposal-ai ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <div className="proposal-ai__head">
          <div className="proposal-ai__brand">
            <span className="proposal-ai__brand-icon">
              <Sparkles size={22} />
            </span>
            <div>
              <h3>TriMerge IQ</h3>
              <p>AI assistant for your proposal</p>
            </div>
          </div>
          <button
            className="proposal-ai__close"
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close TriMerge IQ"
          >
            <X size={24} />
          </button>
          <button type="button" onClick={() => setDrawerOpen(false)}>
            ×
          </button>
        </div>
        <div className="proposal-ai__body">
          <section className="proposal-ai__section">
            <h4>Quick actions</h4>
            <button
              className="proposal-ai__action"
              type="button"
              onClick={saveDraft}
            >
              <span className="proposal-ai__action-icon">
                <FileText size={20} />
              </span>
              <span>
                <strong>Save as draft</strong>
                <small>Save your current proposal as a draft.</small>
              </span>
              <ChevronRight size={20} />
            </button>
            <button className="proposal-ai__action" type="button">
              <span className="proposal-ai__action-icon">
                <Sparkles size={20} />
              </span>
              <span>
                <strong>Generate executive summary</strong>
                <small>Create a concise summary of this proposal.</small>
              </span>
              <ChevronRight size={20} />
            </button>
            <button className="proposal-ai__action" type="button">
              <span className="proposal-ai__action-icon">
                <PenLine size={20} />
              </span>
              <span>
                <strong>Improve grammar and tone</strong>
                <small>
                  Refine your writing for clarity, grammar, and tone.
                </small>
              </span>
              <ChevronRight size={20} />
            </button>
            <button className="proposal-ai__action" type="button">
              <span className="proposal-ai__action-icon">
                <Search size={20} />
              </span>
              <span>
                <strong>Find similar proposals</strong>
                <small>Discover similar proposals to get inspired.</small>
              </span>
              <ChevronRight size={20} />
            </button>
          </section>

          <section className="proposal-ai__ask">
            <h4>Ask TriMerge IQ</h4>
            <p>Get answers, suggestions, or help improving your proposal.</p>
          </section>

          <label className="proposal-ai__input">
            <textarea placeholder="Ask IQ about this proposal..." rows={3} />
            <button type="button">
              <Send size={14} />
            </button>
          </label>
          <p className="proposal-ai__privacy">
            <ShieldCheck size={16} />
            Your data is secure and private.
          </p>
          <button type="button" onClick={saveDraft}>
            Save as draft
          </button>
          <button type="button">Generate executive summary</button>
          <button type="button">Improve grammar and tone</button>
          <button type="button">Find similar proposals</button>
          <label className="proposal-ai__input">
            <input placeholder="Ask IQ about this proposal..." />
            <button type="button">
              <Send size={14} />
            </button>
          </label>
        </div>
      </aside>
    </div>
  );
}
