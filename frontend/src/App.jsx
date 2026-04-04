import React, { useState, useEffect } from 'react'; 
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import CalendarSync from './pages/Calendar';
import Profile from './pages/Profile';
import Store from './pages/Store';
import Intelligence from './pages/intelligence'; 
import History from './pages/History'; 
import SystemConfig from './pages/SystemConfig'; 

// 🔥 THE LIVE CLOUD CONNECTION 🔥
const API_BASE = "https://execution-backend-796951969409.asia-south1.run.app";

function App() {
  const [activeTab, setActiveTab] = useState("home"); 

  const [stats, setStats] = useState({
    compliance_score: "100%",
    streak: 0,
    total_failures: 0,
    xp_balance: 0 
  });

  useEffect(() => {
    // 🔥 CLOUD SYNC FIXED - Removed /api/ and attached API_BASE
    fetch(`${API_BASE}/score`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          console.log("🔥 REAL DB STATS LOADED:", data); 
          setStats(data);
        }
      })
      .catch(err => console.error("⚠️ Backend disconnected.", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#03040a] bg-tech-grid text-gray-300 font-tech flex overflow-hidden selection:bg-gold selection:text-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-screen overflow-y-auto relative p-4 md:p-6">
        <div className="absolute top-0 left-0 w-full h-full ambient-glow pointer-events-none -z-10"></div>
        
        {/* Master Router */}
        {activeTab === 'home' && <Home stats={stats} />}
        {activeTab === 'ongoing' && <Tasks />}
        
        {/* 🔥 FIXED: Combined into one clean route */}
        {activeTab === 'history' && <History />} 
        
        {activeTab === 'intelligence' && <Intelligence stats={stats} />}
        {activeTab === 'gcal' && <CalendarSync stats={stats} />}
        {activeTab === 'profile' && <Profile stats={stats} />}
        {activeTab === 'store' && <Store stats={stats} />} 
        
        {/* 🔥 NEW ROUTE: System Config is now wired up */}
        {activeTab === 'config' && <SystemConfig />} 
        
      </main>
    </div>
  );
}

export default App;
