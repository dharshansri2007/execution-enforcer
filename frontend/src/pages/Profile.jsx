import React, { useState, useEffect } from 'react';
import { User, Shield, Flame, Zap, Terminal, Edit2, Check, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function Profile({ stats }) {
  const [isEditing, setIsEditing] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  
  // 🔥 PERSISTENT STATE (Survives Refresh)
  const [operatorName, setOperatorName] = useState("SRI DHARSHAN");
  const [battleStation, setBattleStation] = useState("Porur HQ");
  const [defaultSyllabus, setDefaultSyllabus] = useState("Anna University R2025 - CSE AI ML");

  // Load from local storage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('operatorName');
    const savedStation = localStorage.getItem('battleStation');
    const savedSyllabus = localStorage.getItem('globalSyllabus');
    
    if (savedName) setOperatorName(savedName);
    if (savedStation) setBattleStation(savedStation);
    if (savedSyllabus) setDefaultSyllabus(savedSyllabus);

    fetchHistoryLogs();
  }, []);

  const fetchHistoryLogs = async () => {
    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      const res = await fetch(`${API_BASE}/history`);
      const data = await res.json();
      setHistoryLogs(data);
    } catch (err) {
      console.error("Failed to fetch history logs", err);
    }
  };

  // 🔥 SAVE TO STORAGE
  const handleSaveProfile = () => {
    localStorage.setItem('operatorName', operatorName);
    localStorage.setItem('battleStation', battleStation);
    localStorage.setItem('globalSyllabus', defaultSyllabus);
    setIsEditing(false);
    
    // Dispatch a custom event so Home.jsx knows the syllabus changed globally
    window.dispatchEvent(new Event('syllabusUpdated'));
  };

  // 📊 THE REAL HEATMAP LOGIC (Last 182 Days / 26 Weeks)
  const generateHeatmap = () => {
    const today = new Date();
    const days = [];
    const historyMap = {};

    // Map the database dates to counts
    historyLogs.forEach(log => {
      if (log.status === 'Done') {
        const dateStr = new Date(log.logged_at).toLocaleDateString('en-CA'); // Standard YYYY-MM-DD
        historyMap[dateStr] = (historyMap[dateStr] || 0) + 1;
      }
    });

    // Build the grid array (from 181 days ago to today)
    for (let i = 181; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const count = historyMap[dateStr] || 0;
      days.push({ date: dateStr, count });
    }
    return days;
  };

  const heatmapData = generateHeatmap();

  return (
    <div className="flex flex-col h-full pb-10">
      
      {/* HEADER SECTION */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3 bg-gold/10 border border-gold/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.1)]">
          <User className="text-gold w-5 h-5" />
          <span className="font-display tracking-widest text-gold uppercase text-sm mt-1">Operator Profile</span>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
          System Status: <span className="text-success flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success animate-pulse"></div> Optimal</span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* PANE 1: IDENTITY & HEATMAP                 */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="xl:col-span-8 flex flex-col gap-6"
        >
          {/* Identity Card */}
          <div className="glass-panel p-6 border-gold/40 shadow-neon-gold rounded relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10"></div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar Placeholder */}
              <div className="w-24 h-24 rounded border-2 border-gold/50 bg-background flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)] overflow-hidden flex-shrink-0">
                <User className="w-12 h-12 text-gold/50" />
              </div>
              
              <div className="flex-1 w-full text-center md:text-left relative">
                
                {/* 🔥 The Edit/Save Button */}
                <button 
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gold transition-colors z-10"
                >
                  {isEditing ? <Check className="w-6 h-6 text-success animate-pulse" /> : <Edit2 className="w-4 h-4" />}
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pr-10">
                  <div className="w-full">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        className="bg-background border border-gold text-2xl font-display text-white tracking-widest p-2 rounded focus:outline-none mb-1 w-full max-w-sm"
                      />
                    ) : (
                      <h2 className="text-3xl font-display text-white tracking-widest">{operatorName}</h2>
                    )}
                    <p className="text-gold text-sm font-tech">@operator_alpha</p>
                  </div>
                  <div className="border border-gold/30 bg-gold/10 text-gold px-3 py-1 rounded flex items-center gap-2 text-xs uppercase tracking-widest whitespace-nowrap mt-2 md:mt-0">
                    <Shield className="w-3 h-3" /> Execution OS Admin
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
                  {/* Location & Station */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Terminal className="w-4 h-4 text-gold flex-shrink-0" />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={battleStation}
                        onChange={(e) => setBattleStation(e.target.value)}
                        className="bg-background border border-white/20 text-white p-1 rounded focus:outline-none focus:border-gold w-full"
                        placeholder="Location / Station Name"
                      />
                    ) : (
                      <span>{battleStation}</span>
                    )}
                  </div>
                  
                  {/* Global Syllabus Link */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={defaultSyllabus}
                        onChange={(e) => setDefaultSyllabus(e.target.value)}
                        className="bg-background border border-cyan-500/50 text-cyan-100 p-1 rounded focus:outline-none focus:border-cyan-400 w-full font-tech text-xs"
                        placeholder="Global Syllabus Config"
                      />
                    ) : (
                      <span className="font-tech text-xs text-cyan-400 truncate max-w-[200px]" title={defaultSyllabus}>Config: {defaultSyllabus}</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 🔥 RESTORED REAL CODECHEF/GITHUB HEATMAP */}
          <div className="glass-panel p-6 border-white/10 rounded bg-background/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-display text-gray-300 tracking-widest uppercase">Execution Heatmap</h3>
              <span className="text-[9px] border border-white/10 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">Last 182 Days</span>
            </div>
            
            <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex flex-col justify-between h-[100px] text-[9px] text-gray-600 uppercase tracking-widest py-1">
                <span>Mon</span><span>Wed</span><span>Fri</span>
              </div>
              
              {/* grid-flow-col makes it flow top-to-bottom, left-to-right perfectly */}
              <div className="grid grid-rows-7 grid-flow-col gap-1 flex-grow min-w-max h-[100px]">
                {heatmapData.map((day, i) => {
                  let colorClass = 'bg-white/5 hover:border hover:border-white/50'; // Blank / Zero tasks
                  if (day.count === 1) colorClass = 'bg-success/40 hover:border hover:border-white'; // Light Green
                  if (day.count >= 2) colorClass = 'bg-success shadow-[0_0_5px_rgba(16,185,129,0.8)] hover:border hover:border-white'; // Dark Green Glow

                  return (
                    <div 
                      key={i} 
                      className={`w-[11px] h-[11px] rounded-sm ${colorClass} transition-all cursor-pointer relative group`} 
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black border border-white/20 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                        {day.count} Executions on {day.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 text-[9px] uppercase tracking-widest text-gray-500 mt-2 items-center font-tech">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-white/5"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-success/40"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-success shadow-[0_0_3px_rgba(16,185,129,0.8)]"></div>
              <span>More</span>
            </div>
          </div>

        </motion.div>

        {/* ========================================== */}
        {/* PANE 2: GAMIFICATION (Right Column)        */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="xl:col-span-4 flex flex-col gap-6"
        >
          {/* Gamification Stats */}
          <div className="glass-panel p-6 border-gold/30 rounded relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="text-danger w-6 h-6 animate-pulse" />
              <h3 className="text-xl font-display text-white tracking-widest">{stats?.streak || 0} DAY STREAK</h3>
            </div>
            
            <div className="flex justify-between text-xs text-gold mb-2 tracking-widest uppercase items-end mt-6">
              <span className="text-4xl font-tech drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">{stats?.xp_balance || 0}</span>
              <span>XP EARNED</span>
            </div>
            <div className="w-full bg-background border border-gold/20 rounded-full h-2 mb-4">
              <div className="bg-gold h-1.5 rounded-full shadow-neon-gold" style={{ width: `${Math.min(((stats?.xp_balance || 0) / 10000) * 100, 100)}%` }}></div>
            </div>
            <div className="text-center text-xs text-gray-400 uppercase tracking-widest border-t border-white/10 pt-4 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-gold"/> Level 12 — Executioner
            </div>
          </div>

          {/* AI Insights Summary */}
          <div className="glass-panel p-6 border-cyan-500/20 bg-cyan-500/5 rounded">
            <h3 className="text-cyan-400 text-sm font-display tracking-widest uppercase flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4"/> Execution Analytics
            </h3>
            <p className="text-xs text-cyan-100 mb-4 leading-relaxed">Operator <span className="font-bold">{operatorName}</span>, global pattern analysis complete:</p>
            <ul className="text-xs text-cyan-200/70 space-y-4">
              <li className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                <span className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div> Compliance Score</span>
                <span className="font-tech text-cyan-400">{stats?.compliance_score || "100%"}</span>
              </li>
              <li className="flex justify-between items-center border-b border-cyan-500/10 pb-2">
                <span className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-danger shadow-[0_0_5px_#ef4444]"></div> System Failures</span>
                <span className="font-tech text-danger">{stats?.total_failures || 0}</span>
              </li>
              <li className="flex justify-between items-center pb-1">
                <span className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_5px_#fbbf24]"></div> Current Directive Lock</span>
                <span className="font-tech text-gold text-[10px] truncate max-w-[100px]">{defaultSyllabus}</span>
              </li>
            </ul>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
