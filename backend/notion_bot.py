import requests
import database 

class NotionEnforcer:

    @staticmethod
    def _get_creds_and_headers(uid: str):
        """ V2  AUTH: Dynamically fetches user-specific Notion keys from Firestore."""
        user_doc = database.db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise Exception(f"User {uid} not found in database.")
            
        user_data = user_doc.to_dict()
        
        # Pulls keys from the root document
        api_key = user_data.get("notion_api_key")
        page_id = user_data.get("notion_page_id")
        
        if not api_key or not page_id:
            raise Exception(f"User {uid} has not connected their Notion account.")
            
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28" 
        }
        return page_id, headers

    @staticmethod
    def push_timetable(uid: str, goal: str, tasks: list):
        """Generates a checklist timetable and catches the block IDs for a specific user."""
        try:
            page_id, headers = NotionEnforcer._get_creds_and_headers(uid)
        except Exception as e:
            print(f"🚨 Notion skipped: {e}")
            return tasks # Return unmodified tasks if Notion isn't connected

        print(f"📡 Pushing Timetable to {uid}'s Notion HQ...")
        url = f"https://api.notion.com/v1/blocks/{page_id}/children"
        
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
        
        response = requests.patch(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ Timetable successfully dropped into Notion!")
            
            
            data = response.json()
            created_blocks = data.get("results", [])
            
            # Filter out the heading, keep only the checkboxes (to_do blocks)
            todo_ids = [b["id"] for b in created_blocks if b["type"] == "to_do"]
            
            # Attach the Notion IDs back to the tasks
            for i, task in enumerate(tasks):
                if i < len(todo_ids):
                    task['notion_page_id'] = todo_ids[i]
                    
            return tasks 
        else:
            print(f"🚨 Notion API Error: {response.text}")
            return tasks

    @staticmethod
    def mark_task_complete(uid: str, block_id: str):
        """Targets a specific checkbox block in Notion and ticks it."""
        if not block_id:
            return False
            
        try:
            _, headers = NotionEnforcer._get_creds_and_headers(uid)
        except Exception as e:
            print(f"🚨 Notion skipped: {e}")
            return False

        print(f"🎯 Ticking off Notion Checkbox: {block_id}")
        url = f"https://api.notion.com/v1/blocks/{block_id}"
        
        payload = {
            "to_do": {
                "checked": True
            }
        }
        
        response = requests.patch(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ Notion Checkbox Marked as DONE!")
            return True
        else:
            print(f"🚨 Notion Sync Error: {response.text}")
            return False

    @staticmethod
    def log_wall_of_shame(uid: str, task_name: str, reason: str):
        """Stamps a permanent red block on the Wall of Shame."""
        try:
            page_id, headers = NotionEnforcer._get_creds_and_headers(uid)
        except Exception as e:
            print(f"🚨 Notion skipped: {e}")
            return False

        print(f"💀 Updating Wall of Shame for {uid}...")
        url = f"https://api.notion.com/v1/blocks/{page_id}/children"
        
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
        
        response = requests.patch(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("💀 Failure permanently logged in Notion!")
            return True
        else:
            print(f"🚨 Notion API Error: {response.text}")
            return False

    # Notion Purge 
    @staticmethod
    def purge_completed_tasks(uid: str):
        """Scans the user's Notion page and deletes all to_do blocks that are checked."""
        try:
            page_id, headers = NotionEnforcer._get_creds_and_headers(uid)
        except Exception as e:
            print(f"🚨 Notion skipped: {e}")
            return False

        print(f"🧹 Initiating Notion Garbage Purge for {uid}...")
        
        # Step 1: Fetch all blocks on the page
        url = f"https://api.notion.com/v1/blocks/{page_id}/children"
        response = requests.get(url, headers=headers)
        
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
            del_response = requests.delete(del_url, headers=headers)
            if del_response.status_code == 200:
                success_count += 1

        print(f"✅ Successfully purged {success_count} garbage tasks from Notion.")
        return True

if __name__ == "__main__":
    print("=" * 40)
    print("⚡ V2 NOTION BOT (Wired to Internal Keys)")
    print("=" * 40)