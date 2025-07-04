'use client';

interface ProjectileProps {
  x: number;
  y: number;
  rotation: number;
  isAlly: boolean;
}

export function Projectile({ x, y, rotation, isAlly }: ProjectileProps) {
  const colorClass = "bg-orange-400";
  const shadowStyle = '0 0 6px hsl(30 100% 50%)';

  return (
    <div
      className={`absolute top-0 left-0 w-1 h-4 ${colorClass} rounded`}
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation + 90}deg)`,
        boxShadow: shadowStyle,
        transformOrigin: 'center',
        willChange: 'transform',
      }}
    />
  );
}
