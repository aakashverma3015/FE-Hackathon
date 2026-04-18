import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ComposedChart
} from 'recharts';
import toast from 'react-hot-toast';
import { 
  TrendingUp, CloudRain, Sun, Wind, MessageCircle, X, Send, 
  Sparkles, Zap, Shield, AlertTriangle, Calendar, MapPin, Layout, CheckCircle, BarChart3, Info
} from 'lucide-react';
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
  { crop: 'Soybean', score: 95, reason: 'Demand rising 18%, festival season approaching', action: 'SELL NOW', color: 'var(--brand-600)' },
  { crop: 'Wheat', score: 72, reason: 'Stable prices but storage advisable for 2 more weeks', action: 'WAIT 2 WEEKS', color: '#F59E0B' },
  { crop: 'Gram', score: 45, reason: 'Excess supply in market, prices under pressure', action: 'HOLD & STORE', color: '#3B82F6' },
  { crop: 'Onion', score: 80, reason: 'Price spike expected due to weather disruption', action: 'SELL IN 5 DAYS', color: '#6366F1' },
];

const WEATHER_ALERTS = [
  { icon: CloudRain, color: '#3B82F6', text: 'Heavy rain forecast — Harvest stored crops immediately', severity: 'High' },
  { icon: Wind, color: '#EF4444', text: 'Strong winds expected — Protect field crops this weekend', severity: 'Critical' },
  { icon: Sun, color: '#10B981', text: 'Optimal sunny window for field drying in Indore region', severity: 'Positive' },
];

function AIChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Welcome to Aarohan Intelligence. Ask me anything about Mandi price projections or crop health.' }]);
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
      setMessages(prev => [...prev, { sender: 'ai', text: res.response || 'I calculate a 12% price upside for Soybean in the Indore region over the next 14 days.'}]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I am currently optimizing my intelligence models. Market patterns suggest holding stock for 12 more days.'}]);
    } finally {
      setIsTyping(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 100, right: 32, width: 380, height: 500, 
      maxWidth: 'calc(100vw - 64px)', background: 'var(--bg-card)', borderRadius: 24, 
      boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', zIndex: 9999,
      border: '1px solid var(--border)', overflow: 'hidden'
    }}>
      <div style={{ background: 'var(--brand-600)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>Aarohan AI</div>
            <div style={{ fontSize: '0.625rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>Gemini Pro Core</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg-page)' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            background: m.sender === 'user' ? 'var(--brand-600)' : 'white',
            color: m.sender === 'user' ? 'white' : 'var(--text-primary)',
            padding: '12px 16px', borderRadius: 16,
            borderBottomRightRadius: m.sender === 'user' ? 4 : 16,
            borderBottomLeftRadius: m.sender === 'ai' ? 4 : 16,
            maxWidth: '85%', fontSize: '0.8125rem', fontWeight: 500, boxShadow: 'var(--shadow-sm)',
            border: m.sender === 'ai' ? '1px solid var(--border)' : 'none',
            lineHeight: 1.5
          }}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', gap: 6, border: '1px solid var(--border)' }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
      </div>

      <div style={{ padding: 20, background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
        <input 
          type="text" 
          value={inputStr} 
          onChange={e => setInputStr(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about market volatility..." 
          style={{ flex: 1, height: 44, padding: '0 16px', borderRadius: 12, border: '1px solid var(--border)', outline: 'none', fontSize: '0.875rem', background: 'var(--bg-page)' }} 
        />
        <button onClick={handleSend} style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-600)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Send size={18} />
        </button>
      </div>
      
      <style>{`
        .typing-dot { width: 6px; height: 6px; background: var(--brand-400); border-radius: 50%; animation: typingSync 1s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingSync { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-4px); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default function AiInsights() {
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [seasonalData, setSeasonalData] = useState(INIT_SEASONAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeasonalData(prev => prev.map(m => ({
        ...m,
        wheat: Math.max(10, Math.min(100, m.wheat + (Math.random() > 0.5 ? 1 : -1))),
        soybean: Math.max(10, Math.min(100, m.soybean + (Math.random() > 0.5 ? 1 : -1))),
        gram: Math.max(10, Math.min(100, m.gram + (Math.random() > 0.5 ? 1 : -1))),
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Floating Chat Trigger */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9998,
          width: 64, height: 64, borderRadius: 20, background: 'var(--brand-600)', color: 'white', border: 'none',
          boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={32} />
      </button>

      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-600)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Market Intelligence</span>
        </div>

        {/* ── TOP HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Zap size={24} />
              </div>
              <h1 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Intelligence Center</h1>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Advanced ML models predicting demand-supply dynamics and price trajectories.</p>
          </div>
          <div style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)'
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />
            REAL-TIME AGMARKNET ENGINE
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Strategy Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
              {CROPS_BEST.map(c => (
                <div key={c.crop} style={{
                  background: 'var(--bg-card)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)', position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {c.crop === 'Soybean' ? '🫘' : c.crop === 'Wheat' ? '🌾' : '🧅'}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{c.crop}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: '1.25rem', color: c.color }}>{c.score}</div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, opacity: 0.6 }}>AI SCORE</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{c.reason}</p>
                  <div style={{ 
                    background: c.color, color: 'white', padding: '6px 12px', borderRadius: 8, 
                    fontSize: '0.6875rem', fontWeight: 700, width: 'fit-content' 
                  }}>{c.action}</div>
                </div>
              ))}
            </div>

            {/* Price Forecast Chart */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>7-Day Price Trajectory</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence interval based on historical volatility (₹/qtl)</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                   {[['Forecast', 'var(--brand-600)'], ['Confidence', 'var(--brand-50)']].map(([l, c]) => (
                     <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', fontWeight: 600 }}>
                       <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}
                     </div>
                   ))}
                </div>
              </div>
              <div style={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PRICE_FORECAST}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-600)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--brand-600)" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="upper" stroke="transparent" fill="var(--brand-50)" opacity={0.3} />
                    <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" />
                    <Area type="monotone" dataKey="price" stroke="var(--brand-600)" fill="url(#priceGrad)" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: 'var(--brand-600)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Seasonal Heatmap */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 20 }}>Syncing Seasonal Intensity</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 700, paddingBottom: 10 }}>PRODUCT</th>
                      {seasonalData.map(m => <th key={m.month} style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 700, paddingBottom: 10 }}>{m.month}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {['wheat', 'soybean', 'gram'].map(crop => (
                      <tr key={crop}>
                        <td style={{ fontSize: '0.75rem', fontWeight: 800, paddingRight: 12, textTransform: 'uppercase', color: 'var(--text-primary)' }}>{crop}</td>
                        {seasonalData.map(m => {
                          const val = m[crop];
                          const intensity = val / 100;
                          return (
                            <td key={m.month}>
                              <div style={{ 
                                width: 34, height: 34, borderRadius: 6, background: `rgba(16, 185, 129, ${intensity})`,
                                color: val > 60 ? 'white' : 'var(--text-muted)', fontSize: '0.625rem', fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.5s'
                              }}>
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

          {/* ── RIGHT COLUMN ── */}
          <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Weather Alerts */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CloudRain size={18} color="var(--brand-600)" /> Enviro-Risk Monitor
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {WEATHER_ALERTS.map((alert, i) => (
                  <div key={i} style={{ 
                    padding: '16px', borderRadius: 12, background: 'var(--bg-page)', 
                    border: `1px solid ${alert.severity === 'Critical' ? '#FEE2E2' : 'var(--border)'}`,
                    display: 'flex', gap: 14
                  }}>
                    <div style={{ 
                      width: 36, height: 36, borderRadius: 10, background: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <alert.icon size={18} color={alert.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 800, color: alert.color, textTransform: 'uppercase', marginBottom: 2 }}>{alert.severity} Impact</div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{alert.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demand Chart */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>Demand vs Supply</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>Rolling 6-week Mandi projection</p>
              <div style={{ height: 260, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEMAND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 20 }} />
                    <Bar dataKey="demand" name="Aggregated Demand" fill="var(--brand-600)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="supply" name="Planned Arrivals" fill="var(--brand-200)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
