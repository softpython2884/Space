'use client';

interface FrigateShipProps {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isTargeted: boolean;
}

export function FrigateShip({ x, y, health, maxHealth, isTargeted }: FrigateShipProps) {
    const healthPercentage = (health / maxHealth) * 100;

  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* Ship body */}
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className="fill-orange-600/80 stroke-orange-400 -rotate-90"
          style={{ filter: isTargeted ? 'drop-shadow(0 0 8px hsl(30 100% 50%))' : 'none' }}
        >
          <polygon points="30,5 50,25 45,55 15,55 10,25" strokeWidth="2" />
          <rect x="27" y="15" width="6" height="15" className="fill-orange-500" />
          <polygon points="20,20 5,35 15,35" strokeWidth="1.5" />
          <polygon points="40,20 55,35 45,35" strokeWidth="1.5" />
        </svg>

        {/* Health bar */}
        <div className="absolute -bottom-4 w-full h-1.5 bg-gray-600 rounded-full overflow-hidden border border-gray-800">
            <div
                className="h-full bg-green-500 transition-all duration-200"
                style={{ width: `${healthPercentage}%`}}
            />
        </div>
        
        {/* Targeting indicator */}
        {isTargeted && (
            <div className="absolute -inset-2 border-2 border-orange-500 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
