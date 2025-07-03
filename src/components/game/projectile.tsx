'use client';

interface ProjectileProps {
  x: number;
  y: number;
  rotation: number;
}

export function Projectile({ x, y, rotation }: ProjectileProps) {
  return (
    <div
      className="absolute top-0 left-0 w-1 h-4 bg-yellow-300 rounded"
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation + 90}deg)`,
        boxShadow: '0 0 6px hsl(var(--primary))',
        transformOrigin: 'center',
        willChange: 'transform',
      }}
    />
  );
}