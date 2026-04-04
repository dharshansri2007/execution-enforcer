import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Shield, Clock, Lock, CheckCircle2, XCircle, Crosshair, AlertOctagon, Flame, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function Store({ stats }) {
  const [purchaseMsg, setPurchaseMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 🔥 THE REAL ECONOMY: Local state to instantly update the UI when XP is spent
  const [localXP, setLocalXP] = useState(0);

  // Sync with database stats on load
  useEffect(() => {
    if (stats) {
      setLocalXP(stats.xp_balance);
    }
  }, [stats]);

  // Calculate percentage for the XP bar (Max 10,000)
  const xpPercentage = Math.min((localXP / 10000) * 100, 100);

  // 🔥 DYNAMIC AI ANALYSIS based on real compliance score
  const complianceInt = stats && stats.compliance_score ? parseInt(stats.compliance_score.replace('%', '')) : 0;
  
  let aiMessage = "";
  if (complianceInt >= 80) {
    aiMessage = <><strong className="text-cyan-400">Optimal execution detected ({complianceInt}%).</strong> You have earned the right to spend your XP. A Double XP Boost is recommended to capitalize on your momentum.</>;
  } else if (complianceInt >= 50) {
    aiMessage = <><strong className="text-yellow-400">Mediocre execution detected ({complianceInt}%).</strong> Your focus is slipping. Purchasing a Focus Shield is highly recommended to prevent further calendar penalties.</>;
  } else {
    aiMessage = <><strong className="text-danger">CRITICAL FAILURE PATTERN ({complianceInt}%).</strong> You are actively sabotaging your goals. If you have the XP, buy a Penalty Skip immediately to salvage your schedule.</>;
  }

  const handlePurchase = async (itemName, cost) => {
    if (localXP >= cost) {
      setIsProcessing(true);
      try {
        // 🔥 FIRE THE REAL BACKEND TRANSACTION TO THE CLOUD FIXED - Removed /api/
        const res = await fetch(`${API_BASE}/spend-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cost: cost, item_name: itemName })
        });

        if (res.ok) {
          const data = await res.json();
          setLocalXP(data.new_balance); // Instant UI update
          setPurchaseMsg({ type: 'success', text: `PROTOCOL ACQUIRED: ${itemName}. XP Deducted.` });
        } else {
          setPurchaseMsg({ type: 'error', text: `TRANSACTION FAILED: Backend rejected the request.` });
        }
      } catch (err) {
        setPurchaseMsg({ type: 'error', text: `NETWORK ERROR: Could not connect to API.` });
      }
      setIsProcessing(false);
    } else {
      setPurchaseMsg({ type: 'error', text: `ACCESS DENIED: Insufficient XP for ${itemName}.` });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setPurchaseMsg(null), 3000);
  };

  return (
    <div className="flex flex-col h-full pb-10 relative">
      
      {/* HEADER SECTION */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-6 flex justify-between items-center border-b border-white/10 pb-4"
      >
        <h2 className="text-2xl md:text-3xl font-display tracking-widest text-white uppercase flex items-center gap-3">
          <ShoppingBag className="text-gold" /> REWARDS STORE
        </h2>
        <div className="flex items-center gap-2 text-gold font-tech text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
          <Flame className="w-5 h-5 animate-pulse" /> {localXP.toLocaleString()} XP
        </div>
      </motion.header>

      {/* POPUP MESSAGES */}
      <AnimatePresence>
        {purchaseMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded border flex items-center gap-3 font-tech text-sm tracking-widest uppercase shadow-lg
              ${purchaseMsg.type === 'success' ? 'bg-success/10 border-success/50 text-success shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 
                                                 'bg-danger/10 border-danger/50 text-danger shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
          >
            {purchaseMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {purchaseMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* PANE 1: THE INVENTORY (Left/Center)        */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="xl:col-span-8 flex flex-col gap-4"
        >
          <div className="glass-panel p-6 border-gold/20 rounded h-full">
            <h3 className="text-sm font-display text-gray-300 tracking-widest uppercase mb-6 flex items-center justify-between">
              Available Upgrades
              <span className="text-xs text-gray-500 font-tech">Balance: {localXP.toLocaleString()} XP</span>
            </h3>

            <div className="flex flex-col gap-4">
              <StoreItem 
                icon={<AlertOctagon className="w-6 h-6 text-danger" />}
                title="Skip Penalty"
                desc="Skip your next scheduled Penalty Session automatically."
                cost={1500}
                currentXP={localXP}
                theme="danger"
                isProcessing={isProcessing}
                onBuy={() => handlePurchase("Skip Penalty", 1500)}
              />
              <StoreItem 
                icon={<Zap className="w-6 h-6 text-gold" />}
                title="Double XP Boost"
                desc="Earn Double XP for all tasks completed in the next 24 hours."
                cost={3000}
                currentXP={localXP}
                theme="gold"
                isProcessing={isProcessing}
                onBuy={() => handlePurchase("Double XP Boost", 3000)}
              />
              <StoreItem 
                icon={<Shield className="w-6 h-6 text-cyan-400" />}
                title="Focus Shield"
                desc="Activate Focus Mode shield against digital distractions."
                cost={800}
                currentXP={localXP}
                theme="cyan"
                isProcessing={isProcessing}
                onBuy={() => handlePurchase("Focus Shield", 800)}
              />
            </div>
          </div>
        </motion.div>

        {/* ========================================== */}
        {/* PANE 2: OPERATOR STATS (Right Column)      */}
        {/* ========================================== */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="xl:col-span-4 flex flex-col gap-6"
        >
          {/* XP Panel */}
          <div className="glass-panel p-6 border-gold/40 shadow-neon-gold rounded relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <Flame className="text-gold w-5 h-5 animate-pulse" />
              <h3 className="font-display tracking-widest text-white uppercase">Operator Status</h3>
            </div>
            
            <div className="flex justify-between text-xs text-gold mb-2 tracking-widest uppercase items-end">
              <span className="text-3xl font-tech">{localXP.toLocaleString()}</span>
              <span>/ 10,000</span>
            </div>
            <div className="w-full bg-background border border-gold/20 rounded-full h-2 mb-4">
              <div className="bg-gold h-1.5 rounded-full shadow-[0_0_8px_#fbbf24] transition-all duration-1000" style={{ width: `${xpPercentage}%` }}></div>
            </div>
            <div className="text-center text-xs text-gray-300 uppercase tracking-widest border-t border-white/10 pt-3 flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-gold"/> Level 12 — Executioner
            </div>
          </div>

          {/* DYNAMIC AI Suggestion */}
          <div className="glass-panel p-6 border-cyan-500/30 bg-cyan-500/5 rounded shadow-[0_0_15px_rgba(6,182,212,0.05)] flex-grow">
            <h3 className="text-cyan-400 text-sm font-display tracking-widest uppercase flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-3">
              <BrainCircuit className="w-4 h-4"/> Behavioral Analysis
            </h3>
            <p className="text-xs text-cyan-100 leading-relaxed mb-4">
              {aiMessage}
            </p>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-success mt-auto">
              <CheckCircle2 className="w-3 h-3" /> Live Database Sync
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// Internal component for Store items
function StoreItem({ icon, title, desc, cost, theme, currentXP, onBuy, isProcessing }) {
  const canAfford = currentXP >= cost;

  const borderColors = {
    danger: 'border-danger/30 hover:border-danger/80 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    gold: 'border-gold/30 hover:border-gold/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    cyan: 'border-cyan-500/30 hover:border-cyan-500/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
  };

  return (
    <div className={`flex flex-col md:flex-row justify-between items-center gap-4 bg-background/50 border ${borderColors[theme]} p-4 rounded transition-all group`}>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="p-3 bg-white/5 rounded-full border border-white/10 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="text-white font-display tracking-widest text-lg">{title}</h4>
          <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full md:w-auto gap-6 md:border-l border-white/10 md:pl-6">
        <div className={`font-tech tracking-widest text-sm flex items-center gap-1 ${canAfford ? 'text-gold' : 'text-danger'}`}>
          <Zap className="w-3 h-3" /> {cost.toLocaleString()}
        </div>
        <button 
          onClick={onBuy}
          disabled={!canAfford || isProcessing}
          className={`px-6 py-2 rounded font-display tracking-widest uppercase transition-all shadow-lg text-sm flex items-center gap-2
            ${canAfford ? 
              'border border-white/20 text-gray-300 hover:bg-gold hover:text-background hover:border-gold' : 
              'bg-background border border-gray-700 text-gray-600 cursor-not-allowed'}`}
        >
          {canAfford ? 'Buy' : <Lock className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
