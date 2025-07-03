'use client';

interface ProjectileProps {
  x: number;
  y: number;
  rotation: number;
  isEnemy?: boolean;
}

export function Projectile({ x, y, rotation, isEnemy = false }: ProjectileProps) {
  const colorClass = isEnemy ? "bg-red-500" : "bg-yellow-300";
  const shadowStyle = isEnemy ? '0 0 6px hsl(0 100% 50%)' : '0 0 6px hsl(var(--primary))';

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
