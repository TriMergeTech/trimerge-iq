const express = require("express");
const router = express.Router();

const db = require("../../db");

// =========================
// TEST ROUTE
// =========================
router.get("/test", (req, res) => {
  res.json({ message: "v2 routes working" });
});

// =========================
// NEW CONVERSATION
// =========================
router.post("/new_conversation", (req, res) => {
  const { title, memory, profile, project, recent_message } = req.body;

  if (!title || !profile) {
    return res.status(400).json({ error: "title and profile required" });
  }

  const sql = `
    INSERT INTO v2_conversations (title, memory, profile, project, recent_message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      title,
      memory ? JSON.stringify(memory) : null,
      profile,
      project || null,
      recent_message || null
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        id: this.lastID,
        title,
        memory: memory || null,
        profile,
        project: project || null,
        recent_message: recent_message || null
      });
    }
  );
});

// =========================
// NEW MESSAGE
// =========================
router.post("/new_message", (req, res) => {
  const { conversation, tool, text, attachment } = req.body;

  if (!conversation || !text) {
    return res.status(400).json({ error: "conversation and text required" });
  }

  const sql = `
    INSERT INTO v2_messages (conversation_id, tool, text, attachment)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      conversation,
      tool || null,
      text,
      attachment ? JSON.stringify(attachment) : null
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        id: this.lastID,
        conversation,
        tool: tool || null,
        text,
        attachment: attachment || []
      });
    }
  );
});

// =========================
// GET MESSAGES
// =========================
router.post("/messages", (req, res) => {
  const { conversation, page = 1, limit = 25 } = req.body;

  if (!conversation) {
    return res.status(400).json({ error: "conversation required" });
  }

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 25;
  const offset = (safePage - 1) * safeLimit;

  const sql = `
    SELECT id, conversation_id, tool, text, attachment, created_at
    FROM v2_messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
    LIMIT ? OFFSET ?
  `;

  db.all(sql, [conversation, safeLimit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const parsedRows = rows.map((row) => ({
      id: row.id,
      conversation: row.conversation_id,
      tool: row.tool,
      text: row.text,
      attachment: row.attachment ? JSON.parse(row.attachment) : [],
      created_at: row.created_at
    }));

    res.json({
      conversation,
      page: safePage,
      limit: safeLimit,
      messages: parsedRows
    });
  });
});

// =========================
// GET CONVERSATIONS
// =========================
router.post("/conversations", (req, res) => {
  const { profile, project, page = 1, limit = 25 } = req.body;

  if (!profile) {
    return res.status(400).json({ error: "profile required" });
  }

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 25;
  const offset = (safePage - 1) * safeLimit;

  let sql = `
    SELECT id, title, memory, profile, project, recent_message, created_at
    FROM v2_conversations
    WHERE profile = ?
  `;

  let params = [profile];

  if (project !== undefined && project !== null && project !== "") {
    sql += ` AND project = ? `;
    params.push(project);
  } else {
    sql += ` AND project IS NULL `;
  }

  sql += `
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(safeLimit, offset);

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const parsedRows = rows.map((row) => ({
      id: row.id,
      title: row.title,
      memory: row.memory ? JSON.parse(row.memory) : null,
      profile: row.profile,
      project: row.project,
      recent_message: row.recent_message,
      created_at: row.created_at
    }));

    res.json({
      profile,
      project: project || null,
      page: safePage,
      limit: safeLimit,
      conversations: parsedRows
    });
  });
});

module.exports = router;
