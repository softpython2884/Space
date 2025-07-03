'use client';

import { motion } from 'framer-motion';
import { AimIndicator } from './aim-indicator';

interface PlayerShipProps {
  x: number;
  y: number;
  rotation: number;
  aimRotation: number;
  isShieldActive?: boolean;
}

export function PlayerShip({ x, y, rotation, aimRotation, isShieldActive }: PlayerShipProps) {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2 grid place-items-center w-36 h-36 z-10">
        {isShieldActive && (
          <motion.div
            className="absolute row-start-1 col-start-1"
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1.1, opacity: 0.9 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          >
            <svg width="100" height="100" viewBox="-50 -50 100 100">
              <circle cx="0" cy="0" r="40" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
        <AimIndicator rotation={aimRotation} />
        <motion.div
          className="row-start-1 col-start-1"
          style={{ willChange: 'transform' }}
          animate={{ rotate: rotation + 90 }} // +90 to align SVG's 'up' with atan2's 'right' is 0
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
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
      </div>
    </div>
  );
}
