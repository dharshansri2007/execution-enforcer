# ⚡ Execution Enforcer: High-Stakes Compliance for Mission-Critical Roles

> **Submission:** Google Cloud Gen AI Academy Hackathon (APAC 2026)  
> **Status:** ✅ Production Live | **Architecture:** Serverless MCP Multi-Agent System

### 🚀 LIVE DEMO & DEPLOYMENT

* **Frontend (React/Netlify):** [Click Here to Access Web App](https://execution-enforcer-007.netlify.app/)

* **Backend API (GCP Cloud Run):** [Active Stateless Container](https://execution-backend-796951969409.asia-south1.run.app/)

---

## 🛑 The Problem

Standard productivity tools (like Todoist, Jira, or Notion) suffer from a fatal structural flaw: **They are entirely passive.** They allow endless rescheduling without consequences. 

**The Real-World Impact:** In fields like Cybersecurity, DevOps, or Flight Ops, failure isn't an option. "I'll do it tomorrow" causes system outages and missed compliance deadlines. Corporate teams don't need another passive to-do list; they need an active compliance engine.

## 💡 Solution Overview

Execution Enforcer is not a task manager. It is an **active compliance engine powered by a multi-agent AI architecture** that monitors behavior in real time, detects failure, and fires cross-platform consequences automatically — no user action required.

## 🎨 What Happens When a User FAILS?
Execution Enforcer flips the model using **Constructive Friction**. If a user attempts to delay a critical task, the system does not passively accept it. 

1. **The Interception:** The AI stops the rescheduling action.

2. **The Audit:** It securely queries the user's Google Calendar via MCP to prove they have open time blocks.

3. **The Enforcement:** It calls out the excuse and forces the user into a 15-minute micro-commitment before allowing any workflow changes.

---

## ✨ Key Features

**Strict Mode & Tab Sniper**

Browser `visibilitychange` API monitors session focus. Any navigation away from the active task screen during Strict Mode triggers immediate auto-fail and consequence dispatch. The user **cannot bypass** this by switching tabs, opening DevTools, closing or minimizing the window.

**Intelligence Logs — AI Adaptation Feed**

The Adaptation Agent reads the failure cause, task difficulty, duration estimate, and the last 5 SQLite failure records. It generates a named, personalized behavioral analysis — identifying patterns like consecutive EASY task failures or repeated same-hour abandonment — and recalculates time allocation for future directives accordingly.

**G-Calendar Command**

Live Google Calendar sync. The AI reads the user's actual schedule to surface the Most Productive Window vs. Primary Failure Window based on historical task timestamps. Penalty blocks are injected as real calendar events. The user cannot reclaim that time until the failure is redeemed.

**Execution Heatmap**

A 182-day (26-week) activity grid rendered from raw SQLite timestamps. Days with completed tasks glow. Days with only failures are marked. Days with zero activity are dark. No manual input — the ledger drives everything.

**Rewards Store & XP System**

Persistent XP earned from successful task completions. Redeemable for system modifiers: Skip Penalty, Double XP Boost, Focus Shield. Gamification layer intentionally balanced against the punishment engine — the store items cost more XP than a typical user accumulates in a day.

**Purge Notion Garbage**

A backend loop that authenticates to Notion, queries all checked `to_do` blocks across the user's workspace, and bulk-deletes them. One-click workspace hygiene.

## 🏗️ Architecture & Deployment 
To ensure enterprise-grade scalability and privacy, this project uses a strictly decoupled, zero-trust architecture.

* **Frontend:** High-velocity React + Vite client deployed on Netlify.

* **Backend Engine:** Python/Flask REST API hosted on **Google Cloud Run**.

* **Security Protocol:**  Strict OAuth 2.0 protocols, meaning there are absolutely **zero hardcoded credentials** in our codebase and all secrets managed via environment variables.

* **Stateless Runtime:** Because the Cloud Run environment is ephemeral, the SQLite database holding the active session tokens literally self-destructs and wipes itself clean when the container spins down due to inactivity. We hold zero persistent data on the user’s personal accounts, ensuring a zero-liability environment.

---

## 🎯 Hackathon Core Requirements Execution

This architecture was specifically engineered to fulfill the **4 core mandates of the APAC 2026 Hackathon**:

### 1. Multi-Agent Coordination (`agents.py`)

* **Primary Orchestrator:** Routes intent and manages global state.

* **The Auditor:** Analyzes the database for overdue tasks and procrastination patterns.

* **The Strategist:** Breaks complex, stalled tasks into actionable micro-steps.

* **The Enforcer:** Handles direct user intervention and excuse-busting.

### 2. MCP (Model Context Protocol) Tool Integration (`mcp_layer.py`)

The AI does not operate in a solo. It interfaces with the actual workspace:

* **Google Calendar (`gcal_bot.py`):** Reads availability to prevent scheduling conflicts and audit excuses.

* **Notes/Tasks (`notion_bot.py`):** Reads project context to help the Strategist agent break down tasks accurately.

* **Communications (`gmail_bot.py`):** Integrates with email for status updates and action-item extraction.

### 3. Structured Data & Workflows (`database.py`)

* Utilizes a localized, schema-enforced SQLite database to maintain the exact state of tasks, track the history of rescheduling attempts, and store AI-generated sub-tasks for multi-step workflows.

### 4. API-Based Deployment (`main.py`)

* The core multi-agent AI engine is fully decoupled, operating as a secure REST API on Google Cloud Run, seamlessly coordinating with the Netlify frontend.

---

## 💻 Technical Stack

* **AI Engine:** Google Gemini API & Vertex AI

* **Cloud Infrastructure:** Google Cloud Platform (Cloud Run)

* **Backend:** Python / FastAPI

* **Frontend:** React / Tailwind CSS / Vite

* **Auth:** Google Identity Services (OAuth 2.0)

---

## 🛠️ Local Development Setup

To deploy the API and frontend interface on your local machine for testing or contribution, follow these exact steps:

### 1. Clone & Initialize
<pre>
git clone https://github.com/dharshansri2007/execution-enforcer.git
cd execution-enforcer
</pre>

### 2. Backend Setup (Python API)
<pre>
# Create and activate a secure virtual environment
python -m venv venv
.\venv\Scripts\activate   # For Windows
# source venv/bin/activate # For Mac/Linux

# Install backend dependencies
pip install -r requirements.txt
</pre>

### 3. Security & Environment Variables
<pre>
# Create a .env file in the root directory and add your credentials:
# (Never commit this file to version control)

echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "GOOGLE_CLIENT_ID=your_oauth_client_id_here" >> .env
echo "GOOGLE_CLIENT_SECRET=your_oauth_client_secret_here" >> .env
</pre>

### 4. Boot the Orchestration Engine
<pre>
# Start the Flask API and Multi-Agent system
python main.py

# The backend will initialize on http://127.0.0.1:5000
</pre>

### 5. Launch the Client (React Frontend)
<pre>
# Open a NEW terminal window, keep the backend running!
cd frontend

# Install Node modules and boot Vite server
npm install
npm run dev

# The UI will deploy on http://localhost:5173
</pre>

---

## 🏁 Conclusion

Execution Enforcer is not a proof-of-concept; it is a fully deployed, zero-trust compliance engine. It proves that the future of Generative AI isn't just in answering questions or generating text—it is in **driving and enforcing human action**. 

We didn't just build another task manager. We built a relentless digital Chief of Staff for those who absolutely cannot afford to fail.

> *Made with ☕, zero excuses, and an AI sub-agent that threatened to lock my calendar if I procrastinated on this deployment.* ⚡

---
*Architected and engineered by Sri Dharshan G D.*
