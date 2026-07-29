import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Eraser,
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
  Search,
  Sparkles,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
} from "lucide-react";

import type { Section } from "../types";

interface ProposalSectionsPanelProps {
  addingSection: boolean;
  addBulkSections: () => void;
  addSection: () => void;
  bulkJson: string;
  createEditorLink: (sectionId: string) => void;
  deleteSection: (id: string) => void;
  dirtySectionsRef: MutableRefObject<Record<string, boolean>>;
  editorRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  insertEditorTable: (sectionId: string) => void;
  moveSection: (id: string) => void;
  runEditorCommand: (sectionId: string, command: string, value?: string) => void;
  saveEditorSelection: (sectionId: string) => void;
  savingBulk: boolean;
  sections: Section[] | null;
  setBulkJson: Dispatch<SetStateAction<string>>;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setSections: Dispatch<SetStateAction<Section[] | null>>;
  showBulkSections: boolean;
  syncingDirty: boolean;
  toggleBulkSections: Dispatch<SetStateAction<boolean>>;
}

export default function ProposalSectionsPanel({
  addingSection,
  addBulkSections,
  addSection,
  bulkJson,
  createEditorLink,
  deleteSection,
  dirtySectionsRef,
  editorRefs,
  insertEditorTable,
  moveSection,
  runEditorCommand,
  saveEditorSelection,
  savingBulk,
  sections,
  setBulkJson,
  setDrawerOpen,
  setSections,
  showBulkSections,
  syncingDirty,
  toggleBulkSections,
}: ProposalSectionsPanelProps) {
  return (
    <>
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
                <button type="button" title="Ask AI" onClick={() => setDrawerOpen(true)}>
                  <Sparkles size={15} />
                </button>
                <button type="button" title="Move" onClick={() => moveSection(section._id)}>
                  <GripVertical size={15} />
                </button>
                <button type="button" title="Delete" onClick={() => deleteSection(section._id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="proposal-section__status">
              {(() => {
                const unsaved = Object.keys(dirtySectionsRef.current || {});
                const isDirty = unsaved.includes(section._id);
                return (
                  <>
                    <span className={isDirty ? "" : "is-done"} />
                    {isDirty
                      ? syncingDirty
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
                onChange={(event) => runEditorCommand(section._id, "formatBlock", event.target.value)}
              >
                <option value="p">Paragraph</option>
                <option value="h2">Heading 1</option>
                <option value="h3">Heading 2</option>
              </select>
              <span className="proposal-toolbar__divider" />
              <button type="button" title="Bold" onClick={() => runEditorCommand(section._id, "bold")}>
                <Bold size={14} />
              </button>
              <button type="button" title="Italic" onClick={() => runEditorCommand(section._id, "italic")}>
                <Italic size={14} />
              </button>
              <button type="button" title="Underline" onClick={() => runEditorCommand(section._id, "underline")}>
                <Underline size={14} />
              </button>
              <button type="button" title="Strikethrough" onClick={() => runEditorCommand(section._id, "strikeThrough")}>
                <Strikethrough size={14} />
              </button>
              <span className="proposal-toolbar__divider" />
              <button type="button" title="Bullet list" onClick={() => runEditorCommand(section._id, "insertUnorderedList")}>
                <List size={14} />
              </button>
              <button type="button" title="Numbered list" onClick={() => runEditorCommand(section._id, "insertOrderedList")}>
                <ListOrdered size={14} />
              </button>
              <button type="button" title="Decrease indent" onClick={() => runEditorCommand(section._id, "outdent")}>
                <IndentDecrease size={14} />
              </button>
              <button type="button" title="Increase indent" onClick={() => runEditorCommand(section._id, "indent")}>
                <IndentIncrease size={14} />
              </button>
              <span className="proposal-toolbar__divider" />
              <button type="button" title="Align left" onClick={() => runEditorCommand(section._id, "justifyLeft")}>
                <AlignLeft size={14} />
              </button>
              <button type="button" title="Align center" onClick={() => runEditorCommand(section._id, "justifyCenter")}>
                <AlignCenter size={14} />
              </button>
              <button type="button" title="Align right" onClick={() => runEditorCommand(section._id, "justifyRight")}>
                <AlignRight size={14} />
              </button>
              <span className="proposal-toolbar__divider" />
              <button type="button" title="Quote" onClick={() => runEditorCommand(section._id, "formatBlock", "blockquote")}>
                <Quote size={14} />
              </button>
              <button type="button" title="Link" onClick={() => createEditorLink(section._id)}>
                <Link size={14} />
              </button>
              <button type="button" title="Insert table" onClick={() => insertEditorTable(section._id)}>
                <Table2 size={14} />
              </button>
              <button
                type="button"
                title="Mark complete"
                onClick={() => runEditorCommand(section._id, "insertHTML", "<strong>Done:</strong> ")}
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
                    item._id === section._id ? { ...item, body: nextBody } : item,
                  ),
                );

                dirtySectionsRef.current[section._id] = true;
              }}
            />
          </article>
        ))
      ) : (
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
      )}

      <button className="proposal-doc__add" type="button" onClick={addSection}>
        <Plus size={18} />
        {addingSection ? "Adding section..." : "Add Section"}
      </button>

      <div className={`proposal-bulk ${showBulkSections ? "is-open" : ""}`}>
        <button
          className="proposal-doc__add proposal-doc__import"
          type="button"
          onClick={() => toggleBulkSections(!showBulkSections)}
        >
          <FileText size={18} />
          <span>{showBulkSections ? "Close Bulk Import" : "Import Multiple Sections"}</span>
        </button>

        {showBulkSections && (
          <div className="proposal-bulk__panel">
            <div className="proposal-bulk__head">
              <div>
                <h3>Bulk Section Import</h3>
                <p>Paste a JSON array of proposal sections to instantly generate multiple sections at once.</p>
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

            <label htmlFor="bulk-json-input" className="proposal-bulk__label">
              Section JSON
            </label>

            <textarea
              id="bulk-json-input"
              className="proposal-bulk__textarea"
              value={bulkJson}
              onChange={(event) => setBulkJson(event.target.value)}
              placeholder="Paste proposal sections JSON here..."
              rows={12}
              spellCheck={false}
              aria-label="Bulk sections JSON"
            />

            <div className="proposal-bulk__footer">
              <div className="proposal-bulk__meta">
                {bulkJson?.trim() ? `${bulkJson.length} characters` : "No content pasted"}
              </div>

              <div className="proposal-bulk__actions">
                <button type="button" className="proposal-bulk__ghost" onClick={() => setBulkJson("")}>
                  Clear
                </button>

                <button type="button" className="proposal-bulk__submit" onClick={() => addBulkSections()}>
                  <Plus size={16} />
                  {!savingBulk ? "Send Sections" : "Sending..."}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
