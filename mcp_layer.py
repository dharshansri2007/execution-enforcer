import json
import datetime

def simulate_calendar_update(task_name, original_hours, new_hours):
    """
    🔥 ANTI-SPAM FIX: This now purely generates the UI/AI JSON payload.
    The actual Google Calendar API strike is handled exclusively by gcal_bot.py 
    to prevent duplicate/blue spam blocks.
    """
    now = datetime.datetime.now()

    # --- JUST GENERATE THE JSON PAYLOAD FOR THE UI/AI LOGS ---
    payload = {
        "mcp_tool": "calendar.update_event",
        "status": "ADAPTATION_LOGGED",
        "payload": {
            "target_task": task_name,
            "action": "force_reschedule",
            "rescheduled_block": f"{new_hours} hours required.",
            "system_note": "AI adaptation logged. Red penalty block dispatched via GCalEnforcer."
        }
    }
    return json.dumps(payload, indent=2)

def simulate_email_alert(failure_reason):
    """Generates the MCP payload for the UI/AI logs."""
    payload = {
        "mcp_tool": "email.send",
        "status": "ACCOUNTABILITY_TRIGGERED",
        "payload": {
            "to": "accountability_partner@enforcer.os",
            "subject": "⚠️ SYSTEM ALERT: Missed Execution Block",
            "body": f"Automated Alert: Failure reason logged: '{failure_reason}'."
        }
    }
    return json.dumps(payload, indent=2)

if __name__ == "__main__":
    print("--- Firing MCP Layer (Logs Only) ---")
    print(simulate_calendar_update("Applied Physics", 4, 2))
