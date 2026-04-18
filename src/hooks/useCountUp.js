import { useState, useEffect, useRef } from 'react';

export function useCountUp(endValue, durationMs = 1500) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevEndValue = useRef(0);

  useEffect(() => {
    if (endValue === prevEndValue.current || endValue === undefined || endValue === null) return;
    
    // Only animate if difference is significant, else jump
    const startValue = count;
    const difference = endValue - startValue;
    
    if (Math.abs(difference) === 0) return;

    setIsAnimating(true);
    let startTime;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / durationMs, 1);
      
      // easeOutExpo
      const easeOut = progressRatio === 1 ? 1 : 1 - Math.pow(2, -10 * progressRatio);
      
      const currentValue = startValue + (difference * easeOut);
      setCount(currentValue);

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        setIsAnimating(false);
        prevEndValue.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, durationMs]); // deliberately removing 'count' to prevent infinite loop

  return { count: Math.round(count), isAnimating };
}
