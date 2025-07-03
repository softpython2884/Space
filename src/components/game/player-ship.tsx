'use client';

import { motion } from 'framer-motion';

interface PlayerShipProps {
  x: number;
  y: number;
}

export function PlayerShip({ x, y }: PlayerShipProps) {
  return (
    <motion.div
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 0.5 }}
      className="absolute top-0 left-0"
      style={{ willChange: 'transform' }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 50 50"
        className="fill-cyan-400 stroke-cyan-200 -rotate-90"
        style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
      >
        <polygon points="25,5 45,45 25,35 5,45" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}
