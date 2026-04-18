import React, { useState } from 'react';
import { Mic, X } from 'lucide-react';
import toast from 'react-hot-toast';

const COMMANDS = [
  { trigger: ['fasal', 'list', 'crop'], action: '/marketplace', response: 'आपको Marketplace पर ले जा रहे हैं...' },
  { trigger: ['bhav', 'price', 'mandi'], action: null, response: 'आज सोयाबीन का भाव ₹5,200/क्विंटल है — इंदौर मंडी में।' },
  { trigger: ['storage', 'cold', 'bhanda'], action: '/cold-storage', response: 'Cold Storage खोज रहे हैं...' },
  { trigger: ['transport', 'gaadi', 'truck'], action: '/transport', response: 'Transport बुकिंग पेज खोल रहे हैं...' },
  { trigger: ['help', 'madad', 'sahay'], action: '/help', response: 'Help & Support पेज खोल रहे हैं...' },
];

export default function VoiceFAB() {
  const [listening, setListening] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleVoice = () => {
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    toast('🎤 बोलिए... (Listening...)', {
      style: { background: '#FF8F00', color: 'white' },
      duration: 3000,
    });
    setTimeout(() => {
      setListening(false);
      toast('💬 Demo: "Aaj ka soybean bhav batao" → ₹5,200/quintal (Indore Mandi)', { duration: 4000 });
    }, 3000);
  };

  return (
    <div style={{ position: 'relative' }}>
      {showTooltip && !listening && (
        <div style={{
          position: 'fixed', bottom: 165, right: 20, zIndex: 999,
          background: '#1B5E20', color: 'white',
          padding: '8px 14px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600,
          whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          🎤 Bol ke login karo
          <div style={{ position: 'absolute', bottom: -6, right: 28, width: 12, height: 12,
            background: '#1B5E20', transform: 'rotate(45deg)' }} />
        </div>
      )}
      <button
        className={`voice-fab ${listening ? 'listening' : ''}`}
        onClick={handleVoice}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Voice Assistant — Bol ke karo"
        style={{ bottom: listening ? 96 : 96 }}
      >
        {listening ? (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[0, 1, 2, 3].map(i => (
              <span key={i} className="wave-bar" style={{
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 0.15}s`,
                background: 'var(--card-bg)',
              }} />
            ))}
          </div>
        ) : (
          <Mic size={24} />
        )}
      </button>
    </div>
  );
}
