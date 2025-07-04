'use client';
import { motion } from 'framer-motion';

interface ElectricCloudProps {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export function ElectricCloud({ x, y, radius, color }: ElectricCloudProps) {
  const numBolts = Math.floor(radius / 100);

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        transform: `translate(${x - radius}px, ${y - radius}px)`,
        width: radius * 2,
        height: radius * 2,
      }}
    >
        {/* Cloud Body */}
        <motion.div
            className="w-full h-full rounded-full"
            style={{
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                opacity: 0.8,
            }}
            animate={{
                scale: [1, 1.05, 1],
                opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse'
            }}
        />

        {/* Lightning Bolts */}
        {Array.from({ length: numBolts }).map((_, i) => (
            <motion.svg 
                key={i}
                className="absolute"
                viewBox="0 0 50 100"
                style={{
                    width: '10%',
                    top: `${Math.random() * 90}%`,
                    left: `${Math.random() * 90}%`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    filter: `drop-shadow(0 0 5px white)`
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                    duration: Math.random() * 0.5 + 0.2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 5 + 2,
                    ease: "easeInOut"
                }}
            >
                <path d="M25 0 L15 50 L35 50 L25 100" stroke="white" strokeWidth="2" fill="none" />
            </motion.svg>
        ))}
    </div>
  );
}
