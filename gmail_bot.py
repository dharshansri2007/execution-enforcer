import os
import base64
import traceback
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# 🔥 THE FIX: Tell Python to stop crying about HTTP vs HTTPS
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailEnforcer:
    @staticmethod
    def authenticate():
        creds = None
        if os.path.exists('token_gmail.json'):
            creds = Credentials.from_authorized_user_file('token_gmail.json', SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists('credentials.json'):
                    raise FileNotFoundError("🚨 Missing credentials.json!")
                
                # Headless Bypass
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                flow.redirect_uri = 'http://localhost:8088/'
                
                auth_url, _ = flow.authorization_url(prompt='consent')
                
                print("\n" + "="*60)
                print("🚨 MANUAL OVERRIDE REQUIRED 🚨")
                print("1. Click this link to open Google Login:")
                print(f"\n{auth_url}\n")
                print("2. Log in as YOUR_EMAIL@gmail.com and grant permission.")
                print("3. Your browser will crash and say 'Hmmm... can't reach this page'. THIS IS PERFECT.")
                print("4. Copy the ENTIRE broken URL from your browser's address bar.")
                print("="*60 + "\n")
                
                response_url = input("👉 Paste that entire URL here and press Enter:\n").strip()
                
                flow.fetch_token(authorization_response=response_url)
                creds = flow.credentials
            
            with open('token_gmail.json', 'w') as token:
                token.write(creds.to_json())
                
        return creds

    @staticmethod
    def send_failure_alert(task_name: str, reason: str, to_email: str):
        print(f"📧 Preparing to send Wall of Shame email to {to_email}...")
        try:
            creds = GmailEnforcer.authenticate()
            service = build('gmail', 'v1', credentials=creds)

            message = EmailMessage()
            message.set_content(f"""🚨 EXECUTION FAILURE ALERT 🚨

Your accountability partner has failed a scheduled task.

Task: {task_name}
Excuse provided: {reason}

The system has automatically adapted their schedule to enforce compliance. Please ensure they do not fail again.

- Execution Enforcer System""")

            message['To'] = to_email
            message['From'] = "me"
            message['Subject'] = f"🚨 ALERT: Execution Failed - {task_name}"

            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {'raw': encoded_message}
            
            send_message = (service.users().messages().send(userId="me", body=create_message).execute())
            
            print(f"✅ Email successfully fired! Message ID: {send_message['id']}")
            return True
            
        except Exception as e:
            print(f"🚨 Gmail API Error:")
            print(traceback.format_exc())
            return False

# ==========================================
# 🚀 TEST FIRE
# ==========================================
if __name__ == "__main__":
    print("=" * 40)
    print("⚡ TESTING GMAIL ENFORCER BOT")
    print("=" * 40)
    
    # Put your test email here
    TARGET_EMAIL = os.getenv("DEMO_RECIPIENT_EMAIL")
    
    GmailEnforcer.send_failure_alert("Read Physics Chapter 3", "I was playing God of War", TARGET_EMAIL)
