import os
import requests
from dotenv import load_dotenv

# Load the master keys
load_dotenv()
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
PAGE_ID = os.getenv("NOTION_BASE_PAGE_ID")

if not NOTION_API_KEY or not PAGE_ID:
    print("🚨 ERROR: Notion keys are missing from .env file!")
    exit()

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28" # Required by Notion
}

class NotionEnforcer:
    @staticmethod
    def push_timetable(goal: str, tasks: list):
        """Generates a checklist timetable and catches the block IDs."""
        print(f"📡 Pushing Timetable to Notion HQ...")
        url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
        
        # Build the heading
        blocks = [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": f"🎯 Mission: {goal}"}}]
                }
            }
        ]
        
        # Build the checkboxes
        for task in tasks:
            blocks.append({
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"type": "text", "text": {"content": f"{task['task_name']} ({task['duration_hours']}h)"}}],
                    "checked": False
                }
            })
            
        payload = {"children": blocks}
        
        response = requests.patch(url, json=payload, headers=HEADERS)
        if response.status_code == 200:
            print("✅ Timetable successfully dropped into Notion!")
            
            # 🔥 Catch the block IDs from Notion's response!
            data = response.json()
            created_blocks = data.get("results", [])
            
            # Filter out the heading, keep only the checkboxes (to_do blocks)
            todo_ids = [b["id"] for b in created_blocks if b["type"] == "to_do"]
            
            # Attach the Notion IDs back to the tasks
            for i, task in enumerate(tasks):
                if i < len(todo_ids):
                    task['notion_page_id'] = todo_ids[i]
                    
            return tasks # Return tasks WITH their new Notion IDs
        else:
            print(f"🚨 Notion API Error: {response.text}")
            return tasks

    @staticmethod
    def mark_task_complete(block_id: str):
        """Targets a specific checkbox block in Notion and ticks it."""
        if not block_id:
            return False
            
        print(f"🎯 Ticking off Notion Checkbox: {block_id}")
        url = f"https://api.notion.com/v1/blocks/{block_id}"
        
        payload = {
            "to_do": {
                "checked": True
            }
        }
        
        response = requests.patch(url, json=payload, headers=HEADERS)
        if response.status_code == 200:
            print("✅ Notion Checkbox Marked as DONE!")
            return True
        else:
            print(f"🚨 Notion Sync Error: {response.text}")
            return False

    @staticmethod
    def log_wall_of_shame(task_name: str, reason: str):
        """Stamps a permanent red block on the Wall of Shame."""
        print(f"💀 Updating Wall of Shame...")
        url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
        
        payload = {
            "children": [
                {
                    "object": "block",
                    "type": "callout",
                    "callout": {
                        "rich_text": [
                            {"type": "text", "text": {"content": f"WALL OF SHAME 💀 | Failed to execute '{task_name}'. Excuse: {reason}"}}
                        ],
                        "icon": {"type": "emoji", "emoji": "🚨"},
                        "color": "red_background"
                    }
                }
            ]
        }
        
        response = requests.patch(url, json=payload, headers=HEADERS)
        if response.status_code == 200:
            print("💀 Failure permanently logged in Notion!")
            return True
        else:
            print(f"🚨 Notion API Error: {response.text}")
            return False

    # 🔥 THE DEMO FLEX: Notion Purge Engine 🔥
    @staticmethod
    def purge_completed_tasks():
        """Scans the Notion page and deletes all to_do blocks that are checked."""
        print("🧹 Initiating Notion Garbage Purge...")
        
        # Step 1: Fetch all blocks on the page
        url = f"https://api.notion.com/v1/blocks/{PAGE_ID}/children"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code != 200:
            print(f"🚨 Failed to read Notion page: {response.text}")
            return False

        blocks = response.json().get("results", [])
        
        # Step 2: Find all checked to_do blocks
        garbage_ids = []
        for block in blocks:
            if block.get("type") == "to_do":
                if block.get("to_do", {}).get("checked") == True:
                    garbage_ids.append(block["id"])

        print(f"🗑️ Found {len(garbage_ids)} completed tasks to purge.")

        # Step 3: Delete them one by one
        success_count = 0
        for block_id in garbage_ids:
            del_url = f"https://api.notion.com/v1/blocks/{block_id}"
            del_response = requests.delete(del_url, headers=HEADERS)
            if del_response.status_code == 200:
                success_count += 1

        print(f"✅ Successfully purged {success_count} garbage tasks from Notion.")
        return True

if __name__ == "__main__":
    print("=" * 40)
    print("⚡ TESTING NOTION BOT")
    print("=" * 40)
