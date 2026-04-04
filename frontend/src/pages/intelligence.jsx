import React, { useState, useEffect } from 'react';
import { Brain, Activity, Zap, AlertTriangle, Clock, BrainCircuit, BarChart3, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function Intelligence({ stats }) {
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert compliance string to a number for styling
  const complianceNum = parseInt(stats?.compliance_score || "100", 10);
  const isStruggling = complianceNum < 80;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      const [intRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/intelligence`),
        fetch(`${API_BASE}/history`)
      ]);
      setLogs(await intRes.json());
      setHistory(await histRes.json());
    } catch (error) {
      console.error("Failed to fetch intelligence data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🧮 REAL MATHEMATICAL PATTERN CALCULATOR (Using actual SQLite Timestamps)
  let mostProductive = "Awaiting Data";
  let primaryFailure = "Awaiting Data";
  let successRate = "0%";

  if (history && history.length > 0) {
    const doneHours = history.filter(h => h.status === 'Done').map(h => new Date(h.logged_at).getHours());
    const failHours = history.filter(h => h.status === 'Failed').map(h => new Date(h.logged_at).getHours());

    const getFrequentHour = (arr) => {
      if (!arr || !arr.length) return null;
      const counts = arr.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
      return parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
    };

    const formatWindow = (h) => {
      if (h === null || isNaN(h)) return "Insufficient Data";
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 || 12;
      const nextHr = (h + 2) % 12 || 12;
      const nextAmpm = ((h + 2) % 24) >= 12 ? 'PM' : 'AM';
      return `${hr}:00 ${ampm} - ${nextHr}:00 ${nextAmpm}`;
    };

    mostProductive = formatWindow(getFrequentHour(doneHours));
    primaryFailure = formatWindow(getFrequentHour(failHours));

    const totalDone = history.filter(h => h.status === 'Done').length;
    successRate = Math.round((totalDone / history.length) * 100) + "%";
  }

  return (
    <div className="flex flex-col h-full pb-10">
      
      {/* HEADER */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-8 border-b border-gold/20 pb-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-gold animate-pulse" />
          <div>
            <h2 className="text-2xl font-display tracking-widest text-white uppercase">Intelligence Logs</h2>
            <p className="text-xs text-gray-400 font-tech tracking-widest">BEHAVIORAL ANALYSIS & SYSTEM INSIGHTS</p>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
        
        {/* ========================================== */}
        {/* PANE 1: REAL AI ADAPTATION FEED (Left)     */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="xl:col-span-8 flex flex-col gap-6"
        >
          <div className="glass-panel p-0 border-2 border-cyan-500/20 bg-black/80 rounded relative overflow-hidden h-[600px] flex flex-col shadow-[0_0_25px_rgba(6,182,212,0.1)]">
            <div className="bg-cyan-500/10 border-b border-cyan-500/30 p-4 flex justify-between items-center">
              <h3 className="text-cyan-400 text-sm font-display tracking-widest uppercase flex items-center gap-2">
                <BrainCircuit className="w-4 h-4"/> AI Adaptation Engine
              </h3>
              <span className="text-[9px] border border-cyan-500/50 text-cyan-400 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">Live Database Sync</span>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-4 font-tech">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Activity className="w-8 h-8 text-cyan-500 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
                  <Activity className="w-8 h-8 text-cyan-500 mb-2" />
                  <div className="text-[10px] text-cyan-400 font-tech tracking-widest uppercase">No behavioral data generated yet.</div>
                  <div className="text-[9px] text-gray-500 mt-2 text-center max-w-xs">The Adaptation Engine activates only when a failure is detected in the Execution Zone.</div>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="border-l-2 border-cyan-500/50 pl-4 pb-4 border-b border-white/5 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-white font-display tracking-widest uppercase flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-cyan-500"/>
                        {log.task_name}
                      </span>
                      <span className="text-[9px] text-gray-500 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3"/>
                        {new Date(log.logged_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-100/70 italic mb-3">"{log.reasoning}"</p>
                    <div className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-400 inline-block px-2 py-1 rounded border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                      System Adjusted: {log.adjustment}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* ========================================== */}
        {/* PANE 2: MATHEMATICAL METRICS (Right)       */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="xl:col-span-4 flex flex-col gap-6"
        >
          {/* Real Session Patterns */}
          <div className="glass-panel p-6 border-white/10 rounded">
            <h3 className="text-sm font-display tracking-widest uppercase mb-6 text-gray-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold" /> Session Patterns
            </h3>
            
            <div className="space-y-5 font-tech text-xs">
              <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
                <span className="text-gray-500 uppercase tracking-widest text-[9px]">Most Productive Window</span>
                <span className="text-gold text-lg drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">{mostProductive}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
                <span className="text-gray-500 uppercase tracking-widest text-[9px]">Primary Failure Window</span>
                <span className="text-danger text-lg drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]">{primaryFailure}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 uppercase tracking-widest text-[9px]">Historical Success Rate</span>
                <span className="text-success text-2xl drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">{successRate}</span>
              </div>
            </div>
          </div>

          {/* Real Current Status Overview */}
          <div className={`glass-panel p-6 border rounded shadow-lg flex-grow flex flex-col ${isStruggling ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5'}`}>
            <h3 className={`text-sm font-display tracking-widest uppercase mb-4 flex items-center gap-2 ${isStruggling ? 'text-danger' : 'text-success'}`}>
              {isStruggling ? <ShieldAlert className="w-4 h-4" /> : <Target className="w-4 h-4" />}
              Current Operator Status
            </h3>
            
            <ul className="text-xs text-gray-300 font-tech space-y-4">
              <li className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                <span>Compliance Score</span>
                <span className={`font-bold ${isStruggling ? 'text-danger' : 'text-success'}`}>{stats?.compliance_score || "100%"}</span>
              </li>
              <li className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                <span>Total Failures</span>
                <span className="font-bold text-gray-400">{stats?.total_failures || 0}</span>
              </li>
              <li className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5">
                <span>Active Streak</span>
                <span className="font-bold text-gold">{stats?.streak || 0} Days</span>
              </li>
            </ul>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
