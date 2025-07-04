'use client';
import { motion } from 'framer-motion';

interface WarpInEffectProps {
  id: number;
  x: number;
  y: number;
  onComplete: (id: number) => void;
}

export function WarpInEffect({ id, x, y, onComplete }: WarpInEffectProps) {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none z-50"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg width="200" height="200" viewBox="-100 -100 200 200" className="overflow-visible">
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 0.5, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          onAnimationComplete={() => onComplete(id)}
        >
          {/* Streaks */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.line
              key={i}
              x1={0}
              y1={0}
              x2={60}
              y2={0}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              transform={`rotate(${i * 30})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          ))}
          {/* Expanding Circle */}
          <motion.circle
            cx="0"
            cy="0"
            r="1"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            initial={{ r: 1, opacity: 1 }}
            animate={{ r: 80, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
