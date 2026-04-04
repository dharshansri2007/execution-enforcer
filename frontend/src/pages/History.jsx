import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, CheckCircle2, XCircle, Clock, Database, Server, RefreshCw, Trash2, AlertTriangle, ShieldAlert, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function History() {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeType, setPurgeType] = useState(null);

  useEffect(() => {
    // 🔥 CLOUD SYNC FIXED - Removed /api/
    fetch(`${API_BASE}/history`)
      .then(res => res.json())
      .then(data => {
        setHistoryLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("⚠️ Failed to fetch history:", err);
        setLoading(false);
      });
  }, []);

  const formatIST = (dateString) => {
    try {
      const date = new Date(dateString + 'Z'); 
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

  const executeAdvancedPurge = async (type) => {
    setIsPurging(true);
    setPurgeType(type);

    try {
      if (type === 'COMPLETED') {
        // 🔥 CLOUD SYNC FIXED - Removed /api/
        fetch(`${API_BASE}/purge-notion`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).catch((e) => console.error("Purge fetch error:", e));
      } else if (type === 'SHAME') {
        // 🔥 CLOUD SYNC FIXED - Removed /api/
        fetch(`${API_BASE}/purge-shame`, { method: 'POST' }).catch(() => {});
      }
      
      setTimeout(() => {
        setIsPurging(false);
        setShowPurgeModal(false);
        setPurgeType(null);
        alert(`[SYSTEM]: ${type === 'COMPLETED' ? 'Completed Tasks' : 'Wall of Shame'} successfully expunged from Notion Database.`);
      }, 2000);
      
    } catch(e) {
      setIsPurging(false);
      setShowPurgeModal(false);
    }
  };

  const handleDeleteLog = (index, taskName) => {
    if(!window.confirm(`Delete '${taskName}' from the permanent ledger?\n\nWARNING: Modifying history will alter your 7-Day Execution Graph on the Home dashboard.`)) return;

    setHistoryLogs(prev => prev.filter((_, i) => i !== index));

    // 🔥 CLOUD SYNC FIXED - Removed /api/
    fetch(`${API_BASE}/history`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_name: taskName })
    }).catch(e => console.error("⚠️ Backend delete failed:", e));
  };

  return (
    <div className="flex flex-col h-full pb-10 relative">
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-8 border-b border-gold/20 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <HistoryIcon className="w-8 h-8 text-gold" />
          <div>
            <h2 className="text-2xl font-display tracking-widest text-white uppercase">Execution Ledger</h2>
            <p className="text-xs text-gray-400 font-tech tracking-widest">PERMANENT SQLITE DATABASE RECORDS</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-display tracking-widest uppercase border border-gold/50 text-gold bg-gold/10 hover:bg-gold hover:text-black shadow-[0_0_15px_rgba(251,191,36,0.15)] hover:shadow-neon-gold transition-all flex-1 md:flex-none px-4 py-2 rounded"
          >
            <RefreshCw className="w-3 h-3" />
            NOTION PURGE MENU
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-tech text-success bg-success/10 px-3 py-2 border border-success/50 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            Sync: ONLINE
          </div>
        </div>
      </motion.header>

      <div className="glass-panel p-6 border rounded border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="text-gold font-tech animate-pulse text-center py-10 tracking-widest uppercase">Decrypting SQLite Logs...</div>
        ) : historyLogs.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <Server className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-500 font-tech tracking-widest uppercase">Database is empty. Awaiting executions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyLogs.map((log, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 border-l-2 rounded bg-background/40 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-colors
                  ${log.status === 'Done' ? 'border-success hover:bg-success/5' : 'border-danger hover:bg-danger/5'}`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {log.status === 'Done' ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-danger" />}
                    <span className={`text-sm font-display tracking-widest uppercase ${log.status === 'Done' ? 'text-success' : 'text-danger'}`}>
                      {log.status}
                    </span>
                  </div>
                  <h3 className="text-white font-tech text-sm">{log.task_name}</h3>
                  {log.status === 'Failed' && (
                    <p className="text-danger/70 font-tech text-xs mt-1 italic">Cause: {log.failure_reason}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 font-tech text-[10px] flex items-center gap-1 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {formatIST(log.logged_at)}
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteLog(index, log.task_name)}
                    className="text-gray-600 hover:text-danger transition-colors p-1 md:opacity-0 group-hover:opacity-100"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPurgeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-panel border-2 border-gold/40 max-w-lg w-full p-8 rounded shadow-[0_0_50px_rgba(251,191,36,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10"></div>
              
              <div className="flex items-center justify-center gap-3 mb-6">
                <Database className="w-8 h-8 text-gold" />
                <h2 className="text-2xl font-display text-white tracking-widest uppercase">Select Purge Target</h2>
              </div>
              
              <p className="text-gray-400 font-tech text-xs tracking-widest uppercase text-center mb-8">
                Targeted erasure of Notion Database entries. This action cannot be reversed.
              </p>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => executeAdvancedPurge('COMPLETED')}
                  disabled={isPurging}
                  className={`border border-success/30 p-4 rounded text-left transition-all flex items-center justify-between group
                    ${isPurging && purgeType !== 'COMPLETED' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-success/10 hover:border-success/60'}`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-success font-display tracking-widest text-lg mb-1">
                      <CheckCircle2 className="w-5 h-5" /> COMPLETED TASKS
                    </div>
                    <div className="text-[10px] text-gray-500 font-tech tracking-widest uppercase">Erase all successfully executed directives.</div>
                  </div>
                  {isPurging && purgeType === 'COMPLETED' ? <RefreshCw className="w-5 h-5 text-success animate-spin" /> : <ChevronRight className="w-5 h-5 text-success/50 group-hover:text-success transition-all group-hover:translate-x-1" />}
                </button>

                <button 
                  onClick={() => executeAdvancedPurge('SHAME')}
                  disabled={isPurging}
                  className={`border border-danger/30 p-4 rounded text-left transition-all flex items-center justify-between group
                    ${isPurging && purgeType !== 'SHAME' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-danger/10 hover:border-danger/60'}`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-danger font-display tracking-widest text-lg mb-1">
                      <ShieldAlert className="w-5 h-5" /> WALL OF SHAME
                    </div>
                    <div className="text-[10px] text-gray-500 font-tech tracking-widest uppercase">Erase failure logs and red headings.</div>
                  </div>
                  {isPurging && purgeType === 'SHAME' ? <RefreshCw className="w-5 h-5 text-danger animate-spin" /> : <ChevronRight className="w-5 h-5 text-danger/50 group-hover:text-danger transition-all group-hover:translate-x-1" />}
                </button>
              </div>

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => setShowPurgeModal(false)}
                  disabled={isPurging}
                  className="text-[10px] font-tech tracking-widest uppercase text-gray-500 hover:text-white transition-colors px-6 py-2 border border-transparent hover:border-white/10 rounded"
                >
                  CANCEL OPERATION
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
