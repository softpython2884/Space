'use client';
import { motion } from 'framer-motion';
import { TowerControl } from 'lucide-react';

interface OutpostProps {
  x: number;
  y: number;
}

export function Outpost({ x, y }: OutpostProps) {
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
        animate={{ filter: ['drop-shadow(0 0 5px hsl(var(--primary)))', 'drop-shadow(0 0 10px hsl(var(--primary)))', 'drop-shadow(0 0 5px hsl(var(--primary)))'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="50"
          height="50"
          viewBox="-25 -25 50 50"
          className="fill-gray-300/20 stroke-cyan-300"
        >
          <polygon points="0,-20 17.32,-10 17.32,10 0,20 -17.32,10 -17.32,-10" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="8" strokeWidth="1" className="fill-gray-700/50" />
           <rect x="-2" y="-22" width="4" height="6" strokeWidth="0.5" className="fill-gray-500" />
           <rect x="18" y="-5" width="6" height="4" strokeWidth="0.5" className="fill-gray-500" />
           <rect x="-24" y="-5" width="6" height="4" strokeWidth="0.5" className="fill-gray-500" />
        </svg>
      </motion.div>
    </div>
  );
}
