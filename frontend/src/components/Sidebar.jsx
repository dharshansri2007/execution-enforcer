import React from 'react';
import { ShieldAlert, Home, Activity, History, Brain, Calendar, ShoppingBag, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <nav className="w-20 md:w-64 glass-panel border-r border-gold/20 flex flex-col h-screen z-10 sticky top-0 transition-all bg-background/90 backdrop-blur-md">
      <div className="p-4 md:p-6 border-b border-gold/10 flex items-center gap-3">
        <ShieldAlert className="text-gold w-10 h-10 shadow-neon-gold rounded-full flex-shrink-0" />
        <div className="hidden md:block">
          <h1 className="font-display text-xl tracking-widest text-white leading-tight">EXECUTION</h1>
          <p className="text-gold text-xs tracking-widest uppercase">Operator: SD</p>
        </div>
      </div>

      <div className="flex flex-col flex-grow py-6 px-2 md:px-4 gap-2 overflow-y-auto custom-scrollbar">
        <NavButton icon={<Home />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<Activity />} label="Ongoing Tasks" active={activeTab === 'ongoing'} onClick={() => setActiveTab('ongoing')} />
        
        <div className="my-4 border-t border-white/5"></div>
        
        <NavButton icon={<History />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavButton icon={<Brain />} label="Intelligence Logs" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} badge="BETA" />
        <NavButton icon={<Calendar />} label="G-Cal Sync" active={activeTab === 'gcal'} onClick={() => setActiveTab('gcal')} />
        <NavButton icon={<ShoppingBag />} label="Store" active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
      </div>
      
      <div className="mt-auto border-t border-gold/10 p-2 md:p-4 flex flex-col gap-2">
        <NavButton icon={<User />} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        
        {/* 🔥 THE NEON GLOWING SYSTEM CONFIG BUTTON */}
        <button 
          onClick={() => setActiveTab('config')}
          className={`flex justify-center md:justify-between items-center p-3 rounded transition-all group w-full text-left
            ${activeTab === 'config' 
              ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
              : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/5'}`}
        >
          <span className="hidden md:block text-xs font-display tracking-widest uppercase mt-0.5">System Config</span>
          <div className="relative flex-shrink-0">
            <Settings className={`w-5 h-5 ${activeTab === 'config' ? 'text-cyan-400 animate-spin-slow' : 'group-hover:text-cyan-400'}`} />
            {/* The Neon Pulse */}
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40 animate-pulse rounded-full pointer-events-none"></div>
          </div>
        </button>
      </div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick, highlight, badge }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center justify-center md:justify-start gap-3 p-3 rounded transition-all group w-full text-left 
        ${active ? 'bg-gold/10 text-gold border-l-2 border-gold shadow-[inset_4px_0_10px_rgba(251,191,36,0.1)]' : 'hover:bg-white/5 text-gray-500 hover:text-gray-300'} 
        ${highlight && !active ? 'border border-gold/30 text-gold hover:bg-gold/5' : ''}`}
    >
      {React.cloneElement(icon, { className: `w-5 h-5 flex-shrink-0 ${active ? 'drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]' : ''}` })}
      <span className="hidden md:block font-display tracking-widest text-sm uppercase mt-0.5">{label}</span>
      {badge && <span className="hidden md:block ml-auto text-[9px] border border-gold/50 text-gold px-1.5 rounded tracking-widest">{badge}</span>}
    </button>
  );
}
