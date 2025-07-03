'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';
import { EnemyShip } from './enemy-ship';
import { Asteroid } from './asteroid';
import { SpaceStation } from './space-station';
import { Minimap } from '../game-ui/minimap';
import { SpeedIndicator } from '../game-ui/speed-indicator';
import { SettingsMenu } from '../game-ui/settings-menu';
import { PlayerStatus } from '@/components/game-ui/player-status';
import { ResourceDisplay } from '@/components/game-ui/resource-display';
import { ChatBox } from '@/components/game-ui/chat-box';
import { StellarBaseStatus } from '@/components/game-ui/stellar-base-status';
import { VesselSystems } from '@/components/game-ui/vessel-systems';
import type { ControlScheme } from '@/lib/types';

const ACCELERATION = 0.1;
const STRAFE_ACCELERATION = 0.05;
const REVERSE_ACCELERATION = 0.06;
const MAX_SPEED = 6;
const FRICTION = 0.98;

const PROJECTILE_SPEED = 8;
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;
const FIRE_RATE_MS = 250; 
const ENEMY_CLICK_RADIUS = 30;
const PROJECTILE_DAMAGE = 10;
const ENEMY_COLLISION_RADIUS = 20;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_SENSITIVITY = 0.001;

type ProjectileState = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

export type EnemyState = {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
};

export type AsteroidState = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export type StationState = {
  id: number;
  x: number;
  y: number;
}

export function GameContainer() {
  const [playerPosition, setPlayerPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(0);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [aimRotation, setAimRotation] = useState(0);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [asteroids, setAsteroids] = useState<AsteroidState[]>([]);
  const [stations, setStations] = useState<StationState[]>([]);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [controlScheme, setControlScheme] = useState<ControlScheme>('relative');
  const [zoom, setZoom] = useState(1);
  const [autoMoveTarget, setAutoMoveTarget] = useState<{ x: number, y: number } | null>(null);

  const keysPressed = useRef<Set<string>>(new Set());
  const mousePosition = useRef({ x: 0, y: 0 });
  const isLeftMouseDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const playerPositionRef = useRef(playerPosition);
  useEffect(() => { playerPositionRef.current = playerPosition; }, [playerPosition]);

  const velocityRef = useRef(velocity);
  useEffect(() => { velocityRef.current = velocity; }, [velocity]);
  
  const playerRotationRef = useRef(playerRotation);
  useEffect(() => { playerRotationRef.current = playerRotation; }, [playerRotation]);
  
  const targetIdRef = useRef(targetId);
  useEffect(() => { targetIdRef.current = targetId; }, [targetId]);

  const enemiesRef = useRef(enemies);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const projectilesRef = useRef(projectiles);
  useEffect(() => { projectilesRef.current = projectiles; }, [projectiles]);

  const autoMoveTargetRef = useRef(autoMoveTarget);
  useEffect(() => { autoMoveTargetRef.current = autoMoveTarget; }, [autoMoveTarget]);

  // Initial map object setup
  useEffect(() => {
    setEnemies([
        { id: 1, x: MAP_WIDTH / 2 + 300, y: MAP_HEIGHT / 2, health: 100, maxHealth: 100 },
        { id: 2, x: MAP_WIDTH / 2 - 400, y: MAP_HEIGHT / 2 - 200, health: 100, maxHealth: 100 },
        { id: 3, x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 + 500, health: 100, maxHealth: 100 },
        { id: 4, x: MAP_WIDTH / 2 + 500, y: MAP_HEIGHT / 2 - 300, health: 100, maxHealth: 100 },
    ]);
    setAsteroids([
      { id: 1, x: 1000, y: 1200, size: 80, rotation: 30 },
      { id: 2, x: 1800, y: 900, size: 120, rotation: 90 },
      { id: 3, x: 2200, y: 2000, size: 100, rotation: 180 },
      { id: 4, x: 500, y: 2500, size: 90, rotation: 270 },
    ]);
    setStations([
      { id: 1, x: 750, y: 750 },
    ]);
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsSettingsOpen(open => !open);
            setAutoMoveTarget(null);
            return;
        }
        if (isSettingsOpen) return;
        keysPressed.current.add(event.key.toLowerCase());
        
        const isMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase());
        if (isMovementKey && autoMoveTargetRef.current) {
            setAutoMoveTarget(null);
        }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
        keysPressed.current.delete(event.key.toLowerCase());
    }
    const handleMouseMove = (event: MouseEvent) => mousePosition.current = { x: event.clientX, y: event.clientY };
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    
    const handleMouseDown = (event: MouseEvent) => {
      if (isSettingsOpen) return;
      setAutoMoveTarget(null);

      if (event.button === 1) {
          event.preventDefault();
          const targetWorldX = playerPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoom;
          const targetWorldY = playerPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoom;
          setAutoMoveTarget({ x: targetWorldX, y: targetWorldY });
          return;
      }

      if (event.button === 0) {
        isLeftMouseDown.current = true;
        
        const clickWorldX = playerPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoom;
        const clickWorldY = playerPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoom;
        
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
            setTargetId(null);
        }
      }
    };
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isLeftMouseDown.current = false;
    };
    
    const handleWheel = (event: WheelEvent) => {
        if (isSettingsOpen) return;
        event.preventDefault();
        setZoom(prevZoom => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom - event.deltaY * ZOOM_SENSITIVITY)));
    };

    const container = containerRef.current;
    if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [viewSize, isSettingsOpen, zoom]);

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
      if (isSettingsOpen) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // --- MOVEMENT ---
      const rotRad = playerRotationRef.current * (Math.PI / 180);
      const cos = Math.cos(rotRad);
      const sin = Math.sin(rotRad);
      
      let accelVec = { x: 0, y: 0 };
      
      if (autoMoveTargetRef.current) {
        const angleToTarget = Math.atan2(autoMoveTargetRef.current.y - playerPositionRef.current.y, autoMoveTargetRef.current.x - playerPositionRef.current.x);
        setPlayerRotation(angleToTarget * (180 / Math.PI));
        accelVec.x += Math.cos(angleToTarget) * ACCELERATION;
        accelVec.y += Math.sin(angleToTarget) * ACCELERATION;
      } else {
        switch (controlScheme) {
            case 'relative':
              if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) { accelVec.x += cos * ACCELERATION; accelVec.y += sin * ACCELERATION; }
              if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) { accelVec.x -= cos * REVERSE_ACCELERATION; accelVec.y -= sin * REVERSE_ACCELERATION; }
              if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) { accelVec.x += sin * STRAFE_ACCELERATION; accelVec.y -= cos * STRAFE_ACCELERATION; }
              if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) { accelVec.x -= sin * STRAFE_ACCELERATION; accelVec.y += cos * STRAFE_ACCELERATION; }
              break;
            case 'absolute':
              if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) accelVec.y -= ACCELERATION;
              if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) accelVec.y += ACCELERATION;
              if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) accelVec.x -= ACCELERATION;
              if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) accelVec.x += ACCELERATION;
              break;
            case 'hybrid':
              if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) { accelVec.x += cos * ACCELERATION; accelVec.y += sin * ACCELERATION; }
              if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) { accelVec.x -= cos * REVERSE_ACCELERATION; accelVec.y -= sin * REVERSE_ACCELERATION; }
              if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) accelVec.x -= STRAFE_ACCELERATION;
              if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) accelVec.x += STRAFE_ACCELERATION;
              break;
        }
      }
      
      setVelocity(v => {
        const newVx = (v.x + accelVec.x) * FRICTION;
        const newVy = (v.y + accelVec.y) * FRICTION;
        const currentSpeed = Math.hypot(newVx, newVy);
        if (currentSpeed > MAX_SPEED) {
          return { x: (newVx / currentSpeed) * MAX_SPEED, y: (newVy / currentSpeed) * MAX_SPEED };
        }
        return { x: newVx, y: newVy };
      });
      
      setSpeed(Math.hypot(velocityRef.current.x, velocityRef.current.y));

      setPlayerPosition(p => ({
        x: Math.max(40, Math.min(MAP_WIDTH - 40, p.x + velocityRef.current.x)),
        y: Math.max(40, Math.min(MAP_HEIGHT - 40, p.y + velocityRef.current.y)),
      }));

      // --- AIMING & ROTATION ---
      const shipScreenX = viewSize.width / 2;
      const shipScreenY = viewSize.height / 2;
      const aimAngle = Math.atan2(mousePosition.current.y - shipScreenY, mousePosition.current.x - shipScreenX) * (180 / Math.PI);
      setAimRotation(aimAngle);
      
      const currentTarget = enemiesRef.current.find(e => e.id === targetIdRef.current);

      if (!autoMoveTargetRef.current) {
        if (currentTarget) {
            const angleToTarget = Math.atan2(currentTarget.y - playerPositionRef.current.y, currentTarget.x - playerPositionRef.current.x) * (180 / Math.PI);
            setPlayerRotation(angleToTarget);
        } else if (isLeftMouseDown.current) {
            setPlayerRotation(aimAngle);
        }
      }
      
      // --- SHOOTING ---
      const isShooting = currentTarget || keysPressed.current.has(' ');
      if (isShooting && timestamp - lastShotTimestamp > FIRE_RATE_MS) {
        lastShotTimestamp = timestamp;
        setProjectiles(prev => [...prev, { id: timestamp, x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: playerRotationRef.current }]);
      }
      
      // --- PROJECTILE MOVEMENT ---
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
  }, [viewSize, isSettingsOpen, controlScheme]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-gray-900 cursor-crosshair">
      {/* Game World */}
      <div style={{ 
          transform: `translate(${viewSize.width / 2}px, ${viewSize.height / 2}px) scale(${zoom}) translate(${-playerPosition.x}px, ${-playerPosition.y}px)`,
          willChange: 'transform',
          transformOrigin: 'top left'
      }}>
        <GameMap width={MAP_WIDTH} height={MAP_HEIGHT} />
        {projectiles.map((p) => (
          <Projectile key={p.id} x={p.x} y={p.y} rotation={p.rotation} />
        ))}
        {enemies.map((e) => (
            <EnemyShip key={e.id} x={e.x} y={e.y} health={e.health} maxHealth={e.maxHealth} isTargeted={e.id === targetId} />
        ))}
        {asteroids.map((a) => (
            <Asteroid key={a.id} x={a.x} y={a.y} size={a.size} rotation={a.rotation} />
        ))}
        {stations.map((s) => (
            <SpaceStation key={s.id} x={s.x} y={s.y} />
        ))}
      </div>
      
      {/* Player */}
      <PlayerShip rotation={playerRotation} aimRotation={aimRotation} />
      
      {/* UI Overlays */}
      <div className="absolute top-4 left-4 z-10">
        <VesselSystems />
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4">
        <PlayerStatus />
        <ResourceDisplay />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-4">
          <StellarBaseStatus />
          <ChatBox />
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <Minimap 
          playerPosition={playerPosition} 
          playerRotation={playerRotation}
          enemies={enemies}
          asteroids={asteroids}
          stations={stations}
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -transform-x-1/2 z-10">
        <SpeedIndicator speed={speed} rotation={playerRotation} />
      </div>

      <SettingsMenu
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        controlScheme={controlScheme}
        onControlSchemeChange={setControlScheme}
      />
    </div>
  );
}
