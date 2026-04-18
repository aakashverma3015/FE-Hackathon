import { useState, useEffect } from 'react';

export function useTimeAgo(timestamp) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!timestamp) {
      setTimeAgo('');
      return;
    }

    const updateTime = () => {
      const now = Date.now();
      const past = new Date(timestamp).getTime();
      const diffMs = now - past;
      
      if (isNaN(diffMs) || diffMs < 0) {
        setTimeAgo('Just now');
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 60) {
        setTimeAgo(`${diffSecs} sec ago`);
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} min ago`);
      } else {
        const hours = Math.floor(diffMins / 60);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}
