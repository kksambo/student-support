import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "student_support.db");

// Create a promisified version of database methods
const db = new sqlite3.Database(dbPath);

// Promisify database methods
const runAsync = promisify(db.run.bind(db));
const getAsync = promisify(db.get.bind(db));
const allAsync = promisify(db.all.bind(db));

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing Student Support Database...");

    // Enable foreign keys
    await runAsync("PRAGMA foreign_keys = ON");

    // Create users table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_count INTEGER DEFAULT 0
      )
    `);
    console.log("✅ Users table created");

    // Create conversations table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        message_type TEXT CHECK(message_type IN ('user', 'ai')) NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Conversations table created");

    // Create user_sessions table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_end DATETIME,
        message_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    console.log("✅ User sessions table created");

    // Create resources table for campus resources
    await runAsync(`
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        contact TEXT,
        location TEXT,
        hours TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Resources table created");

    // Insert sample resources data
    await insertSampleResources();

    // Create indexes for better performance
    await runAsync(
      "CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)"
    );
    await runAsync(
      "CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp)"
    );
    await runAsync(
      "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)"
    );

    console.log("✅ Database indexes created");

    // Verify tables were created
    const tables = await allAsync(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);

    console.log("\n📊 Database Tables:");
    tables.forEach((table) => {
      console.log(`   - ${table.name}`);
    });

    console.log("\n🎉 Database initialization completed successfully!");
    console.log(`📁 Database file: ${dbPath}`);
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("🔒 Database connection closed.");
      }
    });
  }
}

async function insertSampleResources() {
  const sampleResources = [
    // ... (keep your existing sample resources data)
  ];

  try {
    // Check if resources already exist
    const existingCount = await getAsync(
      "SELECT COUNT(*) as count FROM resources"
    );

    if (existingCount.count === 0) {
      console.log("📝 Inserting sample resources...");

      for (const resource of sampleResources) {
        await runAsync(
          `INSERT INTO resources (category, name, description, contact, location, hours) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            resource.category,
            resource.name,
            resource.description,
            resource.contact,
            resource.location,
            resource.hours,
          ]
        );
      }

      console.log(`✅ Inserted ${sampleResources.length} sample resources`);
    } else {
      console.log(
        `📊 Resources table already contains ${existingCount.count} records`
      );
    }
  } catch (error) {
    console.error("Error inserting sample resources:", error);
  }
}

// Run the initialization
initializeDatabase();
