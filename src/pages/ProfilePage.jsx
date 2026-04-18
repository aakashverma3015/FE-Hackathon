import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { 
  Edit3, Download, Shield, Award, Leaf, Star, Trophy, 
  MapPin, CheckCircle, Wallet, Settings, Layout, Zap, ArrowRight,
  Clock, Package, User, Camera
} from 'lucide-react';

const RATING_DATA = [
  { metric: 'Quality', value: 4.8 },
  { metric: 'Timelines', value: 4.5 },
  { metric: 'Comm.', value: 4.3 },
  { metric: 'Pricing', value: 4.6 },
  { metric: 'Reliability', value: 4.7 },
];

const TRANSACTIONS = [
  { id: 'TXN-001', buyer: 'Rajesh Agromart', crop: 'Soybean', qty: 50, amount: 267500, date: '14 Apr', status: 'Paid' },
  { id: 'TXN-002', buyer: 'Indore Fresh Pvt', crop: 'Wheat', qty: 80, amount: 180000, date: '28 Mar', status: 'Paid' },
  { id: 'TXN-003', buyer: 'MP Grain Traders', crop: 'Soybean', qty: 30, amount: 162000, date: '15 Feb', status: 'Paid' },
];

const BADGES = [
  { icon: <Shield size={20} />, label: 'Lab Certified', color: 'var(--brand-600)', earned: true },
  { icon: <Zap size={20} />, label: 'IoT Streamer', color: '#10B981', earned: true },
  { icon: <Star size={20} />, label: 'Top Seller', color: '#F59E0B', earned: true },
  { icon: <Trophy size={20} />, label: 'Verified Pro', color: '#3B82F6', earned: true },
];

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>My Identity</span>
        </div>

        {/* ── PROFILE HERO: DARK ENTERPRISE STYLE ── */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 24, padding: '40px', marginBottom: 32, 
          color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, background: 'var(--brand-600)', filter: 'blur(100px)', opacity: 0.2 }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: 120, height: 120, borderRadius: 32, background: 'var(--brand-600)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 900,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)', border: '4px solid rgba(255,255,255,0.1)'
              }}>
                {user?.name?.charAt(0)}
              </div>
              <button style={{ 
                position: 'absolute', bottom: -10, right: -10, width: 36, height: 36, borderRadius: 12, 
                background: 'white', color: 'black', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}>
                <Camera size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' }}>{user?.name}</h1>
                <div style={{ background: 'var(--success)', color: 'white', padding: '2px 10px', borderRadius: 99, fontSize: '0.6875rem', fontWeight: 800 }}>CERTIFIED PRO</div>
              </div>
              <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem', marginBottom: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {user?.village}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Member since 2021</span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total Earnings</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>₹5.6L</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Trust Rating</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--success)' }}>4.8/5.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 32, alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Earnings Ledger */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Transaction Ledger</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Download size={14} /> Full Export
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TRANSACTIONS.map((txn, i) => (
                  <div key={txn.id} style={{ display: 'flex', alignItems: 'center', padding: '20px 32px', borderBottom: i === TRANSACTIONS.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-page)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 16 }}>
                      <Wallet size={20} color="var(--brand-600)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{txn.buyer}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.crop} · {txn.qty} qtl · {txn.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--text-primary)' }}>₹{txn.amount.toLocaleString()}</div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>{txn.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analysis */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 24 }}>System Performance Radar</h3>
              <div style={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RATING_DATA}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 5]} axisLine={false} tick={false} />
                    <Radar dataKey="value" stroke="var(--brand-600)" fill="var(--brand-600)" fillOpacity={0.15} strokeWidth={3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Identity Verification */}
            <div style={{ background: 'var(--brand-50)', borderRadius: 24, padding: 32, border: '1px solid var(--brand-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: 'var(--brand-800)' }}>
                <Shield size={24} />
                <h3 style={{ fontWeight: 800, fontSize: '1.125rem' }}>Trust Verification</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--brand-700)', lineHeight: 1.6, marginBottom: 24 }}>Your identity is verified via Aadhaar KYC and Government APMC registries.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Aadhaar Identity', status: 'Verified' },
                  { label: 'Farm Land Registry', status: 'Pending' },
                  { label: 'APMC License', status: 'Verified' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--brand-100)' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, color: item.status === 'Verified' ? 'var(--success)' : 'var(--accent-red)' }}>{item.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 24 }}>System Achievements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {BADGES.map(badge => (
                  <div key={badge.label} style={{ 
                    padding: 20, borderRadius: 20, border: '1px solid var(--border)', textAlign: 'center',
                    background: 'var(--bg-page)', transition: 'all 0.2s'
                  }}>
                    <div style={{ color: badge.color, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{badge.icon}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{badge.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
