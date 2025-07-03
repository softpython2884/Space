import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import type { EnemyState } from "@/components/game/game-container";

const MINIMAP_SIZE = 256; // in pixels
const VIEW_RADIUS = 1000; // world units visible on minimap radius

interface MinimapProps {
  playerPosition: { x: number; y: number };
  playerRotation: number;
  enemies: EnemyState[];
  mapWidth: number;
  mapHeight: number;
}

export function Minimap({ playerPosition, playerRotation, enemies, mapWidth, mapHeight }: MinimapProps) {
    
  const scale = MINIMAP_SIZE / (VIEW_RADIUS * 2);

  const getDirectionalIcon = (isPlayer: boolean) => {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 50 50"
        className={isPlayer ? "fill-cyan-400 stroke-cyan-200" : "fill-red-500 stroke-red-300"}
        style={{ filter: isPlayer ? 'drop-shadow(0 0 4px hsl(var(--primary)))' : 'drop-shadow(0 0 4px hsl(0 100% 50%))' }}
      >
        <polygon points="25,0 45,45 25,35 5,45" strokeWidth="4" />
      </svg>
    )
  }

  return (
    <div className="relative w-64 h-64">
        {/* Compass Rose */}
        <div
            className="absolute inset-0 transition-transform duration-200"
            style={{ transform: `rotate(${-playerRotation}deg)` }}
        >
            <Image
                src="https://placehold.co/256x256"
                alt="Compass Rose"
                data-ai-hint="compass rose futuristic"
                width={256}
                height={256}
                className="opacity-30"
            />
        </div>

        {/* Minimap Content */}
        <Card className="w-56 h-56 bg-black/60 border-primary/50 backdrop-blur-sm rounded-full overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <CardContent className="p-0 relative w-full h-full">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform"
              style={{
                backgroundImage: 'url(https://placehold.co/512x512)',
                backgroundPosition: `${(playerPosition.x / mapWidth) * 100}% ${(playerPosition.y / mapHeight) * 100}%`,
                transform: `scale(1.5) rotate(${playerRotation}deg)`,
              }}
              data-ai-hint="star map space"
            />

            {/* Player Icon at the center */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
                style={{ transform: `translateX(-50%) translateY(-50%) rotate(${playerRotation}deg)` }}
            >
                {getDirectionalIcon(true)}
            </div>

            {/* Enemy Icons */}
            {enemies.map((enemy) => {
              const dx = enemy.x - playerPosition.x;
              const dy = enemy.y - playerPosition.y;
              const dist = Math.hypot(dx, dy);

              if (dist > VIEW_RADIUS) return null;

              const minimapX = (dx * scale) + (MINIMAP_SIZE / 2);
              const minimapY = (dy * scale) + (MINIMAP_SIZE / 2);

              return (
                <div
                  key={enemy.id}
                  className="absolute"
                  style={{
                    left: minimapX - 4, // center the icon
                    top: minimapY - 4,
                  }}
                >
                  <Rocket className="h-4 w-4 text-red-500" />
                </div>
              );
            })}
        </CardContent>
        </Card>
    </div>
  );
}
