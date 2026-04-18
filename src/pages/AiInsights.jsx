import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ComposedChart
} from 'recharts';
import toast from 'react-hot-toast';
import { TrendingUp, CloudRain, Sun, Wind, MessageCircle, X, Send } from 'lucide-react';
import { aiAPI } from '../lib/api';

const DEMAND_DATA = [
  { week: 'W1', demand: 65, supply: 80 },
  { week: 'W2', demand: 72, supply: 75 },
  { week: 'W3', demand: 78, supply: 70 },
  { week: 'W4', demand: 85, supply: 68 },
  { week: 'W5', demand: 91, supply: 65 },
  { week: 'W6', demand: 88, supply: 63 },
];

const PRICE_FORECAST = [
  { day: 'Day 1', price: 5200, lower: 5100, upper: 5300 },
  { day: 'Day 2', price: 5250, lower: 5120, upper: 5380 },
  { day: 'Day 3', price: 5180, lower: 5050, upper: 5310 },
  { day: 'Day 4', price: 5290, lower: 5150, upper: 5430 },
  { day: 'Day 5', price: 5350, lower: 5200, upper: 5500 },
  { day: 'Day 6', price: 5400, lower: 5250, upper: 5550 },
  { day: 'Day 7', price: 5380, lower: 5220, upper: 5540 },
];

const INIT_SEASONAL = [
  { month: 'Jan', wheat: 80, soybean: 40, gram: 90 },
  { month: 'Feb', wheat: 85, soybean: 35, gram: 75 },
  { month: 'Mar', wheat: 95, soybean: 30, gram: 60 },
  { month: 'Apr', wheat: 60, soybean: 50, gram: 40 },
  { month: 'May', wheat: 30, soybean: 65, gram: 20 },
  { month: 'Jun', wheat: 20, soybean: 75, gram: 15 },
  { month: 'Jul', wheat: 15, soybean: 85, gram: 10 },
  { month: 'Aug', wheat: 10, soybean: 90, gram: 10 },
  { month: 'Sep', wheat: 20, soybean: 80, gram: 20 },
  { month: 'Oct', wheat: 40, soybean: 60, gram: 50 },
  { month: 'Nov', wheat: 60, soybean: 45, gram: 70 },
  { month: 'Dec', wheat: 75, soybean: 40, gram: 85 },
];

const CROPS_BEST = [
  { crop: 'Soybean', score: 95, reason: 'Demand rising 18%, festival season approaching', action: 'SELL NOW', color: '#1B5E20' },
  { crop: 'Wheat', score: 72, reason: 'Stable prices but storage advisable for 2 more weeks', action: 'WAIT 2 WEEKS', color: '#FF8F00' },
  { crop: 'Gram', score: 45, reason: 'Excess supply in market, prices under pressure', action: 'HOLD & STORE', color: '#1565C0' },
  { crop: 'Onion', score: 80, reason: 'Price spike expected due to weather disruption in Maharashtra', action: 'SELL IN 5 DAYS', color: '#6A1B9A' },
];

const WEATHER_ALERTS = [
  { icon: CloudRain, color: '#1565C0', text: 'Heavy rain forecast in Vidarbha — Harvest stored crops immediately', severity: 'High' },
  { icon: Wind, color: '#E65100', text: 'Strong winds expected — Protect crop from field damage this weekend', severity: 'Medium' },
  { icon: Sun, color: '#FF8F00', text: 'Optimal sunny weather for field drying in Pithampur region for next 3 days', severity: 'Good' },
];

const FESTIVAL_ALERTS = [
  { festival: 'Diwali (Oct 24)', demand: '+40%', crops: 'Dry Fruits, Sugar, Ghee' },
  { festival: 'Navratri (Oct 3)', demand: '+25%', crops: 'Sabudana, Fruits, Dairy' },
  { festival: 'Eid (Apr 20)', demand: '+30%', crops: 'Vermicelli, Dates, Rice' },
];

const INDIA_DISTRICTS = [
  { name: 'Indore', price: 5200, lat: 22.72, lng: 75.86 },
  { name: 'Bhopal', price: 4850, lat: 23.26, lng: 77.41 },
  { name: 'Ujjain', price: 5150, lat: 23.18, lng: 75.78 },
  { name: 'Ratlam', price: 5050, lat: 23.33, lng: 75.04 },
  { name: 'Sagar', price: 4750, lat: 23.84, lng: 78.74 },
];


function AIChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am your Aarohan AI Assistant powered by Gemini. Ask me any market price questions.' }]);
  const [inputStr, setInputStr] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if(!inputStr.trim()) return;
    const userMsg = { sender: 'user', text: inputStr };
    setMessages(prev => [...prev, userMsg]);
    setInputStr('');
    setIsTyping(true);

    try {
      const res = await aiAPI.chat({ message: userMsg.text, context: 'agri-market' });
      setMessages(prev => [...prev, { sender: 'ai', text: res.response || 'I currently calculate wait-and-hold as the best pattern for your criteria.'}]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, the Gemini interface is temporarily offline. Please try again later.'}]);
    } finally {
      setIsTyping(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 20, width: 340, height: 480, 
      maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 140px)',
      background: 'var(--card-bg)', borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column', zIndex: 9999,
      border: '1px solid var(--border)', overflow: 'hidden'
    }}>
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24 }}>🤖</div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem' }}>Aarohan AI</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Powered by Gemini</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface-bg)' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            background: m.sender === 'user' ? '#1B5E20' : 'white',
            color: m.sender === 'user' ? 'white' : '#333',
            padding: '10px 14px', borderRadius: 16,
            borderBottomRightRadius: m.sender === 'user' ? 4 : 16,
            borderBottomLeftRadius: m.sender === 'ai' ? 4 : 16,
            maxWidth: '85%', fontSize: '0.85rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            border: m.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
            lineHeight: 1.5
          }}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--card-bg)', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', gap: 4, height: 38, alignItems: 'center' }}>
            <div className="typing-dot" />
            <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
            <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>

      <div style={{ padding: 12, background: 'var(--card-bg)', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
        <input 
          type="text" 
          value={inputStr} 
          onChange={e => setInputStr(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask market insights..." 
          style={{ flex: 1, padding: '10px 16px', borderRadius: 100, border: '1px solid var(--border)', outline: 'none', fontSize: '0.85rem' }} 
        />
        <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: 20, background: '#1B5E20', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={16} />
        </button>
      </div>
      
      <style>{`
        .typing-dot { width: 6px; height: 6px; background: #9CA3AF; border-radius: 50%; animation: typingSync 1s infinite ease-in-out; }
        @keyframes typingSync { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-4px); opacity: 1; } }
      `}</style>
    </div>
  );
}


export default function AiInsights() {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [seasonalData, setSeasonalData] = useState(INIT_SEASONAL);

  // Animated Heatmap Jitter Effect simulating Live Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSeasonalData(prev => prev.map(m => ({
        ...m,
        wheat: Math.max(10, Math.min(100, m.wheat + (Math.random() > 0.5 ? 2 : -2))),
        soybean: Math.max(10, Math.min(100, m.soybean + (Math.random() > 0.5 ? 2 : -2))),
        gram: Math.max(10, Math.min(100, m.gram + (Math.random() > 0.5 ? 2 : -2))),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      
      {/* Floating Chat Panel Trigger */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
          width: 60, height: 60, borderRadius: 30, background: '#FF8F00', color: 'white', border: 'none',
          boxShadow: '0 4px 15px rgba(255, 143, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.2s'
        }}
      >
        <MessageCircle size={30} />
      </button>

      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 {t('nav.home') || 'Home'}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">🤖 {t('nav.aiInsights') || 'AI Market Insights'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🤖</div>
          <div>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1B5E20', marginBottom: 2 }}>
              {t('nav.aiInsights') || 'AI Market Insights'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ML-powered demand, price, and market analysis · Updated hourly</p>
          </div>
        </div>

        {/* Weather & Festival Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>
              🌤️ Weather Impact Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WEATHER_ALERTS.map(({ icon: Icon, color, text, severity }, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}30` }}>
                  <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color, marginBottom: 2 }}>{severity} Priority</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 14 }}>
              🪔 Festival Demand Surge
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FESTIVAL_ALERTS.map(f => (
                <div key={f.festival} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--gold-pale)', border: '1px solid #FFD54F' }}>
                  <div style={{ fontSize: 24 }}>🪔</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#E65100', fontSize: '0.85rem' }}>{f.festival}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.crops}</div>
                  </div>
                  <span style={{ background: '#FF8F00', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                    {f.demand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best Time to Sell */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 16 }}>
            ⏰ Best Time to Sell — AI Recommendation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {CROPS_BEST.map(c => (
              <div key={c.crop} style={{
                borderRadius: 14, padding: '16px 18px', border: `2px solid ${c.color}30`,
                background: `${c.color}08`, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: c.color }}>{c.crop}</span>
                  <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem', color: c.color }}>{c.score}</span>
                </div>
                <div style={{ height: 6, background: '#f0f0f0', borderRadius: 100, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${c.score}%`, height: '100%', background: c.color, borderRadius: 100 }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{c.reason}</div>
                <span style={{ background: c.color, color: 'white', padding: '4px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700 }}>
                  {c.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Demand Forecast */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              📈 Demand vs Supply Forecast
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>Soybean · Indore Region · Next 6 Weeks</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={DEMAND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, fontFamily: 'Noto Sans', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="demand" fill="#1B5E20" opacity={0.8} radius={[4,4,0,0]} name="Demand" />
                <Line type="monotone" dataKey="supply" stroke="#FF8F00" strokeWidth={2.5} dot={{ r: 4 }} name="Supply" strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price Forecast */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              🔮 7-Day Price Forecast
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>Soybean · ₹/quintal · With confidence band</p>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PRICE_FORECAST}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[4900, 5700]} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ borderRadius: 12, fontFamily: 'Noto Sans', fontSize: 12 }} />
                <defs>
                  <linearGradient id="confAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#confAi)" name="Upper" />
                <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" name="Lower" />
                <Line type="monotone" dataKey="price" stroke="#1B5E20" strokeWidth={2.5} dot={{ r: 4, fill: '#1B5E20' }} activeDot={{ r: 6, fill: '#FF8F00' }} name="Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Animated matrix heatmap */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              📅 Animated Demand Heatmap
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, background: '#4CAF50', borderRadius: '50%', animation: 'flash 1s infinite' }} />
              Live Sync
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4, fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, width: 80 }}>Crop</th>
                  {seasonalData.map(m => <th key={m.month} style={{ padding: '4px 2px', color: 'var(--text-muted)', fontWeight: 600, width: 38 }}>{m.month.substring(0,3)}</th>)}
                </tr>
              </thead>
              <tbody>
                {['wheat', 'soybean', 'gram'].map(crop => (
                  <tr key={crop}>
                    <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {crop === 'wheat' ? '🌾 Wheat' : crop === 'soybean' ? '🫘 Soybean' : '🟡 Gram'}
                    </td>
                    {seasonalData.map(m => {
                      const val = m[crop];
                      const opacity = val / 100;
                      const color = crop === 'wheat' ? '#FF8F00' : crop === 'soybean' ? '#1B5E20' : '#0288D1';
                      return (
                        <td key={m.month} style={{ padding: 2 }}>
                          <div className="heatmap-cell" style={{
                            background: `rgba(${crop === 'wheat' ? '255,143,0' : crop === 'soybean' ? '27,94,32' : '2,136,209'},${opacity})`,
                            color: val > 50 ? 'white' : '#9CA3AF',
                            width: 34, height: 34, fontSize: '0.65rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
                            transition: 'background 1s ease-in-out'
                          }} title={`${m.month}: ${val}%`}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
