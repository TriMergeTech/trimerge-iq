const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3002;
const OLLAMA_URL = "http://localhost:11434";

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Ollama microserver is running"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    ollama: OLLAMA_URL
  });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { model, message } = req.body;

    if (!model || !message) {
      return res.status(400).json({
        error: "model and message required"
      });
    }

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        prompt: message,
        stream: false,
        format: "json"
      })
    });

    if (!response.ok) {
      return res.status(500).json({
        error: "Ollama returned an error"
      });
    }

    const data = await response.json();

    let parsed;
    try {
      parsed = JSON.parse(data.response);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from model",
        raw: data.response
      });
    }

    return res.json({
      route: parsed.route,
      response: parsed.response
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to connect to Ollama",
      details: error.message
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Catch server errors
server.on("error", (error) => {
  console.error("Server error:", error);
});
