'use client';
import { motion } from 'framer-motion';

interface SpaceStationProps {
  x: number;
  y: number;
}

export function SpaceStation({ x, y }: SpaceStationProps) {
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      <motion.div 
        className="relative -translate-x-1/2 -translate-y-1/2"
        animate={{ filter: ['drop-shadow(0 0 10px hsl(var(--primary)))', 'drop-shadow(0 0 20px hsl(var(--primary)))', 'drop-shadow(0 0 10px hsl(var(--primary)))'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="150"
          height="150"
          viewBox="-75 -75 150 150"
          className="fill-gray-300/20 stroke-cyan-300"
        >
          <circle cx="0" cy="0" r="60" strokeWidth="2" />
          <circle cx="0" cy="0" r="30" strokeWidth="1" className="fill-gray-700/50" />
          <rect x="-70" y="-5" width="40" height="10" strokeWidth="1" className="fill-gray-600" />
          <rect x="30" y="-5" width="40" height="10" strokeWidth="1" className="fill-gray-600" />
          <rect x="-5" y="-70" width="10" height="40" strokeWidth="1" className="fill-gray-600" />
          <rect x="-5" y="30" width="10" height="40" strokeWidth="1" className="fill-gray-600" />
        </svg>
      </motion.div>
    </div>
  );
}
