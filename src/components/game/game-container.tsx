'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';
import { EnemyShip } from './enemy-ship';
import { FrigateShip } from './frigate-ship';
import { StaffShip } from './staff-ship';
import { Asteroid } from './asteroid';
import { SpaceStation } from './space-station';
import { Debris } from './debris';
import { Radar } from '../game-ui/radar';
import { SpeedIndicator } from '../game-ui/speed-indicator';
import { SettingsMenu } from '../game-ui/settings-menu';
import { PlayerStatus } from '@/components/game-ui/player-status';
import { ResourceDisplay } from '@/components/game-ui/resource-display';
import { ChatBox } from '@/components/game-ui/chat-box';
import { StellarBaseStatus } from '@/components/game-ui/stellar-base-status';
import { VesselSystems } from '@/components/game-ui/vessel-systems';
import { ShipModeSelector } from '@/components/game-ui/ship-mode-selector';
import { CruiseStreaks } from '@/components/game/cruise-streaks';
import { INITIAL_PLAYER_DATA } from '@/lib/constants';
import type { ControlScheme, PlayerData, StellarBaseData, VesselSystemsData, ShipMode, Debris as DebrisType, EnemyState as EnemyStateType, AsteroidState, StationState, BotShipType, ContextMenuTargetType, PlayerActionType, Resources } from '@/lib/types';
import { ClientOnly } from '@/components/client-only';
import { GameOverOverlay } from './game-over-overlay';
import { MilitaryViewOverlay } from './military-view-overlay';
import { ContextMenu } from './context-menu';
import { ActionProgress } from '../game-ui/action-progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

let ACCELERATION = 0.1;
let STRAFE_ACCELERATION = 0.05;
const REVERSE_ACCELERATION = 0.06;
let MAX_SPEED = 6;
const FRICTION = 0.98;

const PROJECTILE_SPEED = 8;
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;
const FIRE_RATE_MS = 250; 
const ENEMY_CLICK_RADIUS = 30;
const ASTEROID_CLICK_RADIUS = 60;
const STATION_CLICK_RADIUS = 75;

const BASE_RADAR_RANGE = 1200;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_SENSITIVITY = 0.001;

// Combat & Resource Constants
const PLAYER_COLLISION_RADIUS = 20;
const ENEMY_COLLISION_RADIUS = 20;
const FRIGATE_COLLISION_RADIUS = 30;
const STAFF_COLLISION_RADIUS = 15;
const DEBRIS_COLLISION_RADIUS = 20;
const STATION_COLLISION_RADIUS = 75;
const ASTEROID_COLLISION_RADIUS = 0.3; // Multiplier for asteroid size

const PLAYER_PROJECTILE_DAMAGE = 10;
const ENEMY_PROJECTILE_DAMAGE = 5;

const ASTEROID_COLLISION_DAMAGE = 1;
const ENEMY_COLLISION_DAMAGE = 25;
const STATION_COLLISION_DAMAGE = 50;

const ENERGY_PER_SHOT = 2;
const ENERGY_REGEN_RATE = 0.02; // Slower regen
const ENERGY_REGEN_DELAY_MS = 2000; // 2 seconds delay
const LOW_HEALTH_THRESHOLD = 30;

const ENEMY_AGGRO_RADIUS = 800;
const ENEMY_FIRE_RATE_MS = 1500;
const ENEMY_SPEED = 2.5;

const STEALTH_AGGRO_RADIUS = 350;
const STEALTH_DETECTION_RADIUS_NEAR = 100;

// Cruise Mode Constants
const CRUISE_CHARGE_TIME = 2000; // 2 seconds
const CRUISE_DURATION = 4000; // 4 seconds
const CRUISE_ENERGY_COST = 50;
const CRUISE_COOLDOWN_MS = 5000; // 5 seconds after cruise ends

// Shield Mode Constants
const SHIELD_ENERGY_DRAIN_RATE = 0.01;
const SHIELD_DAMAGE_TO_ENERGY_COST = 3;

// Mode Switching Constants
const MODE_CHANGE_COOLDOWN_MS = 2000; // 2 seconds between any mode change

// Enemy AI Constants
const ENEMY_MAX_ENERGY = 100;
const ENEMY_ENERGY_PER_SHOT = 10;
const ENEMY_ENERGY_REGEN_RATE = 0.05;
const ENEMY_ENERGY_REGEN_DELAY_MS = 3000;
const ENEMY_SEARCH_DURATION_MS = 5000; // Time an enemy will search for the player
const ENEMY_FLEE_HEALTH_THRESHOLD = 0.3; // 30% health

// Action constants
const MINING_DURATION_MS = 5000;
const PILLAGE_DURATION_MS = 2000;
const PILLAGE_ENERGY_COST = 40;
const PILLAGE_DAMAGE = 15;
const BOARDING_DURATION_MS = 7000;
const BOARDING_ENERGY_COST = 60;
const BOARDING_SUCCESS_CHANCE = 0.4;
const BOARDING_FAIL_DAMAGE = 20;


type ProjectileState = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

export type EnemyState = EnemyStateType;

const generateInitialEnemies = (): EnemyState[] => [
    // Chasseurs
    { id: 1, type: 'chasseur', x: MAP_WIDTH / 2 + 1000, y: MAP_HEIGHT / 2 + 1000, vx: 0, vy: 0, health: 100, maxHealth: 100, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0 },
    { id: 2, type: 'chasseur', x: MAP_WIDTH / 2 - 1100, y: MAP_HEIGHT / 2 - 800, vx: 0, vy: 0, health: 100, maxHealth: 100, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0 },
    // Frigate
    { id: 3, type: 'frigate', x: MAP_WIDTH / 2 + 200, y: MAP_HEIGHT / 2 + 1200, vx: 0, vy: 0, health: 300, maxHealth: 300, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 10, lastEnergyUseTimestamp: 0 },
    // Staff
    { id: 4, type: 'staff', x: 850, y: 850, vx: 0.5, vy: -0.5, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 20, lastEnergyUseTimestamp: 0 },
    { id: 5, type: 'staff', x: 2000, y: 2200, vx: -0.5, vy: 0.5, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 20, lastEnergyUseTimestamp: 0 },
];

const generateInitialAsteroids = (): AsteroidState[] => [
    { id: 1, x: 1000, y: 1200, size: 80, rotation: 30 },
    { id: 2, x: 1800, y: 900, size: 120, rotation: 90 },
    { id: 3, x: 2200, y: 2000, size: 100, rotation: 180 },
    { id: 4, x: 500, y: 2500, size: 90, rotation: 270 },
];

const generateInitialStations = (): StationState[] => [
    { id: 1, x: 750, y: 750 },
];


export function GameContainer() {
  const { toast } = useToast();
  const [playerPosition, setPlayerPosition] = useState({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(0);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [aimRotation, setAimRotation] = useState(0);
  const [playerProjectiles, setPlayerProjectiles] = useState<ProjectileState[]>([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState<ProjectileState[]>([]);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [asteroids, setAsteroids] = useState<AsteroidState[]>([]);
  const [stations, setStations] = useState<StationState[]>([]);
  const [debris, setDebris] = useState<DebrisType[]>([]);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [controlScheme, setControlScheme] = useState<ControlScheme>('hybrid');
  const [zoom, setZoom] = useState(1);
  const [autoMoveTarget, setAutoMoveTarget] = useState<{ x: number, y: number } | null>(null);
  const [shipMode, setShipMode] = useState<ShipMode>('normal');
  const [cruiseState, setCruiseState] = useState<'idle' | 'charging' | 'cruising'>('idle');
  const [cooldowns, setCooldowns] = useState({ modeChange: 1, cruise: 1 }); // 1 means available
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId: number; targetType: ContextMenuTargetType; } | null>(null);
  const [playerAction, setPlayerAction] = useState<{ type: PlayerActionType; targetId: number; startTime: number; duration: number; } | null>(null);

  const [playerData, setPlayerData] = useState<PlayerData>(JSON.parse(JSON.stringify(INITIAL_PLAYER_DATA)));
  const [stellarBaseData, setStellarBaseData] = useState<StellarBaseData>({ shields: 95, hull: 88 });
  const [vesselSystems, setVesselSystems] = useState<VesselSystemsData>({ shields: 'Online', weapons: 'Ready', power: 'Optimal' });

  const keysPressed = useRef<Set<string>>(new Set());
  const mousePosition = useRef({ x: 0, y: 0 });
  const isLeftMouseDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEnergyUseTimestamp = useRef(0);
  const lastFiredTimestamp = useRef(0);

  const modeChangeAvailableAtRef = useRef(0);
  const cruiseAvailableAtRef = useRef(0);
  const cruiseChargeStartTimestampRef = useRef<number>(0);
  const cruiseDurationStartTimestampRef = useRef<number>(0);
  
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

  const asteroidsRef = useRef(asteroids);
  useEffect(() => { asteroidsRef.current = asteroids; }, [asteroids]);

  const playerProjectilesRef = useRef(playerProjectiles);
  useEffect(() => { playerProjectilesRef.current = playerProjectiles; }, [playerProjectiles]);
  
  const enemyProjectilesRef = useRef(enemyProjectiles);
  useEffect(() => { enemyProjectilesRef.current = enemyProjectiles }, [enemyProjectiles]);

  const autoMoveTargetRef = useRef(autoMoveTarget);
  useEffect(() => { autoMoveTargetRef.current = autoMoveTarget; }, [autoMoveTarget]);

  const playerDataRef = useRef(playerData);
  useEffect(() => { playerDataRef.current = playerData; }, [playerData]);

  const cruiseStateRef = useRef(cruiseState);
  useEffect(() => { cruiseStateRef.current = cruiseState; }, [cruiseState]);

  const debrisRef = useRef(debris);
  useEffect(() => { debrisRef.current = debris; }, [debris]);

  const shipModeRef = useRef(shipMode);
  useEffect(() => { shipModeRef.current = shipMode; }, [shipMode]);

  const playerActionRef = useRef(playerAction);
  useEffect(() => { playerActionRef.current = playerAction; }, [playerAction]);

  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const resetGame = () => {
    setPlayerPosition({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
    setVelocity({ x: 0, y: 0 });
    setPlayerRotation(0);
    setPlayerProjectiles([]);
    setEnemyProjectiles([]);
    setEnemies(generateInitialEnemies());
    setAsteroids(generateInitialAsteroids());
    setStations(generateInitialStations());
    setDebris([]);
    setTargetId(null);
    setPlayerData(JSON.parse(JSON.stringify(INITIAL_PLAYER_DATA)));
    setIsGameOver(false);
    setShipMode('normal');
    setCruiseState('idle');
    setPlayerAction(null);
    setContextMenu(null);
    modeChangeAvailableAtRef.current = 0;
    cruiseAvailableAtRef.current = 0;
    setCooldowns({ modeChange: 1, cruise: 1 });
  };

  // Initial map object setup
  useEffect(() => {
    resetGame();
  }, []);

  const handleActionSelect = (action: PlayerActionType, targetId: number) => {
    setContextMenu(null);
    if (playerActionRef.current) return;

    const targetEnemy = enemiesRef.current.find(e => e.id === targetId);

    switch(action) {
      case 'mining':
        setPlayerAction({ type: 'mining', targetId, startTime: Date.now(), duration: MINING_DURATION_MS });
        break;
      case 'pillaging':
        if (targetEnemy) {
          if (playerDataRef.current.energy < PILLAGE_ENERGY_COST) {
            toast({ variant: "destructive", title: "Not enough energy to pillage." });
            return;
          }
          setPlayerData(d => ({ ...d, energy: d.energy - PILLAGE_ENERGY_COST }));
          lastEnergyUseTimestamp.current = Date.now();
          setPlayerAction({ type: 'pillaging', targetId, startTime: Date.now(), duration: PILLAGE_DURATION_MS });
        }
        break;
      case 'boarding':
        if (targetEnemy) {
            if (targetEnemy.isAlly) {
                toast({ title: "Target is already an ally." });
                return;
            }
          if (playerDataRef.current.energy < BOARDING_ENERGY_COST) {
            toast({ variant: "destructive", title: "Not enough energy to board." });
            return;
          }
          setPlayerData(d => ({ ...d, energy: d.energy - BOARDING_ENERGY_COST }));
          lastEnergyUseTimestamp.current = Date.now();
          setPlayerAction({ type: 'boarding', targetId, startTime: Date.now(), duration: BOARDING_DURATION_MS });
        }
        break;
    }
  };

  const handleModeChange = (newMode: ShipMode) => {
    const now = Date.now();
    if (now < modeChangeAvailableAtRef.current) {
        toast({ title: "Mode change is on cooldown." });
        return;
    }
    if (cruiseStateRef.current !== 'idle') return;
    if (playerActionRef.current) return; // Cannot change modes during an action

    if (newMode === 'cruise') {
        if (now < cruiseAvailableAtRef.current) {
            toast({ title: "Cruise is on cooldown." });
            return;
        }
        if (playerDataRef.current.energy < CRUISE_ENERGY_COST) {
            toast({ variant: "destructive", title: "Not enough energy for cruise." });
            return;
        }
        setPlayerData(d => ({ ...d, energy: Math.max(0, d.energy - CRUISE_ENERGY_COST) }));
    }

    if (newMode === 'shield' && playerDataRef.current.energy <= 0) {
        toast({ variant: "destructive", title: "Not enough energy to activate shield." });
        return;
    }
    
    if (newMode === 'cruise') {
        setShipMode('cruise');
        setCruiseState('charging');
        cruiseChargeStartTimestampRef.current = 0;
        cruiseDurationStartTimestampRef.current = 0;
    } else {
        setShipMode(newMode);
    }

    modeChangeAvailableAtRef.current = now + MODE_CHANGE_COOLDOWN_MS;
  };

  const applyDamage = (damage: number) => {
    setPlayerData(d => {
        if (d.health <= 0) return d;
        const energyCost = damage * SHIELD_DAMAGE_TO_ENERGY_COST;
        if (shipModeRef.current === 'shield' && d.energy >= energyCost) {
            lastEnergyUseTimestamp.current = Date.now();
            return { ...d, energy: Math.max(0, d.energy - energyCost) };
        }
        return { ...d, health: Math.max(0, d.health - damage) };
    });
  };

  // Setup event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsSettingsOpen(open => !open);
            setAutoMoveTarget(null);
            setContextMenu(null);
            return;
        }
        if (isSettingsOpen || isGameOver || playerActionRef.current?.type === 'mining') return;
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
      if (isSettingsOpen || isGameOver) return;
      if ((event.target as HTMLElement).closest('[data-ui-element="true"]')) {
        return;
      }
      
      const clickWorldX = playerPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoomRef.current;
      const clickWorldY = playerPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoomRef.current;
      
      if (event.button === 0) { // Left mouse button
        isLeftMouseDown.current = true;
        setContextMenu(null);

        for (const enemy of enemiesRef.current) {
            if (enemy.isAlly) continue;
            const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
            if (distance < ENEMY_CLICK_RADIUS) {
                setTargetId(enemy.id === targetIdRef.current ? null : enemy.id);
                setAutoMoveTarget(null);
                return; 
            }
        }
      } else if (event.button === 1) { // Middle mouse button
        event.preventDefault();
        setAutoMoveTarget({ x: clickWorldX, y: clickWorldY });
        setTargetId(null);
        setContextMenu(null);
      } else if (event.button === 2) { // Right mouse button
        event.preventDefault();
        setContextMenu(null);

        for (const enemy of enemiesRef.current) {
          const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
          if (distance < ENEMY_CLICK_RADIUS * 2) {
            setContextMenu({ x: event.clientX, y: event.clientY, targetId: enemy.id, targetType: 'enemy' });
            return;
          }
        }
        for (const asteroid of asteroidsRef.current) {
          const distance = Math.hypot(clickWorldX - asteroid.x, clickWorldY - asteroid.y);
          if (distance < ASTEROID_CLICK_RADIUS) {
            setContextMenu({ x: event.clientX, y: event.clientY, targetId: asteroid.id, targetType: 'asteroid' });
            return;
          }
        }
      }
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isLeftMouseDown.current = false;
    };
    
    const handleWheel = (event: WheelEvent) => {
        if (isSettingsOpen || isGameOver) return;
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
  }, [viewSize, isSettingsOpen, isGameOver]);

  // Resize observer for container size
  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const resizeObserver = new ResizeObserver(() => setViewSize({ width: container.clientWidth, height: container.clientHeight }));
      resizeObserver.observe(container);
      setViewSize({ width: container.clientWidth, height: container.clientHeight });
      return () => resizeObserver.disconnect();
  }, []);

  // Cooldown UI updater effect
  useEffect(() => {
    const intervalId = setInterval(() => {
        const now = Date.now();
        const modeChangeProgress = Math.min(1, 1 - (Math.max(0, modeChangeAvailableAtRef.current - now) / MODE_CHANGE_COOLDOWN_MS));
        const cruiseProgress = Math.min(1, 1 - (Math.max(0, cruiseAvailableAtRef.current - now) / CRUISE_COOLDOWN_MS));
        setCooldowns({ modeChange: modeChangeProgress, cruise: cruiseProgress });
    }, 100);

    return () => clearInterval(intervalId);
  }, []);


  // Update vessel systems based on player data and ship mode
  useEffect(() => {
    const { health, energy } = playerData;
    const newSystems: VesselSystemsData = {
        shields: 'Online',
        weapons: 'Ready',
        power: 'Optimal',
    };

    if (shipMode === 'cruise' || shipMode === 'scan' || !!playerAction) newSystems.weapons = 'Offline';
    else if (energy < ENERGY_PER_SHOT) newSystems.weapons = 'Offline';

    if (shipMode === 'stealth') newSystems.shields = 'Offline';
    else if (shipMode === 'shield') newSystems.shields = 'Online';
    else if (health < 50) newSystems.shields = 'Damaged';
    if (health <= 0) newSystems.shields = 'Offline';
    
    if (energy <= 0) newSystems.power = 'Offline';
    else if (energy < 40) newSystems.power = 'Damaged';

    setVesselSystems(newSystems);
  }, [playerData, shipMode, playerAction]);

  // Main game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastCollisionTimestamp = 0;

    const gameLoop = (timestamp: number) => {
      if (isSettingsOpen || isGameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      
      // --- PLAYER ACTION HANDLING ---
      if (playerActionRef.current) {
        const { type, targetId, startTime, duration } = playerActionRef.current;
        const now = timestamp;
        const targetEnemy = enemiesRef.current.find(e => e.id === targetId);

        if (type === 'mining') {
          if (now - startTime > duration) {
            setAsteroids(prev => prev.filter(a => a.id !== targetId));
            setPlayerData(d => ({ ...d, resources: { ...d.resources, ore: d.resources.ore + Math.floor(Math.random() * 51) + 25 }}));
            setPlayerAction(null);
          }
        } else if (type === 'pillaging') {
            if (!targetEnemy || now - startTime > duration) {
              if (targetEnemy) {
                setEnemies(prev => prev.map(e => e.id === targetId ? { ...e, health: Math.max(0, e.health - PILLAGE_DAMAGE) } : e));
                const newDebris: DebrisType = {
                  id: Date.now(),
                  x: targetEnemy.x,
                  y: targetEnemy.y,
                  resources: {
                    money: Math.floor(Math.random() * 51),
                    ore: Math.floor(Math.random() * 11),
                    gas: Math.floor(Math.random() * 6),
                  }
                };
                setDebris(prev => [...prev, newDebris]);
              }
              setPlayerAction(null);
            }
        } else if (type === 'boarding') {
            if (!targetEnemy) {
                setPlayerAction(null); // Target destroyed
            } else {
                const distanceToTarget = Math.hypot(targetEnemy.x - playerPositionRef.current.x, targetEnemy.y - playerPositionRef.current.y);
                const stickDistance = PLAYER_COLLISION_RADIUS + ENEMY_COLLISION_RADIUS + 5;
                if (distanceToTarget > stickDistance) {
                    const angleToTarget = Math.atan2(targetEnemy.y - playerPositionRef.current.y, targetEnemy.x - playerPositionRef.current.x);
                    setVelocity({ x: Math.cos(angleToTarget) * MAX_SPEED, y: Math.sin(angleToTarget) * MAX_SPEED });
                } else {
                    setVelocity({ x: targetEnemy.vx, y: targetEnemy.vy });
                }

                if (now - startTime > duration) {
                    if (Math.random() < BOARDING_SUCCESS_CHANCE) {
                        toast({ title: "Boarding Successful!", description: `${targetEnemy.type} has joined your side.` });
                        setEnemies(prev => prev.map(e => e.id === targetId ? { ...e, isAlly: true, aiState: 'following' } : e));
                    } else {
                        toast({ variant: "destructive", title: "Boarding Failed!", description: "Your ship took damage." });
                        applyDamage(BOARDING_FAIL_DAMAGE);
                    }
                    setPlayerAction(null);
                }
            }
        }
      }
      
      // --- CRUISE MODE STATE MACHINE ---
      if (cruiseStateRef.current === 'charging') {
        if (cruiseChargeStartTimestampRef.current === 0) {
            cruiseChargeStartTimestampRef.current = timestamp;
        }
        if (timestamp - cruiseChargeStartTimestampRef.current > CRUISE_CHARGE_TIME) {
            setCruiseState('cruising');
            cruiseChargeStartTimestampRef.current = 0;
        }
      }
      if (cruiseStateRef.current === 'cruising') {
          if (cruiseDurationStartTimestampRef.current === 0) {
              cruiseDurationStartTimestampRef.current = timestamp;
          }
          if (timestamp - cruiseDurationStartTimestampRef.current > CRUISE_DURATION) {
              setCruiseState('idle');
              setShipMode('normal');
              cruiseDurationStartTimestampRef.current = 0;
              cruiseAvailableAtRef.current = Date.now() + CRUISE_COOLDOWN_MS;
          }
      }

      // --- SHIP MODE LOGIC ---
      let currentMaxSpeed = MAX_SPEED;
      let currentAccel = ACCELERATION;
      let currentStrafe = STRAFE_ACCELERATION;
      
      if (cruiseStateRef.current === 'cruising') {
          currentMaxSpeed = MAX_SPEED * 5;
          currentAccel = ACCELERATION * 4.0;
          currentStrafe = STRAFE_ACCELERATION * 0.1; // Poor turning
      } else if (shipModeRef.current === 'stealth') {
          currentMaxSpeed = MAX_SPEED * 0.8;
          currentAccel = ACCELERATION * 0.8;
      }
      
      // --- AIMING & ROTATION ---
      const mouseWorldX = playerPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoomRef.current;
      const mouseWorldY = playerPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoomRef.current;
      const aimAngle = Math.atan2(mouseWorldY - playerPositionRef.current.y, mouseWorldX - playerPositionRef.current.x) * (180 / Math.PI);
      setAimRotation(aimAngle); // Aiming reticle always follows mouse
      
      if (isLeftMouseDown.current) {
        setPlayerRotation(aimAngle);
      }


      // --- PLAYER MOVEMENT (REFACTORED FOR SMOOTHNESS) ---
      let accelVec = { x: 0, y: 0 };
      const isMovementDisabled = shipModeRef.current === 'scan' || cruiseStateRef.current === 'charging' || !!playerActionRef.current;

      if (!isMovementDisabled) {
        const rotRad = playerRotationRef.current * (Math.PI / 180);
        if (cruiseStateRef.current === 'cruising') {
          const cruiseRad = playerRotationRef.current * (Math.PI / 180);
          accelVec.x = Math.cos(cruiseRad) * currentAccel;
          accelVec.y = Math.sin(cruiseRad) * currentAccel;
        } else if (autoMoveTargetRef.current) {
          const distanceToTarget = Math.hypot(autoMoveTargetRef.current.x - playerPositionRef.current.x, autoMoveTargetRef.current.y - playerPositionRef.current.y);
          if (distanceToTarget > 10) {
              const angleToTarget = Math.atan2(autoMoveTargetRef.current.y - playerPositionRef.current.y, autoMoveTargetRef.current.x - playerPositionRef.current.x);
              accelVec.x += Math.cos(angleToTarget) * currentAccel;
              accelVec.y += Math.sin(angleToTarget) * currentAccel;
              setPlayerRotation(angleToTarget * (180 / Math.PI));
          } else {
              setAutoMoveTarget(null);
          }
        } else {
            const cos = Math.cos(rotRad);
            const sin = Math.sin(rotRad);
            switch (controlScheme) {
                case 'relative':
                  if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) { accelVec.x += cos * currentAccel; accelVec.y += sin * currentAccel; }
                  if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) { accelVec.x -= cos * REVERSE_ACCELERATION; accelVec.y -= sin * REVERSE_ACCELERATION; }
                  if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) { accelVec.x += sin * currentStrafe; accelVec.y -= cos * currentStrafe; }
                  if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) { accelVec.x -= sin * currentStrafe; accelVec.y += cos * currentStrafe; }
                  break;
                case 'absolute':
                  if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) accelVec.y -= currentAccel;
                  if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) accelVec.y += currentAccel;
                  if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) accelVec.x -= currentAccel;
                  if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) accelVec.x += currentAccel;
                  break;
                case 'hybrid':
                  if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) { accelVec.x += cos * currentAccel; accelVec.y += sin * currentAccel; }
                  if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) { accelVec.x -= cos * REVERSE_ACCELERATION; accelVec.y -= sin * REVERSE_ACCELERATION; }
                  if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) accelVec.x -= currentStrafe;
                  if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) accelVec.x += currentStrafe;
                  break;
            }
        }
      }
      
      let newVx = (velocityRef.current.x + accelVec.x) * FRICTION;
      let newVy = (velocityRef.current.y + accelVec.y) * FRICTION;
      const calculatedSpeed = Math.hypot(newVx, newVy);

      if (calculatedSpeed > currentMaxSpeed) {
        newVx = (newVx / calculatedSpeed) * currentMaxSpeed;
        newVy = (newVy / calculatedSpeed) * currentMaxSpeed;
      }
      
      const newVelocity = { x: newVx, y: newVy };
      
      setVelocity(newVelocity);
      setSpeed(Math.hypot(newVelocity.x, newVelocity.y));
      setPlayerPosition(p => ({
        x: Math.max(40, Math.min(MAP_WIDTH - 40, p.x + newVelocity.x)),
        y: Math.max(40, Math.min(MAP_HEIGHT - 40, p.y + newVelocity.y)),
      }));

      
      // --- PLAYER SHOOTING ---
      const currentTarget = enemiesRef.current.find(e => e.id === targetIdRef.current && !e.isAlly);
      const canShoot = playerDataRef.current.energy >= ENERGY_PER_SHOT && (shipMode === 'normal' || shipMode === 'stealth' || shipMode === 'shield') && cruiseStateRef.current === 'idle' && !playerActionRef.current;
      const isShooting = currentTarget && canShoot;
      if (isShooting && timestamp - lastFiredTimestamp.current > FIRE_RATE_MS) {
        lastFiredTimestamp.current = timestamp;
        lastEnergyUseTimestamp.current = timestamp;
        
        let fireRotation = aimAngle;
        if (currentTarget) {
          fireRotation = Math.atan2(currentTarget.y - playerPositionRef.current.y, currentTarget.x - playerPositionRef.current.x) * (180 / Math.PI);
        }

        setPlayerProjectiles(prev => [...prev, { id: timestamp, x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: fireRotation }]);
        setPlayerData(d => ({ ...d, energy: d.energy - ENERGY_PER_SHOT }));
      }

      // --- PLAYER STATS REGEN & DRAIN ---
      if (shipModeRef.current === 'shield') {
          setPlayerData(d => {
              if (d.energy > 0) {
                  lastEnergyUseTimestamp.current = timestamp;
                  return { ...d, energy: Math.max(0, d.energy - SHIELD_ENERGY_DRAIN_RATE) };
              }
              return d;
          });
          if (playerDataRef.current.energy <= 0) {
              setShipMode('normal'); // Deactivate shield if out of power
          }
      } else if (timestamp - lastEnergyUseTimestamp.current > ENERGY_REGEN_DELAY_MS) {
          setPlayerData(d => ({ ...d, energy: Math.min(100, d.energy + ENERGY_REGEN_RATE) }));
      }
      
      // --- PROJECTILE MOVEMENT ---
      setPlayerProjectiles(prev => prev
          .map(p => {
              const rad = p.rotation * (Math.PI / 180);
              return { ...p, x: p.x + Math.cos(rad) * PROJECTILE_SPEED, y: p.y + Math.sin(rad) * PROJECTILE_SPEED };
          })
          .filter(p => p.x > -10 && p.x < MAP_WIDTH + 10 && p.y > -10 && p.y < MAP_HEIGHT + 10)
      );
      setEnemyProjectiles(prev => prev
          .map(p => {
              const rad = p.rotation * (Math.PI / 180);
              return { ...p, x: p.x + Math.cos(rad) * PROJECTILE_SPEED, y: p.y + Math.sin(rad) * PROJECTILE_SPEED };
          })
          .filter(p => p.x > -10 && p.x < MAP_WIDTH + 10 && p.y > -10 && p.y < MAP_HEIGHT + 10)
      );

      // --- ENEMY PROCESSING & COMBAT ---
      const newEnemyProjectiles: ProjectileState[] = [];
      const hitPlayerProjectileIds = new Set<number>();
      const newDebrisFromKills: DebrisType[] = [];

      let processedEnemies = enemiesRef.current.map(enemy => {
          let updatedEnemy = { ...enemy };
          
          if (updatedEnemy.isAlly) {
            updatedEnemy.aiState = 'following';
          }

          // Energy Regen
          if (timestamp - updatedEnemy.lastEnergyUseTimestamp > ENEMY_ENERGY_REGEN_DELAY_MS) {
              updatedEnemy.energy = Math.min(updatedEnemy.maxEnergy, updatedEnemy.energy + ENEMY_ENERGY_REGEN_RATE);
          }
          
          let collisionRadius = ENEMY_COLLISION_RADIUS;
          if (enemy.type === 'frigate') collisionRadius = FRIGATE_COLLISION_RADIUS;
          else if (enemy.type === 'staff') collisionRadius = STAFF_COLLISION_RADIUS;

          // Check for player projectile hits
          let isHit = false;
          if (!updatedEnemy.isAlly) {
            for (const proj of playerProjectilesRef.current) {
                if (hitPlayerProjectileIds.has(proj.id)) continue;
                const distance = Math.hypot(proj.x - updatedEnemy.x, proj.y - updatedEnemy.y);
                if (distance < collisionRadius) {
                    hitPlayerProjectileIds.add(proj.id);
                    updatedEnemy.health -= PLAYER_PROJECTILE_DAMAGE;
                    isHit = true;
                }
            }
          }

          if (isHit && updatedEnemy.aiState === 'patrolling' && updatedEnemy.type !== 'staff') {
            updatedEnemy.aiState = 'chasing';
            updatedEnemy.stateChangeTimestamp = timestamp;
            updatedEnemy.lastKnownPlayerPosition = { ...playerPositionRef.current };
          }

          if (updatedEnemy.health <= 0) {
              newDebrisFromKills.push({
                  id: updatedEnemy.id + timestamp,
                  x: updatedEnemy.x,
                  y: updatedEnemy.y,
                  resources: { ore: Math.floor(Math.random() * 21) + 5 + updatedEnemy.cargo }
              });
              if (updatedEnemy.id === targetIdRef.current) {
                  setTargetId(null);
              }
              return null;
          }

          if(updatedEnemy.type !== 'staff') {
            // AI STATE MACHINE
            const distanceToPlayer = Math.hypot(updatedEnemy.x - playerPositionRef.current.x, updatedEnemy.y - playerPositionRef.current.y);

            let aggroRadius = ENEMY_AGGRO_RADIUS;
            if (shipModeRef.current === 'scan') aggroRadius *= 1.5;
            else if (shipModeRef.current === 'stealth') aggroRadius = STEALTH_AGGRO_RADIUS;

            const canSeePlayer = distanceToPlayer < aggroRadius;

            const shouldFlee = (updatedEnemy.health / updatedEnemy.maxHealth) < ENEMY_FLEE_HEALTH_THRESHOLD && updatedEnemy.energy < (ENEMY_ENERGY_PER_SHOT * 2);
            if (shouldFlee && updatedEnemy.aiState !== 'fleeing' && !updatedEnemy.isAlly) {
                updatedEnemy.aiState = 'fleeing';
                updatedEnemy.stateChangeTimestamp = timestamp;
            }

            switch (updatedEnemy.aiState) {
                case 'patrolling':
                    if (canSeePlayer && !updatedEnemy.isAlly) {
                        updatedEnemy.aiState = 'chasing';
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    } else {
                        updatedEnemy.vx *= FRICTION;
                        updatedEnemy.vy *= FRICTION;
                    }
                    break;

                case 'chasing':
                    if (canSeePlayer) {
                        updatedEnemy.lastKnownPlayerPosition = { ...playerPositionRef.current };
                        const angleToPlayer = Math.atan2(playerPositionRef.current.y - updatedEnemy.y, playerPositionRef.current.x - updatedEnemy.x);
                        
                        updatedEnemy.vx = Math.cos(angleToPlayer) * ENEMY_SPEED;
                        updatedEnemy.vy = Math.sin(angleToPlayer) * ENEMY_SPEED;

                        if (timestamp - updatedEnemy.lastShotTimestamp > ENEMY_FIRE_RATE_MS && updatedEnemy.energy >= ENEMY_ENERGY_PER_SHOT) {
                            newEnemyProjectiles.push({ id: timestamp + updatedEnemy.id, x: updatedEnemy.x, y: updatedEnemy.y, rotation: angleToPlayer * (180 / Math.PI) });
                            updatedEnemy.lastShotTimestamp = timestamp;
                            updatedEnemy.energy -= ENEMY_ENERGY_PER_SHOT;
                            updatedEnemy.lastEnergyUseTimestamp = timestamp;
                        }
                    } else {
                        updatedEnemy.aiState = 'searching';
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    }
                    break;

                case 'searching':
                    if (canSeePlayer) {
                        updatedEnemy.aiState = 'chasing';
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    } else if (timestamp - updatedEnemy.stateChangeTimestamp > ENEMY_SEARCH_DURATION_MS) {
                        updatedEnemy.aiState = 'patrolling';
                        updatedEnemy.lastKnownPlayerPosition = null;
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    } else if (updatedEnemy.lastKnownPlayerPosition) {
                        const distanceToLKP = Math.hypot(updatedEnemy.lastKnownPlayerPosition.x - updatedEnemy.x, updatedEnemy.lastKnownPlayerPosition.y - updatedEnemy.y);
                        if (distanceToLKP > 20) {
                            const angleToLKP = Math.atan2(updatedEnemy.lastKnownPlayerPosition.y - updatedEnemy.y, updatedEnemy.lastKnownPlayerPosition.x - updatedEnemy.x);
                            updatedEnemy.vx = Math.cos(angleToLKP) * ENEMY_SPEED * 0.5;
                            updatedEnemy.vy = Math.sin(angleToLKP) * ENEMY_SPEED * 0.5;
                        } else {
                            updatedEnemy.vx *= FRICTION;
                            updatedEnemy.vy *= FRICTION;
                        }
                    }
                    break;
                
                case 'fleeing':
                    const angleFromPlayer = Math.atan2(updatedEnemy.y - playerPositionRef.current.y, updatedEnemy.x - playerPositionRef.current.x);
                    updatedEnemy.vx = Math.cos(angleFromPlayer) * ENEMY_SPEED * 1.2;
                    updatedEnemy.vy = Math.sin(angleFromPlayer) * ENEMY_SPEED * 1.2;
                    
                    if (distanceToPlayer > aggroRadius * 1.5 && (updatedEnemy.health / updatedEnemy.maxHealth) > (ENEMY_FLEE_HEALTH_THRESHOLD + 0.2)) {
                        updatedEnemy.aiState = 'patrolling';
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    }
                    break;
                
                case 'following':
                    const followDistance = 150;
                    if (distanceToPlayer > followDistance) {
                        const angleToPlayer = Math.atan2(playerPositionRef.current.y - updatedEnemy.y, playerPositionRef.current.x - updatedEnemy.x);
                        updatedEnemy.vx = Math.cos(angleToPlayer) * ENEMY_SPEED * 0.8;
                        updatedEnemy.vy = Math.sin(angleToPlayer) * ENEMY_SPEED * 0.8;
                    } else {
                        updatedEnemy.vx *= FRICTION;
                        updatedEnemy.vy *= FRICTION;
                    }
                    break;
            }
          }
          
          updatedEnemy.x += updatedEnemy.vx;
          updatedEnemy.y += updatedEnemy.vy;

          updatedEnemy.x = Math.max(collisionRadius, Math.min(MAP_WIDTH - collisionRadius, updatedEnemy.x));
          updatedEnemy.y = Math.max(collisionRadius, Math.min(MAP_HEIGHT - collisionRadius, updatedEnemy.y));
          
          return updatedEnemy;

      }).filter(Boolean) as EnemyState[];

      if (newEnemyProjectiles.length > 0) {
        setEnemyProjectiles(prev => [...prev, ...newEnemyProjectiles]);
      }
      if (hitPlayerProjectileIds.size > 0) {
          setPlayerProjectiles(prev => prev.filter(p => !hitPlayerProjectileIds.has(p.id)));
      }
      
      // --- COLLISION DETECTION ---
      if (timestamp - lastCollisionTimestamp > 1000) {
          let collisionOccurred = false;
          let damage = 0;
          const speedFactor = 0.5 + (speed / (currentMaxSpeed || MAX_SPEED)) * 0.5;
          for (const asteroid of asteroids) {
              const distance = Math.hypot(asteroid.x - playerPositionRef.current.x, asteroid.y - playerPositionRef.current.y);
              if (distance < (asteroid.size * ASTEROID_COLLISION_RADIUS) + PLAYER_COLLISION_RADIUS) {
                  damage = ASTEROID_COLLISION_DAMAGE * speedFactor;
                  collisionOccurred = true;
                  break;
              }
          }
          if (!collisionOccurred) {
              for (const enemy of enemiesRef.current) {
                  if (enemy.isAlly) continue;
                  let enemyRadius = ENEMY_COLLISION_RADIUS;
                  if (enemy.type === 'frigate') enemyRadius = FRIGATE_COLLISION_RADIUS;
                  else if (enemy.type === 'staff') enemyRadius = STAFF_COLLISION_RADIUS;
                  const distance = Math.hypot(enemy.x - playerPositionRef.current.x, enemy.y - playerPositionRef.current.y);
                  if (distance < enemyRadius + PLAYER_COLLISION_RADIUS) {
                      damage = ENEMY_COLLISION_DAMAGE * speedFactor;
                      collisionOccurred = true;
                      break;
                  }
              }
          }
          if (!collisionOccurred) {
              for (const station of stations) {
                  const distance = Math.hypot(station.x - playerPositionRef.current.x, station.y - playerPositionRef.current.y);
                  if (distance < STATION_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS) {
                      damage = STATION_COLLISION_DAMAGE * speedFactor;
                      collisionOccurred = true;
                      break;
                  }
              }
          }
          if (collisionOccurred) {
              applyDamage(damage);
              setVelocity(v => ({ x: -v.x * 0.5, y: -v.y * 0.5 }));
          }
      }
      
      const hitEnemyProjectileIds = new Set<number>();
      let damageToPlayer = 0;
      for (const proj of enemyProjectilesRef.current) {
        if (hitEnemyProjectileIds.has(proj.id)) continue;
        const distance = Math.hypot(proj.x - playerPositionRef.current.x, proj.y - playerPositionRef.current.y);
        if (distance < PLAYER_COLLISION_RADIUS) {
          hitEnemyProjectileIds.add(proj.id);
          damageToPlayer += ENEMY_PROJECTILE_DAMAGE;
        }
      }
      if (damageToPlayer > 0) {
        applyDamage(damageToPlayer);
      }
      if (hitEnemyProjectileIds.size > 0) {
        setEnemyProjectiles(prev => prev.filter(p => !hitEnemyProjectileIds.has(p.id)));
      }
      
      // --- UNIFIED DEBRIS COLLECTION ---
      const collectedDebrisIds = new Set<number>();
      const currentDebris = [...debrisRef.current, ...newDebrisFromKills];
      let collectedResources: Resources = { money: 0, ore: 0, gas: 0 };

      for (const d of currentDebris) {
          if (collectedDebrisIds.has(d.id)) continue;
          
          const playerDist = Math.hypot(d.x - playerPositionRef.current.x, d.y - playerPositionRef.current.y);
          if (playerDist < DEBRIS_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS) {
              collectedResources.money += d.resources.money || 0;
              collectedResources.ore += d.resources.ore || 0;
              collectedResources.gas += d.resources.gas || 0;
              collectedDebrisIds.add(d.id);
              continue;
          }

          for (let i = 0; i < processedEnemies.length; i++) {
              if (collectedDebrisIds.has(d.id)) break;
              let enemyRadius = ENEMY_COLLISION_RADIUS;
              if (processedEnemies[i].type === 'frigate') enemyRadius = FRIGATE_COLLISION_RADIUS;
              else if (processedEnemies[i].type === 'staff') enemyRadius = STAFF_COLLISION_RADIUS;
              const enemyDist = Math.hypot(d.x - processedEnemies[i].x, d.y - processedEnemies[i].y);
              if (enemyDist < DEBRIS_COLLISION_RADIUS + enemyRadius) {
                  processedEnemies[i] = { ...processedEnemies[i], cargo: processedEnemies[i].cargo + (d.resources.ore || 0) };
                  collectedDebrisIds.add(d.id);
                  break; 
              }
          }
      }
      
      if (collectedResources.money > 0 || collectedResources.ore > 0 || collectedResources.gas > 0) {
          setPlayerData(d => ({
              ...d,
              resources: {
                  money: d.resources.money + collectedResources.money,
                  ore: d.resources.ore + collectedResources.ore,
                  gas: d.resources.gas + collectedResources.gas,
              },
              cargo: {
                  ...d.cargo,
                  current: Math.min(d.cargo.max, d.cargo.current + collectedResources.ore),
              }
          }));
      }

      if (collectedDebrisIds.size > 0) {
          setDebris(prev => [...prev, ...newDebrisFromKills].filter(d => !collectedDebrisIds.has(d.id)));
      } else if (newDebrisFromKills.length > 0) {
          setDebris(prev => [...prev, ...newDebrisFromKills]);
      }
      setEnemies(processedEnemies);


      // --- GAME OVER CHECK ---
      if (playerDataRef.current.health <= 0) {
        setIsGameOver(true);
      } else {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };
    
    if(viewSize.width > 0 && !isGameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewSize, isSettingsOpen, isGameOver, controlScheme]);

  let radarRange = BASE_RADAR_RANGE;
  if (shipMode === 'scan') {
      radarRange = BASE_RADAR_RANGE * 2;
  } else if (shipMode === 'stealth') {
      radarRange = 100; // Visual range, radar is offline
  }

  const visibleEnemies = React.useMemo(() => 
    enemies.filter(e => Math.hypot(e.x - playerPosition.x, e.y - playerPosition.y) < radarRange),
    [enemies, playerPosition.x, playerPosition.y, radarRange]
  );
  
  const visibleAsteroids = React.useMemo(() =>
    asteroids.filter(a => Math.hypot(a.x - playerPosition.x, a.y - playerPosition.y) < radarRange),
    [asteroids, playerPosition.x, playerPosition.y, radarRange]
  );
  
  const visibleDebris = React.useMemo(() =>
    debris.filter(d => Math.hypot(d.x - playerPosition.x, d.y - playerPosition.y) < radarRange),
    [debris, playerPosition.x, playerPosition.y, radarRange]
  );
  
  const containerClass = cn(
    "relative w-full h-full overflow-hidden bg-gray-900 cursor-crosshair",
    shipMode === 'stealth' && 'stealth-effect',
    cruiseState === 'cruising' && 'cruise-effect',
    cruiseState === 'charging' && 'cruise-charging-effect',
    shipMode === 'scan' && 'scan-effect'
  );

  const renderEnemy = (enemy: EnemyState) => {
    const props = {
      x: enemy.x,
      y: enemy.y,
      health: enemy.health,
      maxHealth: enemy.maxHealth,
      isTargeted: enemy.id === targetId,
      isAlly: enemy.isAlly || false,
    };
    switch (enemy.type) {
      case 'chasseur':
        return <EnemyShip key={enemy.id} {...props} />;
      case 'frigate':
        return <FrigateShip key={enemy.id} {...props} />;
      case 'staff':
        return <StaffShip key={enemy.id} {...props} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={containerClass}
    >
      {/* Game World */}
      <div style={{ 
          transform: `translate(${viewSize.width / 2}px, ${viewSize.height / 2}px) scale(${zoom}) translate(${-playerPosition.x}px, ${-playerPosition.y}px)`,
          willChange: 'transform',
          transformOrigin: 'top left'
      }}>
        <GameMap width={MAP_WIDTH} height={MAP_HEIGHT} />
        {playerProjectiles.map((p) => (
          <Projectile key={p.id} x={p.x} y={p.y} rotation={p.rotation} />
        ))}
        {enemyProjectiles.map((p) => (
          <Projectile key={p.id} x={p.x} y={p.y} rotation={p.rotation} isEnemy />
        ))}
        <PlayerShip 
          x={playerPosition.x}
          y={playerPosition.y}
          rotation={playerRotation} 
          aimRotation={aimRotation} 
          isShieldActive={shipMode === 'shield'} 
        />
        {enemies.map(renderEnemy)}
        {asteroids.map((a) => (
            <Asteroid key={a.id} x={a.x} y={a.y} size={a.size} rotation={a.rotation} />
        ))}
        {stations.map((s) => (
            <SpaceStation key={s.id} x={s.x} y={s.y} />
        ))}
        {debris.map((d) => (
            <Debris key={d.id} x={d.x} y={d.y} />
        ))}
      </div>
      
      {/* UI Overlays & Effects */}
      <MilitaryViewOverlay isOpen={zoom === MIN_ZOOM} />
      {cruiseState === 'cruising' && <CruiseStreaks />}
       {playerData.health < LOW_HEALTH_THRESHOLD && (
          <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ boxShadow: 'inset 0 0 80px 30px rgba(255, 0, 0, 0.4)' }} />
       )}
       {playerData.energy <= 0 && (
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px 30px rgba(0, 150, 255, 0.3)' }} />
       )}
       {playerAction && (
        <ActionProgress 
            actionType={playerAction.type}
            progress={(Date.now() - playerAction.startTime) / playerAction.duration * 100}
        />
       )}

      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10 flex flex-col gap-4" data-ui-element="true">
        <VesselSystems systems={vesselSystems} />
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4" data-ui-element="true">
        <PlayerStatus data={playerData} />
        <ResourceDisplay resources={playerData.resources} />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-4" data-ui-element="true">
          <StellarBaseStatus data={stellarBaseData} />
          <ClientOnly>
            <ChatBox />
          </ClientOnly>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-4" data-ui-element="true">
        {shipMode !== 'stealth' && <Radar 
            playerPosition={playerPosition}
            enemies={visibleEnemies}
            stations={stations}
            asteroids={visibleAsteroids}
            radarRange={radarRange}
        />}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-end gap-4" data-ui-element="true">
        <SpeedIndicator speed={speed} rotation={playerRotation} />
        <ShipModeSelector
            currentMode={shipMode} 
            onModeChange={handleModeChange} 
            cooldowns={cooldowns}
            playerEnergy={playerData.energy}
            cruiseEnergyCost={CRUISE_ENERGY_COST}
            isCruising={cruiseState !== 'idle'}
        />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetType={contextMenu.targetType}
          onAction={(action) => handleActionSelect(action, contextMenu.targetId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <SettingsMenu
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        controlScheme={controlScheme}
        onControlSchemeChange={setControlScheme}
      />

      <GameOverOverlay isOpen={isGameOver} onRestart={resetGame} />
    </div>
  );
}
