'use client';

import { ShipModel } from './ship-models';

interface InterceptorShipProps {
  x: number;
  y: number;
  rotation: number;
  health: number;
  maxHealth: number;
  isTargeted: boolean;
  isAlly?: boolean;
}

export function InterceptorShip({ x, y, rotation, health, maxHealth, isTargeted, isAlly }: InterceptorShipProps) {
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
         {/* Ship body (rotates) */}
        <div
          style={{
            transform: `rotate(${rotation + 90}deg)`,
            filter: isTargeted ? `drop-shadow(0 0 8px hsl(${isAlly ? '210 100% 50%' : '0 100% 50%'}))` : 'none'
          }}
        >
          <ShipModel shipClass="Intercepteur" isAlly={isAlly} />
        </div>
        
        {/* UI elements (do not rotate) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Health bar */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-gray-600 rounded-full overflow-hidden border border-gray-800">
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
    </div>
  );
}
