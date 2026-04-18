import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Upload, Camera, Droplets, Thermometer, FlaskConical, Download } from 'lucide-react';

const IOT_DATA = [
  { label: 'Soil Moisture', icon: Droplets, value: 68, max: 100, unit: '%', color: '#1976D2', status: 'Optimal' },
  { label: 'Temperature', icon: Thermometer, value: 26, max: 50, unit: '°C', color: '#E65100', status: 'Good' },
  { label: 'pH Level', icon: FlaskConical, value: 6.8, max: 14, unit: 'pH', color: '#6A1B9A', status: 'Optimal' },
];

const HISTORY = [
  { date: '15 Mar 2024', crop: 'Soybean', grade: 'A', status: 'Certified', download: true },
  { date: '28 Jan 2024', crop: 'Wheat', grade: 'A+', status: 'Certified', download: true },
  { date: '10 Nov 2023', crop: 'Gram', grade: 'B', status: 'Expired', download: false },
];

function IotGauge({ label, icon: Icon, value, max, unit, color, status }) {
  const pct = (value / max) * 100;
  const deg = (pct / 100) * 360;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%', margin: '0 auto 12px',
        background: `conic-gradient(${color} ${deg}deg, #e2e8f0 ${deg}deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: 'var(--card-bg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '0.95rem', color, lineHeight: 1.2 }}>
            {value}{unit}
          </span>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: 600 }}>● {status}</div>
    </div>
  );
}

export default function LabTesting() {
  const { t } = useTranslation();
  const { labs } = useApp();
  const [activeTab, setActiveTab] = useState('book');
  const [form, setForm] = useState({ crop: '', qty: '', location: '', date: '' });
  const [booked, setBooked] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleBook = (e) => {
    e.preventDefault();
    setBooked(true);
    toast.success('Lab test booked! Lab partner will confirm within 2 hours.');
  };

  const handleImageUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAiResult({ grade: 'A', moisture: '11.2%', protein: '38.5%', purity: '98.7%', recommendation: 'Premium quality — sell directly to premium buyers for best price!' });
      toast.success('AI analysis complete!');
    }, 2500);
  };

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 {t('nav.home') || 'Home'}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">🧪 {t('nav.labTest') || 'Quality Testing'}</span>
        </div>

        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1B5E20', marginBottom: 4 }}>
          🧪 {t('nav.labTest') || 'Quality & Lab Testing'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
          Get your crop certified and command premium prices in the market
        </p>

        {/* Certified Farmer Badge Preview */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF8E1, #FFF3CD)', border: '2px solid #FF8F00',
          borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 48 }}>🏆</div>
          <div>
            <div style={{ fontWeight: 700, color: '#E65100', fontSize: '0.95rem' }}>Certified Farmer Badge</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Complete all lab tests to earn your Certified Farmer badge and unlock premium buyer access</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: '#FF8F00', fontSize: '1.1rem' }}>75%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complete</div>
            <div style={{ width: 80, height: 6, background: '#e2e8f0', borderRadius: 100, marginTop: 4 }}>
              <div style={{ width: '75%', height: '100%', background: '#FF8F00', borderRadius: 100 }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['book', '📅 Book Test'], ['upload', '📋 Upload Cert'], ['ai', '🤖 AI Analysis'], ['iot', '📡 IoT Data'], ['history', '📜 History']].map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Book Test Tab */}
        {activeTab === 'book' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1B5E20', marginBottom: 20 }}>
                📅 Book a Lab Test
              </h2>
              {booked ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div className="success-icon" style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>Test Booked!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>AgriTest Labs will collect sample within 24 hours</p>
                  <div style={{ background: '#E8F5E9', borderRadius: 12, padding: 12, fontSize: '0.8rem', color: '#1B5E20', fontWeight: 600 }}>
                    Booking ID: LAB-{Date.now().toString().slice(-6)}
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setBooked(false)}>Book Another</button>
                </div>
              ) : (
                <form onSubmit={handleBook}>
                  {[['Crop Type', 'crop', 'text', 'e.g. Soybean MT-101'],
                    ['Quantity (Quintals)', 'qty', 'number', 'e.g. 30'],
                    ['Location', 'location', 'text', 'Village, Tehsil, District'],
                    ['Preferred Date', 'date', 'date', '']].map(([label, field, type, placeholder]) => (
                    <div className="form-group" key={field}>
                      <label className="form-label">{label}</label>
                      <input type={type} className="form-input" placeholder={placeholder}
                        value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary btn-full">📅 Book Lab Test</button>
                </form>
              )}
            </div>

            {/* Lab Partner List */}
            <div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                🏥 Lab Partners Nearby
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {labs.map((lab, i) => (
                  <div key={lab.id} style={{
                    background: 'var(--card-bg)', borderRadius: 16, padding: 18,
                    border: `2px solid ${i === 0 ? '#1B5E20' : '#f0f0f0'}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  }}>
                    {i === 0 && <div style={{ marginBottom: 8 }}><span className="badge badge-green">⭐ Recommended</span></div>}
                    <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 6 }}>🔬 {lab.name}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span>📍 {lab.distance} km</span>
                          <span>⏱️ {lab.turnaround}</span>
                          <span>💰 ₹{lab.price}</span>
                          <span className="badge badge-blue">{lab.accredited}</span>
                          <span>⭐ {lab.rating}</span>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setActiveTab('book'); setBooked(false); }}>
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Certificate Tab */}
        {activeTab === 'upload' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1B5E20', marginBottom: 20 }}>
              📋 Upload Existing Certificate
            </h2>
            <div
              style={{ border: '3px dashed #C8E6C9', borderRadius: 16, padding: '48px 32px', textAlign: 'center', cursor: 'pointer', marginBottom: 20 }}
              onClick={() => toast.success('File uploaded successfully!')}
            >
              <Upload size={48} color="#4CAF50" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1B5E20', marginBottom: 6 }}>Drop your certificate here</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PDF, JPG, PNG · Max 10MB</div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>Browse Files</button>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => toast.success('Certificate verified & uploaded!')}>
              ✅ Upload & Verify Certificate
            </button>
          </div>
        )}

        {/* AI Quality Analysis Tab */}
        {activeTab === 'ai' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 500 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1B5E20', marginBottom: 8 }}>
              🤖 AI Quality Analysis
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
              Upload a photo of your crop — our AI gives instant quality grade estimate
            </p>
            <div
              style={{ border: '3px dashed #FFD54F', borderRadius: 16, padding: '40px 32px', textAlign: 'center', cursor: 'pointer', marginBottom: 20, background: '#FFFDE7' }}
              onClick={handleImageUpload}
            >
              <Camera size={48} color="#FF8F00" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#E65100', marginBottom: 6 }}>
                📷 Upload Crop Photo for AI Analysis
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JPG, PNG · Click to select</div>
            </div>

            {analyzing && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12, animation: 'pulse 1s infinite' }}>🤖</div>
                <div style={{ fontWeight: 600, color: '#1B5E20' }}>Analyzing crop quality...</div>
                <div className="skeleton" style={{ height: 8, margin: '12px 0' }} />
                <div className="skeleton" style={{ height: 8, width: '80%' }} />
              </div>
            )}

            {aiResult && (
              <div style={{ background: '#E8F5E9', borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 700, color: '#1B5E20', fontSize: '1rem', marginBottom: 14 }}>
                  ✅ AI Quality Analysis Result
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    ['Grade', aiResult.grade, '#1B5E20'],
                    ['Moisture', aiResult.moisture, '#1565C0'],
                    ['Protein', aiResult.protein, '#6A1B9A'],
                    ['Purity', aiResult.purity, '#E65100'],
                  ].map(([key, val, color]) => (
                    <div key={key} style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{key}</div>
                      <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.1rem', color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div className="alert alert-success">{aiResult.recommendation}</div>
              </div>
            )}
          </div>
        )}

        {/* IoT Data Tab */}
        {activeTab === 'iot' && (
          <div>
            <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1B5E20', marginBottom: 6 }}>
                📡 IoT Sensor Dashboard
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>Real-time field monitoring · Updated 5 min ago</p>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
                {IOT_DATA.map(item => <IotGauge key={item.label} {...item} />)}
              </div>
            </div>
            <div className="alert alert-success">
              🌱 <strong>Field Status: Excellent</strong> — All parameters are within optimal range. Your crop is healthy and ready for quality testing.
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1B5E20', marginBottom: 20 }}>
              📜 Testing History
            </h2>
            <div className="timeline">
              {HISTORY.map((h, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot" style={{ background: h.status === 'Certified' ? '#4CAF50' : '#9CA3AF' }} />
                  <div style={{ background: 'var(--surface-bg)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{h.crop} — Grade {h.grade}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{h.date}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${h.status === 'Certified' ? 'badge-green' : 'badge-red'}`}>{h.status}</span>
                        {h.download && (
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toast.success('Certificate downloaded!')}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1B5E20', minHeight: 32 }}>
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
