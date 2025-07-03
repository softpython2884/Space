'use client';

interface StaffShipProps {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isTargeted: boolean;
}

export function StaffShip({ x, y, health, maxHealth, isTargeted }: StaffShipProps) {
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
          width="30"
          height="50"
          viewBox="0 0 30 50"
          className="fill-gray-500/80 stroke-gray-300"
          style={{ filter: isTargeted ? 'drop-shadow(0 0 8px hsl(240 5% 80%))' : 'none' }}
        >
          <rect x="10" y="5" width="10" height="40" strokeWidth="2" />
          <polygon points="15,0 20,5 10,5" className="fill-cyan-400" />
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
            <div className="absolute -inset-2 border-2 border-gray-400 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
