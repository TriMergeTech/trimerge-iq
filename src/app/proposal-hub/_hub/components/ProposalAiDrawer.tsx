import type {
  MouseEvent as ReactMouseEvent,
  RefObject,
  TouchEvent as ReactTouchEvent,
} from "react";
import {
  ChevronRight,
  FileText,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

interface ProposalAiDrawerProps {
  drawerOpen: boolean;
  fabPosition: { x: number; y: number } | null;
  fabRef: RefObject<HTMLButtonElement>;
  onClose: () => void;
  onFabClick: () => void;
  onFabMouseDown: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onFabTouchStart: (event: ReactTouchEvent<HTMLButtonElement>) => void;
  onSaveDraft: () => void;
}

export default function ProposalAiDrawer({
  drawerOpen,
  fabPosition,
  fabRef,
  onClose,
  onFabClick,
  onFabMouseDown,
  onFabTouchStart,
  onSaveDraft,
}: ProposalAiDrawerProps) {
  return (
    <>
      <button
        ref={fabRef}
        className="proposal-ai-fab"
        type="button"
        onMouseDown={onFabMouseDown}
        onTouchStart={onFabTouchStart}
        onClick={onFabClick}
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
      <div className={`proposal-scrim ${drawerOpen ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`proposal-ai ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen}>
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
          <button className="proposal-ai__close" type="button" onClick={onClose} aria-label="Close TriMerge IQ">
            <X size={24} />
          </button>
          <button type="button" onClick={onClose}>
            x
          </button>
        </div>
        <div className="proposal-ai__body">
          <section className="proposal-ai__section">
            <h4>Quick actions</h4>
            <button className="proposal-ai__action" type="button" onClick={onSaveDraft}>
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
                <small>Refine your writing for clarity, grammar, and tone.</small>
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
          <button type="button" onClick={onSaveDraft}>
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
    </>
  );
}
