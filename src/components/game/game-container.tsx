'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';

const PLAYER_SPEED = 5;
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
  const isLeftMouseDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to get the latest state inside the game loop without re-triggering the effect
  const playerPositionRef = useRef(playerPosition);
  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);
  
  const playerRotationRef = useRef(playerRotation);
  useEffect(() => {
    playerRotationRef.current = playerRotation;
  }, [playerRotation]);


  // Setup event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.key.toLowerCase());
      if (event.key === ' ') {
        event.preventDefault(); // Prevent space from scrolling the page
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase());
    };
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) isLeftMouseDown.current = true;
    };
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isLeftMouseDown.current = false;
    };
    // Prevent context menu on right click etc.
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
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
      // --- MOVEMENT (relative to rotation) ---
      let forward = 0;
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) forward = 1;
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) forward = -1;

      let strafe = 0;
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) strafe = -1;
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) strafe = 1;

      if (forward !== 0 || strafe !== 0) {
        setPlayerPosition(prev => {
            const rotationInRadians = playerRotationRef.current * (Math.PI / 180);
            const cos = Math.cos(rotationInRadians);
            const sin = Math.sin(rotationInRadians);

            // Forward/backward vector
            let dx = forward * cos;
            let dy = forward * sin;
            
            // Strafe vector (perpendicular to forward, to the right)
            dx -= strafe * sin;
            dy += strafe * cos;
            
            // Normalize to prevent faster diagonal movement
            if (forward !== 0 && strafe !== 0) {
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                dx = dx / magnitude;
                dy = dy / magnitude;
            }

            const newX = prev.x + dx * PLAYER_SPEED;
            const newY = prev.y + dy * PLAYER_SPEED;
            
            return {
                x: Math.max(40, Math.min(MAP_WIDTH - 40, newX)),
                y: Math.max(40, Math.min(MAP_HEIGHT - 40, newY)),
            };
        });
      }

      // --- ROTATION (only on left click) ---
      if (isLeftMouseDown.current) {
        const shipScreenX = viewSize.width / 2;
        const shipScreenY = viewSize.height / 2;
        const angle = Math.atan2(mousePosition.current.y - shipScreenY, mousePosition.current.x - shipScreenX) * (180 / Math.PI);
        setPlayerRotation(angle);
      }

      // --- SHOOTING (on space or left click) ---
      const shouldShoot = keysPressed.current.has(' ') || isLeftMouseDown.current;
      if (shouldShoot && timestamp - lastShotTimestamp > FIRE_RATE_MS) {
        lastShotTimestamp = timestamp;
        setProjectiles((prev) => [
          ...prev,
          { id: timestamp, x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: playerRotationRef.current },
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
  }, [viewSize]); // Dependencies are minimal to prevent loop re-creation

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
