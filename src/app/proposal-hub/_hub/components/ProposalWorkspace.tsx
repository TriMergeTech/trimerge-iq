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
import ProposalAiDrawer from "./ProposalAiDrawer";
import ProposalExportDropdown from "./ProposalExportDropdown";
import ProposalSectionsPanel from "./ProposalSectionsPanel";
import {
  ArrowLeft,
  Save,
  Share2,
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

            <ProposalSectionsPanel
              addingSection={adding_section}
              addBulkSections={add_bulk_sections}
              addSection={addSection}
              bulkJson={bulk_json}
              createEditorLink={createEditorLink}
              deleteSection={deleteSection}
              dirtySectionsRef={dirtySectionsRef}
              editorRefs={editorRefs}
              insertEditorTable={insertEditorTable}
              moveSection={moveSection}
              runEditorCommand={runEditorCommand}
              saveEditorSelection={saveEditorSelection}
              savingBulk={saving_bulk}
              sections={sections}
              setBulkJson={set_bulk_json}
              setDrawerOpen={setDrawerOpen}
              setSections={setSections}
              showBulkSections={show_bulk_sections}
              syncingDirty={syncing_dirty}
              toggleBulkSections={toggle_bulk_sections}
            />
          </section>
        </div>
      </main>

      <ProposalAiDrawer
        drawerOpen={drawerOpen}
        fabPosition={fabPosition}
        fabRef={fabRef}
        onClose={() => setDrawerOpen(false)}
        onFabClick={handleFabClick}
        onFabMouseDown={handleFabMouseDown}
        onFabTouchStart={handleFabTouchStart}
        onSaveDraft={saveDraft}
      />
    </div>
  );
}
