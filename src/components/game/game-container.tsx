'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';
import { EnemyShip } from './enemy-ship';

const PLAYER_SPEED = 5;
const PROJECTILE_SPEED = 8;
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;
const FIRE_RATE_MS = 250; // Fire rate in milliseconds
const ENEMY_CLICK_RADIUS = 30;
const PROJECTILE_DAMAGE = 10;
const ENEMY_COLLISION_RADIUS = 20;

type ProjectileState = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

type EnemyState = {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
};

export function GameContainer() {
  const [playerPosition, setPlayerPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [playerRotation, setPlayerRotation] = useState(0);
  const [aimRotation, setAimRotation] = useState(0);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });

  const keysPressed = useRef<Set<string>>(new Set());
  const mousePosition = useRef({ x: 0, y: 0 });
  const isLeftMouseDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to get the latest state inside the game loop without re-triggering the effect
  const playerPositionRef = useRef(playerPosition);
  useEffect(() => { playerPositionRef.current = playerPosition; }, [playerPosition]);
  
  const playerRotationRef = useRef(playerRotation);
  useEffect(() => { playerRotationRef.current = playerRotation; }, [playerRotation]);
  
  const targetIdRef = useRef(targetId);
  useEffect(() => { targetIdRef.current = targetId; }, [targetId]);

  const enemiesRef = useRef(enemies);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const projectilesRef = useRef(projectiles);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);

  // Initial enemy setup
  useEffect(() => {
    setEnemies([
        { id: 1, x: MAP_WIDTH / 2 + 300, y: MAP_HEIGHT / 2, health: 100, maxHealth: 100 },
        { id: 2, x: MAP_WIDTH / 2 - 400, y: MAP_HEIGHT / 2 - 200, health: 100, maxHealth: 100 },
        { id: 3, x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 + 500, health: 100, maxHealth: 100 },
        { id: 4, x: MAP_WIDTH / 2 + 500, y: MAP_HEIGHT / 2 - 300, health: 100, maxHealth: 100 },
    ]);
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => keysPressed.current.add(event.key.toLowerCase());
    const handleKeyUp = (event: KeyboardEvent) => keysPressed.current.delete(event.key.toLowerCase());
    const handleMouseMove = (event: MouseEvent) => mousePosition.current = { x: event.clientX, y: event.clientY };
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        isLeftMouseDown.current = true;
        
        const clickWorldX = playerPositionRef.current.x - (viewSize.width / 2) + mousePosition.current.x;
        const clickWorldY = playerPositionRef.current.y - (viewSize.height / 2) + mousePosition.current.y;
        
        let clickedOnEnemy = false;
        for (const enemy of enemiesRef.current) {
            const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
            if (distance < ENEMY_CLICK_RADIUS) {
                setTargetId(enemy.id === targetIdRef.current ? null : enemy.id);
                clickedOnEnemy = true;
                break;
            }
        }
        if (!clickedOnEnemy) {
            setTargetId(null); // Clicked on empty space, deselect
        }
      }
    };
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isLeftMouseDown.current = false;
    };

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
  }, [viewSize]); // Re-bind if viewSize changes to get correct world coordinates

  // Resize observer for container size
  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const resizeObserver = new ResizeObserver(() => setViewSize({ width: container.clientWidth, height: container.clientHeight }));
      resizeObserver.observe(container);
      setViewSize({ width: container.clientWidth, height: container.clientHeight });
      return () => resizeObserver.disconnect();
  }, []);

  // Main game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastShotTimestamp = 0;

    const gameLoop = (timestamp: number) => {
      // --- MOVEMENT (relative to rotation) ---
      let forward = (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) ? 1 : (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) ? -1 : 0;
      let strafe = (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) ? -1 : (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) ? 1 : 0;
      if (forward !== 0 || strafe !== 0) {
        setPlayerPosition(prev => {
            const rotRad = playerRotationRef.current * (Math.PI / 180);
            const cos = Math.cos(rotRad);
            const sin = Math.sin(rotRad);
            let dx = (forward * cos) - (strafe * sin);
            let dy = (forward * sin) + (strafe * cos);
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 0) { dx /= mag; dy /= mag; }
            const newX = prev.x + dx * PLAYER_SPEED;
            const newY = prev.y + dy * PLAYER_SPEED;
            return { x: Math.max(40, Math.min(MAP_WIDTH - 40, newX)), y: Math.max(40, Math.min(MAP_HEIGHT - 40, newY)) };
        });
      }

      // --- AIMING & ROTATION ---
      const shipScreenX = viewSize.width / 2;
      const shipScreenY = viewSize.height / 2;
      const aimAngle = Math.atan2(mousePosition.current.y - shipScreenY, mousePosition.current.x - shipScreenX) * (180 / Math.PI);
      setAimRotation(aimAngle);
      
      const currentTarget = enemiesRef.current.find(e => e.id === targetIdRef.current);

      if (currentTarget) {
          // Auto-rotate towards target
          const angleToTarget = Math.atan2(currentTarget.y - playerPositionRef.current.y, currentTarget.x - playerPositionRef.current.x) * (180 / Math.PI);
          setPlayerRotation(angleToTarget);
      } else if (isLeftMouseDown.current) {
          // Manual rotation
          setPlayerRotation(aimAngle);
      }
      
      // --- SHOOTING ---
      if (currentTarget && timestamp - lastShotTimestamp > FIRE_RATE_MS) {
        lastShotTimestamp = timestamp;
        setProjectiles(prev => [...prev, { id: timestamp, x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: playerRotationRef.current }]);
      }
      
      // --- PROJECTILE MOVEMENT & COLLISION ---
      setProjectiles(prev => prev
          .map(p => {
              const rad = p.rotation * (Math.PI / 180);
              return { ...p, x: p.x + Math.cos(rad) * PROJECTILE_SPEED, y: p.y + Math.sin(rad) * PROJECTILE_SPEED };
          })
          .filter(p => p.x > -10 && p.x < MAP_WIDTH + 10 && p.y > -10 && p.y < MAP_HEIGHT + 10)
      );

      // --- ENEMY & PROJECTILE COLLISION ---
      const hitProjectiles = new Set<number>();
      const updatedEnemies = enemiesRef.current.map(enemy => {
          let newHealth = enemy.health;
          for (const proj of projectilesRef.current) {
              if (hitProjectiles.has(proj.id)) continue;
              const distance = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
              if (distance < ENEMY_COLLISION_RADIUS) {
                  hitProjectiles.add(proj.id);
                  newHealth -= PROJECTILE_DAMAGE;
              }
          }
          return { ...enemy, health: newHealth };
      }).filter(enemy => {
        if (enemy.health <= 0 && enemy.id === targetIdRef.current) {
            setTargetId(null);
        }
        return enemy.health > 0
      });
      setEnemies(updatedEnemies);

      if (hitProjectiles.size > 0) {
          setProjectiles(prev => prev.filter(p => !hitProjectiles.has(p.id)));
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    if(viewSize.width > 0) animationFrameId = requestAnimationFrame(gameLoop);
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
        {enemies.map((e) => (
            <EnemyShip key={e.id} x={e.x} y={e.y} health={e.health} maxHealth={e.maxHealth} isTargeted={e.id === targetId} />
        ))}
      </div>
      <PlayerShip rotation={playerRotation} aimRotation={aimRotation} />
    </div>
  );
}
