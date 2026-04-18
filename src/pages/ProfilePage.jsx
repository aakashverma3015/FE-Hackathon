import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { Edit3, Download, Shield, Award, Leaf, Star, Trophy } from 'lucide-react';

const RATING_DATA = [
  { metric: 'Quality', value: 4.8, max: 5 },
  { metric: 'Timeliness', value: 4.5, max: 5 },
  { metric: 'Communication', value: 4.3, max: 5 },
  { metric: 'Pricing', value: 4.6, max: 5 },
  { metric: 'Reliability', value: 4.7, max: 5 },
];

const RADAR_DATA = RATING_DATA.map(r => ({ subject: r.metric, value: r.value }));

const TRANSACTIONS = [
  { id: 'TXN-001', buyer: 'Rajesh Agromart', crop: 'Soybean', qty: 50, amount: 267500, date: 'Apr 14, 2024', status: 'Paid' },
  { id: 'TXN-002', buyer: 'Indore Fresh Pvt Ltd', crop: 'Wheat', qty: 80, amount: 180000, date: 'Mar 28, 2024', status: 'Paid' },
  { id: 'TXN-003', buyer: 'MP Grain Traders', crop: 'Soybean', qty: 30, amount: 162000, date: 'Feb 15, 2024', status: 'Paid' },
];

const PROFILE_TASKS = [
  { label: 'Upload profile photo', done: false, points: 5 },
  { label: 'Verify mobile number', done: true, points: 10 },
  { label: 'Complete Aadhaar KYC', done: false, points: 20 },
  { label: 'Book lab test for first crop', done: true, points: 15 },
  { label: 'List first crop in marketplace', done: true, points: 10 },
  { label: 'Connect IoT sensors', done: false, points: 25 },
];

const BADGES = [
  { icon: '✅', label: 'Lab Certified', color: '#1B5E20', earned: true },
  { icon: '🌱', label: 'IoT Monitored', color: '#4CAF50', earned: false },
  { icon: '⭐', label: 'Top Seller', color: '#FF8F00', earned: true },
  { icon: '🏆', label: 'Verified Farmer', color: '#1565C0', earned: true },
  { icon: '🤝', label: 'Trusted Partner', color: '#6A1B9A', earned: false },
  { icon: '💎', label: 'Premium Member', color: '#C62828', earned: false },
];

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name, village: user?.village, crops: user?.crops?.join(', ') });
  const [activeTab, setActiveTab] = useState('overview');
  const [kycStep, setKycStep] = useState(0);
  const [aadhaar, setAadhaar] = useState('');

  // IoT Sensor Application states
  const [iotStep, setIotStep] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [iotForm, setIotForm] = useState({ acres: '', crop: '' });
  const [showIotDemo, setShowIotDemo] = useState(false);

  const totalEarnings = TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);

  const handleSave = () => {
    setUser(prev => ({ ...prev, name: editData.name, village: editData.village, crops: editData.crops.split(',').map(c => c.trim()) }));
    setEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 Home</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">👤 My Profile</span>
        </div>

        {/* Profile Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: 20, padding: 28,
          marginBottom: 24, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: 20, top: 10, fontSize: 120, opacity: 0.06 }}>🌾</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF8F00, #FFC107)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Poppins', fontWeight: 800, fontSize: '2rem', color: 'white',
                border: '4px solid rgba(255,255,255,0.3)',
              }}>{user?.name?.charAt(0)}</div>
              <button onClick={() => toast.success('Camera would open to change photo')}
                style={{
                  position: 'absolute', bottom: -2, right: -2, width: 28, height: 28,
                  borderRadius: '50%', background: '#FF8F00', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12,
                }}>📷</button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: 'white', margin: 0 }}>
                  {user?.name}
                </h1>
                <span style={{ background: '#FF8F00', color: 'white', padding: '2px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>
                  ✅ Certified
                </span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: 8 }}>
                📍 {user?.village} · 🌾 {user?.crops?.join(', ')} · 🗓️ 8 Years Farming
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#FFD54F', fontSize: '0.8rem', fontWeight: 600 }}>⭐ {user?.rating}/5 Rating</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>|</span>
                <span style={{ color: '#FFD54F', fontSize: '0.8rem', fontWeight: 600 }}>💰 ₹{totalEarnings.toLocaleString()} Earned</span>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)} className="btn btn-ghost btn-icon"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 12, padding: 10, flexShrink: 0 }}>
              <Edit3 size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>Profile Completeness</span>
              <span style={{ color: '#FFD54F', fontWeight: 700, fontSize: '0.8rem' }}>{user?.profileComplete}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ width: `${user?.profileComplete}%`, height: '100%', background: 'linear-gradient(90deg, #FFD54F, #FF8F00)', borderRadius: 100, transition: 'width 0.6s' }} />
            </div>
          </div>
        </div>

        {/* Certification Badges */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 16 }}>
            🏅 Certification Badges
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {BADGES.map(badge => (
              <div key={badge.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 16px',
                borderRadius: 14, border: `2px solid ${badge.earned ? badge.color + '40' : '#e2e8f0'}`,
                background: badge.earned ? `${badge.color}10` : '#F9FAFB', opacity: badge.earned ? 1 : 0.5, minWidth: 90,
              }}>
                <span style={{ fontSize: 28, filter: badge.earned ? 'none' : 'grayscale(100%)' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: badge.earned ? badge.color : '#9CA3AF', textAlign: 'center', lineHeight: 1.2 }}>
                  {badge.label}
                </span>
                {!badge.earned && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Not earned</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {[['overview', '📊 Overview'], ['edit', '✏️ Edit Profile'], ['kyc', '🪪 Aadhaar KYC'], ['transactions', '💰 Earnings'], ['iot', '📡 IoT Sensors']].map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)} style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Rating Radar */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>
                ⭐ Performance Rating
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Radar name="Rating" dataKey="value" stroke="#1B5E20" fill="#1B5E20" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
                {RATING_DATA.map(r => (
                  <div key={r.metric} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B5E20', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.metric}: <strong style={{ color: '#1B5E20' }}>{r.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Completeness Tasks */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 16 }}>
                📋 Complete Your Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PROFILE_TASKS.map((task, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: task.done ? '#4CAF50' : '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, flexShrink: 0,
                    }}>
                      {task.done ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: task.done ? '#9CA3AF' : '#374151', textDecoration: task.done ? 'line-through' : 'none' }}>
                        {task.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#E8F5E9', color: '#1B5E20', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      +{task.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile */}
        {activeTab === 'edit' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 500 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>✏️ Edit Profile</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Village / Location</label>
              <input className="form-input" value={editData.village} onChange={e => setEditData({ ...editData, village: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Crops Grown (comma separated)</label>
              <input className="form-input" value={editData.crops} onChange={e => setEditData({ ...editData, crops: e.target.value })} placeholder="Wheat, Soybean, Gram" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-input" value={user?.mobile} readOnly style={{ background: '#f9f9f9', color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Mobile cannot be changed here. Contact support.</div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSave}>💾 Save Changes</button>
          </div>
        )}

        {/* Aadhaar KYC */}
        {activeTab === 'kyc' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Shield size={24} color="#1B5E20" />
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', margin: 0 }}>Aadhaar KYC Verification</h2>
            </div>
            {kycStep === 0 && (
              <>
                <div className="alert alert-info" style={{ marginBottom: 20 }}>
                  🔐 Your Aadhaar data is encrypted and stored securely. We use it only for identity verification as per APMC regulations.
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input type="text" className="form-input" maxLength={12} value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} placeholder="XXXX XXXX XXXX" />
                </div>
                <button className="btn btn-primary btn-full" onClick={() => { setKycStep(1); toast.success('OTP sent to Aadhaar-linked mobile'); }}>
                  Send OTP to Aadhaar Mobile
                </button>
              </>
            )}
            {kycStep === 1 && (
              <>
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  ✅ OTP sent to ••••••7890 (Aadhaar-linked mobile)
                </div>
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <input type="text" className="form-input" maxLength={6} placeholder="6-digit OTP" />
                </div>
                <button className="btn btn-primary btn-full" onClick={() => { setKycStep(2); toast.success('KYC verified! Certified Farmer badge earned!'); }}>
                  Verify & Complete KYC
                </button>
              </>
            )}
            {kycStep === 2 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="success-icon" style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>KYC Verified!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your identity has been verified. Certified Farmer badge is now active.</p>
                <div style={{ marginTop: 16 }}><span className="badge badge-green" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>🏆 Verified Farmer</span></div>
              </div>
            )}
          </div>
        )}

        {/* Transactions/Earnings */}
        {activeTab === 'transactions' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--text-primary)' }}>💰 Total Earnings: <span style={{ color: '#1B5E20' }}>₹{totalEarnings.toLocaleString()}</span></h2>
              <button className="btn btn-outline btn-sm" onClick={() => toast.success('Statement downloaded!')}>
                <Download size={15} /> Statement
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TRANSACTIONS.map(txn => (
                <div key={txn.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💵</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{txn.buyer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.crop} · {txn.qty} qtl · {txn.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#1B5E20' }}>₹{txn.amount.toLocaleString()}</div>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✅ {txn.status}</span>
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toast.success('Invoice downloaded!')} style={{ minHeight: 36 }}>📄</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IOT SENSORS TAB ── */}
        {activeTab === 'iot' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 12, background: '#E8F5E9', borderRadius: 12, display: 'flex' }}><Leaf color="#1B5E20" size={28} /></div>
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#1B5E20', margin: 0, fontSize: '1.4rem' }}>Smart IoT Hardware Hub</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Apply for subsidized APMC sensor nodes to monitor your crop vitality remotely.</p>
              </div>
            </div>

            {iotStep === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {[
                  { id: 'soil', icon: '🌱', name: 'Soil Vitality Kit', desc: 'Moisture, NPK levels, and pH balance monitoring.', price: 'Free Deposit', tags: ['High Subsidies', 'Basic Node'] },
                  { id: 'weather', icon: '🌦️', name: 'Micro-Weather Station', desc: 'Local humidity, wind, and precipitation forecasts.', price: '₹500 Deposit', tags: ['Advanced', 'Solar Powered'] },
                  { id: 'drone', icon: '🛸', name: 'AI Disease Drone', desc: 'Ariel mapping for early pest detection.', price: 'Rental Only', tags: ['Enterprise', 'On-Demand'] }
                ].map(s => (
                  <div key={s.id} style={{ border: '2px solid #e2e8f0', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer' }}
                    onClick={() => { setSelectedSensor(s); setIotStep(1); }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>{s.icon}</div>
                    <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>{s.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>{s.desc}</p>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                      {s.tags.map(t => <span key={t} style={{ background: '#F3F4F6', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600 }}>{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                      <span style={{ fontWeight: 800, color: '#1B5E20' }}>{s.price}</span>
                      <button className="btn btn-outline btn-sm">Apply →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {iotStep === 1 && selectedSensor && (
              <div style={{ maxWidth: 500, margin: '0 auto', background: '#F9FAFB', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
                <button onClick={() => setIotStep(0)} style={{ background: 'none', border: 'none', color: '#1B5E20', fontWeight: 600, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>← Back to Catalog</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 32 }}>{selectedSensor.icon}</span>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>Apply for {selectedSensor.name}</h3>
                </div>
                <div className="form-group">
                  <label className="form-label">Farm Size (Acres)</label>
                  <input type="number" className="form-input" placeholder="e.g., 5" value={iotForm.acres} onChange={e => setIotForm({...iotForm, acres: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Target Crop</label>
                  <input type="text" className="form-input" placeholder="e.g., Soybean" value={iotForm.crop} onChange={e => setIotForm({...iotForm, crop: e.target.value})} />
                </div>
                <div className="alert alert-info" style={{ marginBottom: 20, fontSize: '0.8rem' }}>
                  A field executive will visit your address to install the hardware. The data will sync to your Aarohan Agri account via local 4G/LoRaWAN.
                </div>
                <button className="btn btn-primary btn-full" onClick={() => { setIotStep(2); toast.success('Application submitted successfully!'); }}>
                  Submit IoT Application
                </button>
              </div>
            )}

            {iotStep === 2 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="success-icon" style={{ fontSize: 72, marginBottom: 20, animation: 'successPop 0.5s ease' }}>🚀</div>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#1B5E20', marginBottom: 10 }}>Hardware Dispatched!</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px' }}>
                  Your {selectedSensor?.name} application has been approved under the Subsidized Agritech Scheme. Installation is scheduled within 48 hours.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button className="btn btn-primary" onClick={() => setShowIotDemo(true)}>📡 View Live Data Demo</button>
                  <button className="btn btn-outline" onClick={() => setIotStep(0)}>Return to Catalog</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* IoT Live Demo Modal */}
        {showIotDemo && (
          <div className="modal-overlay" onClick={() => setShowIotDemo(false)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 800, background: '#111827', color: 'white', border: '1px solid #374151', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #374151', paddingBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="live-dot" style={{ background: '#10B981' }} /> {selectedSensor?.name} Telemetry
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Node ID: {Math.random().toString(16).slice(2,10).toUpperCase()} · Battery: 88% 🔋</div>
                </div>
                <button onClick={() => setShowIotDemo(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Soil Moisture', val: '43%', trend: '+2%', color: '#3B82F6' },
                  { label: 'Soil pH', val: '6.8', trend: 'Optimal', color: '#10B981' },
                  { label: 'Nitrogen (N)', val: '120 kg/ha', trend: '-5 kg', color: '#F59E0B' },
                  { label: 'Temperature', val: '28°C', trend: '+1°C', color: '#EF4444' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#1F2937', padding: 16, borderRadius: 16, border: '1px solid #374151', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -10, bottom: -15, width: 60, height: 60, borderRadius: '50%', background: m.color, opacity: 0.1, filter: 'blur(10px)' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.label}</div>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.6rem', color: 'white', margin: '4px 0' }}>{m.val}</div>
                    <div style={{ fontSize: '0.7rem', color: m.color, fontWeight: 700 }}>{m.trend} last 24h</div>
                  </div>
                ))}
              </div>
              
              <div style={{ background: '#1F2937', height: 200, borderRadius: 16, border: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 16, left: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Visualization (Demo)</span>
                <div style={{ width: '100%', padding: '0 20px' }}>
                  <svg width="100%" height="100" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" points="0,80 50,70 100,50 150,75 200,30 250,45 300,20 350,55 400,10" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,0.3))' }} />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
