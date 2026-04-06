const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3002;

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const ROUTER_MODEL = process.env.ROUTER_MODEL || "model_file_upgrade";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:latest";

app.use(cors());
app.use(express.json());

/* =========================================================
   PROCESS-LEVEL ERROR HANDLERS
========================================================= */
process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", reason);
});

/* =========================================================
   DB HELPERS
========================================================= */
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/* =========================================================
   GENERAL HELPERS
========================================================= */
function parseLimit(value, fallback = 10) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return fallback;
  return n;
}

function normalizeDate(input) {
  if (!input) return null;

  const value = String(input).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  let match = value.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, mm, dd, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return null;
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeToolName(toolname = "") {
  const t = String(toolname).toLowerCase().trim();

  if (
    [
      "staff",
      "employee",
      "employees",
      "staff member",
      "staff members",
      "team member",
      "team members",
      "worker",
      "workers",
      "new hire",
      "new hires",
      "hired person",
      "hired people"
    ].includes(t)
  ) {
    return "staff";
  }

  if (["client", "clients", "customer", "customers"].includes(t)) {
    return "clients";
  }

  return t;
}

/* =========================================================
   INTENT / FILTER HELPERS
========================================================= */
function isStaffIntent(message = "") {
  const lower = message.toLowerCase();

  const peopleWords = [
    "employee",
    "employees",
    "staff",
    "staff member",
    "staff members",
    "team member",
    "team members",
    "worker",
    "workers",
    "new hire",
    "new hires",
    "hired person",
    "hired people"
  ];

  const hireWords = [
    "hire",
    "hired",
    "joined",
    "started",
    "employed"
  ];

  const hasPeopleWord = peopleWords.some((w) => lower.includes(w));
  const hasHireWord = hireWords.some((w) => lower.includes(w));

  return hasPeopleWord || hasHireWord;
}

function extractStaffFiltersFromMessage(message = "") {
  const lower = message.toLowerCase();
  const filters = {};

  const yyyyMmDd = lower.match(/\b\d{4}-\d{1,2}-\d{1,2}\b/);
  const yyyySlashMmDd = lower.match(/\b\d{4}\/\d{1,2}\/\d{1,2}\b/);
  const mmDdYyyy = lower.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/);

  if (yyyyMmDd) {
    filters.hire_date = normalizeDate(yyyyMmDd[0]);
    return filters;
  }

  if (yyyySlashMmDd) {
    filters.hire_date = normalizeDate(yyyySlashMmDd[0]);
    return filters;
  }

  if (mmDdYyyy) {
    filters.hire_date = normalizeDate(mmDdYyyy[0]);
    return filters;
  }

  const yearMatch = lower.match(/\b(20\d{2})\b/);
  if (yearMatch && !yyyyMmDd && !yyyySlashMmDd && !mmDdYyyy) {
    filters.year = yearMatch[1];
    return filters;
  }

  if (lower.includes("last year")) {
    filters.relative_year = "last_year";
    return filters;
  }

  if (lower.includes("this year")) {
    filters.year = String(new Date().getFullYear());
    return filters;
  }

  if (lower.includes("today")) {
    filters.hire_date = getTodayDate();
    return filters;
  }

  return filters;
}

function fallbackRouter(message = "") {
  if (isStaffIntent(message)) {
    return {
      route: "tools",
      toolname: "staff",
      mode: "retrieval",
      filters: extractStaffFiltersFromMessage(message)
    };
  }

  return {
    route: "text",
    response: "I can help with staff, clients, conversations, and service requests."
  };
}

/* =========================================================
   OLLAMA HELPERS
========================================================= */
async function callOllamaGenerate(model, prompt) {
  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model,
    prompt,
    stream: false
  });

  return response.data?.response || "";
}

async function routeMessageWithModel(message) {
  const routerPrompt = `
You are a strict JSON routing model.

Return valid JSON only.
Do not add markdown.
Do not explain anything.

Allowed shapes:

For staff / employee retrieval:
{
  "route": "tools",
  "toolname": "staff",
  "mode": "retrieval",
  "filters": {
    "hire_date": "YYYY-MM-DD"
  }
}

OR

{
  "route": "tools",
  "toolname": "staff",
  "mode": "retrieval",
  "filters": {
    "year": "2025"
  }
}

OR

{
  "route": "tools",
  "toolname": "staff",
  "mode": "retrieval",
  "filters": {
    "relative_year": "last_year"
  }
}

For client retrieval:
{
  "route": "tools",
  "toolname": "clients",
  "mode": "retrieval",
  "filters": {}
}

For service creation requests:
{
  "route": "tools",
  "toolname": "create_service",
  "mode": "mutation"
}

For everything else:
{
  "route": "text",
  "response": "plain text response"
}

User message:
${message}
`;

  try {
    const raw = await callOllamaGenerate(ROUTER_MODEL, routerPrompt);
    const parsed = safeJsonParse(raw);

    if (parsed && parsed.route) {
      return parsed;
    }

    return fallbackRouter(message);
  } catch (error) {
    console.error("ROUTER MODEL ERROR:", error.message);
    return fallbackRouter(message);
  }
}

async function formatToolResultWithModel(userMessage, toolResult) {
  const formatterPrompt = `
You are a business response formatter.

You will receive:
1. a user question
2. a database result in JSON

Write exactly one plain-text response using only the provided database result.

Rules:
- Output plain text only
- No markdown
- No JSON
- No explanation of reasoning
- No follow-up question
- If no matching rows exist, clearly say none were found

User question:
${userMessage}

Database result:
${JSON.stringify(toolResult, null, 2)}
`;

  try {
    const raw = await callOllamaGenerate(OLLAMA_MODEL, formatterPrompt);
    return raw.trim();
  } catch (error) {
    console.error("FORMATTER MODEL ERROR:", error.message);

    if (Array.isArray(toolResult) && toolResult.length === 0) {
      return "No matching records were found.";
    }

    if (Array.isArray(toolResult)) {
      return JSON.stringify(toolResult, null, 2);
    }

    return "I found a result, but I could not format it.";
  }
}

/* =========================================================
   TOOL EXECUTION
========================================================= */
async function executeTool(parsed) {
  if (!parsed || parsed.route !== "tools") {
    return parsed;
  }

  const normalizedTool = normalizeToolName(parsed.toolname);
  console.log("⚙️ Tool triggered:", normalizedTool, "| mode:", parsed.mode);

  if (normalizedTool === "staff" && parsed.mode === "retrieval") {
    const filters = parsed.filters || {};
    const limit = parseLimit(parsed.limit, 25);

    const exactDate = normalizeDate(filters.hire_date || filters.exact_date);
    const year = filters.year ? String(filters.year) : null;
    const relativeYear = filters.relative_year || null;

    let startDate = normalizeDate(filters.start_date);
    let endDate = normalizeDate(filters.end_date);

    const currentYear = new Date().getFullYear();

    if (!year && relativeYear === "last_year") {
      const y = currentYear - 1;
      startDate = `${y}-01-01`;
      endDate = `${y}-12-31`;
    }

    if (year) {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    let sql = `
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role_title,
        department,
        hire_date,
        status,
        created_at
      FROM staff
      WHERE 1=1
    `;
    const params = [];

    if (exactDate) {
      sql += ` AND hire_date = ?`;
      params.push(exactDate);
    } else {
      if (startDate) {
        sql += ` AND hire_date >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND hire_date <= ?`;
        params.push(endDate);
      }
    }

    sql += ` ORDER BY hire_date DESC, id DESC LIMIT ?`;
    params.push(limit);

    return await dbAll(sql, params);
  }

  if (normalizedTool === "clients" && parsed.mode === "retrieval") {
    const filters = parsed.filters || {};
    const limit = parseLimit(parsed.limit, 25);

    const startDate = normalizeDate(filters.start_date);
    const endDate = normalizeDate(filters.end_date);

    let sql = `
      SELECT
        id,
        client_name,
        contact_name,
        email,
        phone,
        company_type,
        status,
        onboard_date,
        created_at
      FROM clients
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      sql += ` AND onboard_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND onboard_date <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY id DESC LIMIT ?`;
    params.push(limit);

    return await dbAll(sql, params);
  }

  if (normalizedTool === "create_service" && parsed.mode === "mutation") {
    return {
      status: "ready_for_execution",
      message: "Service creation routing worked."
    };
  }

  return {
    status: "unsupported_tool",
    toolname: parsed.toolname,
    mode: parsed.mode
  };
}

/* =========================================================
   BASIC ROUTES
========================================================= */
app.get("/", (req, res) => {
  res.json({
    message: "TriMerge microserver is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    ollama_url: OLLAMA_URL,
    router_model: ROUTER_MODEL,
    ollama_model: OLLAMA_MODEL
  });
});

/* =========================================================
   USERS
========================================================= */
app.post("/users", async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({
        error: "username is required"
      });
    }

    const result = await dbRun(
      `INSERT INTO users (username) VALUES (?)`,
      [String(username).trim()]
    );

    const user = await dbGet(
      `SELECT id, username, created_at FROM users WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(user);
  } catch (error) {
    console.error("CREATE USER ERROR:", error.message);
    next(error);
  }
});

app.get("/users", async (req, res, next) => {
  try {
    const rows = await dbAll(
      `SELECT id, username, created_at FROM users ORDER BY id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   CONVERSATIONS
========================================================= */
app.post("/conversations", async (req, res, next) => {
  try {
    const { user_id, title } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: "user_id is required"
      });
    }

    const result = await dbRun(
      `INSERT INTO conversations (user_id, title) VALUES (?, ?)`,
      [user_id, title || "New Chat"]
    );

    const conversation = await dbGet(
      `SELECT id, user_id, title, created_at FROM conversations WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error.message);
    next(error);
  }
});

app.get("/conversations/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const rows = await dbAll(
      `
      SELECT id, user_id, title, created_at
      FROM conversations
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   MESSAGES
========================================================= */
app.post("/messages", async (req, res, next) => {
  try {
    const { conversation_id, role, content } = req.body;

    if (!conversation_id || !role || !content) {
      return res.status(400).json({
        error: "conversation_id, role, and content are required"
      });
    }

    const result = await dbRun(
      `INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)`,
      [conversation_id, role, content]
    );

    const messageRow = await dbGet(
      `
      SELECT id, conversation_id, role, content, created_at
      FROM messages
      WHERE id = ?
      `,
      [result.lastID]
    );

    res.status(201).json(messageRow);
  } catch (error) {
    console.error("CREATE MESSAGE ERROR:", error.message);
    next(error);
  }
});

app.get("/messages/:conversation_id", async (req, res, next) => {
  try {
    const { conversation_id } = req.params;

    const rows = await dbAll(
      `
      SELECT id, conversation_id, role, content, created_at
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC, id ASC
      `,
      [conversation_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   STAFF / NEW HIRES
========================================================= */
app.post("/staff", async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      role_title,
      department,
      hire_date,
      status
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        error: "first_name and last_name are required"
      });
    }

    const finalHireDate = normalizeDate(hire_date) || getTodayDate();

    const result = await dbRun(
      `
      INSERT INTO staff (
        first_name,
        last_name,
        email,
        phone,
        role_title,
        department,
        hire_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        first_name,
        last_name,
        email || null,
        phone || null,
        role_title || null,
        department || null,
        finalHireDate,
        status || "active"
      ]
    );

    const row = await dbGet(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role_title,
        department,
        hire_date,
        status,
        created_at
      FROM staff
      WHERE id = ?
      `,
      [result.lastID]
    );

    res.status(201).json(row);
  } catch (error) {
    console.error("ADD STAFF ERROR:", error.message);
    next(error);
  }
});

app.get("/staff", async (req, res, next) => {
  try {
    const rows = await dbAll(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role_title,
        department,
        hire_date,
        status,
        created_at
      FROM staff
      ORDER BY hire_date DESC, id DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("GET STAFF ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   DIRECT STAFF SEARCH
========================================================= */
app.post("/staff/search", async (req, res, next) => {
  try {
    const { hire_date, year, relative_year, start_date, end_date, limit } = req.body;

    const parsed = {
      route: "tools",
      toolname: "staff",
      mode: "retrieval",
      limit: limit || 25,
      filters: {
        hire_date,
        year,
        relative_year,
        start_date,
        end_date
      }
    };

    const result = await executeTool(parsed);
    res.json(result);
  } catch (error) {
    console.error("STAFF SEARCH ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   CLIENTS
========================================================= */
app.post("/clients", async (req, res, next) => {
  try {
    const {
      client_name,
      contact_name,
      email,
      phone,
      company_type,
      status,
      onboard_date
    } = req.body;

    if (!client_name) {
      return res.status(400).json({
        error: "client_name is required"
      });
    }

    const finalOnboardDate = normalizeDate(onboard_date) || null;

    const result = await dbRun(
      `
      INSERT INTO clients (
        client_name,
        contact_name,
        email,
        phone,
        company_type,
        status,
        onboard_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_name,
        contact_name || null,
        email || null,
        phone || null,
        company_type || null,
        status || "active",
        finalOnboardDate
      ]
    );

    const row = await dbGet(
      `
      SELECT
        id,
        client_name,
        contact_name,
        email,
        phone,
        company_type,
        status,
        onboard_date,
        created_at
      FROM clients
      WHERE id = ?
      `,
      [result.lastID]
    );

    res.status(201).json(row);
  } catch (error) {
    console.error("ADD CLIENT ERROR:", error.message);
    next(error);
  }
});

app.get("/clients", async (req, res, next) => {
  try {
    const rows = await dbAll(
      `
      SELECT
        id,
        client_name,
        contact_name,
        email,
        phone,
        company_type,
        status,
        onboard_date,
        created_at
      FROM clients
      ORDER BY id DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   ROUTER TEST
========================================================= */
app.post("/route-message", async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required"
      });
    }

    const parsed = await routeMessageWithModel(message);
    res.json(parsed);
  } catch (error) {
    console.error("ROUTE MESSAGE ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   EXECUTE TOOL TEST
========================================================= */
app.post("/execute-tool", async (req, res, next) => {
  try {
    const parsed = req.body;

    if (!parsed || !parsed.route) {
      return res.status(400).json({
        error: "Valid parsed tool JSON is required"
      });
    }

    const result = await executeTool(parsed);
    res.json(result);
  } catch (error) {
    console.error("EXECUTE TOOL ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   CHAT
========================================================= */
app.post("/chat", async (req, res, next) => {
  try {
    const { model, message, conversation_id } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required"
      });
    }

    if (!conversation_id) {
      return res.status(400).json({
        error: "conversation_id is required"
      });
    }

    await dbRun(
      `INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)`,
      [conversation_id, "user", message]
    );

    const parsed = await routeMessageWithModel(message);

    let finalReply = "";
    let toolResult = null;

    if (parsed.route === "tools") {
      toolResult = await executeTool(parsed);
      finalReply = await formatToolResultWithModel(message, toolResult);
    } else {
      finalReply =
        parsed.response ||
        "I understood your message, but I do not have a response.";
    }

    await dbRun(
      `INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)`,
      [conversation_id, "assistant", finalReply]
    );

    res.json({
      model_used: model || OLLAMA_MODEL,
      router_model: ROUTER_MODEL,
      parsed_route: parsed,
      tool_result: toolResult,
      response: finalReply
    });
  } catch (error) {
    console.error("CHAT ERROR:", error.message);
    next(error);
  }
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR HANDLER:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    details: err.message || "Something went wrong"
  });
});

/* =========================================================
   START SERVER
========================================================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ OLLAMA_URL: ${OLLAMA_URL}`);
  console.log(`✅ ROUTER_MODEL: ${ROUTER_MODEL}`);
  console.log(`✅ OLLAMA_MODEL: ${OLLAMA_MODEL}`);
});
