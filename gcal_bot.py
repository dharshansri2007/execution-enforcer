import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Scope required to read and edit your calendar
SCOPES = ['https://www.googleapis.com/auth/calendar.events']
TIMEZONE = 'Asia/Kolkata'

# 🔥 THE TIMEZONE LOCK: Forces Cloud Shell to use IST natively
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

class GCalEnforcer:
    
    @staticmethod
    def get_service():
        """Handles authentication safely using your existing token."""
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                print("\n" + "="*50)
                print("🚨 SYSTEM ALERT: Authenticating Google Calendar...")
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES, redirect_uri='http://localhost:8080'
                )
                auth_url, _ = flow.authorization_url(prompt='consent')
                
                print(f"🔗 CLICK HERE: {auth_url}")
                print("="*50 + "\n")
                
                auth_response = input("👉 Paste the FULL redirected URL here (the one that says 'Hmmm... can't reach this page'): ")
                
                flow.fetch_token(authorization_response=auth_response.strip())
                creds = flow.credentials
                
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
                
        return build('calendar', 'v3', credentials=creds)

    @staticmethod
    def clear_todays_schedule():
        """ANTI-SPAM FIX: Sweeps and deletes existing Enforcer tasks before adding new ones."""
        try:
            service = GCalEnforcer.get_service()
            now = datetime.datetime.now(datetime.timezone.utc)
            time_min = now.isoformat()
            time_max = (now + datetime.timedelta(days=1)).isoformat()
            
            events_result = service.events().list(
                calendarId='primary', timeMin=time_min, timeMax=time_max, singleEvents=True
            ).execute()
            events = events_result.get('items', [])
            
            for event in events:
                if "🤖 Automated by Execution Enforcer" in event.get('description', ''):
                    service.events().delete(calendarId='primary', eventId=event['id']).execute()
        except Exception as e:
            print(f"⚠️ Calendar Sweep Failed: {e}")

    @staticmethod
    def push_schedule(tasks):
        """Injects a clean, sequential list of tasks into the calendar."""
        GCalEnforcer.clear_todays_schedule()
        service = GCalEnforcer.get_service()
        
        start_time = datetime.datetime.now(IST)
        
        for t in tasks:
            task_name = t.get("task_name", "Unknown Task")
            duration = int(t.get("duration_hours", 1))
            end_time = start_time + datetime.timedelta(hours=duration)
            
            event = {
                'summary': f"🎯 {task_name}",
                'description': '🤖 Automated by Execution Enforcer. Execute immediately.',
                'start': {'dateTime': start_time.isoformat(), 'timeZone': TIMEZONE},
                'end': {'dateTime': end_time.isoformat(), 'timeZone': TIMEZONE},
                'colorId': '5'
            }
            service.events().insert(calendarId='primary', body=event).execute()
            start_time = end_time 

    @staticmethod
    def add_penalty_block(task_name, duration_hours):
        """🔥 THE SEQUENTIAL STACKING ENGINE V2 (Index-Lag Proof)"""
        try:
            service = GCalEnforcer.get_service()
            now_ist = datetime.datetime.now(IST)
            
            # Default start time: Tomorrow, rounded down to the clean hour in IST
            start_time = (now_ist + datetime.timedelta(days=1)).replace(minute=0, second=0, microsecond=0)
            
            # Fetch ALL events in the next 3 days to bypass Google Search Index lag
            time_min = now_ist.isoformat()
            time_max = (now_ist + datetime.timedelta(days=3)).isoformat()
            
            events_result = service.events().list(
                calendarId='primary', timeMin=time_min, timeMax=time_max, singleEvents=True, orderBy='startTime'
            ).execute()
            events = events_result.get('items', [])
            
            # Manually filter and find the absolute latest end time
            for event in events:
                if "PENALTY" in event.get('summary', '') and "Execution Enforcer" in event.get('description', ''):
                    end_str = event['end'].get('dateTime')
                    if end_str:
                        try:
                            event_end = datetime.datetime.fromisoformat(end_str)
                            if event_end > start_time:
                                start_time = event_end
                        except Exception:
                            pass
            
            end_time = start_time + datetime.timedelta(hours=duration_hours)
            
            event = {
                'summary': f"🚨 PENALTY: {task_name}",
                'description': '🤖 Automated by Execution Enforcer. You failed this. Redemption required.',
                'start': {'dateTime': start_time.isoformat(), 'timeZone': TIMEZONE},
                'end': {'dateTime': end_time.isoformat(), 'timeZone': TIMEZONE},
                'colorId': '11'
            }
            service.events().insert(calendarId='primary', body=event).execute()
            print(f"💀 PENALTY BLOCK deployed to G-Cal sequentially at {start_time.strftime('%I:%M %p')}")
        except Exception as e:
            print(f"⚠️ Failed to add penalty block: {e}")

    @staticmethod
    def redeem_penalty(task_name):
        """THE REDEMPTION ARC"""
        try:
            service = GCalEnforcer.get_service()
            now = datetime.datetime.now(datetime.timezone.utc)
            time_min = now.isoformat()
            time_max = (now + datetime.timedelta(days=7)).isoformat()
            
            # Bypassing Search Lag here too
            events_result = service.events().list(
                calendarId='primary', timeMin=time_min, timeMax=time_max, singleEvents=True
            ).execute()
            events = events_result.get('items', [])
            
            for event in events:
                if f"PENALTY: {task_name}" in event.get('summary', '') and "Execution Enforcer" in event.get('description', ''):
                    service.events().delete(calendarId='primary', eventId=event['id']).execute()
                    print(f"🕊️ REDEMPTION: Removed penalty block for - {task_name}")
        except Exception as e:
            print(f"⚠️ Failed to redeem penalty: {e}")
