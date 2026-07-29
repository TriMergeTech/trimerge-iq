import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Send, Sparkles } from "lucide-react";
import { BACKEND, TRIMERGE_BACKEND } from "../utils/services";

interface ToolArgument {
  name?: string;
  label?: string;
  type?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
  default?: string | number | boolean;
}

interface ToolDefinition {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  arguments?: ToolArgument[] | Record<string, ToolArgument>;
}

interface ToolGeneratorProps {
  endpoint: string;
  onBack?: () => void;
  on_generated?: (proposal: any) => void;
  on_view_proposal?: (proposal: any) => void;
}

const proposalCreationToolFallback: ToolDefinition = {
  _id: "6a0f6fb93995d6cbe80d82e9",
  name: "Proposal Creation",
  description:
    "Creates professional business proposals using client requirements, project goals, pricing, staffing, timelines, and organizational data to generate structured, accurate, and submission-ready proposals.",
  arguments: {
    proposal_id: {
      type: "string",
      description: "Unique proposal identifier",
    },
    client_name: {
      type: "string",
      description: "Client requesting proposal",
    },
    proposal_budget: {
      type: "string",
      description: "Total proposed cost",
    },
    requested_timeline: {
      type: "string",
      description: "Requested completion timeline",
    },
    current_staff_capacity: {
      type: "string",
      description: "Current organizational workload percentage",
    },
    services: {
      type: "string",
      description: "Services being proposed",
    },
    project_scope: {
      type: "string",
      description: "Defined scope of work",
    },
  },
};

const getToolArguments = (
  toolDefinition: ToolDefinition | null,
): ToolArgument[] => {
  if (!toolDefinition?.arguments) return [];
  if (Array.isArray(toolDefinition.arguments)) return toolDefinition.arguments;
  return Object.entries(toolDefinition.arguments).map(([name, argument]) => ({
    ...argument,
    name,
  }));
};

const canUseProposalCreationFallback = (endpoint: string) =>
  endpoint.includes("/tools/6a0f6fb93995d6cbe80d82e9");

const fieldCopy: Record<
  string,
  { label: string; description: string; placeholder: string }
> = {
  proposal_id: {
    label: "Proposal ID",
    description: "Internal tracking ID for this proposal.",
    placeholder: "e.g. PROP-2026-001",
  },
  client_name: {
    label: "Client Name",
    description: "Client or organization requesting the proposal.",
    placeholder: "e.g. Jorge Alvarez",
  },
  proposal_budget: {
    label: "Proposed Budget",
    description: "Estimated budget or proposed project cost.",
    placeholder: "e.g. 5000",
  },
  requested_timeline: {
    label: "Requested Timeline",
    description: "Target delivery window or completion timeframe.",
    placeholder: "e.g. 3 months",
  },
  current_staff_capacity: {
    label: "Staff Capacity",
    description: "Current team workload or available capacity percentage.",
    placeholder: "e.g. 75%",
  },
  services: {
    label: "Services Requested",
    description: "Services that should be included in the proposal.",
    placeholder: "e.g. Technology consulting",
  },
  project_scope: {
    label: "Project Scope",
    description: "Brief description of the work to be delivered.",
    placeholder: "Summarize the project scope",
  },
};

const getDisplayName = (toolDefinition: ToolDefinition | null) => {
  if (toolDefinition?.name === "Proposal Creation") return "Generate Proposal";
  return toolDefinition?.name ?? "Tool Form";
};

const getFieldLabel = (argument: ToolArgument) =>
  argument.label ||
  fieldCopy[argument.name ?? ""]?.label ||
  (argument.name ?? "").replace(/_/g, " ");

const getFieldDescription = (argument: ToolArgument) =>
  fieldCopy[argument.name ?? ""]?.description || argument.description;

const getFieldPlaceholder = (argument: ToolArgument, label: string) =>
  argument.placeholder ||
  fieldCopy[argument.name ?? ""]?.placeholder ||
  `Enter ${label}`;

export default function ToolGenerator({
  endpoint,
  on_generated,
  on_view_proposal,
  onBack,
}: ToolGeneratorProps) {
  const [tool, setTool] = useState<ToolDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});

  const [jobState, setJobState] = useState<any>(null);
  const [callbackId, setCallbackId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "running" | "done" | "failed">(
    "form",
  );

  const [generated_proposal, set_generated_proposal] = useState<any>(null);

  useEffect(() => {
    if (!callbackId || !phase) return;

    let alive = true;
    let interval: any;

    const fetchState = async () => {
      try {
        const res = await fetch(`${BACKEND}/get_callback_status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: callbackId,
          }),
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!alive) return;

        if (data?.ok) {
          setJobState(data.data);
          setPhase("running");
          setCallbackId(callbackId);
          // setTracking(true);

          // stop polling when complete or failed
          if (data.data.status === "completed") {
            setPhase("done");
            // setTracking(false);
            on_generated?.(data.data.proposal);
            set_generated_proposal(data.data.proposal);
            clearInterval(interval);
          }

          if (data.data.status === "failed") {
            setPhase("failed");
            // setTracking(false);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("callback polling error", err);
      }
    };

    // immediate first fetch
    fetchState();

    interval = setInterval(fetchState, 2000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [callbackId, phase]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setTool(null);

    fetch(`${TRIMERGE_BACKEND}/get_tool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "9a4e0485-4796-4cc8-9567-be1be91640f6",
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Tool fetch failed: ${res.status} ${res.statusText} ${text}`,
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (!data.ok) {
          throw new Error(data.message);
        }
        setTool(data.data);
      })
      .catch((fetchError) => {
        if (!active) return;
        if (canUseProposalCreationFallback(endpoint)) {
          setTool(proposalCreationToolFallback);
          setError(null);
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to fetch tool.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint]);

  const argumentList = useMemo(() => getToolArguments(tool), [tool]);

  const handleChange = (name: string, rawValue: string) => {
    setValues((current) => ({ ...current, [name]: rawValue }));
  };

  const preventSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  let [starting_generation, set_starting_generation] = useState(false);

  const start_generation = async () => {
    if (starting_generation) return;
    try {
      set_starting_generation(true);
      const payload = {
        proposal_metadata: {
          ...values,
        },
        org_context: {
          company_name: "TriMerge Consulting Group, P.A.",
          certifications: ["8(a)", "WOSB", "EDWOSB", "CPA Firm"],
          experience_years: 22,
          skills: [
            "federal program management",
            "financial compliance",
            "healthcare claims analysis",
            "coding validation oversight",
            "risk and audit remediation",
          ],
          teaming_partners: [
            "Anchor Group NA Corp",
            "Certified Coding Partner (CPC/CCS/RHIA)",
          ],
        },
      };

      const res = await fetch(`${BACKEND}/generate_proposal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to start generation");
      }

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message || "Generation failed to start");
      }

      const callbackId = data.data.callbackId;

      setCallbackId(callbackId);
      setPhase("running");
      // 🔥 Store for tracking (you can replace with Redux/Zustand/etc)
      sessionStorage.setItem("proposal_callback_id", callbackId);

      console.log("Generation started:", callbackId);

      return callbackId;
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Something went wrong starting generation");
      return null;
    } finally {
      set_starting_generation(false);
    }
  };

  let [exporting, set_exporting] = useState<string | boolean>(false);

  const export_to_doc = async (type: string) => {
    if (exporting) return;

    try {
      set_exporting(type);
      const response = await fetch(`${BACKEND}/export_to_document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposal: generated_proposal?._id,
          export_type: type,
        }),
      });

      const res = await response.json();

      if (res.ok) {
        // Prefer an explicit download URL if provided
        const downloadUrl = res.data?.url;

        if (downloadUrl && typeof downloadUrl === "string") {
          // open in new tab/window
          window.open(downloadUrl, "_blank", "noopener,noreferrer");
          return;
        }
      } else throw new Error(res.message);
    } catch (e) {
    } finally {
      set_exporting(false);
    }
  };

  const [extracting_rfp, setExtractingRfp] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleRfpUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setExtractingRfp(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BACKEND}/proposal_extract_rfp`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.ok) {
        setValues((prev) => ({
          ...prev,
          ...result.data,
        }));
      }
    } finally {
      setExtractingRfp(false);

      // 🔥 HERE is where it goes
      setFileInputKey((k) => k + 1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", gap: 3, maxWidth: 900, mx: "auto" }}>
        <Typography variant="h4" sx={{ color: "#f6f7ff", fontWeight: 800 }}>
          Loading proposal intake
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "rgba(18,22,52,0.7)",
            borderRadius: "20px",
          }}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2, color: "#9da4c3" }}>
            Preparing the intake form...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "grid", gap: 3, maxWidth: 900, mx: "auto" }}>
        <Button
          variant="text"
          onClick={onBack}
          sx={{
            color: "#9da4c3",
            alignSelf: "flex-start",
            textTransform: "none",
          }}
        >
          &lt;- Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 3, maxWidth: 980, mx: "auto" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="text"
          onClick={onBack}
          sx={{
            color: "#9da4c3",
            alignSelf: "flex-start",
            textTransform: "none",
          }}
        >
          &lt;- Back
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              display: "grid",
              placeItems: "center",
              borderRadius: "16px",
              bgcolor: "rgba(124, 92, 255, 0.12)",
              color: "#b9b7ff",
            }}
          >
            <Sparkles size={26} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: "#f6f7ff", fontWeight: 800 }}>
              {getDisplayName(tool)}
            </Typography>
            {tool?.description && (
              <Typography sx={{ color: "#9da4c3", maxWidth: 720 }}>
                {tool.description}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {argumentList.length === 0 ? (
        <Alert severity="info">
          This tool does not expose any form arguments.
        </Alert>
      ) : phase === "running" && jobState ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "20px",
            bgcolor: "rgba(18,22,52,0.72)",
            border: "1px solid rgba(124,92,255,0.18)",
          }}
        >
          <Typography
            sx={{ color: "#f6f7ff", fontWeight: 800, fontSize: "1.2rem" }}
          >
            Generating Proposal...
          </Typography>

          <Typography sx={{ color: "#9da4c3", mt: 1 }}>
            {jobState.message}
          </Typography>

          {/* progress bar */}
          <Box
            sx={{
              mt: 3,
              height: 10,
              borderRadius: "20px",
              bgcolor: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${jobState.progress || 0}%`,
                height: "100%",
                background: "linear-gradient(90deg, #5c55ff, #7c5cff, #2e2bff)",
                transition: "width 0.4s ease",
              }}
            />
          </Box>

          {/* stage */}
          <Typography sx={{ mt: 2, color: "#7f8cb9", fontSize: "0.9rem" }}>
            Stage: {jobState.stage}
          </Typography>

          {/* current section */}
          {jobState.current_section && (
            <Typography sx={{ color: "#b1b9d9", mt: 1 }}>
              Writing: {jobState.current_section}
            </Typography>
          )}

          {/* completed sections preview */}
          {jobState.generated_sections?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: "#f6f7ff", fontWeight: 700 }}>
                Sections Generated
              </Typography>

              {jobState.generated_sections.map((s: any) => (
                <Box
                  key={s._id}
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Typography sx={{ color: "#b9b7ff", fontWeight: 600 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ color: "#7f8cb9", fontSize: "0.85rem" }}>
                    {s.type}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      ) : phase === "done" && jobState ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "20px",
            bgcolor: "rgba(18,22,52,0.72)",
            border: "1px solid rgba(124,92,255,0.18)",
          }}
        >
          <Typography
            sx={{ color: "#f6f7ff", fontWeight: 800, fontSize: "1.4rem" }}
          >
            Proposal Generated Successfully!
          </Typography>

          <Typography sx={{ color: "#9da4c3", mt: 1 }}>
            {jobState.message || "Your proposal is ready."}
          </Typography>

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => on_view_proposal?.(generated_proposal)}
              sx={{ bgcolor: "#2e2bff", textTransform: "none" }}
            >
              View Proposal
            </Button>

            <Button
              variant="outlined"
              onClick={() => export_to_doc("pdf")}
              sx={{ color: "#b9b7ff", borderColor: "#7c5cff" }}
            >
              {exporting ? "Downloading..." : "Download PDF"}
            </Button>

            <Button
              variant="outlined"
              onClick={() => export_to_doc("word")}
              sx={{ color: "#b9b7ff", borderColor: "#7c5cff" }}
            >
              {exporting ? "Downloading..." : "Download Word"}
            </Button>

            <Button
              variant="text"
              onClick={() => {
                setPhase("form");
                setJobState(null);
                setCallbackId(null);
              }}
              sx={{ color: "#9da4c3" }}
            >
              Create New Proposal
            </Button>
          </Box>

          {/* Optional preview */}
          {jobState.generated_sections?.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography sx={{ color: "#f6f7ff", fontWeight: 700 }}>
                Generated Sections
              </Typography>

              {jobState.generated_sections.map((s: any) => (
                <Box
                  key={s._id}
                  sx={{
                    mt: 1,
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.04)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography sx={{ color: "#b9b7ff", fontWeight: 600 }}>
                    {s.title}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        <Paper
          elevation={0}
          component="form"
          onSubmit={preventSubmit}
          sx={{
            p: { xs: 3, md: 4 },
            display: "grid",
            gap: 3,
            bgcolor: "rgba(18,22,52,0.72)",
            borderRadius: "22px",
            border: "1px solid rgba(124,92,255,0.18)",
            boxShadow: "0 28px 90px rgba(5, 9, 37, 0.28)",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "18px",
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(142,151,255,0.18)",
              display: "grid",
              gap: 1.5,
            }}
          >
            {/* Header */}
            <Typography
              sx={{
                color: "#f6f7ff",
                fontWeight: 800,
                fontSize: "1.05rem",
              }}
            >
              Opportunity Document
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                color: "#7f88aa",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              Upload an RFP, RFQ, SOW, or solicitation document to automatically
              extract opportunity information and pre-fill the proposal form.
              Extracted values can be reviewed and edited before generating a
              proposal.
            </Typography>

            {/* Upload Button */}
            <Button
              component="label"
              variant="outlined"
              disabled={extracting_rfp}
              sx={{
                justifyContent: "flex-start",
                borderRadius: "14px",
                py: 1.5,
                px: 2,
                color: "#f4f6ff",
                border: "1px solid rgba(142,151,255,0.22)",
                bgcolor: "rgba(255,255,255,0.04)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              {extracting_rfp
                ? "Analyzing Document..."
                : selectedFile?.name || "Upload PDF Opportunity Document"}

              <input
                hidden
                type="file"
                accept=".pdf"
                key={fileInputKey}
                onChange={handleRfpUpload}
              />
            </Button>

            {/* Footer hint */}
            <Typography
              sx={{
                color: "#7f88aa",
                fontSize: "0.8rem",
              }}
            >
              Supported format: PDF (.pdf)
            </Typography>

            {/* Loading state */}
            {extracting_rfp && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CircularProgress size={16} />
                <Typography sx={{ color: "#9da4c3", fontSize: "0.85rem" }}>
                  Extracting opportunity details...
                </Typography>
              </Box>
            )}
          </Paper>

          {argumentList.map((argument) => {
            const fieldValue = values[argument.name ?? ""] ?? "";

            const label = getFieldLabel(argument);
            const placeholder = getFieldPlaceholder(argument, label);
            const description = getFieldDescription(argument);
            const isSelect =
              Array.isArray(argument.options) && argument.options.length > 0;
            const inputType = argument.type === "number" ? "number" : "text";
            const rows = argument.type === "textarea" ? 4 : 1;

            return (
              <Box key={argument.name} sx={{ display: "grid", gap: 1 }}>
                <Typography
                  sx={{
                    color: "#b1b9d9",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {label}
                </Typography>
                {isSelect ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={fieldValue}
                    onChange={(event) =>
                      handleChange(argument.name ?? "", event.target.value)
                    }
                    placeholder={placeholder}
                    InputProps={{
                      sx: {
                        bgcolor: "rgba(255,255,255,0.04)",
                        color: "#f4f6ff",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        bgcolor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(142,151,255,0.22)",
                        color: "#f4f6ff",
                      },
                    }}
                  >
                    {argument.options?.map((option) => {
                      if (typeof option === "string") {
                        return (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        );
                      }
                      return (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type={inputType}
                    multiline={argument.type === "textarea"}
                    minRows={rows}
                    value={fieldValue}
                    onChange={(event) =>
                      handleChange(argument.name ?? "", event.target.value)
                    }
                    placeholder={placeholder}
                    required={argument.required}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        bgcolor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(142,151,255,0.22)",
                        color: "#f4f6ff",
                        "&:hover": {
                          borderColor: "rgba(124,92,255,0.38)",
                        },
                        "&.Mui-focused": {
                          borderColor: "#7c5cff",
                          boxShadow: "0 0 0 4px rgba(124,92,255,0.16)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "#f4f6ff",
                      },
                    }}
                  />
                )}
                {description && (
                  <Typography sx={{ color: "#7f8cb9", fontSize: "0.94rem" }}>
                    {description}
                  </Typography>
                )}
              </Box>
            );
          })}
          <Box sx={{ pt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              onClick={() => start_generation()}
              startIcon={<Send size={20} />}
              sx={{
                minHeight: 58,
                borderRadius: "16px",
                bgcolor: "#2e2bff",
                color: "#fff",
                backgroundImage:
                  "linear-gradient(135deg, #5c55ff 0%, #2e2bff 58%, #725cff 100%)",
                boxShadow:
                  "0 18px 44px rgba(46,43,255,0.34), inset 0 1px 0 rgba(255,255,255,0.22)",
                textTransform: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "16px",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#2120e0",
                  boxShadow:
                    "0 22px 54px rgba(46,43,255,0.46), inset 0 1px 0 rgba(255,255,255,0.26)",
                },
              }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
