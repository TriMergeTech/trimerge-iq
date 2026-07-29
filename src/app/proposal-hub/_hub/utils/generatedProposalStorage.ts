import type { Proposal } from "../types";

const GENERATED_PROPOSALS_STORAGE_KEY = "trimerge_generated_proposals";

function getProposalId(proposal: Proposal) {
  return proposal._id ?? proposal.id ?? "";
}

export function getProposalHubUrl(proposal: Proposal) {
  const proposalId = getProposalId(proposal);
  return proposalId ? `/proposal-hub?proposal=${encodeURIComponent(proposalId)}&from=chat` : "/proposal-hub?from=chat";
}

export function readStoredGeneratedProposals() {
  if (typeof window === "undefined") return [] as Proposal[];

  const rawValue = localStorage.getItem(GENERATED_PROPOSALS_STORAGE_KEY);
  if (!rawValue) return [] as Proposal[];

  try {
    const proposals = JSON.parse(rawValue);
    return Array.isArray(proposals) ? (proposals as Proposal[]) : [];
  } catch {
    return [] as Proposal[];
  }
}

export function readStoredGeneratedProposal(proposalId: string) {
  return readStoredGeneratedProposals().find((proposal) => getProposalId(proposal) === proposalId) ?? null;
}

export function rememberGeneratedProposal(proposal: Proposal) {
  if (typeof window === "undefined") return;

  const proposalId = getProposalId(proposal);
  if (!proposalId) return;

  const existingProposals = readStoredGeneratedProposals();
  const nextProposals = [
    proposal,
    ...existingProposals.filter((storedProposal) => getProposalId(storedProposal) !== proposalId),
  ].slice(0, 25);

  localStorage.setItem(GENERATED_PROPOSALS_STORAGE_KEY, JSON.stringify(nextProposals));
}
