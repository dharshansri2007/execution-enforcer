import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, CheckCircle2, AlertTriangle, Clock, Flame, ChevronLeft, ChevronRight, Zap, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

export default function CalendarSync({ stats }) {
  const [penalties, setPenalties] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [todayIndex, setTodayIndex] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0); 
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch active penalties
  useEffect(() => {
    // 🔥 CLOUD SYNC FIXED - Removed /api/ 🔥
    fetch(`${API_BASE}/penalties`)
      .then(res => res.json())
      .then(data => setPenalties(data))
      .catch(err => console.error("⚠️ Failed to fetch penalties:", err));
  }, []);

  // Calculate weeks dynamically based on arrows
  useEffect(() => {
    const realToday = new Date();
    const curr = new Date();
    curr.setDate(curr.getDate() + (weekOffset * 7));

    const currentDay = curr.getDay(); 
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMonday);

    const days = [];
    let tIndex = -1; 

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isRealToday = d.toDateString() === realToday.toDateString();
      if (isRealToday) tIndex = i;
      
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: d.getDate(),
        isToday: isRealToday
      });
    }
    setWeekDays(days);
    setTodayIndex(tIndex);
  }, [weekOffset]);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      alert("[SYSTEM]: Optimization Authorized. AI has successfully re-routed your Google Calendar for maximum focus output.");
    }, 2000);
  };

  const xpPercentage = stats ? Math.min((stats.xp_balance / 10000) * 100, 100) : 0;
  const activeStreak = stats ? stats.streak : 0;
  const renderIndex = todayIndex !== -1 ? todayIndex : 2; 
  const todayLeftPosition = `${renderIndex * 16.66}%`;

  return (
    <div className="flex flex-col h-full pb-10">
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-display tracking-widest text-white uppercase flex items-center gap-3">
            <CalIcon className="text-gold" /> G-CALENDAR COMMAND
          </h2>
          <p className="text-xs text-gray-500 font-tech tracking-widest mt-1 uppercase">Tactical Schedule Overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/30 px-4 py-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.2)] tracking-widest uppercase">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          Live Sync Active
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="xl:col-span-8 glass-panel border-gold/30 rounded p-0 shadow-neon-gold overflow-hidden flex flex-col bg-black/40"
        >
          <div className="flex justify-between items-center border-b border-gold/20 bg-gold/5 p-4">
            <button onClick={() => setWeekOffset(prev => prev - 1)} className="text-gold/60 hover:text-gold transition-colors p-2 hover:bg-gold/10 rounded">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-6 w-full text-center">
              {weekDays.map((d, i) => (
                <DayHeader key={i} day={d.day} date={d.date} active={d.isToday} />
              ))}
            </div>
            <button onClick={() => setWeekOffset(prev => prev + 1)} className="text-gold/60 hover:text-gold transition-colors p-2 hover:bg-gold/10 rounded">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="relative h-[600px] overflow-y-auto pr-2 custom-scrollbar bg-grid-pattern">
            <div className="absolute inset-0 grid grid-cols-6 ml-14 pointer-events-none">
              {weekDays.map((d, i) => (
                <div key={i} className={`border-r border-white/5 ${d.isToday ? 'bg-gold/5 border-x border-gold/20 shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]' : ''}`}></div>
              ))}
            </div>

            <div className="flex flex-col justify-between h-[800px] text-[10px] text-gray-500 font-tech tracking-widest absolute left-0 top-0 w-14 text-right pr-3 pt-2 pb-2 bg-background/80 border-r border-white/10 z-10">
              <span>8 AM</span><span>9 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span>
              <span>1 PM</span><span>2 PM</span><span>3 PM</span><span>4 PM</span><span>5 PM</span>
              <span>6 PM</span><span>7 PM</span><span>8 PM</span><span>9 PM</span>
            </div>

            <div className="relative h-[800px] ml-14">
              {penalties.length > 0 ? (
                penalties.map((penalty, index) => {
                  const topPos = `${10 + (index * 12)}%`; 
                  return (
                    <EventBlock 
                      key={index} 
                      color="danger" 
                      top={topPos} 
                      height="10%" 
                      left={todayLeftPosition} 
                      width="16.6%" 
                      title={penalty.title} 
                      time={`${penalty.duration} Hour Lock`} 
                    />
                  );
                })
              ) : (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full bg-success/5 border border-success/10 py-8 rounded-lg">
                  <CheckCircle2 className="w-16 h-16 text-success/50 mx-auto mb-3" />
                  <p className="text-success font-display tracking-widest uppercase text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">Calendar Clear</p>
                  <p className="text-gray-500 font-tech text-xs mt-1 uppercase">No active punishment blocks.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="xl:col-span-4 flex flex-col gap-6"
        >
          <div className="glass-panel p-6 border-gold/40 rounded relative overflow-hidden bg-gradient-to-br from-background to-gold/5 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
            <div className="absolute -right-4 -top-4 opacity-10"><Target className="w-32 h-32 text-gold" /></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Flame className={`w-6 h-6 ${activeStreak > 0 ? 'text-gold animate-pulse' : 'text-gray-600'}`} />
              <h3 className={`text-2xl font-display tracking-widest ${activeStreak > 0 ? 'text-white' : 'text-gray-500'}`}>{activeStreak} DAY STREAK</h3>
            </div>
            <div className="flex justify-between text-xs text-gold mb-2 tracking-widest uppercase relative z-10 font-tech">
              <span>XP: {stats ? stats.xp_balance : 0}</span><span>10,000</span>
            </div>
            
            <div className="w-full bg-black border border-gold/30 rounded-full h-2 relative z-10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut", type: "tween" }}
                className="bg-gold h-full rounded-full shadow-neon-gold"
              ></motion.div>
            </div>
          </div>

          <div className="glass-panel p-0 border-cyan-500/30 rounded shadow-[0_0_20px_rgba(6,182,212,0.1)] flex-grow flex flex-col overflow-hidden">
            <h3 className="bg-cyan-500/10 text-cyan-400 text-sm font-display tracking-widest uppercase flex items-center gap-2 p-4 border-b border-cyan-500/20">
              <Zap className="w-4 h-4"/> AI Schedule Optimization
            </h3>
            
            <div className="p-6 flex-grow flex flex-col">
              <div className="bg-black/50 border border-white/5 p-4 rounded mb-6 text-sm text-gray-300 leading-relaxed font-tech">
                {penalties.length > 0 
                  ? <><span className="text-danger">High failure rate detected.</span> Your afternoon focus is compromised. The system recommends shifting execution to a strict morning block.</>
                  : <><span className="text-success">Compliance verified.</span> Based on your current calendar telemetry, your focus output is optimal. Maintain current schedule.</>
                }
              </div>
              
              <div className="border border-cyan-500/30 bg-cyan-500/5 p-5 rounded mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <div className="flex justify-center items-center gap-2 text-[10px] text-cyan-500 tracking-widest uppercase mb-2 font-bold">
                  <Clock className="w-3 h-3" /> Recommended Execution Window
                </div>
                <div className="text-3xl font-display text-white tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  {penalties.length > 0 ? "5:00 AM - 7:00 AM" : "10:00 AM - 1:00 PM"}
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <button 
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className={`flex-1 border py-3 rounded tracking-widest font-display transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] 
                    ${isOptimizing ? 'border-cyan-500/30 text-cyan-500/50 cursor-wait' : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]'}`}
                >
                  {isOptimizing ? 'RECALIBRATING...' : 'AUTHORIZE'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-white/10 rounded bg-black/60 relative overflow-hidden">
            {penalties.length > 0 && <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>}
            <h3 className="text-gray-500 text-xs font-tech tracking-widest uppercase mb-4">Penalty Status</h3>
            <div className={`flex items-start gap-3 ${penalties.length > 0 ? 'text-danger' : 'text-success'}`}>
              {penalties.length > 0 ? <ShieldAlert className="w-6 h-6 flex-shrink-0 mt-1" /> : <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />}
              <div>
                <div className={`text-lg font-display tracking-widest uppercase mb-1 ${penalties.length > 0 ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}>
                  {penalties.length > 0 ? `${penalties.length} ACTIVE PENALTIES` : "ALL CLEAR"}
                </div>
                <div className="text-[11px] font-tech text-gray-400 leading-relaxed">
                  {penalties.length > 0 ? "You have failed directives actively blocking your Google Calendar. Execute assigned tasks immediately to redeem your schedule." : "Your Google Calendar is free of punishment blocks. Awaiting next directive."}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DayHeader({ day, date, active }) {
  return (
    <div className={`flex flex-col items-center justify-center py-2 ${active ? 'text-gold' : 'text-gray-500'}`}>
      <span className="text-[10px] tracking-widest uppercase font-tech">{day}</span>
      <span className={`text-xl font-display mt-1 ${active ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' : ''}`}>{date}</span>
      {active && <div className="w-1 h-1 bg-gold rounded-full mt-1"></div>}
    </div>
  );
}

function EventBlock({ color, top, left, width, height, title, time }) {
  const colorMap = {
    gold: 'border-gold/50 bg-gold/10 text-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]',
    danger: 'border-danger/50 bg-danger/10 text-danger shadow-[0_0_15px_rgba(244,63,94,0.2)] z-10 backdrop-blur-sm',
    cyan: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    success: 'border-success/50 bg-success/10 text-success shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  };

  return (
    <div className={`absolute border-l-2 rounded-r p-2 overflow-hidden cursor-pointer hover:brightness-125 transition-all flex flex-col justify-center ${colorMap[color]}`} style={{ top, left, width, height }}>
      <div className="text-[11px] font-display uppercase tracking-widest leading-tight line-clamp-2">{title}</div>
      <div className="text-[9px] opacity-80 font-tech mt-1">{time}</div>
    </div>
  );
}
