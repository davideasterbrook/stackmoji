import { useState, useEffect } from 'react';

export function useTimeUntilMidnightUTC(): string {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Pad with leading zeros using padStart
      const paddedHours = hours.toString().padStart(2, '0');
      const paddedMinutes = minutes.toString().padStart(2, '0');
      const paddedSeconds = seconds.toString().padStart(2, '0');

      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    };

    // Set initial value
    setTimeLeft(calculateTimeLeft());
    
    // Set up interval
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}