import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { 
  Upload, Camera, Droplets, Thermometer, FlaskConical, Download, 
  MapPin, Clock, Shield, Star, CheckCircle, Zap, Info, ArrowRight,
  Monitor, Calendar, History, Sparkles, Layout
} from 'lucide-react';

const IOT_DATA = [
  { label: 'Soil Moisture', icon: Droplets, value: 68, max: 100, unit: '%', color: '#3B82F6', status: 'Optimal' },
  { label: 'Temperature', icon: Thermometer, value: 26, max: 50, unit: '°C', color: '#EF4444', status: 'Good' },
  { label: 'pH Level', icon: FlaskConical, value: 6.8, max: 14, unit: 'pH', color: '#8B5CF6', status: 'Optimal' },
];

const QUALITY_HISTORY = [
  { id: 'CERT-001', date: '15 Mar 2024', crop: 'Soybean', grade: 'A', status: 'Certified', hash: '0x8fa...c91' },
  { id: 'CERT-002', date: '28 Jan 2024', crop: 'Wheat', grade: 'A+', status: 'Certified', hash: '0x3bb...2af' },
  { id: 'CERT-003', date: '10 Nov 2023', crop: 'Gram', grade: 'B', status: 'Expired', hash: '0x4ca...88b' },
];

function IotGauge({ label, icon: Icon, value, max, unit, color, status }) {
  const pct = (value / max) * 100;
  const rad = 36;
  const circ = 2 * Math.PI * rad;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: 20, borderRadius: 20, border: '1px solid var(--border)', flex: 1, minWidth: 160 }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={rad} stroke="var(--bg-page)" strokeWidth="6" fill="none" />
          <circle cx="40" cy="40" r={rad} stroke={color} strokeWidth="6" fill="none" 
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          <Icon size={24} />
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 2 }}>{value}{unit}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ 
        display: 'inline-flex', alignItems: 'center', gap: 4, 
        background: 'var(--success-50)', color: 'var(--success-700)',
        padding: '2px 8px', borderRadius: 99, fontSize: '0.625rem', fontWeight: 800
      }}>
        <div style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--success)' }} /> {status}
      </div>
    </div>
  );
}

export default function LabTesting() {
  const { t } = useTranslation();
  const { labs, user } = useApp();
  const [activeTab, setActiveTab] = useState('book');
  const [form, setForm] = useState({ crop: '', qty: '', location: '', date: '' });
  const [booked, setBooked] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleBook = (e) => {
    e.preventDefault();
    setBooked(true);
    toast.success('Lab test booked successfully!');
  };

  const simulateAiAnalysis = () => {
    setAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setAiResult({ 
        grade: 'A+', moisture: '11.2%', purity: '99.4%', starch: '68.5%',
        recommendation: 'Exceptional quality batch. Recommended for premium export channel or specialty procurement.'
      });
      toast.success('AI Analysis Insight Generated');
    }, 2500);
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Quality Certification</span>
        </div>

        {/* ── ENTERPRISE HEADER ── */}
        <div style={{ 
          background: 'linear-gradient(135deg, #065F46, #047857)', borderRadius: 20, padding: '32px 40px', marginBottom: 32, 
          color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, background: '#10B981', filter: 'blur(100px)', opacity: 0.2 }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: 8 }}>Quality Assurance</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', maxWidth: 500 }}>
                Certify your harvest with NABL accredited labs and unlock premium pricing tiers through immutable quality verification.
              </p>
            </div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20, padding: '20px 24px', backdropFilter: 'blur(10px)', textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Certification Status</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>75% Verified</div>
              <div style={{ width: 140, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginLeft: 'auto' }}>
                <div style={{ width: '75%', height: '100%', background: 'white', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div style={{ 
          display: 'flex', gap: 8, background: 'var(--bg-card)', padding: 6, borderRadius: 14, 
          marginBottom: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', width: 'fit-content', overflowX: 'auto'
        }}>
          {[
            { id: 'book', label: 'Book Lab Test', icon: <FlaskConical size={16} /> },
            { id: 'ai', label: 'AI Quality Bot', icon: <Sparkles size={16} /> },
            { id: 'iot', label: 'Field Monitor', icon: <Monitor size={16} /> },
            { id: 'history', label: 'Certificates', icon: <History size={16} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--brand-600)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                border: 'none', whiteSpace: 'nowrap'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT: BOOK ── */}
        {activeTab === 'book' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Calendar size={20} color="var(--brand-600)" />
                <h3 style={{ fontWeight: 800, fontSize: '1.125rem' }}>Schedule Field Collection</h3>
              </div>
              
              {booked ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 64, height: 64, background: 'var(--success-50)', color: 'var(--success)', borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={32} />
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 8 }}>Request Submitted</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>AgriTest NABL Lab will arrive at your location within 24 hours.</p>
                  <button className="btn btn-secondary" onClick={() => setBooked(false)}>Book Another Test</button>
                </div>
              ) : (
                <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                  {[
                    { label: 'Commodity Type', placeholder: 'e.g. Soybean FAQ', full: true },
                    { label: 'Batch Volume (qtl)', placeholder: '50' },
                    { label: 'Target Mandi', placeholder: 'Indore APMC' },
                    { label: 'Collection Point', placeholder: 'Farm Gate / Warehouse', full: true },
                  ].map((field, i) => (
                    <div key={i} style={{ gridColumn: field.full ? '1 / -1' : 'auto' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{field.label}</label>
                      <input type="text" placeholder={field.placeholder} className="form-input" style={{ width: '100%' }} required />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1', marginTop: 12 }}>
                    <button type="submit" className="btn btn-primary btn-full" style={{ height: 48 }}>Confirm Booking & Schedule Collection</button>
                  </div>
                </form>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Lab Partners</h4>
              {labs.map(lab => (
                <div key={lab.id} style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', marginBottom: 2 }}>{lab.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {lab.distance}km away</div>
                    </div>
                    <div style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', padding: '2px 8px', borderRadius: 99, fontSize: '0.625rem', fontWeight: 800 }}>{lab.accredited}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 700 }}>₹{lab.price} <span style={{ fontWeight: 500, opacity: 0.6 }}>/ test</span></div>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {lab.turnaround}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: AI ── */}
        {activeTab === 'ai' && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 40, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'var(--brand-50)', color: 'var(--brand-600)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Sparkles size={32} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 12 }}>Aarohan Computer Vision</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                Upload high-res images of your crop grains for instant visual quality grading and purity estimation.
              </p>
              
              <div 
                onClick={simulateAiAnalysis}
                style={{ 
                  border: '2px dashed var(--brand-200)', background: 'var(--bg-page)', borderRadius: 20, padding: 48,
                  cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                }}
              >
                {analyzing ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <div style={{ width: 32, height: 32, border: '3px solid var(--brand-100)', borderTopColor: 'var(--brand-600)', borderRadius: 99, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-700)' }}>Scanning Grains...</div>
                  </div>
                ) : null}
                <div style={{ color: 'var(--brand-600)', marginBottom: 16 }}><Camera size={48} /></div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: 6 }}>Drop Image or Click to Capture</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Supported: JPG, PNG (Max 12MB)</div>
                <button className="btn btn-primary" style={{ marginTop: 24 }}>Upload for AI Scan</button>
              </div>

              {aiResult && (
                <div style={{ marginTop: 32, textAlign: 'left', background: 'var(--brand-50)', padding: 24, borderRadius: 16, border: '1px solid var(--brand-100)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--brand-800)', fontWeight: 800, marginBottom: 20 }}>
                     <CheckCircle size={20} /> AI ANALYSIS SUMMARY
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                     {[
                       { l: 'Grade', v: aiResult.grade },
                       { l: 'Moisture', v: aiResult.moisture },
                       { l: 'Purity', v: aiResult.purity },
                       { l: 'Starch', v: aiResult.starch },
                     ].map((s, i) => (
                       <div key={i} style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid var(--brand-100)' }}>
                         <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</div>
                         <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--brand-700)' }}>{s.v}</div>
                       </div>
                     ))}
                   </div>
                   <p style={{ fontSize: '0.875rem', color: 'var(--brand-800)', lineHeight: 1.6 }}>{aiResult.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: IOT ── */}
        {activeTab === 'iot' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
              {IOT_DATA.map(item => <IotGauge key={item.label} {...item} />)}
            </div>
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--success-50)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>Field Intelligence Node #12</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status: Active · Hub: Pithampur-West · Last ping: 42s ago</p>
              </div>
              <button className="btn btn-secondary">Sync Live Stream</button>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: HISTORY ── */}
        {activeTab === 'history' && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Type / Certificate ID</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Commodity</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grade</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blockchain Hash</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {QUALITY_HISTORY.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Quality Certificate</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.id} · {h.date}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{h.crop}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        background: h.grade.includes('A') ? 'var(--success-50)' : 'var(--bg-page)', 
                        color: h.grade.includes('A') ? 'var(--success-700)' : 'var(--text-muted)',
                        padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 800
                      }}>{h.grade}</span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <code style={{ fontSize: '0.6875rem', color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '2px 6px', borderRadius: 4 }}>{h.hash}</code>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => toast.success(`Downloading ${h.id}...`)}
                        style={{ background: 'none', border: 'none', color: 'var(--brand-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        <Download size={16} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
