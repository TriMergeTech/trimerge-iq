import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Plus, FileText, Search, Download, Edit, Trash2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ProposalForm from "./components/ProposalForm";
import ProposalWorkspace from "./components/ProposalWorkspace";
import ToolGenerator from "./components/ToolGenerator";
import { post_request } from "./utils/services";

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  createdAt: Date;
}

export default function App() {
  const [proposals, setProposals] = useState<Proposal[]>(null);

  let [page, set_page] = useState(1);
  const [view, setView] = useState<string>("list");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const handleCreateProposal = (data: {
    title: string;
    description: string;
    category: string;
    budget: string;
    timeline: string;
  }) => {
    const newProposal: Proposal = {
      id: Date.now().toString(),
      ...data,
      status: "draft",
      createdAt: new Date(),
    };
    setProposals([newProposal, ...proposals]);
    setView("list");
  };

  useEffect(() => {
    let get_proposals = async (curr_page = page) => {
      let proposals = await post_request("get_proposals", { page: curr_page });

      if (proposals.ok) {
        setProposals(proposals.data);
      }
    };

    get_proposals();
  }, []);

  const handleViewProposal = (_id: string) => {
    const proposal = proposals.find((p) => p._id === _id);
    if (proposal) {
      setSelectedProposal(proposal);
      setView("detail");
    }
  };

  const handleDeleteProposal = async (_id: string) => {
    setProposals((prev) => prev.filter((p) => p._id !== _id));

    await post_request("delete_proposal", {
      proposal: _id,
    });
  };

  const handleEditProposal = (_id: string) => {
    const proposal = proposals.find((p) => p._id === _id);
    if (proposal) {
      setSelectedProposal(proposal);
      setView("edit");
    }
  };

  const handleNavigate = (newView: string) => {
    setView(newView === "all" ? "list" : newView);
    setSelectedProposal(null);
  };

  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const apiBaseUrl = isLocalDev ? "/api" : "https://trimerge-iq.onrender.com";
  const toolEndpoint = `${apiBaseUrl}/tools/6a0f6fb93995d6cbe80d82e9`;

  const draftProposals = null;
  const filteredProposals = proposals;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365)
      return `about ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
  };

  const on_delete_section = (proposal) => {
    setProposals((prev) => {
      return prev.map((p) => {
        if (p._id === proposal) {
          p.sections -= 1;
        }

        return p;
      });
    });
  };

  const emptyProposal: Proposal = {
    id: "new-proposal",
    title: "",
    description: "",
    category: "",
    budget: "",
    timeline: "",
    status: "draft",
    createdAt: new Date(),
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#070c2b" }}>
      <Sidebar
        activeView={view}
        onNavigate={handleNavigate}
        // draftCount={draftProposals?.length}
      />

      <Box
        sx={{
          flex: 1,
          ml: "240px",
          p: 4,
          bgcolor: "#070c2b",
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(124,92,255,0.18), transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(43,197,255,0.08), transparent 60%), #070c2b",
          minHeight: "100vh",
        }}
      >
        {(view === "list" || view === "drafts") && (
          <>
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "stretch" }}>
              <TextField
                fullWidth
                placeholder={
                  view === "drafts"
                    ? "Search drafts by name or category"
                    : "Search proposals by name or category"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#5b6079" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                    borderRadius: "14px",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(142,151,255,0.24)",
                    color: "#e6e9f5",
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 36px rgba(0,0,0,0.18)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "15px",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.22)",
                      border: "1px solid rgba(150,160,255,0.38)",
                    },
                    "&.Mui-focused": {
                      borderColor: "#7c5cff",
                      border: "1px solid #7c5cff",
                      boxShadow:
                        "0 0 0 4px rgba(124,92,255,0.16), 0 18px 48px rgba(46,43,255,0.18)",
                    },
                    "& input": {
                      color: "#e6e9f5",
                    },
                    "& input::placeholder": {
                      color: "#8b92b8",
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={() => setView("create")}
                sx={{
                  bgcolor: "#2e2bff",
                  color: "#fff",
                  backgroundImage:
                    "linear-gradient(135deg, #5c55ff 0%, #2e2bff 58%, #725cff 100%)",
                  textTransform: "none",
                  px: 3,
                  height: "56px",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  borderRadius: "14px",
                  boxShadow:
                    "0 18px 44px rgba(46,43,255,0.34), inset 0 1px 0 rgba(255,255,255,0.22)",
                  whiteSpace: "nowrap",
                  minWidth: "auto",
                  "&:hover": {
                    bgcolor: "#2120e0",
                    boxShadow:
                      "0 22px 54px rgba(46,43,255,0.46), inset 0 1px 0 rgba(255,255,255,0.26)",
                  },
                }}
              >
                Create
              </Button>
            </Box>

            {filteredProposals?.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  border: "1px solid rgba(142,151,255,0.22)",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.032))",
                  boxShadow:
                    "0 24px 70px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <FileText size={64} color="#9CA3AF" />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#e6e9f5",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  {!proposals
                    ? null
                    : view === "drafts"
                      ? draftProposals?.length === 0
                        ? "No drafts yet"
                        : "No drafts match your search"
                      : proposals.length === 0
                        ? "No proposals yet"
                        : "No proposals match your search"}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => setView("create")}
                  sx={{
                    bgcolor: "#2e2bff",
                    color: "#fff",
                    backgroundImage:
                      "linear-gradient(135deg, #5c55ff 0%, #2e2bff 58%, #725cff 100%)",
                    "&:hover": {
                      bgcolor: "#2120e0",
                      boxShadow:
                        "0 22px 54px rgba(46,43,255,0.46), inset 0 1px 0 rgba(255,255,255,0.26)",
                    },
                    textTransform: "none",
                    px: 4,
                    py: 1.8,
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                    borderRadius: "14px",
                    boxShadow:
                      "0 18px 44px rgba(46,43,255,0.34), inset 0 1px 0 rgba(255,255,255,0.22)",
                  }}
                >
                  {view === "drafts"
                    ? "Create New Draft"
                    : "Create Your First Proposal"}
                </Button>
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid rgba(142,151,255,0.22)",
                  bgcolor: "rgba(255,255,255,0.05)",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03))",
                  backdropFilter: "blur(8px)",
                  boxShadow:
                    "0 26px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  "&:before": {
                    content: '""',
                    display: "block",
                    height: "1px",
                    width: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(124,92,255,0.62), rgba(43,197,255,0.38), transparent)",
                  },
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#8b92b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(142,151,255,0.16)",
                          py: 2,
                        }}
                      >
                        NAME
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#8b92b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(142,151,255,0.16)",
                          py: 2,
                        }}
                      >
                        Sections
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#8b92b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(142,151,255,0.16)",
                          py: 2,
                        }}
                      >
                        LAST EDITED
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "1px solid rgba(142,151,255,0.16)",
                          py: 2,
                        }}
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProposals ? (
                      filteredProposals?.map((proposal) => {
                        proposal = {
                          ...proposal,
                          title: proposal.opportunity_title,
                        };
                        return (
                          <TableRow
                            key={proposal._id}
                            sx={{
                              "&:hover": {
                                bgcolor: "rgba(124,92,255,0.08)",
                                boxShadow: "inset 3px 0 0 rgba(124,92,255,0.9)",
                              },
                              "&:last-child td": {
                                borderBottom: "none",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                borderBottom:
                                  "1px solid rgba(142,151,255,0.12)",
                                py: 2.5,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily:
                                    "'Bricolage Grotesque', sans-serif",
                                  fontSize: "15px",
                                  fontWeight: 500,
                                  color: "#9ea2ff",
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "#c7cbff",
                                    textShadow:
                                      "0 0 18px rgba(124,92,255,0.38)",
                                  },
                                }}
                                onClick={() => handleViewProposal(proposal._id)}
                              >
                                {proposal.title}
                                {/* {proposal.status === "draft" &&
                              view !== "drafts" && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1.25,
                                    px: 1,
                                    py: 0.35,
                                    borderRadius: "999px",
                                    bgcolor: "rgba(124,92,255,0.16)",
                                    color: "#c7cbff",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  Draft
                                </Box>
                              )} */}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "14px",
                                color: "#a7adc8",
                                borderBottom:
                                  "1px solid rgba(142,151,255,0.12)",
                                py: 2.5,
                              }}
                            >
                              {proposal.sections || 0}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "14px",
                                color: "#a7adc8",
                                borderBottom:
                                  "1px solid rgba(142,151,255,0.12)",
                                py: 2.5,
                              }}
                            >
                              {formatDate(new Date(proposal.created))}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                borderBottom:
                                  "1px solid rgba(142,151,255,0.12)",
                                py: 2.5,
                                width: "140px",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                }}
                              >
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#9ca3af",
                                    borderRadius: "8px",
                                    width: 36,
                                    height: 36,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      color: "#ef4444",
                                      bgcolor: "rgba(239, 68, 68, 0.12)",
                                      boxShadow:
                                        "0 0 0 1px rgba(239,68,68,0.22), 0 12px 28px rgba(239,68,68,0.18)",
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                  onClick={() => setDeleteTarget(proposal)}
                                >
                                  <Trash2 size={18} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#9ca3af",
                                    borderRadius: "8px",
                                    width: 36,
                                    height: 36,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      color: "#9ea2ff",
                                      bgcolor: "rgba(46, 43, 255, 0.14)",
                                      boxShadow:
                                        "0 0 0 1px rgba(124,92,255,0.24), 0 12px 28px rgba(46,43,255,0.18)",
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                >
                                  <Download size={18} />
                                </IconButton>
                                {/* <IconButton
                                size="small"
                                sx={{
                                  color: "#9ca3af",
                                  borderRadius: "8px",
                                  width: 36,
                                  height: 36,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    color: "#7adfff",
                                    bgcolor: "rgba(43, 197, 255, 0.12)",
                                    boxShadow:
                                      "0 0 0 1px rgba(43,197,255,0.24), 0 12px 28px rgba(43,197,255,0.14)",
                                    transform: "scale(1.05)",
                                  },
                                }}
                                onClick={() => handleEditProposal(proposal._id)}
                              >
                                <Edit size={18} />
                              </IconButton> */}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ borderBottom: "none", py: 8 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: "50%",
                                border: "5px solid rgba(255,255,255,0.18)",
                                borderTopColor: "rgba(255,255,255,0.95)",
                                boxShadow: "0 6px 18px rgba(124,92,255,0.12)",
                                animation: "spin 900ms linear infinite",
                                "@keyframes spin": {
                                  "0%": { transform: "rotate(0deg)" },
                                  "100%": { transform: "rotate(360deg)" },
                                },
                              }}
                            />
                            <Typography
                              sx={{
                                color: "#F1F5FF",
                                fontWeight: 700,
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              Loading proposals...
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#C7D2FE", fontSize: 13, mt: 0.5 }}
                            >
                              Fetching the latest items — please wait.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {view === "create" && (
          <ProposalWorkspace
            key="new-proposal-workspace"
            proposal={null}
            isNew
            onBack={() => setView("list")}
            onDeleteSection={on_delete_section}
            onSave={(proposalDraft) => {
              const newProposal: Proposal = {
                ...proposalDraft,
              };
              setProposals((prev) => {
                let exists = prev.find((pr) => pr._id === newProposal._id);
                if (exists)
                  return prev.map((p) =>
                    p._id === newProposal._id ? newProposal : p,
                  );
                return [newProposal, ...prev];
              });
              setSelectedProposal(newProposal);
              setView("detail");
            }}
          />
        )}

        {view === "generate" && (
          <ToolGenerator
            endpoint={toolEndpoint}
            on_generated={(proposal) => {
              setProposals((current) => [proposal, ...current]);
            }}
            on_view_proposal={(proposal) => {
              setView("detail");
              setSelectedProposal(proposal);
            }}
            onBack={() => setView("list")}
          />
        )}

        {view === "edit" && selectedProposal && (
          <Box
            sx={{
              maxWidth: "960px",
              mx: "auto",
              pt: 2,
              pb: 6,
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(112, 94, 255, 0.22), transparent 18%), radial-gradient(circle at 80% 10%, rgba(91, 92, 246, 0.16), transparent 15%), radial-gradient(circle at 60% 90%, rgba(71, 73, 182, 0.16), transparent 18%)",
              }}
            />
            <Box
              sx={{ position: "relative", zIndex: 1, mb: 4, maxWidth: "720px" }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "#9CA3AF",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  mb: 1,
                  fontSize: "12px",
                }}
              >
                Management
              </Typography>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "-0.6px",
                  fontSize: { xs: "2.9rem", md: "3.65rem" },
                  lineHeight: 1.02,
                  maxWidth: "720px",
                  background:
                    "linear-gradient(90deg, #F8FBFF 0%, #A2B5FF 45%, #C084FC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Edit Proposal
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#B8C2FF",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  maxWidth: "680px",
                }}
              >
                Update the proposal information
              </Typography>
            </Box>
            <ProposalForm
              initialData={selectedProposal}
              onSubmit={(data) => {
                setProposals(
                  proposals.map((p) =>
                    p.id === selectedProposal.id
                      ? { ...p, ...data, createdAt: new Date() }
                      : p,
                  ),
                );
                setView("list");
              }}
              onCancel={() => setView("list")}
            />
          </Box>
        )}

        {view === "detail" && selectedProposal && (
          <ProposalWorkspace
            proposal={selectedProposal}
            onBack={() =>
              setView(selectedProposal.status === "draft" ? "drafts" : "list")
            }
            onDeleteSection={on_delete_section}
            onSave={(updatedProposal) => {
              setProposals((current) =>
                current.map((proposal) =>
                  proposal._id === updatedProposal._id
                    ? updatedProposal
                    : proposal,
                ),
              );
              setSelectedProposal(updatedProposal);
            }}
          />
        )}

        {view === "analytics" && (
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#e6e9f5",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              Analytics
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#8b92b8",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Analytics dashboard coming soon...
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{
          sx: {
            bgcolor: "#101633",
            color: "#fff",
            borderRadius: "18px",
            border: "1px solid rgba(142,151,255,0.2)",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            minWidth: "420px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 700,
            color: "#F8FAFF",
          }}
        >
          Delete Proposal?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              color: "#B8C2FF",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.title}</strong>?
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{
              color: "#C7D2FE",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await handleDeleteProposal(deleteTarget._id);
              setDeleteTarget(null);
            }}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              px: 3,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
