import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Phone, MessageCircle, BookOpen, Mic, ChevronDown, ChevronUp, Send, CheckCircle } from 'lucide-react';

const TUTORIALS = [
  { id: 1, title: 'How to list your crop', duration: '2:14', lang: 'हिंदी', thumb: '📦', views: '12.4K' },
  { id: 2, title: 'Finding cold storage', duration: '1:58', lang: 'English', thumb: '🧊', views: '8.1K' },
  { id: 3, title: 'Booking transport', duration: '2:31', lang: 'मराठी', thumb: '🚛', views: '5.6K' },
  { id: 4, title: 'Getting lab certified', duration: '2:07', lang: 'ਪੰਜਾਬੀ', thumb: '🧪', views: '3.2K' },
  { id: 5, title: 'AI insights explained', duration: '1:45', lang: 'தமிழ்', thumb: '🤖', views: '2.8K' },
  { id: 6, title: 'Using voice assistant', duration: '1:22', lang: 'తెలుగు', thumb: '🎤', views: '1.9K' },
];

const FAQS = [
  {
    q: 'How do I list my crop for sale?',
    qHi: 'मैं अपनी फसल कैसे बेचूं?',
    a: 'Go to Marketplace → Fill in crop details (type, quantity, grade, location) → Click "List Crop". Buyers will be notified instantly.'
  },
  {
    q: 'How long does lab certification take?',
    qHi: 'लैब सर्टिफिकेट में कितना समय लगता है?',
    a: 'NABL accredited labs issue results in 24-48 hours. Government labs may take 72 hours. You receive an SMS when results are ready.'
  },
  {
    q: 'Is my payment guaranteed once I accept an offer?',
    qHi: 'ऑफर स्वीकार करने पर भुगतान की गारंटी है?',
    a: 'Yes! All payments are processed through our secure escrow. Money is released to your account only after delivery confirmation.'
  },
  {
    q: 'What if transport partner cancels?',
    qHi: 'अगर ट्रांसपोर्ट पार्टनर रद्द कर दे तो?',
    a: 'Call our emergency helpline (1800-XXX-XXXX) immediately. We will arrange an alternative within 2 hours and compensate any losses.'
  },
  {
    q: 'How is the AI price suggestion calculated?',
    qHi: 'AI मूल्य सुझाव कैसे गणना होता है?',
    a: 'We analyze live mandi prices across 500+ mandis, pending buyer orders, weather forecasts, and seasonal demand to suggest the optimal price for your crop.'
  },
];

const ONBOARDING = [
  { title: 'Register & Verify', desc: 'Create account with mobile OTP → Complete profile → Verify Aadhaar KYC', icon: '📱' },
  { title: 'List Your Crop', desc: 'Go to Marketplace → Add crop details → Get AI price suggestion → List for buyers', icon: '🌾' },
  { title: 'Receive & Compare Offers', desc: 'Buyers send offers within hours → Compare price, distance, rating → Negotiate if needed', icon: '💼' },
  { title: 'Confirm & Track Delivery', desc: 'Choose best offer → Book transport → Track live → Receive payment securely', icon: '🚛' },
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [grievance, setGrievance] = useState({ type: '', desc: '', mobile: '' });
  const [submitted, setSubmitted] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [activeTab, setActiveTab] = useState('help');

  const handleGrievanceSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Grievance submitted! Ticket ID: GRV-2024-' + Math.floor(Math.random() * 10000));
  };

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 {t('nav.home') || 'Home'}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">🆘 {t('nav.help') || 'Help & Support'}</span>
        </div>

        {/* 24x7 Helpline — Prominent */}
        <div style={{
          background: 'linear-gradient(135deg, #C62828, #B71C1C)', borderRadius: 20, padding: '24px 28px',
          marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ fontSize: 52 }}>📞</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: 'white', marginBottom: 4 }}>
              24×7 Kisan Helpline
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', marginBottom: 12 }}>
              Toll-free · Available in 10 languages · Monday–Sunday
            </div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem', color: '#FFD54F' }}>
              1800-XXX-XXXX
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-gold btn-lg" onClick={() => toast.success('Calling 1800-XXX-XXXX...')}>
              📞 Call Now
            </button>
            <button
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#25D366', color: 'white', border: 'none', borderRadius: 12,
                padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', minHeight: 44,
              }}
              onClick={() => toast.success('Opening WhatsApp support...')}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['help', '🆘 Help Center'], ['tutorials', '🎥 Tutorials'], ['onboarding', '📖 Getting Started'], ['grievance', '📝 Grievance'], ['voice', '🎤 Voice Help']].map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)} style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === 'help' && (
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 16 }}>
              ❓ Frequently Asked Questions
            </h2>
            <div>
              {FAQS.map((faq, i) => (
                <div key={i} className={`accordion-item ${openFaq === i ? 'open' : ''}`}>
                  <div className="accordion-header" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{faq.q}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{faq.qHi}</div>
                    </div>
                    {openFaq === i ? <ChevronUp size={18} color="#1B5E20" /> : <ChevronDown size={18} color="#9CA3AF" />}
                  </div>
                  {openFaq === i && (
                    <div className="accordion-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live Chat Widget */}
            <div style={{
              background: 'var(--card-bg)', borderRadius: 16, padding: 20, marginTop: 20,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '2px solid #E8F5E9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AI Support Assistant</div>
                  <div style={{ fontSize: '0.75rem', color: '#4CAF50' }}>🟢 Online · Replies instantly</div>
                </div>
              </div>
              <div style={{ background: '#E8F5E9', borderRadius: '0 12px 12px 12px', padding: '10px 14px', marginBottom: 12, fontSize: '0.875rem', color: '#1B5E20' }}>
                Namaste! 🙏 Main Aarohan Agri ka AI assistant hun. Aapki kya madad kar sakta hun? Apna sawaal Hindi ya English mein poochein.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" className="form-input" placeholder="Type your question..." />
                <button className="btn btn-primary" style={{ padding: '10px 16px', minHeight: 48 }}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutorials */}
        {activeTab === 'tutorials' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                🎥 Video Tutorials — Regional Languages
              </h2>
              <select className="form-select" style={{ width: 'auto', background: '#F3F4F6', border: '1px solid var(--border)', padding: '8px 32px 8px 12px', minHeight: 40 }}>
                <option>All Languages</option>
                <option>हिंदी</option>
                <option>English</option>
                <option>मराठी</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {TUTORIALS.map(t => (
                <div key={t.id} style={{
                  background: 'var(--card-bg)', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => toast.success(`Playing: ${t.title}`)}>
                  <div style={{
                    background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', height: 120,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, position: 'relative',
                  }}>
                    {t.thumb}
                    <div style={{
                      position: 'absolute', width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>▶️</div>
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                      {t.duration}
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 6 }}>{t.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{t.lang}</span>
                      <span>👁️ {t.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started / Onboarding */}
        {activeTab === 'onboarding' && (
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 20 }}>
              📖 Getting Started — Step by Step Guide
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ONBOARDING.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, background: 'var(--card-bg)', borderRadius: 16, padding: 20,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #E8F5E9',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, background: '#E8F5E9', fontSize: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{step.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', background: '#1B5E20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
                      }}>{i + 1}</span>
                      <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#1B5E20', margin: 0 }}>{step.title}</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                  <CheckCircle size={24} color="#4CAF50" style={{ flexShrink: 0, marginTop: 4 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grievance Form */}
        {activeTab === 'grievance' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 500 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>📝 Submit Grievance</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>We resolve all grievances within 48 working hours</p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div className="success-icon" style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>Grievance Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>We will contact you within 48 hours.</p>
                <div style={{ background: '#E8F5E9', borderRadius: 12, padding: 12, fontSize: '0.85rem', color: '#1B5E20', fontWeight: 600 }}>
                  Ticket ID: GRV-2024-{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}
                </div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={() => setSubmitted(false)}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit}>
                <div className="form-group">
                  <label className="form-label">Issue Type</label>
                  <select className="form-select" value={grievance.type} onChange={e => setGrievance({...grievance, type: e.target.value})} required>
                    <option value="">Select issue type...</option>
                    <option>Payment not received</option>
                    <option>Transport partner cancelled</option>
                    <option>Lab test result delayed</option>
                    <option>Buyer did not pick up crop</option>
                    <option>Account/login issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={4} placeholder="Describe your issue in detail..." value={grievance.desc} onChange={e => setGrievance({...grievance, desc: e.target.value})} required style={{ minHeight: 100, resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Mobile</label>
                  <input type="tel" className="form-input" placeholder="Your mobile number" value={grievance.mobile} onChange={e => setGrievance({...grievance, mobile: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  📤 Submit Grievance
                </button>
              </form>
            )}
          </div>
        )}

        {/* Voice Help */}
        {activeTab === 'voice' && (
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', margin: '0 auto 24px',
              background: voiceActive ? 'linear-gradient(135deg, #FF8F00, #FFC107)' : 'linear-gradient(135deg, #1B5E20, #4CAF50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52,
              boxShadow: voiceActive ? '0 0 0 20px rgba(255,143,0,0.15), 0 0 0 40px rgba(255,143,0,0.05)' : '0 8px 32px rgba(27,94,32,0.3)',
              transition: 'all 0.3s', cursor: 'pointer',
            }} onClick={() => { setVoiceActive(!voiceActive); if (!voiceActive) toast.success('🎤 Voice assistant activated! Speak your query...'); }}>
              🎤
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.3rem', color: '#1B5E20', marginBottom: 8 }}>
              {voiceActive ? '🎤 Listening...' : 'Voice AI Assistant'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              Speak in your preferred language — Hindi, Marathi, Punjabi, Tamil and more. <br />
              <strong style={{ color: '#1B5E20' }}>Say: "Aaj ka soybean bhav batao", "Meri fasal list karo"</strong>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              {['"Aaj ka gehu ka bhav?"', '"Cold storage kahan hai?"', '"Meri last booking dikhao"', '"Lab test book karo"'].map(cmd => (
                <button key={cmd} className="filter-pill active" style={{ fontSize: '0.78rem' }}
                  onClick={() => { toast.success(`Command recognized: ${cmd}`); }}>
                  {cmd}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Works on low bandwidth · No internet needed for basic queries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
