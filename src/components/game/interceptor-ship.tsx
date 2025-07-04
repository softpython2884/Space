'use client';

interface InterceptorShipProps {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isTargeted: boolean;
  isAlly?: boolean;
}

export function InterceptorShip({ x, y, health, maxHealth, isTargeted, isAlly }: InterceptorShipProps) {
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
          className={isAlly ? "fill-blue-400/80 stroke-blue-200 -rotate-90" : "fill-red-400/80 stroke-red-200 -rotate-90"}
          style={{ filter: isTargeted ? `drop-shadow(0 0 8px hsl(${isAlly ? '210 100% 50%' : '0 100% 50%'}))` : 'none' }}
        >
          <polygon points="25,5 35,45 25,35 15,45" strokeWidth="2" />
          <polygon points="25,10 30,25 20,25" className={isAlly ? "fill-blue-300" : "fill-red-300"} />
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
