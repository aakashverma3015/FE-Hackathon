import React, { useEffect, useRef } from 'react';

/**
 * Dynamic Indian Farming Background
 * - Animated sky gradient (dawn/dusk tones)
 * - Drifting clouds
 * - Waving wheat field (multi-layer parallax)
 * - Flying birds
 * - Floating agricultural particles (seeds, leaves)
 * - Slow-scrolling tractor silhouette
 * - No external dependencies — pure CSS + inline SVG
 */
export default function FarmingBackground({ variant = 'green' }) {
  // variant: 'green' (landing/lang page) | 'gold' (auth page)
  const isGold = variant === 'gold';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* ── Sky Gradient ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isGold
          ? 'linear-gradient(180deg, #0d2b0d 0%, #1a4a0f 22%, #1B5E20 50%, #2E7D32 75%, #33691e 100%)'
          : 'linear-gradient(180deg, #051a05 0%, #0d3310 20%, #1B5E20 55%, #2E7D32 80%, #388E3C 100%)',
        transition: 'background 0.8s ease',
      }} />

      {/* ── Sun / Moon glow ── */}
      <div style={{
        position: 'absolute',
        top: '8%', right: '12%',
        width: 120, height: 120,
        borderRadius: '50%',
        background: isGold
          ? 'radial-gradient(circle, rgba(255,213,79,0.9) 0%, rgba(255,143,0,0.5) 40%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255,213,79,0.6) 0%, rgba(255,180,0,0.25) 40%, transparent 70%)',
        animation: 'sunPulse 6s ease-in-out infinite',
        filter: 'blur(1px)',
      }} />

      {/* ── Rays from sun ── */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 'calc(8% + 60px)', right: 'calc(12% + 60px)',
          width: 200, height: 2,
          background: 'linear-gradient(90deg, rgba(255,213,79,0.25), transparent)',
          transformOrigin: '0 50%',
          transform: `rotate(${deg}deg)`,
          animation: `rayRotate 20s linear infinite`,
          animationDelay: `${i * 0.3}s`,
        }} />
      ))}

      {/* ── Drifting Clouds ── */}
      {CLOUDS.map((c, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: c.top, left: c.left,
          opacity: c.opacity,
          animation: `cloudDrift ${c.duration}s linear infinite`,
          animationDelay: `${c.delay}s`,
          willChange: 'transform',
        }}>
          <CloudSVG width={c.width} />
        </div>
      ))}

      {/* ── Flying Birds ── */}
      {BIRDS.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: b.top, left: '-60px',
          animation: `birdFly ${b.duration}s linear infinite`,
          animationDelay: `${b.delay}s`,
          opacity: 0.6,
          willChange: 'transform',
        }}>
          <BirdSVG size={b.size} />
        </div>
      ))}

      {/* ── Rolling Hills / Far Fields ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        {/* Far hills */}
        <svg viewBox="0 0 1440 280" preserveAspectRatio="none" style={{ width: '100%', height: 'auto', display: 'block', position: 'absolute', bottom: 160 }}>
          <defs>
            <linearGradient id="hillGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a5c1a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0d3310" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path d="M0,180 Q180,60 360,140 Q540,220 720,120 Q900,20 1080,130 Q1260,240 1440,100 L1440,280 L0,280 Z" fill="url(#hillGrad1)" />
        </svg>

        {/* Mid wheat field row 1 — slow parallax */}
        <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, animation: 'fieldSway 8s ease-in-out infinite' }}>
          <WheatRow count={28} height={80} color="#4a7c2a" opacity={0.5} />
        </div>

        {/* Mid wheat field row 2 */}
        <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, animation: 'fieldSway 6s ease-in-out infinite', animationDelay: '-2s' }}>
          <WheatRow count={32} height={90} color="#5a8c30" opacity={0.65} />
        </div>

        {/* Front wheat field — main, detailed */}
        <div style={{ position: 'absolute', bottom: 55, left: 0, right: 0, animation: 'fieldSway 5s ease-in-out infinite', animationDelay: '-1s' }}>
          <WheatRow count={38} height={105} color="#6dab38" opacity={0.85} />
        </div>

        {/* Ground / Soil base */}
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
          <defs>
            <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d2b1a" />
              <stop offset="100%" stopColor="#2a1a0a" />
            </linearGradient>
          </defs>
          <rect width="1440" height="80" fill="url(#soilGrad)" />
          {/* Soil texture lines */}
          {Array.from({length:12}, (_,i) => (
            <path key={i} d={`M${i*130},5 Q${i*130+65},20 ${(i+1)*130},5`} stroke="rgba(100,60,20,0.3)" strokeWidth="2" fill="none" />
          ))}
        </svg>
      </div>

      {/* ── Tractor Silhouette ── */}
      <div style={{
        position: 'absolute', bottom: 65,
        animation: 'tractorMove 40s linear infinite',
        animationDelay: '-5s',
        willChange: 'transform',
        zIndex: 2,
      }}>
        <TractorSVG />
      </div>

      {/* ── Farmer Silhouette ── */}
      <div style={{
        position: 'absolute', bottom: 65,
        animation: 'tractorMove 60s linear infinite',
        animationDelay: '-20s',
        willChange: 'transform',
        zIndex: 2,
      }}>
        <FarmerSVG />
      </div>

      {/* ── Floating Particles (seeds/leaves) ── */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.left, top: p.top,
          width: p.size, height: p.size,
          borderRadius: p.round ? '50%' : '40% 60% 40% 60%',
          background: p.color,
          animation: `floatParticle ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
          opacity: p.opacity,
          willChange: 'transform',
        }} />
      ))}

      {/* ── Rain of golden seeds (decorative) ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {SEEDS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: s.left, top: '-20px',
            width: s.size, height: s.size * 2.5,
            borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
            background: `rgba(255,213,79,${s.opacity})`,
            animation: `seedFall ${s.duration}s linear infinite`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* ── Overlay gradient for text legibility ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.35) 100%)',
      }} />

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes rayRotate {
          from { transform: rotate(var(--deg, 0deg)); }
          to { transform: rotate(calc(var(--deg, 0deg) + 360deg)); }
        }
        @keyframes cloudDrift {
          0% { transform: translateX(-300px); }
          100% { transform: translateX(calc(100vw + 300px)); }
        }
        @keyframes birdFly {
          0% { transform: translateX(-60px) translateY(0); }
          25% { transform: translateX(25vw) translateY(-15px); }
          50% { transform: translateX(50vw) translateY(5px); }
          75% { transform: translateX(75vw) translateY(-10px); }
          100% { transform: translateX(calc(100vw + 60px)) translateY(0); }
        }
        @keyframes fieldSway {
          0%, 100% { transform: skewX(0deg) translateX(0); }
          25% { transform: skewX(0.8deg) translateX(3px); }
          75% { transform: skewX(-0.8deg) translateX(-3px); }
        }
        @keyframes tractorMove {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          33% { transform: translateY(-25px) rotate(120deg); opacity: 0.7; }
          66% { transform: translateY(-12px) rotate(240deg); opacity: 0.5; }
        }
        @keyframes seedFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes stemSway {
          0%, 100% { transform: rotate(0deg); transform-origin: bottom; }
          30% { transform: rotate(3deg); transform-origin: bottom; }
          70% { transform: rotate(-3deg); transform-origin: bottom; }
        }
      `}</style>
    </div>
  );
}

/* ──────────── Sub-Components ──────────── */

function CloudSVG({ width = 120 }) {
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 200 80" fill="none">
      <ellipse cx="100" cy="55" rx="90" ry="28" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="70" cy="45" rx="55" ry="32" fill="rgba(255,255,255,0.10)" />
      <ellipse cx="130" cy="42" rx="50" ry="28" fill="rgba(255,255,255,0.10)" />
      <ellipse cx="100" cy="35" rx="40" ry="28" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

function BirdSVG({ size = 24 }) {
  return (
    <svg width={size * 3} height={size} viewBox="0 0 80 30" fill="none">
      <path d="M0,15 Q15,5 25,12 Q35,18 40,12" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M40,12 Q45,6 55,12 Q65,18 80,15" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function WheatRow({ count = 30, height = 100, color = '#5a8c30', opacity = 0.8 }) {
  const width = 100 / count;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block', opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const x = i * width + width / 2;
        const h = height * (0.7 + Math.sin(i * 0.9) * 0.3);
        return (
          <g key={i}>
            {/* Stem */}
            <line x1={x} y1={height} x2={x} y2={height - h * 0.6}
              stroke={color} strokeWidth="0.6" />
            {/* Nodes */}
            <line x1={x} y1={height - h * 0.3} x2={x + width * 0.35} y2={height - h * 0.38}
              stroke={color} strokeWidth="0.4" />
            <line x1={x} y1={height - h * 0.5} x2={x - width * 0.4} y2={height - h * 0.58}
              stroke={color} strokeWidth="0.4" />
            {/* Grain head */}
            {[0,1,2,3,4].map(j => (
              <ellipse key={j} cx={x + Math.sin(j * 0.9) * 0.4} cy={height - h * 0.6 - j * (h * 0.08)}
                rx="0.7" ry="1.4" fill={color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function TractorSVG() {
  return (
    <svg width="110" height="65" viewBox="0 0 220 130" fill="none" opacity="0.7">
      {/* Rear large wheel */}
      <circle cx="70" cy="90" r="35" fill="#1a4a0f" stroke="#2d7a1f" strokeWidth="4" />
      <circle cx="70" cy="90" r="22" fill="#0d2b08" />
      <circle cx="70" cy="90" r="6" fill="#2d7a1f" />
      {/* Front small wheel */}
      <circle cx="170" cy="100" r="22" fill="#1a4a0f" stroke="#2d7a1f" strokeWidth="3" />
      <circle cx="170" cy="100" r="12" fill="#0d2b08" />
      {/* Body */}
      <rect x="80" y="55" width="100" height="50" rx="6" fill="#2d5a1f" />
      {/* Hood */}
      <rect x="150" y="65" width="55" height="35" rx="4" fill="#3a6e28" />
      {/* Exhaust pipe */}
      <rect x="195" y="45" width="6" height="25" rx="3" fill="#222" />
      <circle cx="198" cy="43" r="5" fill="#333" />
      {/* Cab / window */}
      <rect x="90" y="30" width="55" height="40" rx="6" fill="#2d5a1f" />
      <rect x="98" y="36" width="38" height="26" rx="4" fill="rgba(100,200,255,0.2)" />
      {/* Farmer in cab — silhouette */}
      <circle cx="118" cy="40" r="7" fill="#1a3a0f" />
      <rect x="112" y="47" width="12" height="12" rx="2" fill="#1a3a0f" />
      {/* Exhaust smoke */}
      <circle cx="198" cy="35" r="5" fill="rgba(200,200,200,0.2)" />
      <circle cx="202" cy="24" r="7" fill="rgba(200,200,200,0.15)" />
      <circle cx="196" cy="14" r="9" fill="rgba(200,200,200,0.1)" />
    </svg>
  );
}

function FarmerSVG() {
  return (
    <svg width="35" height="65" viewBox="0 0 70 130" fill="none" opacity="0.65">
      {/* Dhoti/Kurta */}
      <rect x="22" y="52" width="26" height="45" rx="4" fill="#c8a060" />
      {/* Legs */}
      <line x1="30" y1="97" x2="27" y2="125" stroke="#c8a060" strokeWidth="7" strokeLinecap="round" />
      <line x1="40" y1="97" x2="43" y2="125" stroke="#c8a060" strokeWidth="7" strokeLinecap="round" />
      {/* Head */}
      <circle cx="35" cy="28" r="16" fill="#8B5E3C" />
      {/* Turban / Gandhi cap */}
      <ellipse cx="35" cy="16" rx="18" ry="8" fill="#FF8F00" />
      <rect x="17" y="13" width="36" height="6" rx="3" fill="#FF8F00" />
      {/* Arms + Tool (sickle/stick) */}
      <line x1="22" y1="60" x2="8" y2="80" stroke="#8B5E3C" strokeWidth="6" strokeLinecap="round" />
      <line x1="48" y1="60" x2="58" y2="75" stroke="#8B5E3C" strokeWidth="6" strokeLinecap="round" />
      <line x1="58" y1="73" x2="60" y2="110" stroke="#5a3a1a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ──────────────── Static Config Data ──────────────── */

const CLOUDS = [
  { top: '6%',  left: '-20%', width: 180, opacity: 0.6, duration: 55, delay: 0  },
  { top: '12%', left: '20%',  width: 120, opacity: 0.4, duration: 75, delay: -25},
  { top: '4%',  left: '60%',  width: 200, opacity: 0.5, duration: 65, delay: -40},
  { top: '18%', left: '80%',  width: 100, opacity: 0.35,duration: 90, delay: -10},
  { top: '8%',  left: '40%',  width: 150, opacity: 0.3, duration: 70, delay: -55},
];

const BIRDS = [
  { top: '10%', size: 18, duration: 28, delay: 0   },
  { top: '7%',  size: 14, duration: 35, delay: -12 },
  { top: '15%', size: 20, duration: 22, delay: -8  },
  { top: '5%',  size: 12, duration: 40, delay: -20 },
];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 379) % 100}%`,
  top:  `${20 + (i * 277) % 55}%`,
  size: `${6 + (i * 13) % 10}px`,
  color: i % 3 === 0 ? 'rgba(255,213,79,0.6)' : i % 3 === 1 ? 'rgba(76,175,80,0.5)' : 'rgba(255,143,0,0.4)',
  opacity: 0.3 + (i % 5) * 0.1,
  round: i % 2 === 0,
  duration: 6 + (i * 3) % 8,
  delay: -(i * 1.3),
}));

const SEEDS = Array.from({ length: 15 }, (_, i) => ({
  left: `${(i * 7.1) % 100}%`,
  size: `${3 + (i % 4)}px`,
  opacity: 0.15 + (i % 5) * 0.05,
  duration: 12 + (i * 2.3) % 10,
  delay: -(i * 1.8),
}));
