import { useState, useEffect } from 'react';

export default function useTimer(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onExpire) onExpire();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onExpire]);

  return { timeLeft, setTimeLeft, isActive, setIsActive };
}