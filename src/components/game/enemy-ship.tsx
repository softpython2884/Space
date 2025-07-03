'use client';

interface EnemyShipProps {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isTargeted: boolean;
  isAlly?: boolean;
}

export function EnemyShip({ x, y, health, maxHealth, isTargeted, isAlly }: EnemyShipProps) {
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
          width="40"
          height="40"
          viewBox="0 0 50 50"
          className={isAlly ? "fill-blue-500/80 stroke-blue-300" : "fill-red-500/80 stroke-red-300"}
          style={{ filter: isTargeted ? `drop-shadow(0 0 8px hsl(${isAlly ? '210 100% 50%' : '0 100% 50%'}))` : 'none' }}
        >
          <polygon points="25,5 40,20 40,45 10,45 10,20" strokeWidth="2" />
          <polygon points="18,5 32,5 25,15" strokeWidth="1" className={isAlly ? "fill-blue-400" : "fill-red-400"} />
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
            <div className={`absolute -inset-2 border-2 ${isAlly ? 'border-blue-500' : 'border-red-500'} rounded-full animate-pulse`} />
        )}
      </div>
    </div>
  );
}
