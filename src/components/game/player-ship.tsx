'use client';

import { motion } from 'framer-motion';

interface PlayerShipProps {
  rotation: number;
}

export function PlayerShip({ rotation }: PlayerShipProps) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ willChange: 'transform' }}
      animate={{ rotate: rotation + 90 }} // +90 to align SVG's 'up' with atan2's 'right' is 0
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 50 50"
        className="fill-cyan-400 stroke-cyan-200"
        style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
      >
        {/* Direction arrow */}
        <polygon points="25,0 28,8 22,8" className="fill-primary stroke-primary" strokeWidth="1" />
        {/* Ship body */}
        <polygon points="25,5 45,45 25,35 5,45" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}
