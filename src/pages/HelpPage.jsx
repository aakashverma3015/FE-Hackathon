import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  Phone, MessageCircle, BookOpen, Mic, ChevronDown, ChevronUp, Send, 
  CheckCircle, LifeBuoy, Play, Search, HelpCircle, FileText, ArrowRight,
  Shield, Headset, MessageSquare, Clock
} from 'lucide-react';

const TUTORIALS = [
  { id: 1, title: 'Listing crops for sale', duration: '2:14', lang: 'हिंदी', views: '12.4K', color: 'var(--brand-600)' },
  { id: 2, title: 'Booking cold storage', duration: '1:58', lang: 'English', views: '8.1K', color: '#3B82F6' },
  { id: 3, title: 'Real-time Transport', duration: '2:31', lang: 'मराठी', views: '5.6K', color: '#F59E0B' },
  { id: 4, title: 'NABL Certification', duration: '2:07', lang: 'ਪੰਜਾਬੀ', views: '3.2K', color: '#8B5CF6' },
];

const FAQS = [
  {
    q: 'How do I list my crop for sale?',
    a: 'Navigate to the Marketplace tab and fill in your crop variety, quantity, and grade. Our AI will automatically suggest the best market price based on live Mandi data.'
  },
  {
    q: 'Is my payment guaranteed once I accept an offer?',
    a: 'Absolutely. All transactions are backed by our secure Escrow system. Funds are released to your bank account only after the buyer confirms the delivery of the goods.'
  },
  {
    q: 'What happens if a transport partner cancels?',
    a: 'We monitor active bookings 24/7. In case of a cancellation, our logistics engine automatically reroutes an alternative provider within 2 hours.'
  },
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('center');
  const [voiceActive, setVoiceActive] = useState(false);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Support Center</span>
        </div>

        {/* ── EMERGENCY HOTLINE ── */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1E293B, #0F172A)', borderRadius: 20, padding: '32px 40px', marginBottom: 32, 
          color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, background: '#EF4444', filter: 'blur(100px)', opacity: 0.15 }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Headset size={24} color="#EF4444" />
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>24/7 Priority Helpline</span>
              </div>
              <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: 8 }}>Connect with an Expert</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem', maxWidth: 450 }}>
                Direct human assistance for procurement, logistics, or payment disputes. Available in 10+ regional languages.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FCD34D', letterSpacing: '-0.02em' }}>1800-419-1221</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" style={{ background: '#EF4444', height: 44, padding: '0 24px' }}>Call Now</button>
                <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0 24px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={18} /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div style={{ 
          display: 'flex', gap: 8, background: 'var(--bg-card)', padding: 6, borderRadius: 14, 
          marginBottom: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', width: 'fit-content'
        }}>
          {[
            { id: 'center', label: 'Help Center', icon: <LifeBuoy size={16} /> },
            { id: 'tutorials', label: 'Video Academy', icon: <Play size={16} /> },
            { id: 'voice', label: 'Voice Assistant', icon: <Mic size={16} /> },
            { id: 'grievance', label: 'Grievance', icon: <FileText size={16} /> },
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

        {/* ── TAB CONTENT: CENTER ── */}
        {activeTab === 'center' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 32 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 20 }}>Common Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ 
                    background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', 
                    overflow: 'hidden', cursor: 'pointer' 
                  }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{faq.q}</span>
                      {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    {openFaq === i && (
                      <div style={{ padding: '0 20px 20px', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ 
                background: 'var(--bg-card)', borderRadius: 24, padding: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                display: 'flex', gap: 20
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: 8 }}>Secure Escrow Policy</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Your payments are held in a secure multi-sig escrow until delivery is verified. We ensure zero payment defaults.
                  </p>
                  <button style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 800, fontSize: '0.8125rem', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    Read Documentation <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div style={{ 
                background: 'var(--brand-600)', borderRadius: 24, padding: 32, color: 'white',
                display: 'flex', gap: 20
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: 8 }}>Chat with Support</h4>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                    Average response time: <strong>4 mins</strong>.
                  </p>
                  <button className="btn btn-secondary" style={{ marginTop: 16 }}>Start Live Chat</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: TUTORIALS ── */}
        {activeTab === 'tutorials' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {TUTORIALS.map(vid => (
              <div key={vid.id} style={{ 
                background: 'var(--bg-card)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)',
                transition: 'transform 0.2s', cursor: 'pointer'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}>
                <div style={{ height: 160, background: vid.color, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Play size={40} fill="currentColor" />
                  <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4, fontSize: '0.625rem', fontWeight: 800 }}>{vid.duration}</div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', marginBottom: 12 }}>{vid.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HelpCircle size={14} /> {vid.lang}</span>
                    <span>{vid.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB CONTENT: VOICE ── */}
        {activeTab === 'voice' && (
          <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
            <div 
              onClick={() => { setVoiceActive(!voiceActive); if(!voiceActive) toast.success('Mic Active: Speak your query'); }}
              style={{ 
                width: 120, height: 120, borderRadius: 99, background: voiceActive ? 'var(--brand-600)' : 'var(--bg-card)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 32px', cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: voiceActive ? '0 0 0 20px var(--brand-50)' : 'var(--shadow-md)'
              }}
            >
              <Mic size={48} color={voiceActive ? 'white' : 'var(--brand-600)'} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 12 }}>Speak your Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 32 }}>
              Our multi-lingual AI can help you list crops, check rates, or book a truck via voice commands.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {['"List my Soybean"', '"Check Indore Mandi prices"', '"Track my shipment"'].map(cmd => (
                <div key={cmd} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>{cmd}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: GRIEVANCE ── */}
        {activeTab === 'grievance' && (
          <div style={{ maxWidth: 640, margin: '0 auto', background: 'var(--bg-card)', padding: 40, borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
             <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 12 }}>Formal Grievance</h3>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: 32 }}>Official submission for complex issues. Guaranteed resolution T+48 hours.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Vocation Category</label>
                 <select className="form-select" style={{ width: '100%', height: 48 }}>
                   <option>Payment Hold / Escrow Dispute</option>
                   <option>Logistics Non-Compliance</option>
                   <option>Quality Report Contest</option>
                   <option>Buyer Default</option>
                 </select>
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Detailed Description</label>
                 <textarea className="form-input" style={{ width: '100%', minHeight: 120, padding: 16 }} placeholder="Please provide order IDs or certificate hashes if relevant..."></textarea>
               </div>
               <button className="btn btn-primary btn-full" style={{ height: 48 }} onClick={() => toast.success('Grievance ticket #9822 filed')}>Submit Official Ticket</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
