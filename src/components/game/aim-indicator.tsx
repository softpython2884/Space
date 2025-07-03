'use client';

import { motion } from 'framer-motion';

interface AimIndicatorProps {
  rotation: number;
}

export function AimIndicator({ rotation }: AimIndicatorProps) {
  return (
    <motion.div
      className="row-start-1 col-start-1"
      style={{ willChange: 'transform' }}
      animate={{ rotate: rotation }}
      transition={{ type: 'linear', duration: 0 }}
    >
      <svg
        width="120"
        height="120"
        viewBox="-60 -60 120 120"
        className="opacity-50"
      >
        <path
          d="M 35.35 35.35 A 50 50 0 0 1 35.35 -35.35" // A 90 degree arc
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon
          points="50,-5 56,0 50,5"
          className="fill-primary"
        />
      </svg>
    </motion.div>
  );
}
