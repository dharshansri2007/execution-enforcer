import React, { useState } from 'react';
import { Settings, Zap, Lock, Server, RefreshCw, AlertTriangle, CheckCircle2, Database, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function SystemConfig() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const handleReset = async () => {
    if (!window.confirm("⚠️ WARNING: This will wipe the SQLite database, clear all XP, and reset the simulation to factory defaults. Proceed?")) return;

    setIsResetting(true);
    try {
      // 🔥 CLOUD SYNC FIXED - Removed /api/
      await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
      
      setTimeout(() => {
        setIsResetting(false);
        setResetMessage("SYSTEM RESET SUCCESSFUL. ENVIRONMENT PURGED.");
        setTimeout(() => setResetMessage(null), 4000);
        setTimeout(() => window.location.reload(), 1000);
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col h-full pb-10">
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-8 border-b border-cyan-500/20 pb-4"
      >
        <h2 className="text-2xl md:text-3xl font-display tracking-widest text-white uppercase flex items-center gap-3">
          <Settings className="text-cyan-400 animate-spin-slow" /> SYSTEM CONFIGURATION
        </h2>
        <p className="text-xs text-gray-500 font-tech tracking-widest mt-1 uppercase">Runtime Control & Environment Architecture</p>
      </motion.header>

      <div className="max-w-4xl flex flex-col gap-8">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel p-6 border-cyan-500/30 rounded relative overflow-hidden"
        >
          <h3 className="text-sm font-display text-gray-300 tracking-widest uppercase mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" /> Execution Environment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-cyan-400 bg-cyan-400/5 p-5 rounded relative shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 bg-cyan-400 text-black text-[9px] font-bold px-2 py-1 rounded-bl uppercase tracking-widest">Active</div>
                <div className="flex items-center gap-2 text-cyan-400 font-display tracking-widest text-lg mb-2">
                  <Zap className="w-5 h-5 fill-cyan-400" /> DEMO MODE
                </div>
                <ul className="text-[10px] text-gray-400 font-tech uppercase tracking-widest space-y-2 mt-4">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-success"/> Stateless Architecture (Cloud Run)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-success"/> Auto-Reset on Container Spin-down</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-success"/> Secure Ephemeral Token Handling</li>
                </ul>
              </div>
              {/* 🔥 NEW STATELESS ALERT UI */}
              <div className="mt-6 text-[9px] text-gray-500 font-tech uppercase tracking-widest border border-white/10 bg-black/50 p-2 rounded flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-gold flex-shrink-0"/> 
                ⚠️ This environment is intentionally stateless for safe AI execution testing.
              </div>
            </div>

            <div className="border border-gray-800 bg-black/50 p-5 rounded relative opacity-60 grayscale flex flex-col justify-between">
              <div>
                <div className="absolute top-0 right-0 bg-gray-800 text-gray-400 text-[9px] font-bold px-2 py-1 rounded-bl uppercase tracking-widest flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </div>
                <div className="flex items-center gap-2 text-gray-400 font-display tracking-widest text-lg mb-2">
                  <Database className="w-5 h-5" /> PRODUCTION MODE
                </div>
                <ul className="text-[10px] text-gray-500 font-tech uppercase tracking-widest space-y-2 mt-4">
                  <li className="flex items-center gap-2">• Persistent Database (Firestore)</li>
                  <li className="flex items-center gap-2">• Google Secret Manager Auth</li>
                  <li className="flex items-center gap-2">• Multi-Tenant Scaling</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-0 border-white/10 rounded overflow-hidden"
        >
          <div className="bg-black/80 p-3 border-b border-white/10 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-tech text-gray-500 tracking-widest uppercase">System Status Monitor</span>
          </div>
          <div className="p-6 bg-black/95 font-mono text-[11px] md:text-xs leading-loose text-success/80">
            <div className="flex items-center gap-2"><span className="text-cyan-400">root@execution-enforcer:~$</span> systemctl status backend</div>
            <div>[  <span className="text-success">OK</span>  ] Cloud Run Container Instance: <span className="text-white">ACTIVE</span></div>
            <div>[ <span className="text-gold">WARN</span> ] Persistence Layer: <span className="text-gold">EPHEMERAL (SQLite Local)</span></div>
            {/* 🔥 NEW SANDBOXED TERMINAL LOG */}
            <div>[ <span className="text-cyan-400">INFO</span> ] Environment Type: <span className="text-white">SANDBOXED (Ephemeral Execution)</span></div>
            <div>[  <span className="text-success">OK</span>  ] MCP Tooling (GCal, Gmail, Notion): <span className="text-white">ONLINE</span></div>
            <div>[  <span className="text-success">OK</span>  ] AI Adaptation Engine: <span className="text-white">DEPLOYED</span></div>
            <div className="mt-4 text-gray-500"># System is running in safely isolated simulation mode.</div>
            <div className="text-gray-500"># Expected behavior: Database resets upon idle timeout.</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-panel p-6 border-danger/30 bg-danger/5 rounded"
        >
          <h3 className="text-sm font-display text-danger tracking-widest uppercase mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h3>
          <p className="text-xs text-gray-400 font-tech tracking-widest uppercase mb-6">
            Manually trigger the Ephemeral Reset. This purges all tasks, XP, and history. Useful for restarting a clean demo.
          </p>
          
          <button 
            onClick={handleReset}
            disabled={isResetting}
            className={`border border-danger/50 text-danger px-6 py-3 font-display tracking-widest uppercase rounded flex items-center gap-3 transition-all
              ${isResetting ? 'bg-danger/20 cursor-not-allowed' : 'hover:bg-danger hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]'}`}
          >
            <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'PURGING ENVIRONMENT...' : 'RESET SIMULATION ENVIRONMENT'}
          </button>

          <AnimatePresence>
            {resetMessage && (
              <motion.div 
                initial={{ opacity: 0, mt: 0, h: 0 }} animate={{ opacity: 1, mt: 16, h: 'auto' }} exit={{ opacity: 0 }}
                className="text-success font-tech text-xs tracking-widest uppercase bg-success/10 border border-success/30 p-3 rounded flex items-center gap-2 w-max"
              >
                <CheckCircle2 className="w-4 h-4" /> {resetMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
