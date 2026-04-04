import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Zap, CheckCircle2, XCircle, Clock, 
  BrainCircuit, Target, ChevronRight, AlertTriangle, ShieldAlert, Skull
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

// 🔥 DYNAMIC QUOTES ENGINE
const ENFORCER_QUOTES = [
  "Discipline is the weapon. Execution is the victory.",
  "Excuses are the nails used to build a house of failure.",
  "Action cures fear. Indecision creates it.",
  "The penalty of inaction is a compromised future.",
  "Execute the protocol. Feelings are irrelevant.",
  "Motivation is fragile. Routine is relentless."
];

export default function Tasks() {
  const [showFailureMode, setShowFailureMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(ENFORCER_QUOTES[0]);

  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const isFocusModeRef = useRef(isFocusMode);
  const activeTaskRef = useRef(null);

  useEffect(() => {
    isFocusModeRef.current = isFocusMode;
  }, [isFocusMode]);

  useEffect(() => {
    fetchTasks();
    setQuote(ENFORCER_QUOTES[Math.floor(Math.random() * ENFORCER_QUOTES.length)]);
  }, []);

  const fetchTasks = () => {
    // 🔥 CLOUD SYNC FIXED - Removed /api/
    fetch(`${API_BASE}/tasks`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("⚠️ Failed to fetch tasks:", err);
        setLoading(false);
      });
  };

  const activeTask = tasks.find(t => t.status === 'Pending');
  
  useEffect(() => {
    activeTaskRef.current = activeTask;
  }, [activeTask]);

  const parseTaskName = (name) => {
    if (!name) return { tag: 'TASK', cleanName: 'Unknown Target' };
    const match = name.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return { tag: match[1], cleanName: match[2] };
    }
    return { tag: 'TARGET', cleanName: name };
  };

  const handleCompliance = (taskId, isCompleted, manualReason = null) => {
    let reason = "No reason provided.";
    if (!isCompleted) {
      if (manualReason) {
        reason = manualReason; 
      } else {
        reason = prompt("💀 THREAT DETECTED. Enter your excuse for failing this directive:");
        if (reason === null) return;
      }
    }

    setShowFailureMode(false); 
    setIsFocusMode(false); 

    // 🔥 CLOUD SYNC FIXED - Removed /api/
    fetch(`${API_BASE}/check-compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: taskId,
        completed: isCompleted,
        failure_reason: reason
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(`[SYSTEM]: ${data.message}`);
      fetchTasks(); 
    })
    .catch(err => console.error("⚠️ Compliance check failed:", err));
  };

  // 🔥 THE DEAD MAN'S SWITCH 1: React Unmount (User clicks another UI tab)
  useEffect(() => {
    return () => {
      if (isFocusModeRef.current && activeTaskRef.current) {
        const payload = JSON.stringify({
          task_id: activeTaskRef.current.id,
          completed: false,
          failure_reason: "System detected user abandoned the terminal during Strict Mode."
        });
        const blob = new Blob([payload], { type: 'application/json' });
        // 🔥 CLOUD SYNC FIXED - Removed /api/
        navigator.sendBeacon(`${API_BASE}/check-compliance`, blob);
      }
    };
  }, []);

  // 🔥 THE DEAD MAN'S SWITCH 2: The Alt+F4 & Tab Close Exploit Fix
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFocusModeRef.current && activeTaskRef.current) {
        // Fire the un-killable beacon
        const payload = JSON.stringify({
          task_id: activeTaskRef.current.id,
          completed: false,
          failure_reason: "System detected user forcibly closed the browser during Strict Mode."
        });
        const blob = new Blob([payload], { type: 'application/json' });
        // 🔥 CLOUD SYNC FIXED - Removed /api/
        navigator.sendBeacon(`${API_BASE}/check-compliance`, blob);
        
        // This triggers the browser's native "Leave Site?" popup warning
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 🔥 TAB SWITCHING LISTENER
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocusModeRef.current && activeTaskRef.current) {
        setIsFocusMode(false);
        alert("💀 FATAL VIOLATION: TAB SWITCH DETECTED.\nFocus broken. Immediate penalty deployed.");
        handleCompliance(activeTaskRef.current.id, false, "System detected tab-switching/distraction during Strict Mode.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFocusMode]);

  // TIMER LOGIC
  useEffect(() => {
    let timer;
    if (isFocusMode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isFocusMode && timeLeft === 0) {
      setIsFocusMode(false);
      handleCompliance(activeTask.id, true);
    }
    return () => clearInterval(timer);
  }, [isFocusMode, timeLeft, activeTask]);

  const startFocusProtocol = () => {
    if (!activeTask) return;
    setShowFocusWarning(false);
    setIsFocusMode(true);
    setTimeLeft(activeTask.duration_hours * 3600); 
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full pb-10 relative">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6 border-b border-white/10 pb-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-display tracking-widest text-white uppercase flex items-center gap-3">
            <Activity className="text-gold" /> ONGOING TASKS
          </h2>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-1">Manage & track your daily execution</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANE 1: THE QUEUE (Greys out during Strict Mode) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className={`lg:col-span-3 flex flex-col gap-6 transition-all duration-500 ${isFocusMode ? 'opacity-40 pointer-events-none grayscale' : ''}`}
        >
          <div className="glass-panel p-4 rounded border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] h-[400px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs text-gray-500 tracking-widest uppercase mb-4 flex justify-between">
              My Tasks <span className="text-gold">{tasks.length}</span>
            </h3>
            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="text-gold font-tech animate-pulse text-xs">Fetching directives...</div>
              ) : tasks.length === 0 ? (
                <div className="text-gray-500 font-tech text-xs italic">No directives generated.</div>
              ) : (
                tasks.map((task) => {
                  const { tag, cleanName } = parseTaskName(task.task_name);
                  return (
                    <div key={task.id} className={`border p-3 rounded cursor-pointer relative overflow-hidden transition-all
                      ${task.status === 'Pending' ? 'border-gold/40 bg-gold/5 hover:border-gold' : 
                        task.status === 'Done' ? 'border-success/20 bg-success/5 opacity-70' : 
                        'border-danger/20 bg-danger/5 opacity-70'}`}>
                      <div className={`absolute left-0 top-0 w-1 h-full ${task.status === 'Pending' ? 'bg-gold' : task.status === 'Done' ? 'bg-success' : 'bg-danger'}`}></div>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] uppercase tracking-widest inline-block w-max px-1.5 py-0.5 rounded border ${task.status === 'Pending' ? 'border-gold/50 text-gold bg-gold/10' : task.status === 'Done' ? 'border-success/50 text-success bg-success/10' : 'border-danger/50 text-danger bg-danger/10'}`}>
                            {tag}
                          </span>
                          <span className={`text-xs font-tech tracking-wide ${task.status === 'Failed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                            {cleanName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* PANE 2: EXECUTION ZONE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          <div className="glass-panel border-cyan-500/20 bg-cyan-500/5 p-4 rounded text-center shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <p className="text-cyan-100 italic tracking-wide">"{quote}"</p>
            <p className="text-[10px] text-cyan-500 uppercase tracking-widest mt-2">— Execution Enforcer AI</p>
          </div>

          <div className={`glass-panel rounded p-8 relative overflow-hidden flex-grow flex flex-col transition-all duration-500
            ${isFocusMode ? 'border-danger shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-black scale-105 z-10' : 'border-gold/40 shadow-[0_0_30px_rgba(251,191,36,0.1)]'}`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isFocusMode ? 'from-danger/10 via-danger to-danger/10 animate-pulse' : 'from-gold/10 via-gold to-gold/10'}`}></div>
            
            {!activeTask ? (
               <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                 <CheckCircle2 className="w-16 h-16 mb-4 text-success opacity-50" />
                 <p className="font-display tracking-widest uppercase">All tasks cleared.</p>
               </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${isFocusMode ? 'bg-danger shadow-[0_0_8px_#ef4444]' : 'bg-gold shadow-[0_0_8px_#fbbf24]'}`}></div>
                      <span className={`text-[10px] border px-2 py-0.5 rounded uppercase tracking-widest ${isFocusMode ? 'border-danger/50 text-danger bg-danger/10' : 'border-gold/50 text-gold bg-gold/10'}`}>
                        {isFocusMode ? 'STRICT MODE ACTIVE' : 'ACTIVE TARGET'}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl text-white font-display tracking-widest drop-shadow-md leading-tight uppercase">
                      {parseTaskName(activeTask.task_name).cleanName}
                    </h2>
                  </div>
                </div>

                <div className={`my-8 py-8 rounded-lg text-center flex flex-col justify-center items-center transition-all
                  ${isFocusMode ? 'bg-black border border-danger/30 shadow-[inset_0_0_50px_rgba(239,68,68,0.05)]' : 'bg-background/50 border border-white/5'}`}>
                  <div className={`text-xs tracking-widest uppercase mb-4 flex items-center justify-center gap-2 ${isFocusMode ? 'text-danger' : 'text-gray-500'}`}>
                    <Clock className="w-4 h-4"/> Time Remaining
                  </div>
                  <div className={`text-6xl md:text-7xl font-tech ${isFocusMode ? 'text-danger drop-shadow-[0_0_25px_rgba(239,68,68,0.9)] animate-pulse' : 'text-gold drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]'}`}>
                    {isFocusMode ? formatTime(timeLeft) : `${activeTask.duration_hours}:00:00`}
                  </div>
                </div>

                <div className="mt-auto">
                  {!isFocusMode ? (
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => setShowFocusWarning(true)}
                        className="w-full bg-danger/20 border-2 border-danger text-danger py-5 rounded font-display tracking-widest text-xl hover:bg-danger hover:text-white transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] uppercase"
                      >
                        <Zap className="w-6 h-6"/> INITIATE STRICT MODE
                      </button>
                      
                      <div className="flex gap-4 mt-2">
                        <button onClick={() => handleCompliance(activeTask.id, true)} className="flex-1 border border-success/30 text-success bg-success/5 hover:bg-success hover:text-background py-2 rounded text-xs tracking-widest font-tech transition-all flex justify-center items-center gap-2 opacity-70 hover:opacity-100">
                          <CheckCircle2 className="w-4 h-4"/> MANUAL BYPASS (DONE)
                        </button>
                        <button onClick={() => setShowFailureMode(!showFailureMode)} className="flex-1 border border-danger/30 text-danger bg-danger/5 hover:bg-danger hover:text-white py-2 rounded text-xs tracking-widest font-tech transition-all flex justify-center items-center gap-2 opacity-70 hover:opacity-100">
                          <XCircle className="w-4 h-4"/> REPORT FAILURE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCompliance(activeTask.id, false, "Surrendered during Strict Mode")}
                      className="w-full bg-black border border-danger/50 text-gray-500 py-5 rounded font-display tracking-widest hover:bg-danger hover:text-white transition-all flex justify-center items-center gap-2"
                    >
                      <Skull className="w-5 h-5"/> SURRENDER AND ACCEPT CALENDAR PENALTY
                    </button>
                  )}
                </div>
              </>
            )}

            <AnimatePresence>
              {showFailureMode && activeTask && !isFocusMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="glass-panel border-danger border p-6 rounded shadow-[0_0_20px_rgba(244,63,94,0.15)] mt-4"
                >
                  <h3 className="text-danger tracking-widest uppercase flex items-center gap-2 mb-2 font-display text-lg">
                    <AlertTriangle className="w-5 h-5" /> Reason Required
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <FailureBtn label="YouTube" onClick={() => handleCompliance(activeTask.id, false, "Distracted by YouTube")} />
                    <FailureBtn label="Social Media" onClick={() => handleCompliance(activeTask.id, false, "Scrolling Social Media")} />
                    <FailureBtn label="Tired / Sleepy" onClick={() => handleCompliance(activeTask.id, false, "Burnout / Too tired")} />
                    <FailureBtn label="Lack of Focus" onClick={() => handleCompliance(activeTask.id, false, "Lost focus on the objective")} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* PANE 3: AI ENFORCER & RESTRICTED WALL OF SHAME (Greys out during Strict Mode) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className={`lg:col-span-3 flex flex-col gap-5 transition-all duration-500 ${isFocusMode ? 'opacity-40 pointer-events-none grayscale' : ''}`}
        >
          <div className="glass-panel p-0 border-2 border-danger/40 bg-black/80 rounded relative overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.15)] h-full flex flex-col">
            <div className="bg-danger/20 border-b border-danger/40 p-4 flex justify-between items-center">
              <h3 className="text-danger text-xs font-tech tracking-widest uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4"/> PENALTY LOGS
              </h3>
              <span className="text-[9px] bg-danger text-black font-bold px-2 py-0.5 rounded uppercase tracking-widest">Restricted</span>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar font-mono flex-grow">
              {tasks.filter(t => t.status === 'Failed').length > 0 ? (
                tasks.filter(t => t.status === 'Failed').map(task => {
                  const { cleanName } = parseTaskName(task.task_name);
                  return (
                    <div key={task.id} className="mb-5 border-l-2 border-danger pl-3 last:mb-0">
                      <div className="text-[10px] text-danger mb-1 uppercase tracking-wide">TARGET: {cleanName}</div>
                      <div className="text-[10px] text-gray-500 mb-3 bg-white/5 p-1.5 border border-white/5 rounded">CAUSE: {task.failure_reason}</div>
                      
                      <button 
                        disabled={isFocusMode}
                        onClick={() => {
                          if (isFocusMode) return;
                          if(window.confirm("Initiate Redemption Protocol? This will mark the task complete and clear your calendar penalty.")) {
                            handleCompliance(task.id, true);
                          }
                        }}
                        className={`w-full text-[9px] px-2 py-1.5 rounded tracking-widest transition-all flex items-center justify-center gap-1
                          ${isFocusMode 
                            ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' 
                            : 'bg-success/10 text-success border border-success/30 hover:bg-success hover:text-black'}`}
                      >
                        <Zap className="w-3 h-3" /> REDEEM
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
                  <ShieldAlert className="w-10 h-10 text-success mb-2" />
                  <div className="text-[10px] text-success tracking-widest uppercase">Logs Clear. No Violations.</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      <AnimatePresence>
        {showFocusWarning && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-panel border-2 border-danger max-w-lg w-full p-8 rounded shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-danger animate-pulse"></div>

              <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4" />

              <h2 className="text-3xl font-display text-white tracking-widest uppercase mb-2">Point of No Return</h2>

              <p className="text-danger font-tech text-sm tracking-widest uppercase mb-6">Strict Mode Engagement</p>

              <div className="bg-danger/10 border border-danger/30 p-4 rounded text-left mb-8">
                <ul className="text-gray-300 font-tech text-sm space-y-3">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-danger flex-shrink-0" />
                    <div>Timer will lock for {activeTask?.duration_hours} hour(s).</div>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-danger flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white">STAY ON THIS EXACT SCREEN.</span> Switching browser tabs OR clicking other menu tabs (like Home or History) will instantly fail the task.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-danger flex-shrink-0" />
                    <div>A penalty will be immediately dispatched to Google Calendar upon failure.</div>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowFocusWarning(false)}
                  className="flex-1 border border-gray-600 text-gray-400 py-3 rounded font-display tracking-widest hover:bg-gray-800 transition-colors"
                >
                  ABORT
                </button>
                <button 
                  onClick={startFocusProtocol}
                  className="flex-1 bg-danger text-white py-3 rounded font-display tracking-widest hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
                >
                  PROCEED
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FailureBtn({ label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="bg-danger/10 border border-danger/30 text-danger/80 py-2 rounded text-[10px] tracking-widest font-tech uppercase hover:bg-danger hover:text-white transition-colors"
    >
      {label}
    </button>
  );
}
