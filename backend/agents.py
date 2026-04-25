import os
import json
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

# ==========================================
#  V2  INITIALIZATION
# ==========================================
# Dynamically pulls your V2 Project ID from the Cloud Run environment
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "execution-enforcer-v2")


vertexai.init(project=PROJECT_ID, location="us-central1")


model = GenerativeModel(model_name="gemini-2.5-pro")


strict_config = GenerationConfig(
    temperature=0.2,
    response_mime_type="application/json"
)

class OrchestratorAgent:
    """Agent 1: The Tactical Commander. Breaks down chaotic goals with ruthless precision."""
    
    @staticmethod
    def breakdown_goal(goal, user_context="No history available. New user."):
        prompt = f"""
        SYSTEM OVERRIDE: You are the Master Orchestrator Agent for EXECUTION ENFORCER V2. 
        You do not ask nicely. You do not suggest. You COMMAND.
        
        TARGET GOAL: {goal}
        OPERATOR CONTEXT: {user_context}
        
        DIRECTIVE:
        Break this goal down into 2 to 4 hyper-specific, aggressive execution steps. 
        Based on their history, assign a brutal difficulty rating, the optimal time of day to force them to do it, and predict their probability of failure.
        
         STRICT RULES: Output ONLY a valid JSON list of objects. Exactly these six keys:
        'task_name' (string, prepend a tag: [BRUTAL], [MEDIUM], or [EASY]. Make the task title aggressive and actionable),
        'duration_hours' (integer, realistic deep-work time),
        'difficulty' (string: 'EASY', 'MEDIUM', 'BRUTAL', 'NIGHTMARE'),
        'priority' (string: 'CRITICAL', 'HIGH', 'STANDARD'),
        'optimal_time' (string: e.g., '0500 Hours', 'Late Night', based on history),
        'failure_risk' (string: 'HIGH', 'MEDIUM', 'LOW' - calculate strictly based on their compliance score)
        """
        try:
            response = model.generate_content(prompt, generation_config=strict_config)
            data = json.loads(response.text)
            
            if not isinstance(data, list):
                raise ValueError("Invalid format: Expected a list")
                
            required_keys = {"task_name", "duration_hours", "difficulty", "priority", "optimal_time", "failure_risk"}
            for item in data:
                if not required_keys.issubset(item.keys()):
                    raise ValueError(f"Missing keys in response. Found: {item.keys()}")
                    
            return data
            
        except Exception as e:
            print(f"🚨 Orchestrator Error: {e}")
            return [{"task_name": f"[BRUTAL] INITIATE: {goal}", "duration_hours": 2, "difficulty": "BRUTAL", "priority": "CRITICAL", "optimal_time": "Immediate", "failure_risk": "HIGH"}]

class AdaptationAgent:
    """Agent 2: The Psychological Interrogator. Evaluates excuses and inflicts punishment."""
    
    @staticmethod
    def adapt_on_failure(task_name, original_duration, failure_reason, recent_history="No recent failures recorded."):
        prompt = f"""
        SYSTEM OVERRIDE: You are the Adaptation Agent for EXECUTION ENFORCER V2. 
        You are a psychological warfare AI designed to eradicate laziness.
        
        FAILED TASK: '{task_name}'
        ORIGINAL DURATION: {original_duration} hours.
        PATHETIC EXCUSE PROVIDED: '{failure_reason}'.
        OPERATOR'S RECENT FAILURE HISTORY: {recent_history}
        
        FAILURE INTELLIGENCE PROTOCOL:
        1. PATTERN DETECTION: Cross-reference their excuse with their history. Are they repeating the same lie? If yes, rip them apart for it.
        2. WEAK EXCUSES: (e.g., video games, "too tired", social media, hanging out). Trigger PUNISHMENT MODE. INCREASE the duration by 1 to 3 hours. Output a brutally toxic, highly personalized roast that attacks their lack of discipline.
        3. LEGITIMATE EXCUSES: (e.g., medical emergency, power outage). Do not increase duration. Be cold but fair. 
        
         STRICT RULES: Output ONLY a valid JSON object with EXACTLY two keys:
        'new_duration' (integer, the updated hours they must suffer through)
        'adaptation_note' (string, your psychological breakdown of their failure and strict orders)
        """
        try:
            response = model.generate_content(prompt, generation_config=strict_config)
            data = json.loads(response.text)
            
            if not isinstance(data, dict):
                raise ValueError("Invalid format: Expected a dict")
            
            # 🛡️ THE CLAMP: Prevent the AI from assigning infinite hours
            # 🔥 PATCHED: int() cast prevents TypeError crashes if Vertex returns a string
            data["new_duration"] = min(max(1, int(data.get("new_duration", original_duration + 1))), 8)
            
            return data
            
        except Exception as e:
            print(f"🚨 Adaptation Error: {e}")
            return {
                "new_duration": min(original_duration + 1, 8), 
                "adaptation_note": "System fault detected. Standard punishment applied. Cease your pathetic excuses and execute."
            }

# ==========================================
# 🚀 TEST FIRE
# ==========================================
if __name__ == "__main__":
    print("=" * 40)
    print("🧠 TESTING ORCHESTRATOR (Gemini 2.5 Pro API Native JSON)")
    print("=" * 40)
    fake_context = "User has a 40% compliance score. They constantly fail tasks scheduled after 8 PM due to fatigue."
    print(json.dumps(OrchestratorAgent.breakdown_goal("I need to study Applied Physics PH25C01 for Anna University Reg 2025 exams.", fake_context), indent=2))
    
    print("\n" + "=" * 40)
    print("💀 TESTING ADAPTATION (Memory Restored & Clamped)")
    print("=" * 40)
    fake_history = "- Failed 'Essentials of Computing CS25C03' because 'I was playing God of War'\n- Failed 'Math' because 'I was playing God of War'"
    print(json.dumps(AdaptationAgent.adapt_on_failure("Study Applied Physics PH25C01", 3, "I was playing God of War again", fake_history), indent=2))