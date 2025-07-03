'use client';

import { motion } from 'framer-motion';

interface AimIndicatorProps {
  rotation: number;
}

export function AimIndicator({ rotation }: AimIndicatorProps) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ willChange: 'transform' }}
      animate={{ rotate: rotation }}
      transition={{ type: 'linear', duration: 0 }} // Instant rotation for the aimer
    >
      <svg
        width="120"
        height="120"
        viewBox="-60 -60 120 120"
        className="opacity-40"
      >
        <path
          d="M 40 0 A 40 40 0 0 1 28.28 28.28" // 45 degree arc
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polygon
          points="40,-4 45,0 40,4"
          className="fill-primary"
        />
      </svg>
    </motion.div>
  );
}
