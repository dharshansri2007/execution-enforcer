import React, { useState, useEffect } from 'react';
import { Flame, Activity, CheckSquare, PlusCircle, AlertTriangle, Zap, BookOpen, Wrench, User, Briefcase, Loader, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function Home({ stats }) {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 🔥 DYNAMIC LOADING TEXT STATE
  const loadingPhrases = ["DISPATCHING...", "VERTEX AI THINKING...", "STRUCTURING PLAN...", "ALMOST THERE..."];
  const [loadingText, setLoadingText] = useState(loadingPhrases[0]);
  
  // 🔥 NEW DIRECTIVE FORM STATE
  const [directiveType, setDirectiveType] = useState('Study'); 
  const [formData, setFormData] = useState({
    subject: '',
    syllabus: 'Anna University R2025 - CSE AI ML',
    difficulty: 'Medium',
    duration: 2,
    reference: '',
    skillName: '',
    level: 'Beginner',
    taskName: '',
    ticketId: '',
    priority: 'Standard'
  });

  useEffect(() => {
    fetchTasks();
    fetchHistory();
  }, []);

  // 🔥 THE ROTATING TEXT ENGINE
  useEffect(() => {
    let interval;
    if (isGenerating) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingPhrases.length;
        setLoadingText(loadingPhrases[i]);
      }, 2000); 
    } else {
      setLoadingText(loadingPhrases[0]);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const fetchTasks = async () => {
    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      const res = await fetch(`${API_BASE}/tasks`);
      setTasks(await res.json());
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchHistory = async () => {
    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      const res = await fetch(`${API_BASE}/history`);
      setHistory(await res.json());
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleAddDirective = async () => {
    if (directiveType === 'Study' && !formData.subject) return alert("Subject required.");
    if (directiveType === 'Skill' && !formData.skillName) return alert("Skill name required.");
    if (directiveType === 'Personal' && !formData.taskName) return alert("Task name required.");
    if (directiveType === 'IT Sprint' && !formData.ticketId) return alert("Ticket ID/Description required.");

    setIsGenerating(true);
    
    let structuredGoal = "";
    if (directiveType === 'Study') {
      structuredGoal = `[STUDY MODE] Subject: ${formData.subject}. Syllabus Context: ${formData.syllabus}. Target Difficulty: ${formData.difficulty}. Total Time: ${formData.duration} hours. Reference Material: ${formData.reference || 'None provided'}.`;
    } else if (directiveType === 'Skill') {
      structuredGoal = `[SKILL MODE] Target Skill: ${formData.skillName}. Current Level: ${formData.level}. Total Time: ${formData.duration} hours.`;
    } else if (directiveType === 'Personal') {
      structuredGoal = `[PERSONAL MODE] Task: ${formData.taskName}. Duration: ${formData.duration} hours. (Bypass AI Breakdown, direct save).`;
    } else if (directiveType === 'IT Sprint') {
      structuredGoal = `[ENTERPRISE MODE] Jira Ticket / Workflow: ${formData.ticketId}. Priority Level: ${formData.priority}. Allocated Sprint Time: ${formData.duration} hours.`;
    }

    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      await fetch(`${API_BASE}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: structuredGoal })
      });
      
      setFormData(prev => ({...prev, subject: '', skillName: '', taskName: '', ticketId: ''}));
      fetchTasks();
    } catch (err) {
      console.error("Failed to generate plan", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      await fetch(`${API_BASE}/check-compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, completed: true })
      });
      window.location.reload(); 
    } catch (err) {
      console.error("Failed to complete task", err);
    }
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    let weekStats = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      weekStats.push({ 
        day: days[d.getDay()], 
        dateStr: d.toDateString(), 
        done: 0, 
        failed: 0,
        heightDone: 0,
        heightFail: 0
      });
    }

    history.forEach(log => {
      const logDate = new Date(log.logged_at).toDateString();
      const targetDay = weekStats.find(w => w.dateStr === logDate);
      if (targetDay) {
        if (log.status === 'Done') targetDay.done += 1;
        if (log.status === 'Failed') targetDay.failed += 1;
      }
    });

    const maxTasksInOneDay = Math.max(...weekStats.map(w => w.done + w.failed), 1);
    weekStats = weekStats.map(w => ({
      ...w,
      heightDone: (w.done / maxTasksInOneDay) * 100,
      heightFail: (w.failed / maxTasksInOneDay) * 100
    }));

    return weekStats;
  };

  const weeklyChart = getWeeklyData();

  return (
    <div className="flex flex-col h-full pb-10">
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gold/20 pb-4 gap-4"
      >
        <h2 className="text-2xl md:text-3xl font-display tracking-widest text-white uppercase">
          Welcome, Sir. <span className="text-gold">Director!</span>
        </h2>
        <div className="flex text-[10px] md:text-xs tracking-widest uppercase text-gray-500 gap-4 bg-background/50 px-4 py-2 border border-white/5 rounded">
          <span>XP Earned: <span className="text-gold font-bold">{stats?.xp_balance || 0}</span></span>
          <span className="border-l border-white/10 pl-4">Failures: <span className="text-danger font-bold">{stats?.total_failures || 0}</span></span>
          <span className="border-l border-white/10 pl-4">Compliance: <span className="text-cyan-400 font-bold">{stats?.compliance_score || "100%"}</span></span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-6 border-gold/40 shadow-neon-gold rounded relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-gold w-6 h-6 animate-pulse" />
              <h3 className="text-sm text-gray-300 font-display tracking-widest uppercase">New Execution Directive</h3>
            </div>

            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded border border-white/5">
              {['Study', 'Skill', 'Personal', 'IT Sprint'].map(type => (
                <button 
                  key={type}
                  onClick={() => setDirectiveType(type)}
                  className={`flex-1 py-2 text-xs tracking-widest uppercase font-display rounded transition-all flex justify-center items-center gap-2
                    ${directiveType === type ? 'bg-gold/20 text-gold border border-gold/50 shadow-[0_0_10px_rgba(251,191,36,0.2)]' : 'text-gray-500 hover:text-white'}`}
                >
                  {type === 'Study' && <BookOpen className="w-3 h-3"/>}
                  {type === 'Skill' && <Wrench className="w-3 h-3"/>}
                  {type === 'Personal' && <User className="w-3 h-3"/>}
                  {type === 'IT Sprint' && <Briefcase className="w-3 h-3 text-cyan-400"/>}
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-4 font-tech text-sm">
              {directiveType === 'Study' && (
                <AnimatePresence>
                  <motion.div initial={{ opacity:0, h:0 }} animate={{ opacity:1, h:'auto' }} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Subject / Topic</label>
                      <input type="text" placeholder="e.g., Semiconductor Physics" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white focus:border-gold outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block text-gold/70">Context Boundary (Syllabus Lock)</label>
                      <input type="text" value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="w-full bg-gold/5 border border-gold/20 p-2 rounded text-gold/80 outline-none font-mono text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
                      <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white outline-none">
                        <option>Easy</option><option>Medium</option><option>Brutal</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Duration (Hours)</label>
                      <input type="number" min="0.5" max="8" step="0.5" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white outline-none" />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {directiveType === 'IT Sprint' && (
                <AnimatePresence>
                  <motion.div initial={{ opacity:0, h:0 }} animate={{ opacity:1, h:'auto' }} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs text-cyan-500 mb-1 block">Ticket ID / Objective</label>
                      <input type="text" placeholder="e.g., ENG-402: Refactor Payment Gateway" value={formData.ticketId} onChange={e => setFormData({...formData, ticketId: e.target.value})} className="w-full bg-cyan-900/10 border border-cyan-500/30 p-2 rounded text-cyan-100 focus:border-cyan-400 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white outline-none">
                        <option>Standard</option><option>High</option><option className="text-danger">Critical P0</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Allocated Sprint Hours</label>
                      <input type="number" min="1" max="12" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white outline-none" />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {(directiveType === 'Skill' || directiveType === 'Personal') && (
                <AnimatePresence>
                  <motion.div initial={{ opacity:0, h:0 }} animate={{ opacity:1, h:'auto' }} className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Target Name</label>
                      <input type="text" placeholder="What are we doing?" value={directiveType === 'Skill' ? formData.skillName : formData.taskName} onChange={e => setFormData(directiveType === 'Skill' ? {...formData, skillName: e.target.value} : {...formData, taskName: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white focus:border-gold outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Duration (Hours)</label>
                      <input type="number" min="0.5" max="8" step="0.5" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-background/50 border border-white/10 p-2 rounded text-white outline-none" />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

            </div>

            <div className="mt-6 flex justify-end">
               <button 
                onClick={handleAddDirective}
                disabled={isGenerating}
                className={`border border-gold text-gold hover:bg-gold hover:text-background px-8 py-3 font-display text-lg tracking-widest rounded transition-all flex items-center gap-2
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_15px_rgba(251,191,36,0.15)] hover:shadow-neon-gold'}
                  ${directiveType === 'IT Sprint' ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]' : ''}`}
              >
                {isGenerating ? <><Loader className="w-5 h-5 animate-spin" /> {loadingText}</> : 'EXECUTE DIRECTIVE'}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-6 border-gold/20 rounded flex-grow"
          >
            <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-4">
              <h3 className="text-sm text-gray-400 tracking-widest uppercase flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-gold" /> Active Protocol: {tasks.length} Tasks
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8 font-tech text-sm tracking-widest uppercase">
                  No active directives. Awaiting command.
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onComplete={handleCompleteTask} />
                ))
              )}
            </div>
          </motion.div>

        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-6 border-gold/30 rounded relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <Flame className="text-danger w-6 h-6 animate-pulse" />
              <h3 className="text-xl font-display text-white tracking-widest">{stats?.streak || 0} DAY STREAK</h3>
            </div>
            <div className="flex justify-between text-xs text-gold mb-2 tracking-widest uppercase font-tech">
              <span>XP: {stats?.xp_balance || 0}</span><span>10,000</span>
            </div>
            
            <div className="w-full bg-black/50 border border-gold/30 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((stats?.xp_balance || 0) / 10000) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut", type: "tween" }}
                className="bg-gold h-full rounded-full shadow-[0_0_12px_#fbbf24]"
              ></motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-6 border-white/10 rounded relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-display text-gray-300 tracking-widest uppercase flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold" /> Execution Pattern
              </h3>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 border border-white/10 px-2 py-1 rounded">Past 7 Days</span>
            </div>

            <div className="flex items-end justify-between h-[120px] gap-2 border-b border-white/10 pb-2">
              {weeklyChart.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full group relative">
                  <div className="absolute -top-8 bg-black border border-white/10 text-[9px] font-tech text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                    <span className="text-success">{stat.done} Done</span> / <span className="text-danger">{stat.failed} Fail</span>
                  </div>
                  
                  <div className="w-full flex flex-col justify-end h-[100px] gap-0.5">
                    {stat.heightFail > 0 && <div className="w-full bg-danger/80 rounded-t-sm" style={{ height: `${stat.heightFail}%` }}></div>}
                    {stat.heightDone > 0 && <div className="w-full bg-success/80 rounded-t-sm" style={{ height: `${stat.heightDone}%` }}></div>}
                    {stat.heightFail === 0 && stat.heightDone === 0 && <div className="w-full bg-white/5 h-1 rounded-sm"></div>}
                  </div>
                  <span className="text-[10px] text-gray-500 font-tech uppercase">{stat.day}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-tech tracking-widest uppercase">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-success/80 rounded-sm"></div> Successful</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-danger/80 rounded-sm"></div> Failed</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-6 border-danger/40 bg-danger/5 rounded relative overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.05)]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-danger w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-display text-danger tracking-widest uppercase">Threat Level</h3>
            </div>
            <h2 className="text-3xl text-white font-bold tracking-widest mb-2 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">ELEVATED</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Failure to complete active protocol will result in severe digital roasting and Calendar penalties.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onComplete }) {
  const isDone = task.status === 'Done';
  const isFailed = task.status === 'Failed';
  
  return (
    <div className={`flex items-center justify-between p-3 border rounded transition-all group
      ${isDone ? 'border-success/30 bg-success/5' : isFailed ? 'border-danger/30 bg-danger/5' : 'border-white/5 bg-background/50 hover:border-gold/30'}
    `}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => !isDone && !isFailed && onComplete(task.id)}
          disabled={isDone || isFailed}
          className={`${isDone || isFailed ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <CheckSquare className={`w-5 h-5 ${isDone ? 'text-success' : isFailed ? 'text-danger' : 'text-gray-600 group-hover:text-gold'} transition-colors`} />
        </button>
        <span className={`text-sm tracking-wide ${isDone ? 'text-success line-through' : isFailed ? 'text-danger line-through' : 'text-gray-300'}`}>
          {task.task_name}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs font-tech">
        <span className={isDone ? 'text-success' : isFailed ? 'text-danger' : 'text-gray-500'}>{task.duration_hours} hr</span>
        <span className="w-20 text-right uppercase tracking-widest text-[10px] text-gray-500">{task.status}</span>
      </div>
    </div>
  );
}
