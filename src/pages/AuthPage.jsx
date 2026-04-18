import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';
import { useApp } from '../context/AppContext';
import { TabTransition } from '../components/PageTransition';
import {
  Mic, Globe, ChevronDown, Eye, EyeOff, ArrowLeft, Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const TABS = [
  { id: 'farmer',    emoji: '🌾', labelKey: 'roles.farmer',    color: '#1B5E20', bg: '#E8F5E9'  },
  { id: 'buyer',     emoji: '🏪', labelKey: 'roles.buyer',     color: '#1565C0', bg: '#E3F2FD'  },
  { id: 'middleman', emoji: '🤝', labelKey: 'roles.middleman', color: '#6A1B9A', bg: '#F3E5F5'  },
];

const BUYER_SUBTYPES = [
  { id: 'wholesaler', emoji: '🏭', labelKey: 'roles.wholesaler' },
  { id: 'retailer',   emoji: '🛒', labelKey: 'roles.retailer' },
  { id: 'cold',       emoji: '🧊', labelKey: 'roles.coldStorage' },
  { id: 'transport',  emoji: '🚛', labelKey: 'roles.transport' },
  { id: 'export',     emoji: '🌍', labelKey: 'roles.exporter' },
];

const STATS = [
  { value: '12,000+', key: 'app.stats.farmers' },
  { value: '₹47 Cr',  key: 'app.stats.saved' },
  { value: '340+',    key: 'app.stats.buyers' },
  { value: '5',       key: 'app.stats.states' },
];

const INDIAN_STATES = [
  'Madhya Pradesh','Maharashtra','Punjab','Gujarat','Rajasthan','Uttar Pradesh',
  'Bihar','West Bengal','Odisha','Karnataka','Tamil Nadu','Andhra Pradesh','Telangana',
  'Haryana','Himachal Pradesh','Uttarakhand','Jharkhand','Chhattisgarh','Kerala',
  'Assam','Other',
];

/* ──────────────────────────── COMPONENT ─────────────────────────── */
export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const { setUser } = useApp();
  const navigate = useNavigate();

  /* UI state */
  const [activeTab, setActiveTab]       = useState('farmer');
  const [mode, setMode]                 = useState('login');   // 'login' | 'register'
  const [loginMethod, setLoginMethod]   = useState('mobile');  // 'mobile' | 'email'
  const [langOpen, setLangOpen]         = useState(false);
  const [listening, setListening]       = useState(false);
  const [loading, setLoading]           = useState(false);
  const [step, setStep]                 = useState(1);         // 1=credentials, 2=otp, 3=reg-details, 4=success

  /* Form state – login */
  const [mobile, setMobile] = useState('');
  const [email,  setEmail]  = useState('');
  const [pass,   setPass]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp,    setOtp]    = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpValue, setDemoOtpValue] = useState(null);

  /* Form state – buyer subtype */
  const [buyerType, setBuyerType] = useState('wholesaler');

  /* Form state – registration */
  const [reg, setReg] = useState({
    name: '', mobile: '', email: '', village: '', state: 'Madhya Pradesh',
    aadhar: '', crops: '', company: '', gst: '', license: '',
    pass: '', confirmPass: '', agreeTerms: false,
  });

  const curLang   = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[1];
  const curTab    = TABS.find(t => t.id === activeTab) || TABS[0];

  /* ── Handlers ── */
  const resetForm = () => { setMobile(''); setEmail(''); setPass(''); setOtp(''); setOtpSent(false); setStep(1); };
  const switchTab = (id) => { setActiveTab(id); resetForm(); setMode('login'); };

  const handleSendOtp = async () => {
    if (mobile.length < 10) { toast.error('10 अंकों का मोबाइल नंबर दर्ज करें'); return; }
    setLoading(true);
    try {
      const res = await authAPI.sendOtp(mobile, 'login');
      setOtpSent(true);
      toast.success(res.message || `OTP sent to +91 ${mobile}`);
      if (res.demo_otp) {
        setDemoOtpValue(res.demo_otp);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}. Is backend running?`);
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async () => {
    setLoading(true);
    try {
      const roleMap = { farmer: 'farmer', buyer: buyerType, middleman: 'middleman' };
      const currentRole = roleMap[activeTab];

      let res;
      if (loginMethod === 'mobile') {
        res = await authAPI.verifyOtp(mobile, otp, currentRole);
      } else {
        res = await authAPI.loginEmail(email, pass, currentRole);
      }
      
      if (res.token || res.accessToken) {
        localStorage.setItem('aarohan-token', res.token || res.accessToken);
      }

      setUser({
        ...res.user,
        role: res.user?.role || currentRole,
        name: res.user?.name || (activeTab === 'farmer' ? 'New Farmer' : 'Buyer User'),
        mobile: res.user?.mobile || mobile,
        village: res.user?.village || 'Unknown Location',
        rating: res.user?.rating || 4.8,
        profileComplete: res.user?.profileComplete || 80,
      });
      toast.success('🌾 Aarohan Agri में आपका स्वागत है!');
      if (activeTab === 'buyer') navigate('/wholesaler');
      else if (activeTab === 'middleman') navigate('/ai-insights');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed! Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (loginMethod === 'mobile' && otpSent && otp.length < 4) { toast.error('OTP दर्ज करें'); return; }
    if (loginMethod === 'email' && (!email || !pass)) { toast.error('Email और Password दर्ज करें'); return; }
    doLogin();
  };

  const handleRegSubmit = () => {
    if (!reg.name || !reg.mobile || !reg.pass) { toast.error('सभी जरूरी फ़ील्ड भरें'); return; }
    if (reg.pass !== reg.confirmPass) { toast.error('Password मेल नहीं खाता'); return; }
    if (!reg.agreeTerms) { toast.error('Terms & Conditions स्वीकार करें'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      toast.success('✅ पंजीकरण सफल!');
      
      setTimeout(() => {
        const roleMap = { farmer: 'farmer', buyer: buyerType, middleman: 'middleman' };
        const currentRole = roleMap[activeTab];
        
        setUser({
          name: reg.name,
          role: currentRole,
          mobile: reg.mobile,
          email: reg.email,
          village: reg.village || 'Pending',
          state: reg.state,
          crops: reg.crops ? reg.crops.split(',').map(c => c.trim()) : [],
          rating: 4.8,
          profileComplete: 80,
        });
        
        if (activeTab === 'buyer') navigate('/wholesaler');
        else if (activeTab === 'middleman') navigate('/ai-insights');
        else navigate('/dashboard');
      }, 2000);
    }, 1800);
  };

  const handleVoice = () => {
    setListening(true);
    toast('🎤 बोलिए... सुन रहे हैं', { style: { background: '#FF8F00', color: 'white' }, duration: 2500 });
    setTimeout(() => { setListening(false); toast.success('Voice demo activated!'); }, 2500);
  };

  const updReg = (k, v) => setReg(prev => ({ ...prev, [k]: v }));

  /* ── Render ── */
  return (
    <div style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      animation: 'authPageEnter 0.55s cubic-bezier(0.4,0,0.2,1) both',
    }}>
      {/* ── Ultra Premium Image Background ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('/agri_premium_bg.png')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        zIndex: 0
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)' }} />
      </div>

      {/* ── All content above background ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* TOP BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ fontSize: 30 }}>🌾</div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem', color: 'white', lineHeight: 1.1 }}>Aarohan Agri</div>
            <div style={{ fontSize: '0.62rem', color: '#FF8F00', fontWeight: 600 }}>अपनी फसल, अपना दाम</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Back to language select */}
          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '6px 12px',
            color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', minHeight: 36,
          }}>
            <ArrowLeft size={14} /> भाषा
          </button>

          {/* Language Selector */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 12, padding: '8px 14px', color: 'white', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(8px)', minHeight: 40,
            }}>
              <Globe size={15} /> {curLang.flag} {curLang.native} <ChevronDown size={13} />
            </button>
            {langOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '110%',
                background: 'var(--card-bg)', borderRadius: 16, boxShadow: '0 8px 36px rgba(0,0,0,0.2)',
                minWidth: 200, zIndex: 200, overflow: 'hidden', maxHeight: 360, overflowY: 'auto',
              }}>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('preferred-language', lang.code); setLangOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px',
                    border: 'none', background: lang.code === i18n.language ? '#E8F5E9' : 'white',
                    cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left',
                    color: lang.code === i18n.language ? '#1B5E20' : '#374151',
                    fontWeight: lang.code === i18n.language ? 700 : 400,
                  }}>
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px 32px', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 36, maxWidth: 980, width: '100%', alignItems: 'start' }}>

          {/* LEFT: Hero + Stats */}
          <div style={{ color: 'white' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,143,0,0.2)', border: '1px solid rgba(255,143,0,0.4)',
              borderRadius: 100, padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600,
              color: '#FFD54F', marginBottom: 18,
            }}>🚀 India's #1 Agri Platform</div>
            <h1 style={{ fontFamily: 'Poppins', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, color: 'white' }}>
              {t('app.tagline')}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: 26 }}>
              {t('app.description')}
            </p>
            {/* Stat Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 22 }}>
              {STATS.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px',
                  backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)',
                }}>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.35rem', color: '#FFD54F' }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{t(s.key)}</div>
                </div>
              ))}
            </div>
            {/* Trust badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[['🛡️', t('trust.apmc')], ['🏆', t('trust.iso')], ['🔒', t('trust.secure')]].map(([icon, txt]) => (
                <span key={txt} className="trust-badge">{icon} {txt}</span>
              ))}
            </div>
          </div>

          {/* RIGHT: Auth Card */}
          <div style={{
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
            borderRadius: 24, padding: 28, boxShadow: '0 24px 72px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            {step < 4 && (
              <>
                {/* ROLE TABS */}
                <div style={{ display: 'flex', marginBottom: 22, background: '#F3F4F6', borderRadius: 12, padding: 4, gap: 3 }}>
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => switchTab(tab.id)} style={{
                      flex: 1, padding: '9px 4px', borderRadius: 9, fontSize: '0.78rem', fontWeight: 700,
                      border: 'none', cursor: 'pointer', transition: 'all 0.22s',
                      background: activeTab === tab.id ? 'white' : 'transparent',
                      color: activeTab === tab.id ? tab.color : '#6B7280',
                      boxShadow: activeTab === tab.id ? '0 2px 10px rgba(0,0,0,0.12)' : 'none',
                      minHeight: 40,
                    }}>
                      <div style={{ fontSize: '1.1rem' }}>{tab.emoji}</div>
                      <div style={{ marginTop: 2, lineHeight: 1.2 }}>{t(tab.labelKey)}</div>
                    </button>
                  ))}
                </div>

                {/* MODE TOGGLE — Login / Register */}
                <div style={{ display: 'flex', gap: 4, background: curTab.bg, borderRadius: 10, padding: 4, marginBottom: 20 }}>
                  {['login', 'register'].map(m => (
                    <button key={m} onClick={() => { setMode(m); resetForm(); }} style={{
                      flex: 1, padding: '9px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s', minHeight: 40,
                      background: mode === m ? curTab.color : 'transparent',
                      color: mode === m ? 'white' : curTab.color,
                    }}>
                      {m === 'login' ? `🔑 ${t('auth.loginBtn')}` : `📝 ${t('auth.register')}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Buyer Sub-Type (only on login) ── */}
            {activeTab === 'buyer' && mode === 'login' && step < 2 && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  आप कौन हैं? / Who are you?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {BUYER_SUBTYPES.map(bt => (
                    <button key={bt.id} onClick={() => setBuyerType(bt.id)} style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                      border: buyerType === bt.id ? `2px solid #1565C0` : '2px solid #e2e8f0',
                      background: buyerType === bt.id ? '#E3F2FD' : 'white',
                      color: buyerType === bt.id ? '#1565C0' : '#6B7280',
                      cursor: 'pointer', transition: 'all 0.2s', minHeight: 36,
                    }}>
                      {bt.emoji} {t(bt.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ════════  LOGIN FLOW  ════════ */}
            {mode === 'login' && step < 3 && (
              <TabTransition activeTab={activeTab} direction="fade-up">
                <LoginFlow
                  loginMethod={loginMethod} setLoginMethod={setLoginMethod}
                  mobile={mobile} setMobile={setMobile}
                  email={email} setEmail={setEmail}
                  pass={pass} setPass={setPass}
                  showPass={showPass} setShowPass={setShowPass}
                  otp={otp} setOtp={setOtp}
                  otpSent={otpSent} loading={loading} demoOtpValue={demoOtpValue}
                  handleSendOtp={handleSendOtp} handleLogin={handleLogin}
                  handleVoice={handleVoice} listening={listening}
                  setMode={setMode} curTab={curTab} t={t}
                />
              </TabTransition>
            )}

            {/* ════════  REGISTER FLOW  ════════ */}
            {mode === 'register' && step < 4 && (
              <TabTransition activeTab={activeTab} direction="fade-up">
                <RegisterFlow
                  activeTab={activeTab} curTab={curTab}
                  reg={reg} updReg={updReg}
                  buyerType={buyerType} setBuyerType={setBuyerType}
                  loading={loading} handleRegSubmit={handleRegSubmit}
                  setMode={setMode} t={t}
                />
              </TabTransition>
            )}

            {/* ════════  SUCCESS SCREEN  ════════ */}
            {step === 4 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce-in 0.5s ease' }}>✅</div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#1B5E20', marginBottom: 8 }}>{t('auth.success')}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{t('auth.redirecting')}</p>
                <div style={{ width: 40, height: 4, background: '#1B5E20', borderRadius: 2, margin: '16px auto 0', animation: 'loading-bar 2s linear forwards' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS TICKER */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <div style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-block', animation: 'ticker 30s linear infinite', paddingLeft: '100%' }}>
            {[...STATS, ...STATS, ...STATS].map((s, i) => (
              <span key={i} style={{ marginRight: 60, color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                <span style={{ color: '#FFD54F' }}>✦ {s.value}</span> {s.en}&nbsp;
              </span>
            ))}
            <span style={{ marginRight: 60, color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
              🛡️ {t('trust.apmc')} &nbsp; ⭐ {t('trust.iso')} &nbsp; 🔒 {t('trust.secure')} &nbsp; 🤖 {t('trust.ai')}
            </span>
          </div>
        </div>
      </div>

      </div>{/* end zIndex wrapper */}

      <style>{`
        @keyframes authPageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading-bar { from{width:0} to{width:100%} }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════ LOGIN FLOW SUB-COMPONENT ═══════════════════ */
function LoginFlow({ loginMethod, setLoginMethod, mobile, setMobile, email, setEmail, pass, setPass, showPass, setShowPass, otp, setOtp, otpSent, loading, handleSendOtp, handleLogin, handleVoice, listening, setMode, curTab, t, demoOtpValue }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.25rem', color: '#1a1a1a', marginBottom: 4 }}>
        {t('auth.welcomeBack')}
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 18 }}>{t('auth.loginPrompt')}</p>

      {/* Login Method Tabs */}
      <div className="tabs" style={{ marginBottom: 18, background: '#F3F4F6' }}>
        <button className={`tab-btn ${loginMethod === 'mobile' ? 'active' : ''}`} onClick={() => setLoginMethod('mobile')}>📱 {t('auth.mobileOtp')}</button>
        <button className={`tab-btn ${loginMethod === 'email' ? 'active' : ''}`} onClick={() => setLoginMethod('email')}>✉️ {t('auth.email')}</button>
      </div>

      {loginMethod === 'mobile' ? (
        <div>
          <div className="form-group">
            <label className="form-label">📱 {t('auth.mobileOtp')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#F3F4F6', borderRadius: 12, border: '2px solid #e2e8f0', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', flexShrink: 0 }}>🇮🇳 +91</div>
              <input type="tel" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ''))} placeholder={t('auth.mobilePlaceholder')} className="form-input" style={{ flex: 1 }} />
            </div>
          </div>
          {otpSent && (
            <div className="form-group">
              <label className="form-label">
                🔑 {t('auth.enterOtp')} 
                {demoOtpValue && (
                  <span style={{ fontSize: '0.8rem', marginLeft: 8, color: 'var(--text-secondary)' }}>
                    (Test API OTP: <strong style={{ color: curTab.color }}>{demoOtpValue}</strong>)
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2, 3].map(i => (
                  <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={otp[i] || ''}
                    onChange={e => {
                      const arr = otp.split(''); arr[i] = e.target.value; setOtp(arr.join(''));
                      if (e.target.value) {
                        const next = document.getElementById(`otp-${i + 1}`);
                        if (next) next.focus();
                      }
                    }}
                    style={{ width: 52, height: 54, textAlign: 'center', fontSize: '1.3rem', fontWeight: 800, border: '2.5px solid #e2e8f0', borderRadius: 12, outline: 'none', transition: 'all 0.2s', flex: 1 }}
                    onFocus={e => e.target.style.borderColor = curTab.color}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                ))}
              </div>
            </div>
          )}
          {!otpSent
            ? <button className="btn btn-primary btn-full btn-lg" onClick={handleSendOtp} disabled={loading} style={{ background: `linear-gradient(135deg, ${curTab.color}, ${curTab.color}cc)`, marginBottom: 10 }}>
                {loading ? <><Loader size={18} className="spin" /> {t('auth.sending')}</> : `📤 ${t('auth.sendOtp')}`}
              </button>
            : <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading} style={{ background: `linear-gradient(135deg, ${curTab.color}, ${curTab.color}cc)`, marginBottom: 10 }}>
                {loading ? <><Loader size={18} className="spin" /> {t('auth.verifying')}</> : `✅ ${t('auth.verifyLogin')}`}
              </button>
          }
        </div>
      ) : (
        <div>
          <div className="form-group">
            <label className="form-label">✉️ {t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="aapka@email.com" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">🔐 {t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder={t('auth.password')} className="form-input" style={{ paddingRight: 48 }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, minHeight: 36 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading} style={{ background: `linear-gradient(135deg, ${curTab.color}, ${curTab.color}cc)`, marginBottom: 10 }}>
            {loading ? t('auth.loggingIn') : `🔑 ${t('auth.loginBtn')}`}
          </button>
        </div>
      )}

      {/* Voice Login */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>या</span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>
      <button onClick={handleVoice} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '12px 20px', borderRadius: 12, border: `2px solid #FF8F00`,
        background: listening ? '#FF8F00' : '#FFF8E1', color: listening ? 'white' : '#E65100',
        fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', minHeight: 48,
      }}>
        {t('auth.voiceLogin')}
      </button>

      {/* Register link */}
      <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {t('auth.newHere')}{' '}
        <button onClick={() => setMode('register')} style={{ fontWeight: 700, color: curTab.color, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', minHeight: 32 }}>
          🌱 {t('auth.register')}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════ REGISTER FLOW SUB-COMPONENT ═══════════════════ */
function RegisterFlow({ activeTab, curTab, reg, updReg, buyerType, setBuyerType, loading, handleRegSubmit, setMode, t }) {
  const inputStyle = { width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0', borderRadius: 12, fontSize: '0.95rem', color: '#1a1a1a', background: 'var(--card-bg)', transition: 'all 0.2s', minHeight: 48, display: 'block', marginTop: 6 };

  return (
    <div>
      <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem', color: '#1a1a1a', marginBottom: 4 }}>
        {activeTab === 'farmer' ? `🌾 ${t('auth.registerFarmer')}` : activeTab === 'buyer' ? `🏪 ${t('auth.registerBuyer')}` : `🤝 ${t('auth.registerAgent')}`}
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 18 }}>
        APMC Verified • Free Registration • Instant Access
      </p>

      {activeTab === 'buyer' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>{t('auth.whoAreYou')}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { id: 'wholesaler', emoji: '🏭', labelKey: 'roles.wholesaler' },
              { id: 'retailer', emoji: '🛒', labelKey: 'roles.retailer' },
              { id: 'cold', emoji: '🧊', labelKey: 'roles.coldStorage' },
              { id: 'transport', emoji: '🚛', labelKey: 'roles.transport' },
            ].map(bt => (
              <button key={bt.id} onClick={() => setBuyerType(bt.id)} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                border: buyerType === bt.id ? `2px solid ${curTab.color}` : '2px solid #e2e8f0',
                background: buyerType === bt.id ? `${curTab.bg}` : 'white',
                color: buyerType === bt.id ? curTab.color : '#6B7280', cursor: 'pointer', minHeight: 36,
              }}>
                {bt.emoji} {t(bt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12-3 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.fullName')}</label>
          <input style={inputStyle} placeholder="Ramesh Patel" value={reg.name} onChange={e => updReg('name', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.mobileOtp')}</label>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', background: '#F3F4F6', borderRadius: 10, border: '2px solid #e2e8f0', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>🇮🇳 +91</span>
            <input style={{ ...inputStyle, marginTop: 0, flex: 1 }} type="tel" maxLength={10} placeholder="9876543210" value={reg.mobile} onChange={e => updReg('mobile', e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.email')}</label>
          <input style={inputStyle} type="email" placeholder="aapka@email.com" value={reg.email} onChange={e => updReg('email', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.village')}</label>
          <input style={inputStyle} placeholder="Mhow" value={reg.village} onChange={e => updReg('village', e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.state')}</label>
          <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={reg.state} onChange={e => updReg('state', e.target.value)}>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {activeTab === 'farmer' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.crops')}</label>
            <input style={inputStyle} placeholder="Soybean, Wheat" value={reg.crops} onChange={e => updReg('crops', e.target.value)} />
          </div>
        )}
        {(activeTab === 'buyer' || activeTab === 'middleman') && (
          <>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.company')}</label>
              <input style={inputStyle} placeholder="ABC Traders" value={reg.company} onChange={e => updReg('company', e.target.value)} />
            </div>
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.gst')}</label>
              <input style={inputStyle} placeholder="22AAAAA0000A1Z5" value={reg.gst} onChange={e => updReg('gst', e.target.value)} />
            </div>
          </>
        )}
        <div>
          <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.aadhaar')}</label>
          <input style={inputStyle} type="tel" maxLength={4} placeholder="XXXX" value={reg.aadhar} onChange={e => updReg('aadhar', e.target.value.replace(/\D/g, ''))} />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.password')} *</label>
            <input style={inputStyle} type="password" placeholder="Min 8" value={reg.pass} onChange={e => updReg('pass', e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{t('auth.confirmPass')}</label>
            <input style={inputStyle} type="password" placeholder="Repeat" value={reg.confirmPass} onChange={e => updReg('confirmPass', e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '14px 0' }}>
        <input type="checkbox" id="terms" checked={reg.agreeTerms} onChange={e => updReg('agreeTerms', e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, accentColor: curTab.color, cursor: 'pointer' }} />
        <label htmlFor="terms" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
          {t('auth.agreeTerms')}
        </label>
      </div>

      <button className="btn btn-full btn-lg" onClick={handleRegSubmit} disabled={loading} style={{
        background: `linear-gradient(135deg, ${curTab.color}, ${curTab.color}cc)`,
        color: 'white', marginBottom: 12, borderRadius: 12,
      }}>
        {loading ? `⏳ ${t('auth.redirecting')}` : `✅ ${t('auth.register')}`}
      </button>

      <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {t('auth.alreadyHaveAccount')}{' '}
        <button onClick={() => setMode('login')} style={{ fontWeight: 700, color: curTab.color, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', minHeight: 32 }}>
          {t('auth.loginBtn')}
        </button>
      </div>
    </div>
  );
}

