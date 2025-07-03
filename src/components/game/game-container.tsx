'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';

const PLAYER_SPEED = 4;
const PROJECTILE_SPEED = 8;
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;
const FIRE_RATE_MS = 150; // Fire rate in milliseconds

type ProjectileState = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

export function GameContainer() {
  const [playerPosition, setPlayerPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [playerRotation, setPlayerRotation] = useState(0);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  const keysPressed = useRef<Set<string>>(new Set());
  const mousePosition = useRef({ x: 0, y: 0 });
  const isShooting = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use a ref to get the latest position for projectile creation without causing loop dependency issues
  const playerPositionRef = useRef(playerPosition);
  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  // Setup event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
      if (event.key === ' ') {
        event.preventDefault();
        isShooting.current = true;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
      if (event.key === ' ') {
        isShooting.current = false;
      }
    };
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) isShooting.current = true;
    };
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isShooting.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Resize observer for container size
  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const resizeObserver = new ResizeObserver(() => {
          setViewSize({ width: container.clientWidth, height: container.clientHeight });
      });
      resizeObserver.observe(container);
      
      // Set initial size
      setViewSize({ width: container.clientWidth, height: container.clientHeight });
      
      return () => resizeObserver.disconnect();
  }, []);

  // Main game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastShotTimestamp = 0;

    const gameLoop = (timestamp: number) => {
      // --- MOVEMENT ---
      setPlayerPosition((prev) => {
        let { x, y } = prev;
        if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) y -= PLAYER_SPEED;
        if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) y += PLAYER_SPEED;
        if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) x -= PLAYER_SPEED;
        if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) x += PLAYER_SPEED;
        return {
          x: Math.max(40, Math.min(MAP_WIDTH - 40, x)),
          y: Math.max(40, Math.min(MAP_HEIGHT - 40, y)),
        };
      });

      // --- ROTATION ---
      const shipScreenX = viewSize.width / 2;
      const shipScreenY = viewSize.height / 2;
      const angle = Math.atan2(mousePosition.current.y - shipScreenY, mousePosition.current.x - shipScreenX) * (180 / Math.PI);
      setPlayerRotation(angle);

      // --- SHOOTING ---
      if (isShooting.current && timestamp - lastShotTimestamp > FIRE_RATE_MS) {
        lastShotTimestamp = timestamp;
        setProjectiles((prev) => [
          ...prev,
          { id: timestamp, x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: angle },
        ]);
      }
      
      // --- PROJECTILE MOVEMENT ---
      setProjectiles((prev) =>
        prev
          .map((p) => {
            const rad = p.rotation * (Math.PI / 180);
            return { ...p, x: p.x + Math.cos(rad) * PROJECTILE_SPEED, y: p.y + Math.sin(rad) * PROJECTILE_SPEED };
          })
          .filter((p) => p.x > -10 && p.x < MAP_WIDTH + 10 && p.y > -10 && p.y < MAP_HEIGHT + 10)
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    if(viewSize.width > 0) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [viewSize]);

  const mapOffsetX = -playerPosition.x + viewSize.width / 2;
  const mapOffsetY = -playerPosition.y + viewSize.height / 2;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-gray-900 cursor-crosshair">
      <div style={{ transform: `translate(${mapOffsetX}px, ${mapOffsetY}px)`, willChange: 'transform' }}>
        <GameMap width={MAP_WIDTH} height={MAP_HEIGHT} />
        {projectiles.map((p) => (
          <Projectile key={p.id} x={p.x} y={p.y} rotation={p.rotation} />
        ))}
      </div>
      <PlayerShip rotation={playerRotation} />
    </div>
  );
}