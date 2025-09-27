import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "student_support.db");

// Create database connection with better error handling
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("✅ Connected to SQLite database.");
      // Enable foreign keys
      db.run("PRAGMA foreign_keys = ON");
    }
  }
);

// User management
export const UserDB = {
  createUser: (specificUserId = null) => {
    return new Promise((resolve, reject) => {
      const userId = specificUserId || uuidv4();
      db.run(
        "INSERT OR IGNORE INTO users (id) VALUES (?)",
        [userId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(userId);
          }
        }
      );
    });
  },

  updateUserActivity: (userId) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET last_active = CURRENT_TIMESTAMP, message_count = message_count + 1 WHERE id = ?",
        [userId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
};

// Conversation management
export const ConversationDB = {
  saveMessage: (userId, message, response, messageType = "user") => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO conversations (user_id, message, response, message_type) 
         VALUES (?, ?, ?, ?)`,
        [userId, message, response, messageType],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  getConversationHistory: (userId, limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM conversations 
         WHERE user_id = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.reverse()); // Return in chronological order
        }
      );
    });
  },

  getRecentConversations: (userId, hours = 24) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM conversations 
         WHERE user_id = ? AND timestamp >= datetime('now', ?) 
         ORDER BY timestamp ASC`,
        [userId, `-${hours} hours`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },
};

// Session management
export const SessionDB = {
  startSession: (userId) => {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO user_sessions (user_id) VALUES (?)",
        [userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  },

  endSession: (sessionId) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE user_sessions SET session_end = CURRENT_TIMESTAMP WHERE id = ?",
        [sessionId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  updateMessageCount: (sessionId) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE user_sessions SET message_count = message_count + 1 WHERE id = ?",
        [sessionId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  getActiveSession: (userId) => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM user_sessions WHERE user_id = ? AND session_end IS NULL ORDER BY session_start DESC LIMIT 1",
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },
};

// Resource management
export const ResourceDB = {
  getAllResources: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM resources ORDER BY category, name", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getResourcesByCategory: (category) => {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM resources WHERE category = ? ORDER BY name",
        [category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },
};

export default db;
