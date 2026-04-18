import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';
import { Mic, Globe, ChevronDown, Shield, Award, Lock, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';

const ROLES = [
  { id: 'farmer', emoji: '🌾', label: 'Farmer', labelHi: 'किसान' },
  { id: 'wholesaler', emoji: '🏪', label: 'Wholesaler/Retailer', labelHi: 'थोक/खुदरा' },
  { id: 'cold', emoji: '🧊', label: 'Cold Storage', labelHi: 'शीत भंडार' },
  { id: 'transport', emoji: '🚛', label: 'Transport Partner', labelHi: 'परिवहन' },
  { id: 'admin', emoji: '🛠️', label: 'Admin', labelHi: 'एडमिन' },
];

const STATS = [
  { value: '12,000+', label: 'Farmers', labelHi: 'किसान' },
  { value: '₹47 Cr', label: 'Saved', labelHi: 'बचाए' },
  { value: '340+', label: 'Verified Buyers', labelHi: 'सत्यापित खरीदार' },
  { value: '5 States', label: 'Active', labelHi: 'राज्य सक्रिय' },
];

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [loginMethod, setLoginMethod] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [demoOtpValue, setDemoOtpValue] = useState(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[1];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    width: `${Math.random() * 40 + 20}px`,
    height: `${Math.random() * 40 + 20}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: i % 3 === 0 ? '#FF8F00' : i % 3 === 1 ? '#4CAF50' : '#FFF',
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${8 + Math.random() * 8}s`,
  }));

  const handleSendOtp = async () => {
    if (mobile.length < 10) { toast.error('Please enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const res = await authAPI.sendOtp({ mobile });
      setOtpSent(true);
      toast.success(res.data?.message || 'OTP sent to +91 ' + mobile);
      if (res.data?.demo_otp) {
        setDemoOtpValue(res.data.demo_otp);
      }
    } catch (err) {
      toast.error('Failed to send OTP. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      let res;
      if (loginMethod === 'mobile') {
        res = await authAPI.verifyOtp({ mobile, otp });
      } else {
        res = await authAPI.login({ email, password });
      }
      
      if (res.data?.token) {
        localStorage.setItem('aarohan-token', res.data.token);
      }
      
      toast.success('🌾 Welcome to Aarohan Agri!');
      if (selectedRole === 'wholesaler') navigate('/wholesaler');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed! Invalid credentials/OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('Voice login is not supported in this browser. Please use Chrome or Edge.'));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

    let loadToastId = null;

    recognition.onstart = () => {
      setListening(true);
      setVoiceText('');
      loadToastId = toast.loading('🎤 Listening... Please speak now.', { style: { background: 'var(--gold-pale)', color: '#FF8F00' } });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setVoiceText(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);
      toast.dismiss(loadToastId);
      toast.error(`Voice error: ${event.error}. Please ensure microphone permissions are granted.`);
    };

    recognition.onend = () => {
      setListening(false);
      
      // Since closures might trap stale state in event listeners without refs,
      // we extract the final text from the state setter callback to be perfectly safe,
      // but standard React flow has setVoiceText run immediately before onend fires.
      setVoiceText(finalText => {
        toast.dismiss(loadToastId);
        
        if (!finalText) {
          toast.error("Didn't catch that. Please click the mic and try again.");
          return finalText;
        }

        // Extremely generous keyword matching
        const isWholesaler = finalText.includes('wholesaler') || finalText.includes('buyer') || finalText.includes('व्यापारी') || finalText.includes('खरीदार');
        const isFarmer = finalText.includes('farmer') || finalText.includes('किसान') || finalText.includes('लॉगिन') || finalText.includes('login');
        const destination = isWholesaler ? '/wholesaler' : '/dashboard';
        const roleStr = isWholesaler ? 'Wholesaler' : 'Farmer';

        if (isWholesaler || isFarmer) {
          toast.success(`" ${finalText} "`);
          toast.loading(`Logging in as ${roleStr}...`);
          setTimeout(() => {
            toast.dismiss();
            toast.success(`🌾 Successfully logged in via Voice!`);
            navigate(destination);
          }, 1500);
        } else {
          toast.error(`Recognized: " ${finalText} ". Please say "Login as Farmer".`);
        }
        return finalText;
      });
    };

    recognition.start();
  };

  return (
    <div className="landing-hero" style={{ minHeight: '100vh' }}>
      {/* Particle Background */}
      <div className="particles">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>
      {/* Pattern Overlay */}
      <div className="hero-overlay" />

      {/* Wheat field decorative SVG */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.12, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,100 Q180,20 360,100 Q540,180 720,100 Q900,20 1080,100 Q1260,180 1440,100 L1440,200 L0,200 Z" fill="#4CAF50"/>
        </svg>
      </div>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 32 }}>🌾</div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.3rem', color: 'white', lineHeight: 1.1 }}>Aarohan Agri</div>
            <div style={{ fontSize: '0.65rem', color: '#FF8F00', fontWeight: 600 }}>आरोहण एग्री</div>
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 12, padding: '8px 14px', color: 'white',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, backdropFilter: 'blur(8px)',
              minHeight: 44,
            }}
          >
            <Globe size={16} />
            {currentLang.flag} {currentLang.native}
            <ChevronDown size={14} />
          </button>
          {langOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '110%',
              background: 'var(--card-bg)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              minWidth: 200, zIndex: 100, overflow: 'hidden', maxHeight: 360, overflowY: 'auto',
            }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px',
                    border: 'none', background: lang.code === i18n.language ? '#E8F5E9' : 'white',
                    cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left',
                    color: lang.code === i18n.language ? '#1B5E20' : '#374151',
                    fontWeight: lang.code === i18n.language ? 700 : 400,
                  }}>
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 24px', position: 'relative', zIndex: 5,
        flexDirection: 'column',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 40, maxWidth: 960, width: '100%', alignItems: 'center' }}>
          {/* Hero Text */}
          <div style={{ color: 'white' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,143,0,0.2)', border: '1px solid rgba(255,143,0,0.4)',
              borderRadius: 100, padding: '6px 16px', fontSize: '0.8rem', fontWeight: 600,
              color: '#FFD54F', marginBottom: 20,
            }}>
              🚀 India's #1 Agri Supply Chain Platform
            </div>
            <h1 style={{
              fontFamily: 'Poppins', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900,
              lineHeight: 1.15, marginBottom: 16, color: 'white',
            }}>
              {t('app.tagline') || t('tagline')}
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 28 }}>
              {t('app.description') || t('taglineSub')}
            </p>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {STATS.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.1)', borderRadius: 12,
                  padding: '14px 16px', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#FFD54F' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{s.labelHi} / {s.label}</div>
                </div>
              ))}
            </div>
            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
              {[
                { icon: Shield, text: 'APMC Verified' },
                { icon: Award, text: 'ISO Certified' },
                { icon: Lock, text: 'Data Secure' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="trust-badge">
                  <Icon size={13} /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div style={{
            background: 'var(--card-bg)', borderRadius: 24, padding: 32,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#1B5E20', marginBottom: 6 }}>
              Welcome Back 🙏
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Login to your Aarohan Agri account</p>

            {/* Role Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Login As
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ROLES.map(role => (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                      border: selectedRole === role.id ? '2px solid #1B5E20' : '2px solid #e2e8f0',
                      background: selectedRole === role.id ? '#E8F5E9' : 'white',
                      color: selectedRole === role.id ? '#1B5E20' : '#6B7280',
                      cursor: 'pointer', transition: 'all 0.2s', minHeight: 36,
                    }}>
                    {role.emoji} {role.labelHi}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Method Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
              <button className={`tab-btn ${loginMethod === 'mobile' ? 'active' : ''}`}
                onClick={() => setLoginMethod('mobile')}>
                📱 Mobile + OTP
              </button>
              <button className={`tab-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => setLoginMethod('email')}>
                ✉️ Email
              </button>
            </div>

            {loginMethod === 'mobile' ? (
              <div>
                <div className="form-group">
                  <label className="form-label">📱 {t('mobileNumber')}</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', padding: '0 12px',
                      background: '#F3F4F6', borderRadius: 12, border: '2px solid #e2e8f0',
                      fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', minWidth: 56,
                    }}>🇮🇳 +91</div>
                    <input
                      type="tel" maxLength={10} value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder={t('enterMobile')}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                {otpSent && (
                  <div className="form-group">
                    <label className="form-label">🔑 {t('enterOtp')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[0,1,2,3,4,5].map(i => (
                        <input key={i} type="text" maxLength={1}
                          value={otp[i] || ''}
                          onChange={e => {
                            const val = otp.split('');
                            val[i] = e.target.value;
                            setOtp(val.join(''));
                            if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                          }}
                          style={{
                            width: 40, height: 48, textAlign: 'center', fontSize: '1.1rem', fontWeight: 700,
                            border: '2px solid #e2e8f0', borderRadius: 10, outline: 'none',
                            transition: 'all 0.2s',
                          }}
                          onFocus={e => e.target.style.borderColor = '#1B5E20'}
                          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                      ))}
                    </div>
                    {demoOtpValue && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                        Testing Code: <strong style={{ color: '#1B5E20' }}>{demoOtpValue}</strong>
                      </div>
                    )}
                  </div>
                )}
                {!otpSent ? (
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleSendOtp} disabled={loading}
                    style={{ marginBottom: 12 }}>
                    {loading ? '⏳ Sending...' : t('sendOtp')}
                  </button>
                ) : (
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading}
                    style={{ marginBottom: 12 }}>
                    {loading ? '⏳ Verifying...' : t('verifyOtp')}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">✉️ {t('email')}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="farmer@example.com" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">🔐 {t('password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password" className="form-input" style={{ paddingRight: 48 }} />
                    <button onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={handleLogin} disabled={loading}
                  style={{ marginBottom: 12 }}>
                  {loading ? '⏳ Logging in...' : t('loginEmail')}
                </button>
              </div>
            )}

            {/* Voice Login */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>या</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <button onClick={handleVoice}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '12px 20px', borderRadius: 12, border: '2px solid #FF8F00',
                background: listening ? '#FF8F00' : '#FFF8E1', color: listening ? 'white' : '#E65100',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', minHeight: 48,
                position: 'relative', overflow: 'hidden'
              }}>
              <Mic size={18} className={listening ? "pulse-anim" : ""} /> 
              {listening ? (voiceText || "Listening...") : `🎤 ${t('voiceLogin')}`}
            </button>

            {/* Register CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('newHere')}</span>
              <button onClick={handleLogin}
                style={{
                  fontSize: '0.875rem', fontWeight: 700, color: '#1B5E20', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#4CAF50', minHeight: 36,
                }}>
                🌱 {t('registerFarm')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Ticker */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <div style={{
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          <div style={{ display: 'inline-block', animation: 'ticker 30s linear infinite', paddingLeft: '100%' }}>
            {[...STATS, ...STATS, ...STATS].map((s, i) => (
              <span key={i} style={{ marginRight: 60, color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
                <span style={{ color: '#FFD54F' }}>✦ {s.value}</span> {s.label} &nbsp;
              </span>
            ))}
            <span style={{ marginRight: 60, color: 'white', fontSize: '0.875rem' }}>
              🛡️ Government APMC Verified &nbsp; ⭐ ISO Certified &nbsp; 🔒 Data Secure
            </span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-anim {
          animation: pulse 1s infinite alternate;
        }
      `}</style>
    </div>
  );
}
