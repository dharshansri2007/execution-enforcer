import sqlite3
import datetime

DB_NAME = "enforcer.db"

def init_db():
    """Initializes the database and safely upgrades tables if needed."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Table 1: Track the user's overall stats (The Gamification & Metrics)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            id INTEGER PRIMARY KEY,
            compliance_score INTEGER DEFAULT 100,
            streak INTEGER DEFAULT 0,
            total_failures INTEGER DEFAULT 0
        )
    ''')

    # Table 2: Track daily tasks and failure reasons (The Accountability Log)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            duration_hours INTEGER NOT NULL,
            status TEXT DEFAULT 'Pending',  -- 'Pending', 'Done', or 'Failed'
            failure_reason TEXT,            -- Tracks WHY they failed
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 🔥 NEW: Table 3: The Intelligence Log (The AI's Memory Bank)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS intelligence_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT,
            reasoning TEXT,
            adjustment TEXT,
            logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("⚡ Intelligence Log table initialized!")

    # 🔥 THE HEIST UPGRADE: Safely add new columns without wiping your existing data
    try:
        cursor.execute("ALTER TABLE user_stats ADD COLUMN xp_balance INTEGER DEFAULT 0")
        print("⚡ Upgraded user_stats with xp_balance!")
    except sqlite3.OperationalError:
        pass # Column already exists, safe to ignore

    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN difficulty TEXT DEFAULT 'MEDIUM'")
        print("⚡ Upgraded tasks with difficulty tags!")
    except sqlite3.OperationalError:
        pass # Column already exists, safe to ignore

    # 🔥 NEW UPGRADE: Notion Graveyard Columns
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN notion_page_id TEXT")
        print("⚡ Upgraded tasks with notion_page_id!")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN swept_at DATETIME")
        print("⚡ Upgraded tasks with swept_at for the Graveyard!")
    except sqlite3.OperationalError:
        pass

    # Ensure there is exactly one row in user_stats so we can update it later
    cursor.execute('SELECT COUNT(*) FROM user_stats')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO user_stats (compliance_score, streak, total_failures, xp_balance) VALUES (100, 0, 0, 0)')

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully. Gamification Engine Online.")

# Helper functions for our FastAPI server to quickly read/write data
def execute_query(query, params=()):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    conn.close()

def fetch_query(query, params=()):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(query, params)
    result = cursor.fetchall()
    conn.close()
    return result

# Run this script directly to build the DB for the first time
if __name__ == "__main__":
    init_db()
