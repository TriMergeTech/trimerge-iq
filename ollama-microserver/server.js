const db = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3002;
const OLLAMA_URL = "http://localhost:11434";

app.use(cors());
app.use(express.json());

//////////////////////////////////////////////////////
// HELPER: SAVE MESSAGE
//////////////////////////////////////////////////////
function saveMessage(conversationId, role, content) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)`,
      [conversationId, role, content],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

//////////////////////////////////////////////////////
// HELPER: RUN DB.ALL AS PROMISE
//////////////////////////////////////////////////////
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

//////////////////////////////////////////////////////
// HELPER: RUN DB.GET AS PROMISE
//////////////////////////////////////////////////////
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

//////////////////////////////////////////////////////
// HELPER: RUN DB.RUN AS PROMISE
//////////////////////////////////////////////////////
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

//////////////////////////////////////////////////////
// HELPER: VALIDATE LIMIT
//////////////////////////////////////////////////////
function parseLimit(limitValue) {
  if (limitValue === undefined || limitValue === null || limitValue === "") {
    return null;
  }

  const parsed = parseInt(limitValue, 10);

  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

//////////////////////////////////////////////////////
// HELPER: EXECUTE TOOL
//////////////////////////////////////////////////////
async function executeTool(parsed) {
  if (parsed.route !== "tools") {
    return parsed;
  }

  console.log("⚙️ Tool triggered:", parsed.toolname, "| mode:", parsed.mode);

  if (parsed.toolname === "staff" && parsed.mode === "retrieval") {
    const filters = parsed.filters || {};
    const startDate = filters.start_date || null;
    const endDate = filters.end_date || null;
    const limit = parseLimit(parsed.limit);

    let sql = `
      SELECT id, first_name, last_name, email, phone, role_title, department, hire_date, status
      FROM staff
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      sql += ` AND hire_date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND hire_date <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY hire_date DESC`;

    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    const rows = await dbAll(sql, params);
    return rows;
  }

  if (parsed.toolname === "clients" && parsed.mode === "retrieval") {
    const filters = parsed.filters || {};
    const startDate = filters.start_date || null;
    const endDate = filters.end_date || null;
    const limit = parseLimit(parsed.limit);

    let sql = `
      SELECT id, client_name, contact_name, email, phone, company_type, status, onboard_date
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

    sql += ` ORDER BY onboard_date DESC`;

    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    const rows = await dbAll(sql, params);
    return rows;
  }

  if (parsed.toolname === "create_service" && parsed.mode === "mutation") {
    return {
      route: parsed.route,
      toolname: parsed.toolname,
      mode: parsed.mode,
      status: "ready_for_execution"
    };
  }

  return {
    route: parsed.route,
    toolname: parsed.toolname,
    mode: parsed.mode,
    status: "unsupported_tool"
  };
}

//////////////////////////////////////////////////////
// ROOT ROUTE
//////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.json({
    message: "TriMerge multi-user microserver is running"
  });
});

//////////////////////////////////////////////////////
// HEALTH CHECK
//////////////////////////////////////////////////////
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    ollama: OLLAMA_URL
  });
});

//////////////////////////////////////////////////////
// CREATE OR GET USER
//////////////////////////////////////////////////////
app.post("/users", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      error: "username is required"
    });
  }

  db.run(
    `INSERT INTO users (username) VALUES (?)`,
    [username],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          console.log("⚠️ User already exists, returning existing user");

          db.get(
            `SELECT * FROM users WHERE username = ?`,
            [username],
            (err2, row) => {
              if (err2) {
                console.error("GET EXISTING USER ERROR:", err2.message);
                return res.status(500).json({
                  error: "Failed to fetch existing user"
                });
              }

              return res.json(row);
            }
          );

          return;
        }

        console.error("CREATE USER ERROR:", err.message);
        return res.status(500).json({
          error: "Failed to create user",
          details: err.message
        });
      }

      res.json({
        id: this.lastID,
        username
      });
    }
  );
});

//////////////////////////////////////////////////////
// GET ALL USERS
//////////////////////////////////////////////////////
app.get("/users", (req, res) => {
  db.all(
    `SELECT * FROM users ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("GET USERS ERROR:", err.message);
        return res.status(500).json({
          error: "Failed to fetch users"
        });
      }

      res.json(rows);
    }
  );
});

//////////////////////////////////////////////////////
// CREATE CONVERSATION
//////////////////////////////////////////////////////
app.post("/conversations", (req, res) => {
  const { user_id, title } = req.body;

  if (!user_id) {
    return res.status(400).json({
      error: "user_id is required"
    });
  }

  db.run(
    `INSERT INTO conversations (user_id, title) VALUES (?, ?)`,
    [user_id, title || "New Chat"],
    function (err) {
      if (err) {
        console.error("CREATE CONVERSATION ERROR:", err.message);
        return res.status(500).json({
          error: "Failed to create conversation",
          details: err.message
        });
      }

      res.json({
        id: this.lastID,
        user_id,
        title: title || "New Chat"
      });
    }
  );
});

//////////////////////////////////////////////////////
// GET CONVERSATIONS FOR A USER
//////////////////////////////////////////////////////
app.get("/users/:userId/conversations", (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("GET CONVERSATIONS ERROR:", err.message);
        return res.status(500).json({
          error: "Failed to fetch conversations"
        });
      }

      res.json(rows);
    }
  );
});

//////////////////////////////////////////////////////
// GET MESSAGES FOR A CONVERSATION
//////////////////////////////////////////////////////
app.get("/conversations/:conversationId/messages", (req, res) => {
  const { conversationId } = req.params;

  db.all(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
    [conversationId],
    (err, rows) => {
      if (err) {
        console.error("GET MESSAGES ERROR:", err.message);
        return res.status(500).json({
          error: "Failed to fetch messages"
        });
      }

      res.json(rows);
    }
  );
});

//////////////////////////////////////////////////////
// ADD STAFF
//////////////////////////////////////////////////////
app.post("/staff", async (req, res) => {
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

    if (!first_name || !last_name || !hire_date) {
      return res.status(400).json({
        error: "first_name, last_name, and hire_date are required"
      });
    }

    const result = await dbRun(
      `
      INSERT INTO staff
      (first_name, last_name, email, phone, role_title, department, hire_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        first_name,
        last_name,
        email || null,
        phone || null,
        role_title || null,
        department || null,
        hire_date,
        status || "active"
      ]
    );

    const row = await dbGet(
      `
      SELECT id, first_name, last_name, email, phone, role_title, department, hire_date, status
      FROM staff
      WHERE id = ?
      `,
      [result.lastID]
    );

    res.json(row);
  } catch (error) {
    console.error("ADD STAFF ERROR:", error.message);
    res.status(500).json({
      error: "Failed to add staff"
    });
  }
});

//////////////////////////////////////////////////////
// GET STAFF
// ?start_date=2026-03-01&end_date=2026-03-31&limit=5
//////////////////////////////////////////////////////
app.get("/staff", async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query;

    let sql = `
      SELECT id, first_name, last_name, email, phone, role_title, department, hire_date, status
      FROM staff
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      sql += ` AND hire_date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND hire_date <= ?`;
      params.push(end_date);
    }

    sql += ` ORDER BY hire_date DESC`;

    const parsedLimit = parseLimit(limit);
    if (limit && !parsedLimit) {
      return res.status(400).json({
        error: "limit must be a positive number"
      });
    }

    if (parsedLimit) {
      sql += ` LIMIT ?`;
      params.push(parsedLimit);
    }

    const rows = await dbAll(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("GET STAFF ERROR:", error.message);
    res.status(500).json({
      error: "Failed to fetch staff"
    });
  }
});

//////////////////////////////////////////////////////
// ADD CLIENT
//////////////////////////////////////////////////////
app.post("/clients", async (req, res) => {
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

    const result = await dbRun(
      `
      INSERT INTO clients
      (client_name, contact_name, email, phone, company_type, status, onboard_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_name,
        contact_name || null,
        email || null,
        phone || null,
        company_type || null,
        status || "active",
        onboard_date || null
      ]
    );

    const row = await dbGet(
      `
      SELECT id, client_name, contact_name, email, phone, company_type, status, onboard_date
      FROM clients
      WHERE id = ?
      `,
      [result.lastID]
    );

    res.json(row);
  } catch (error) {
    console.error("ADD CLIENT ERROR:", error.message);
    res.status(500).json({
      error: "Failed to add client"
    });
  }
});

//////////////////////////////////////////////////////
// GET CLIENTS
// ?start_date=2026-03-01&end_date=2026-03-31&limit=5
//////////////////////////////////////////////////////
app.get("/clients", async (req, res) => {
  try {
    const { start_date, end_date, limit } = req.query;

    let sql = `
      SELECT id, client_name, contact_name, email, phone, company_type, status, onboard_date
      FROM clients
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      sql += ` AND onboard_date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND onboard_date <= ?`;
      params.push(end_date);
    }

    sql += ` ORDER BY onboard_date DESC`;

    const parsedLimit = parseLimit(limit);
    if (limit && !parsedLimit) {
      return res.status(400).json({
        error: "limit must be a positive number"
      });
    }

    if (parsedLimit) {
      sql += ` LIMIT ?`;
      params.push(parsedLimit);
    }

    const rows = await dbAll(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("GET CLIENTS ERROR:", error.message);
    res.status(500).json({
      error: "Failed to fetch clients"
    });
  }
});

//////////////////////////////////////////////////////
// CREATE SERVICE REQUEST
//////////////////////////////////////////////////////
app.post("/service-requests", async (req, res) => {
  try {
    const {
      client_id,
      service_type,
      description,
      request_status,
      priority,
      assigned_staff_id
    } = req.body;

    if (!service_type) {
      return res.status(400).json({
        error: "service_type is required"
      });
    }

    const result = await dbRun(
      `
      INSERT INTO service_requests
      (client_id, service_type, description, request_status, priority, assigned_staff_id)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        client_id || null,
        service_type,
        description || null,
        request_status || "pending",
        priority || "normal",
        assigned_staff_id || null
      ]
    );

    const row = await dbGet(
      `
      SELECT id, client_id, service_type, description, request_status, priority, assigned_staff_id, created_at
      FROM service_requests
      WHERE id = ?
      `,
      [result.lastID]
    );

    res.json(row);
  } catch (error) {
    console.error("CREATE SERVICE REQUEST ERROR:", error.message);
    res.status(500).json({
      error: "Failed to create service request"
    });
  }
});

//////////////////////////////////////////////////////
// GET SERVICE REQUESTS
// ?limit=5
//////////////////////////////////////////////////////
app.get("/service-requests", async (req, res) => {
  try {
    const { limit } = req.query;

    let sql = `
      SELECT id, client_id, service_type, description, request_status, priority, assigned_staff_id, created_at
      FROM service_requests
      ORDER BY created_at DESC
    `;
    const params = [];

    const parsedLimit = parseLimit(limit);
    if (limit && !parsedLimit) {
      return res.status(400).json({
        error: "limit must be a positive number"
      });
    }

    if (parsedLimit) {
      sql += ` LIMIT ?`;
      params.push(parsedLimit);
    }

    const rows = await dbAll(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("GET SERVICE REQUESTS ERROR:", error.message);
    res.status(500).json({
      error: "Failed to fetch service requests"
    });
  }
});

//////////////////////////////////////////////////////
// CHAT ROUTE
//////////////////////////////////////////////////////
app.post("/chat", async (req, res) => {
  try {
    const { model, message, conversation_id } = req.body;

    if (!model || !message || !conversation_id) {
      return res.status(400).json({
        error: "model, message, and conversation_id are required"
      });
    }

    console.log("MODEL USED:", model);
    console.log("MESSAGE USED:", message);
    console.log("CONVERSATION ID:", conversation_id);

    try {
      const userMessageId = await saveMessage(conversation_id, "user", message);
      console.log("✅ Saved user message ID:", userMessageId);
    } catch (err) {
      console.error("SAVE USER MESSAGE ERROR:", err.message);
    }

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        prompt: message,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "Ollama returned an error",
        details: errorText
      });
    }

    const data = await response.json();

    console.log("RAW OLLAMA RESPONSE:", data.response);

    let parsed;
    try {
      parsed = JSON.parse(data.response);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from model",
        raw: data.response
      });
    }

    const finalResponse = await executeTool(parsed);

    try {
      const assistantMessageId = await saveMessage(
        conversation_id,
        "assistant",
        JSON.stringify(finalResponse)
      );
      console.log("✅ Saved assistant message ID:", assistantMessageId);
    } catch (err) {
      console.error("SAVE ASSISTANT MESSAGE ERROR:", err.message);
    }

    return res.json(finalResponse);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to connect to Ollama",
      details: error.message
    });
  }
});

//////////////////////////////////////////////////////
// START SERVER
//////////////////////////////////////////////////////
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

//////////////////////////////////////////////////////
// CATCH SERVER ERRORS
//////////////////////////////////////////////////////
server.on("error", (error) => {
  console.error("Server error:", error);
});
