'use client';

interface ProjectileProps {
  x: number;
  y: number;
  rotation: number;
  type?: 'basic' | 'heavy';
}

export function Projectile({ x, y, rotation, type = 'basic' }: ProjectileProps) {
  const isHeavy = type === 'heavy';
  const colorClass = isHeavy ? "bg-red-500" : "bg-orange-400";
  const shadowStyle = isHeavy ? '0 0 8px hsl(0 100% 50%)' : '0 0 6px hsl(30 100% 50%)';
  const sizeClass = isHeavy ? "w-1.5 h-5" : "w-1 h-4";

  return (
    <div
      className={`absolute top-0 left-0 ${sizeClass} ${colorClass} rounded`}
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation + 90}deg)`,
        boxShadow: shadowStyle,
        transformOrigin: 'center',
        willChange: 'transform',
      }}
    />
  );
}
