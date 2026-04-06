const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "trimerge_microserver.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);

  //////////////////////////////////////////////////////
  // USERS
  //////////////////////////////////////////////////////
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  //////////////////////////////////////////////////////
  // CONVERSATIONS
  //////////////////////////////////////////////////////
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT DEFAULT 'New Chat',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  //////////////////////////////////////////////////////
  // MESSAGES
  //////////////////////////////////////////////////////
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  //////////////////////////////////////////////////////
  // STAFF
  //////////////////////////////////////////////////////
  db.run(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      role_title TEXT,
      department TEXT,
      hire_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  //////////////////////////////////////////////////////
  // CLIENTS
  //////////////////////////////////////////////////////
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      company_type TEXT,
      status TEXT DEFAULT 'active',
      onboard_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  //////////////////////////////////////////////////////
  // SERVICE REQUESTS
  //////////////////////////////////////////////////////
  db.run(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      service_type TEXT NOT NULL,
      description TEXT,
      request_status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'normal',
      assigned_staff_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_staff_id) REFERENCES staff(id) ON DELETE SET NULL
    )
  `);

  //////////////////////////////////////////////////////
  // INDEXES
  //////////////////////////////////////////////////////
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id
    ON conversations(user_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON messages(conversation_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_created_at
    ON messages(created_at)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_staff_hire_date
    ON staff(hire_date)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_staff_last_name
    ON staff(last_name)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_staff_first_name
    ON staff(first_name)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_clients_onboard_date
    ON clients(onboard_date)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_clients_client_name
    ON clients(client_name)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_service_requests_client_id
    ON service_requests(client_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_service_requests_assigned_staff_id
    ON service_requests(assigned_staff_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_service_requests_created_at
    ON service_requests(created_at)
  `);
});

module.exports = db;
