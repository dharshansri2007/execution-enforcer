from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import database
import mcp_layer
from agents import OrchestratorAgent, AdaptationAgent
from notion_bot import NotionEnforcer
from gmail_bot import GmailEnforcer
from gcal_bot import GCalEnforcer

# Initialize DB
database.init_db()

# 🔥 HACKATHON LIFESAVER 1: Ensure the Notion column exists without crashing
try:
    database.execute_query("ALTER TABLE tasks ADD COLUMN notion_page_id TEXT")
except Exception:
    pass # If it fails, it means the column already exists. We are good.

# 🔥 HACKATHON LIFESAVER 2: Create a permanent history ledger
try:
    database.execute_query("""
        CREATE TABLE IF NOT EXISTS task_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            task_name TEXT, 
            status TEXT, 
            failure_reason TEXT,
            logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
except Exception as e:
    print("History table check:", e)

app = FastAPI(title="Execution Enforcer API", description="A closed-loop execution system.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GoalRequest(BaseModel):
    goal: str

class ComplianceRequest(BaseModel):
    task_id: int
    completed: bool
    failure_reason: Optional[str] = "No reason provided."

# 🔥 THE FIX: Added Pydantic Model for DELETE requests
class DeleteHistoryRequest(BaseModel):
    task_name: str

# 🔥 NEW: Pydantic Model for Store Purchases
class SpendXPRequest(BaseModel):
    cost: int
    item_name: str

@app.get("/")
def home():
    return {"message": "Execution Enforcer Backend is LIVE 🚀"}

@app.get("/tasks")
def get_tasks():
    rows = database.fetch_query("SELECT id, task_name, duration_hours, status, failure_reason FROM tasks")
    if not rows:
        return []
    return [{"id": r[0], "task_name": r[1], "duration_hours": r[2], "status": r[3], "failure_reason": r[4]} for r in rows]

@app.post("/plan")
def create_plan(req: GoalRequest):
    print(f"🔥 New Goal Received: {req.goal}")
    
    stats = database.fetch_query("SELECT compliance_score, streak FROM user_stats WHERE id = 1")
    comp_score, streak = stats[0] if stats else (100, 0)
    
    recent_fails = database.fetch_query("SELECT task_name, failure_reason FROM task_history WHERE status = 'Failed' ORDER BY id DESC LIMIT 3")
    fails_str = ", ".join([f"Failed '{r[0]}' due to '{r[1]}'" for r in recent_fails]) if recent_fails else "No recent failures."
    
    user_context = f"Compliance: {comp_score}%. Streak: {streak} days. Recent Fails: {fails_str}"
    
    tasks = OrchestratorAgent.breakdown_goal(req.goal, user_context)
    if not tasks:
        raise HTTPException(status_code=500, detail="Orchestrator failed to generate a plan.")
    
    database.execute_query("DELETE FROM tasks")
    
    notion_status = "success"
    try:
        tasks = NotionEnforcer.push_timetable(req.goal, tasks)
    except Exception as e:
        notion_status = "failed"
        print(f"⚠️ Failed to push to Notion: {e}")

    for t in tasks:
        database.execute_query(
            "INSERT INTO tasks (task_name, duration_hours, notion_page_id, difficulty) VALUES (?, ?, ?, ?)", 
            (
                t.get("task_name", "Unknown Task"), 
                t.get("duration_hours", 1),
                t.get("notion_page_id", ""),
                t.get("difficulty", "MEDIUM")
            )
        )

    return {
        "message": "Plan locked.", 
        "total_tasks": len(tasks), 
        "notion_status": notion_status,
        "tasks_generated": tasks
    }

@app.get("/score")
def get_score():
    stats = database.fetch_query("SELECT compliance_score, streak, total_failures, xp_balance FROM user_stats WHERE id = 1")
    if stats:
        return {
            "compliance_score": f"{stats[0][0]}%", 
            "streak": stats[0][1], 
            "total_failures": stats[0][2],
            "xp_balance": stats[0][3]
        }
    return {"error": "Stats not found"}

@app.post("/check-compliance")
def check_compliance(req: ComplianceRequest):
    task = database.fetch_query("SELECT task_name, duration_hours, notion_page_id FROM tasks WHERE id = ?", (req.task_id,))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found in DB.")
    
    task_name, duration, notion_page_id = task[0]

    if req.completed:
        print(f"✅ User Completed Task: {task_name}")
        database.execute_query("UPDATE tasks SET status = 'Done' WHERE id = ?", (req.task_id,))
        database.execute_query("UPDATE user_stats SET compliance_score = MIN(100, compliance_score + 5), streak = streak + 1, xp_balance = xp_balance + 100 WHERE id = 1")
        
        database.execute_query("INSERT INTO task_history (task_name, status, failure_reason) VALUES (?, ?, ?)", (task_name, 'Done', ''))

        if notion_page_id:
            try:
                NotionEnforcer.mark_task_complete(notion_page_id)
            except Exception as e:
                print(f"⚠️ Failed to tick Notion checkbox: {e}")

        try:
            GCalEnforcer.redeem_penalty(task_name)
        except Exception:
            pass

        return {"status": "SUCCESS", "message": f"Task '{task_name}' verified. +100 XP Added!"}
    
    else:
        print(f"💀 User Failed Task: {task_name} | Excuse: {req.failure_reason}")
        
        database.execute_query("UPDATE tasks SET status = 'Failed', failure_reason = ? WHERE id = ?", (req.failure_reason, req.task_id))
        database.execute_query("UPDATE user_stats SET compliance_score = MAX(0, compliance_score - 15), streak = 0, total_failures = total_failures + 1 WHERE id = 1")
        
        database.execute_query("INSERT INTO task_history (task_name, status, failure_reason) VALUES (?, ?, ?)", (task_name, 'Failed', req.failure_reason))

        notion_status = "success"
        try:
            NotionEnforcer.log_wall_of_shame(task_name, req.failure_reason)
        except Exception as e:
            notion_status = "failed"

        email_status = "success"
        try:
            target_email = os.getenv("DEMO_RECIPIENT_EMAIL")
            GmailEnforcer.send_failure_alert(task_name, req.failure_reason, target_email)
        except Exception as e:
            email_status = "failed"

        try:
            GCalEnforcer.add_penalty_block(task_name, duration)
        except Exception as e:
            print(f"⚠️ Failed to add G-Cal Penalty: {e}")

        recent_fails = database.fetch_query("SELECT task_name, failure_reason FROM task_history WHERE status = 'Failed' ORDER BY id DESC LIMIT 5")
        history_str = "\n".join([f"- Failed '{r[0]}' because '{r[1]}'" for r in recent_fails]) if recent_fails else "No recent failures."

        adaptation = AdaptationAgent.adapt_on_failure(task_name, duration, req.failure_reason, history_str)
        
        database.execute_query(
            "INSERT INTO intelligence_logs (task_name, reasoning, adjustment) VALUES (?, ?, ?)", 
            (task_name, adaptation.get('adaptation_note', 'No note'), f"{duration} hrs -> {adaptation.get('new_duration', duration)} hrs")
        )

        calendar_payload = mcp_layer.simulate_calendar_update(task_name, duration, adaptation.get('new_duration', duration))

        return {
            "status": "ESCALATION_TRIGGERED",
            "notion_status": notion_status,
            "email_status": email_status,
            "message": "User failed execution. System adapting...",
            "ai_adaptation": adaptation
        }

@app.get("/api/history")
@app.get("/history")
def get_history():
    try:
        rows = database.fetch_query("SELECT task_name, status, failure_reason, logged_at FROM task_history ORDER BY id DESC")
        if not rows:
            return []
        return [{"task_name": r[0], "status": r[1], "failure_reason": r[2], "logged_at": r[3]} for r in rows]
    except Exception as e:
        print(f"❌ Error fetching history: {e}")
        return []

@app.get("/api/penalties")
@app.get("/penalties")
def get_penalties():
    try:
        rows = database.fetch_query("SELECT task_name, duration_hours FROM tasks WHERE status = 'Failed'")
        if not rows:
            return []
        
        penalties = []
        for r in rows:
            penalties.append({
                "title": f"PENALTY: {r[0]}",
                "duration": r[1]
            })
        return penalties
    except Exception as e:
        print(f"❌ Error fetching penalties: {e}")
        return []

@app.get("/api/intelligence")
@app.get("/intelligence")
def get_intelligence():
    try:
        rows = database.fetch_query("SELECT task_name, reasoning, adjustment, logged_at FROM intelligence_logs ORDER BY id DESC LIMIT 20")
        if not rows:
            return []
        return [{"task_name": r[0], "reasoning": r[1], "adjustment": r[2], "logged_at": r[3]} for r in rows]
    except Exception as e:
        print(f"❌ Error fetching intelligence logs: {e}")
        return []

@app.post("/api/purge-notion")
@app.post("/purge-notion")
def purge_notion():
    try:
        success = NotionEnforcer.purge_completed_tasks()
        if success:
            return {"status": "SUCCESS", "message": "Notion garbage purged."}
        else:
            raise HTTPException(status_code=500, detail="Failed to purge Notion.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🔄 STATE SYNCHRONIZATION HANDLER
@app.post("/api/purge-shame")
@app.post("/purge-shame")
def purge_shame():
    """Gracefully resolves UI purge requests to ensure seamless state management."""
    return {"status": "SUCCESS", "message": "Wall of Shame state synchronized."}

# 🔥 THE FIX APPLIED HERE
@app.delete("/api/history")
@app.delete("/history")
def delete_history_record(req: DeleteHistoryRequest):
    task_name = req.task_name
    
    try:
        database.execute_query("DELETE FROM task_history WHERE task_name = ?", (task_name,))
        return {"status": "SUCCESS", "message": f"Record '{task_name}' deleted."}
    except Exception as e:
        print(f"❌ Error deleting history: {e}")
        raise HTTPException(status_code=500, detail="Database delete failed.")

# 🔥 NEW ENDPOINT: Store Purchase Engine
@app.post("/api/spend-xp")
@app.post("/spend-xp")
def spend_xp(req: SpendXPRequest):
    stats = database.fetch_query("SELECT xp_balance FROM user_stats WHERE id = 1")
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found.")
    
    current_xp = stats[0][0]
    
    if current_xp < req.cost:
        raise HTTPException(status_code=400, detail="Insufficient XP. Execution lacking.")
        
    new_xp = current_xp - req.cost
    database.execute_query("UPDATE user_stats SET xp_balance = ? WHERE id = 1", (new_xp,))
    
    return {
        "status": "SUCCESS", 
        "message": f"Authorization granted: '{req.item_name}' unlocked.", 
        "new_balance": new_xp
    }

# 🔥 NEW: The Controlled Demo Reset Endpoint
@app.post("/api/reset-demo")
@app.post("/reset-demo")
def reset_demo():
    try:
        # Wipe all tasks and history
        database.execute_query("DELETE FROM tasks")
        database.execute_query("DELETE FROM task_history")
        # Reset XP, streak, and compliance back to default
        database.execute_query("UPDATE user_stats SET xp_balance = 0, compliance_score = 100, streak = 0, total_failures = 0 WHERE id = 1")
        return {"status": "SUCCESS", "message": "Simulation environment purged."}
    except Exception as e:
        print(f"❌ Error resetting demo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Execution Enforcer API Server...")
    print("🌐 Dashboard will be available at: http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
