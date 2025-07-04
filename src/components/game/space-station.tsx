'use client';
import { motion } from 'framer-motion';

interface SpaceStationProps {
  x: number;
  y: number;
  isEnemy?: boolean;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  isTargeted: boolean;
}

export function SpaceStation({ x, y, isEnemy = false, health, maxHealth, shield, maxShield, isTargeted }: SpaceStationProps) {
  const color = isEnemy ? 'hsl(0 70% 50%)' : 'hsl(var(--primary))';
  const healthPercentage = (health / maxHealth) * 100;
  const shieldPercentage = (shield / maxShield) * 100;
  
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <motion.div 
          className="relative"
          animate={{ filter: [`drop-shadow(0 0 10px ${color})`, `drop-shadow(0 0 20px ${color})`, `drop-shadow(0 0 10px ${color})`] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="150"
            height="150"
            viewBox="-75 -75 150 150"
            className={isEnemy ? "fill-red-900/20 stroke-red-400" : "fill-gray-300/20 stroke-cyan-300"}
          >
            <circle cx="0" cy="0" r="60" strokeWidth="2" />
            <circle cx="0" cy="0" r="30" strokeWidth="1" className={isEnemy ? "fill-red-950/50" : "fill-gray-700/50"} />
            <rect x="-70" y="-5" width="40" height="10" strokeWidth="1" className={isEnemy ? "fill-red-800" : "fill-gray-600"} />
            <rect x="30" y="-5" width="40" height="10" strokeWidth="1" className={isEnemy ? "fill-red-800" : "fill-gray-600"} />
            <rect x="-5" y="-70" width="10" height="40" strokeWidth="1" className={isEnemy ? "fill-red-800" : "fill-gray-600"} />
            <rect x="-5" y="30" width="10" height="40" strokeWidth="1" className={isEnemy ? "fill-red-800" : "fill-gray-600"} />
          </svg>
        </motion.div>

        {/* UI elements (do not rotate) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Health bar */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-2.5 bg-gray-600 rounded-full overflow-hidden border-2 border-gray-800">
                <div
                    className="h-full bg-green-500 transition-all duration-200"
                    style={{ width: `${healthPercentage}%`}}
                />
                <div
                    className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-200 opacity-70"
                    style={{ width: `${shieldPercentage}%`}}
                />
            </div>
            
            {/* Targeting indicator */}
            {isTargeted && (
                <div className={`absolute -inset-4 border-2 ${isEnemy ? 'border-red-500' : 'border-blue-500'} rounded-full animate-pulse`} />
            )}
        </div>
      </div>
    </div>
  );
}
