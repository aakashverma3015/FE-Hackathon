import React, { useEffect, useState, useRef } from 'react';

/* ─────────────────────────────────────────────────────
   PageTransition — wraps a page for smooth enter/exit
   Usage:
     <PageTransition>
       <YourPage />
     </PageTransition>
───────────────────────────────────────────────────── */
export function PageTransition({ children, keyProp }) {
  const [phase, setPhase] = useState('entering'); // 'entering' | 'visible' | 'leaving'

  useEffect(() => {
    setPhase('entering');
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('visible'));
    });
    return () => cancelAnimationFrame(t);
  }, [keyProp]);

  const style = {
    position: 'relative',
    transition: 'opacity 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1)',
    opacity:   phase === 'visible' ? 1 : 0,
    transform: phase === 'visible' ? 'translateY(0)' : 'translateY(18px)',
    willChange: 'opacity, transform',
  };

  return <div style={style}>{children}</div>;
}

/* ─────────────────────────────────────────────────────
   TabTransition — animates content when switching tabs
   Usage:
     <TabTransition activeTab={activeTab}>
       <div key={activeTab}>...content...</div>
     </TabTransition>
───────────────────────────────────────────────────── */
export function TabTransition({ children, activeTab, direction = 'fade-up' }) {
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase] = useState('visible');
  const prevTabRef = useRef(activeTab);
  const timerRef = useRef(null);

  useEffect(() => {
    if (prevTabRef.current === activeTab) return;
    prevTabRef.current = activeTab;

    // Exit current
    setPhase('leaving');
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setDisplayed(children);
      setPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('visible'));
      });
    }, 200);

    return () => clearTimeout(timerRef.current);
  }, [activeTab]);

  // Also update content when children changes while same tab
  useEffect(() => {
    if (phase === 'visible') setDisplayed(children);
  }, [children]);

  const transforms = {
    'fade-up':    phase === 'visible' ? 'translateY(0)'   : phase === 'entering' ? 'translateY(12px)'  : 'translateY(-8px)',
    'fade-down':  phase === 'visible' ? 'translateY(0)'   : phase === 'entering' ? 'translateY(-12px)' : 'translateY(8px)',
    'fade-right': phase === 'visible' ? 'translateX(0)'   : phase === 'entering' ? 'translateX(-16px)' : 'translateX(12px)',
    'fade-left':  phase === 'visible' ? 'translateX(0)'   : phase === 'entering' ? 'translateX(16px)'  : 'translateX(-12px)',
    'scale':      phase === 'visible' ? 'scale(1)'        : phase === 'entering' ? 'scale(0.97)'       : 'scale(1.02)',
  };

  return (
    <div style={{
      transition: 'opacity 0.22s ease, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      opacity: phase === 'visible' ? 1 : 0,
      transform: transforms[direction] || transforms['fade-up'],
      willChange: 'opacity, transform',
    }}>
      {displayed}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SlideTransition — horizontal slide for steppers
───────────────────────────────────────────────────── */
export function SlideTransition({ children, step, prevStep }) {
  const [phase, setPhase] = useState('visible');
  const [displayed, setDisplayed] = useState(children);
  const dir = step > (prevStep || 0) ? 1 : -1;
  const timerRef = useRef(null);

  useEffect(() => {
    setPhase('leaving');
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayed(children);
      setPhase('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('visible')));
    }, 200);
    return () => clearTimeout(timerRef.current);
  }, [step]);

  const tx = phase === 'visible' ? '0' : phase === 'entering' ? `${dir * 30}px` : `${-dir * 20}px`;

  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{
        transition: 'opacity 0.22s ease, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        opacity: phase === 'visible' ? 1 : 0,
        transform: `translateX(${tx})`,
        willChange: 'opacity, transform',
      }}>
        {displayed}
      </div>
    </div>
  );
}
