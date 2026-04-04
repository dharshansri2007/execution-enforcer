import json
import re
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

# Enterprise Engine Initialization
vertexai.init(project="execution-enforcer", location="us-central1")
model = GenerativeModel(model_name="gemini-2.5-pro")

# 🔥 FIX 2: Strict Generation Config to stop hallucinations
strict_config = GenerationConfig(temperature=0.3)

def extract_safe_json(text):
    """🔥 FIX 1: Safely extracts JSON from Markdown or chatty text."""
    match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
    if match:
        return match.group(0)
    raise ValueError("No JSON found in model output")

class OrchestratorAgent:
    """Agent 1: Breaks down chaotic goals with Difficulty Tags, Priority, and Predictive Risk."""
    
    @staticmethod
    def breakdown_goal(goal, user_context="No history available. New user."):
        prompt = f"""
        You are the Master Orchestrator Agent for an elite execution app. 
        Break down the user's goal into specific, actionable daily tasks.
        
        User Goal: {goal}
        User Context & History: {user_context}
        
        Based on their history, you MUST assign a difficulty rating, the optimal time of day to do it, and predict their risk of failing this task.
        
        🔥 STRICT RULES: DO NOT include explanations, comments, or markdown. ONLY JSON.
        
        Output ONLY a valid JSON list of objects. Each object must have exactly six keys:
        'task_name' (string, prepend the tag like [BRUTAL], [MEDIUM], or [EASY]),
        'duration_hours' (integer, realistic time to complete),
        'difficulty' (string: 'EASY', 'MEDIUM', or 'BRUTAL'),
        'priority' (string: 'CRITICAL', 'HIGH', 'STANDARD'),
        'optimal_time' (string: e.g., 'Morning', 'Afternoon', 'Late Night' based on history),
        'failure_risk' (string: 'HIGH', 'MEDIUM', 'LOW')
        """
        try:
            response = model.generate_content(prompt, generation_config=strict_config)
            cleaned_response = extract_safe_json(response.text)
            data = json.loads(cleaned_response)
            
            if not isinstance(data, list):
                raise ValueError("Invalid format: Expected a list")
                
            # 🔥 FIX 4: Validation Check
            required_keys = {"task_name", "duration_hours", "difficulty", "priority", "optimal_time", "failure_risk"}
            for item in data:
                if not required_keys.issubset(item.keys()):
                    raise ValueError(f"Missing keys in response. Found: {item.keys()}")
                    
            return data
            
        except Exception as e:
            print(f"🚨 Orchestrator Error: {e}")
            return [{"task_name": f"[BRUTAL] {goal}", "duration_hours": 2, "difficulty": "BRUTAL", "priority": "CRITICAL", "optimal_time": "Morning", "failure_risk": "HIGH"}]

class AdaptationAgent:
    """Agent 2: Evaluates excuses, detects patterns, and triggers Punishment Mode."""
    
    @staticmethod
    def adapt_on_failure(task_name, original_duration, failure_reason, recent_history="No recent failures recorded."):
        prompt = f"""
        You are the ruthless Execution Enforcer. The user failed to complete a task.
        
        Task: '{task_name}'
        Original Duration: {original_duration} hours.
        Excuse provided: '{failure_reason}'.
        Recent Failure History: {recent_history}
        
        FAILURE INTELLIGENCE PROTOCOL: Evaluate their excuse against their history.
        1. Pattern Detection: If they use the SAME excuse repeatedly, CALL THEM OUT on it.
        2. If the excuse is weak: Trigger PUNISHMENT MODE. INCREASE duration for their next attempt by 1 to 3 hours. Roast them brutally.
        3. If the excuse is legitimate: Be empathetic. Keep duration the same.
        
        🔥 STRICT RULES: DO NOT include explanations, comments, or markdown. ONLY JSON.
        
        Output ONLY a valid JSON object with EXACTLY two keys:
        'new_duration' (integer)
        'adaptation_note' (string, your strict roasting, calling out patterns if they exist)
        """
        try:
            response = model.generate_content(prompt, generation_config=strict_config)
            cleaned_response = extract_safe_json(response.text)
            data = json.loads(cleaned_response)
            
            if not isinstance(data, dict):
                raise ValueError("Invalid format: Expected a dict")
            
            # 🔥 FIX 5: Prevent the AI from going crazy and assigning 999 hours
            data["new_duration"] = min(max(1, data.get("new_duration", original_duration + 1)), 8)
            
            return data
            
        except Exception as e:
            print(f"🚨 Adaptation Error: {e}")
            return {
                "new_duration": min(original_duration + 1, 8), 
                "adaptation_note": "System error. Defaulting to Punishment Mode. Stop making excuses."
            }

# ==========================================
# 🚀 TEST FIRE
# ==========================================
if __name__ == "__main__":
    print("=" * 40)
    print("🧠 TESTING ORCHESTRATOR (Bulletproof Version)")
    print("=" * 40)
    fake_context = "User has a 40% compliance score. They constantly fail tasks scheduled after 8 PM due to fatigue."
    print(json.dumps(OrchestratorAgent.breakdown_goal("I need to study Applied Physics for 4 hours", fake_context), indent=2))
    
    print("\n" + "=" * 40)
    print("💀 TESTING ADAPTATION (Clamped & Validated)")
    print("=" * 40)
    fake_history = "- Failed 'Math' because 'I was playing God of War'\n- Failed 'Coding' because 'I was playing God of War'"
    print(json.dumps(AdaptationAgent.adapt_on_failure("Study Applied Physics", 4, "I was playing God of War again", fake_history), indent=2))
