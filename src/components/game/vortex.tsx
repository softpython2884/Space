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
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="vortexGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
              <stop offset="70%" stopColor="rgba(150, 0, 255, 0.1)" />
              <stop offset="95%" stopColor="rgba(180, 50, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(200, 100, 255, 0.6)" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#vortexGradient)" />
        </svg>
      </motion.div>
    </div>
  );
}
