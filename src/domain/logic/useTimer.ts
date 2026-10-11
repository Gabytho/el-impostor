import { useEffect, useRef, useState } from "react";

export function useTimer(totalSeconds: number | null) {
  const [remaining, setRemaining] = useState<number>(totalSeconds ?? 0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(totalSeconds ?? 0);
    setRunning(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running || totalSeconds === null) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, totalSeconds]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemaining(totalSeconds ?? 0);
  };

  const finished = totalSeconds !== null && remaining === 0;

  return { remaining, running, finished, start, pause, reset };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
