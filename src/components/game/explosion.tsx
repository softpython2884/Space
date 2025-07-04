'use client';
import { motion } from 'framer-motion';

interface ExplosionProps {
  id: number;
  x: number;
  y: number;
  size: number; // e.g., 1 for small, 2 for medium, 3 for large
  onComplete: (id: number) => void;
}

export function Explosion({ id, x, y, size, onComplete }: ExplosionProps) {
  const baseRadius = 30 * size;
  const numParticles = 20 * size;

  return (
    <div
      className="absolute top-0 left-0 pointer-events-none z-50"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onAnimationEnd={() => onComplete(id)}
    >
      {/* Central Flash */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
            width: baseRadius * 2,
            height: baseRadius * 2,
            background: `radial-gradient(circle, white 0%, hsl(45 100% 50%) 40%, hsl(25 100% 50% / 0) 70%)`
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* Debris Particles */}
      {Array.from({ length: numParticles }).map((_, i) => {
          const angle = (i / numParticles) * 360;
          const distance = Math.random() * baseRadius * 1.5 + baseRadius * 0.5;
          return (
            <motion.div
                key={i}
                className="absolute top-0 left-0 w-1 h-1 rounded-full bg-orange-400"
                initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
                animate={{
                    x: Math.cos(angle * Math.PI / 180) * distance,
                    y: Math.sin(angle * Math.PI / 180) * distance,
                    scale: 0,
                    opacity: 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            />
          );
      })}
    </div>
  );
}
