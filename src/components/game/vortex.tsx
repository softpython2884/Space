'use client';
import { motion } from 'framer-motion';

interface VortexProps {
  x: number;
  y: number;
  radius: number;
}

export function Vortex({ x, y, radius }: VortexProps) {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2"
        style={{ width: radius * 2, height: radius * 2 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="vortexGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(180, 50, 255, 0)" />
              <stop offset="70%" stopColor="rgba(150, 0, 255, 0.2)" />
              <stop offset="95%" stopColor="rgba(180, 50, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(200, 100, 255, 0.7)" />
            </radialGradient>
             <filter id="vortexGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            </filter>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#vortexGradient)" />
          {Array.from({ length: 8 }).map((_, i) => (
              <motion.path
                  key={i}
                  d="M 100 100 C 120 80, 140 80, 160 100 S 180 140, 160 160"
                  stroke={`hsla(${280 + i*10}, 100%, 70%, 0.6)`}
                  strokeWidth="1.5"
                  fill="none"
                  style={{ transformOrigin: '100px 100px', rotate: i * 45, filter: 'url(#vortexGlow)' }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
              />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
