import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';
import { PageTransition } from '../components/PageTransition';

const LANGUAGE_GREETINGS = {
  hi: { greeting: 'नमस्ते!',       sub: 'अपनी भाषा चुनें',               desc: 'किसानों की फसल, उनका दाम' },
  en: { greeting: 'Welcome!',       sub: 'Choose your language',           desc: "Farmers' crop, farmers' price" },
  mr: { greeting: 'नमस्कार!',       sub: 'आपली भाषा निवडा',               desc: 'शेतकऱ्यांचे पीक, त्यांची किंमत' },
  pa: { greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ!', sub: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',               desc: 'ਕਿਸਾਨਾਂ ਦੀ ਫ਼ਸਲ, ਉਹਨਾਂ ਦੀ ਕੀਮਤ' },
  gu: { greeting: 'નમસ્તે!',         sub: 'તમારી ભાષા પસંદ કરો',           desc: 'ખેડૂતોનો પાક, તેમની કિંમત' },
  ta: { greeting: 'வணக்கம்!',       sub: 'உங்கள் மொழியை தேர்வு செய்யுங்கள்', desc: 'விவசாயிகளின் பயிர், அவர்களின் விலை' },
  te: { greeting: 'నమస్కారం!',       sub: 'మీ భాషను ఎంచుకోండి',             desc: 'రైతుల పంట, వారి ధర' },
  kn: { greeting: 'ನಮಸ್ಕಾರ!',        sub: 'ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ',           desc: 'ರೈತರ ಬೆಳೆ, ಅವರ ಬೆಲೆ' },
  bn: { greeting: 'নমস্কার!',         sub: 'আপনার ভাষা বেছে নিন',           desc: 'কৃষকদের ফসল, তাদের দাম' },
  or: { greeting: 'ନମସ୍କାର!',        sub: 'ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ',           desc: 'ଚାଷୀଙ୍କ ଫସଲ, ସେମାନଙ୍କ ଦର' },
};

export default function LanguageSelectPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(i18n.language || 'hi');
  const [exiting, setExiting] = useState(false);
  const [hovering, setHovering] = useState(null);

  const greet = LANGUAGE_GREETINGS[selected] || LANGUAGE_GREETINGS['hi'];

  const handleSelect = (code) => {
    setSelected(code);
    i18n.changeLanguage(code);
    localStorage.setItem('preferred-language', code);
  };

  const handleContinue = () => {
    setExiting(true);
    setTimeout(() => navigate('/login'), 550);
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      /* Page exit animation */
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'translateY(-24px) scale(0.98)' : 'translateY(0) scale(1)',
      transition: 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)',
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

        {/* Header */}
        <div style={{
          padding: '20px 24px 0',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'slideDown 0.6s cubic-bezier(0.4,0,0.2,1) both',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}>🌾</div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.25rem', color: 'white', lineHeight: 1.1 }}>
              Aarohan Agri
            </div>
            <div style={{ fontSize: '0.62rem', color: '#FFD54F', fontWeight: 600, letterSpacing: '0.5px' }}>
              आरोहण एग्री · Agricultural Platform
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              background: 'rgba(255,143,0,0.25)', border: '1px solid rgba(255,143,0,0.5)',
              borderRadius: 100, padding: '5px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#FFD54F',
              backdropFilter: 'blur(8px)',
            }}>
              🇮🇳 {t('trust.apmc')}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '28px 20px', textAlign: 'center',
        }}>

          {/* Greeting Block — animates when language changes */}
          <div style={{
            marginBottom: 32,
            animation: 'fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.1s both',
          }}>
            {/* Greeting text */}
            <div
              key={selected + '-greeting'}
              style={{
                fontSize: 'clamp(2.4rem, 7vw, 4rem)', fontFamily: 'Poppins', fontWeight: 900,
                color: 'white', lineHeight: 1.1, marginBottom: 10,
                textShadow: '0 4px 24px rgba(0,0,0,0.4)',
                animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
              }}
            >
              {greet.greeting}
            </div>
            <div
              key={selected + '-sub'}
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: '#FFD54F',
                fontWeight: 700, marginBottom: 8,
                animation: 'fadeInUp 0.35s ease 0.08s both',
              }}
            >
              {greet.sub}
            </div>
            <div
              key={selected + '-desc'}
              style={{
                color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
                fontStyle: 'italic',
                animation: 'fadeInUp 0.35s ease 0.14s both',
              }}
            >
              {greet.desc}
            </div>
            {/* Decorative divider */}
            <div style={{
              width: 60, height: 3,
              background: 'linear-gradient(90deg, #FF8F00, #FFD54F)',
              borderRadius: 2, margin: '16px auto 0',
            }} />
          </div>

          {/* Language Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 10, width: '100%', maxWidth: 680, marginBottom: 32,
            animation: 'fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.2s both',
          }}>
            {LANGUAGES.map((lang, idx) => {
              const isSelected = lang.code === selected;
              const isHovered = hovering === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  onMouseEnter={() => setHovering(lang.code)}
                  onMouseLeave={() => setHovering(null)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 6, padding: '14px 10px',
                    borderRadius: 16, cursor: 'pointer', minHeight: 82,
                    border: isSelected ? '2.5px solid #FFD54F' : '2px solid rgba(255,255,255,0.2)',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(255,213,79,0.22), rgba(255,143,0,0.18))'
                      : isHovered
                        ? 'rgba(255,255,255,0.18)'
                        : 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(14px)',
                    boxShadow: isSelected
                      ? '0 8px 32px rgba(255,143,0,0.3), 0 0 0 1px rgba(255,213,79,0.3)'
                      : isHovered ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
                    transform: isSelected ? 'scale(1.06)' : isHovered ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    animation: `fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) ${0.03 * idx + 0.25}s both`,
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>{lang.flag}</span>
                  <div style={{
                    fontWeight: isSelected ? 800 : 600, fontSize: '0.95rem',
                    color: isSelected ? '#FFD54F' : 'white',
                    lineHeight: 1.2, textAlign: 'center',
                    transition: 'color 0.2s',
                  }}>
                    {lang.native}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: isSelected ? 'rgba(255,213,79,0.8)' : 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                    {lang.name}
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#FFD54F', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900,
                      color: '#1B5E20', marginTop: 2,
                      animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
                    }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            style={{
              background: 'linear-gradient(135deg, #FF8F00, #FFC107)',
              color: 'white', border: 'none', borderRadius: 18,
              padding: '17px 52px', fontFamily: 'Poppins',
              fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(255,143,0,0.45)',
              letterSpacing: '0.3px', minHeight: 58,
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              animation: 'fadeInUp 0.6s cubic-bezier(0.4,0,0.2,1) 0.4s both',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 14px 40px rgba(255,143,0,0.55)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,143,0,0.45)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🚀</span>
            <span>Next</span>
            <span style={{ fontSize: '1.1rem' }}>→</span>
          </button>

          {/* Trust line */}
          <div style={{
            marginTop: 22, display: 'flex', gap: 18, flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'fadeInUp 0.6s ease 0.5s both',
          }}>
            {[`🛡️ ${t('trust.apmc')}`, `⭐ ${t('trust.iso')}`, `🔒 ${t('trust.secure')}`, `🇮🇳 ${t('trust.madeInIndia')}`].map((txt, i) => (
              <span key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{txt}</span>
            ))}
          </div>
        </div>

        {/* Bottom Stats Ticker */}
        <div style={{
          background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap',
          position: 'relative', zIndex: 5,
        }}>
          <div style={{ display: 'inline-block', animation: 'ticker 28s linear infinite', paddingLeft: '100%' }}>
            {[
              `12,000+ ${t('app.stats.farmers')}`,
              `₹47 Cr ${t('app.stats.saved')}`,
              `340+ ${t('app.stats.buyers')}`,
              `5 ${t('app.stats.states')}`,
              `🌾 Wheat ₹2,180`,
              `🫘 Soybean ₹5,200`,
              `🧅 Onion ₹1,450`
            ].map((s, i) => (
              <span key={i} style={{ marginRight: 60, color: '#FFD54F', fontWeight: 700, fontSize: '0.85rem' }}>✦ {s}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
