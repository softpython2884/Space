'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';
import { EnemyShip } from './enemy-ship';
import { FrigateShip } from './frigate-ship';
import { StaffShip } from './staff-ship';
import { InterceptorShip } from './interceptor-ship';
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
import { INITIAL_PLAYER_DATA, UPGRADE_VALUES, UPGRADE_COSTS, RESOURCE_PRICES, SHIP_DATA, ALLY_COST } from '@/lib/constants';
import type { ControlScheme, PlayerData, StellarBaseData, VesselSystemsData, ShipMode, Debris as DebrisType, EnemyState as EnemyStateType, AsteroidState, StationState, BotShipType, ContextMenuTargetType, PlayerActionType, Resources, PlayerUpgrades, PlayerShipClass } from '@/lib/types';
import { ClientOnly } from '@/components/client-only';
import { GameOverOverlay } from './game-over-overlay';
import { MilitaryViewOverlay } from './military-view-overlay';
import { ContextMenu } from '../game-ui/context-menu';
import { StationMenu } from '../game-ui/station-menu';
import { PlayerUpgradesDisplay } from '../game-ui/player-upgrades';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ActionProgress } from '../game-ui/action-progress';


let ACCELERATION = 0.1;
let STRAFE_ACCELERATION = 0.05;
const REVERSE_ACCELERATION = 0.06;
let MAX_SPEED = 6;
const FRICTION = 0.98;

const PROJECTILE_SPEED = 8;
const MAP_WIDTH = 4000;
const MAP_HEIGHT = 4000;
const FIRE_RATE_MS = 250; 
const ENEMY_CLICK_RADIUS = 30;
const STATION_CLICK_RADIUS = 75;
const ASTEROID_CLICK_RADIUS = 2.0; 

const BASE_RADAR_RANGE = 1200;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_SENSITIVITY = 0.001;

// Combat & Resource Constants
const PLAYER_COLLISION_RADIUS = 20;
const ENEMY_COLLISION_RADIUS = 20;
const FRIGATE_COLLISION_RADIUS = 30;
const STAFF_COLLISION_RADIUS = 25;
const DEBRIS_COLLISION_RADIUS = 20;
const STATION_COLLISION_RADIUS = 75;
const ASTEROID_COLLISION_RADIUS = 0.75;

const PLAYER_PROJECTILE_DAMAGE = 10;
const ENEMY_PROJECTILE_DAMAGE = 5;

const ASTEROID_COLLISION_DAMAGE = 5;
const ENEMY_COLLISION_DAMAGE = 10;
const STATION_COLLISION_DAMAGE = 20;
const COLLISION_SPEED_THRESHOLD = 1;

const ENERGY_PER_SHOT = 2;
const LOW_HEALTH_THRESHOLD = 30;

const ENEMY_AGGRO_RADIUS = 800;
const ENEMY_FIRE_RATE_MS = 1500;
const ENEMY_SPEED = 2.5;

const STEALTH_AGGRO_RADIUS = 350;
const STEALTH_DETECTION_RADIUS_NEAR = 250;

// Cruise Mode Constants
const CRUISE_CHARGE_TIME = 2000;
const CRUISE_DURATION = 4000;
const CRUISE_ENERGY_COST = 50;
const CRUISE_COOLDOWN_MS = 5000;

// Shield Mode Constants
const SHIELD_ENERGY_DRAIN_RATE = 0.005;
const SHIELD_DAMAGE_TO_ENERGY_COST = 3;

// Mode Switching Constants
const MODE_CHANGE_COOLDOWN_MS = 2000;

// Enemy AI Constants
const ENEMY_MAX_ENERGY = 100;
const ENEMY_ENERGY_PER_SHOT = 10;
const ENEMY_ENERGY_REGEN_RATE = 0.05;
const ENEMY_ENERGY_REGEN_DELAY_MS = 3000;
const ENEMY_SEARCH_DURATION_MS = 5000;
const ENEMY_FLEE_HEALTH_THRESHOLD = 0.3;
const ENEMY_RAM_HEALTH_ADVANTAGE = 1.5;
const GUARD_PATROL_RADIUS = 600;
const MINER_SIMULATED_MINE_TIME_MS = 8000;
const MINER_CARGO_PER_TRIP = 20;


// Action constants
const PILLAGE_DAMAGE = 15;
const BOARDING_FAIL_DAMAGE = 20;
const ACTION_MAX_RANGE = 200;
const ASTEROID_ACTION_MAX_RANGE = 75;

const MINING_CHARGES = 3;
const MINING_DURATION_MS = 2000;
const MINING_LONG_COOLDOWN_MS = 60000;
const PILLAGE_DURATION_MS = 2000;
const PILLAGE_ENERGY_COST = 40;
const BOARDING_DURATION_MS = 7000;
const BOARDING_ENERGY_COST = 60;
const BOARDING_SUCCESS_CHANCE = 0.4;

// Station Constants
const STATION_INTERACTION_RADIUS = 300;
const STATION_PLAYER_REGEN_RATE = 0.1;
const STATION_SHIELD_REGEN_RATE = 0.05;
const STATION_SHIELD_REGEN_DELAY_MS = 5000;


type ProjectileState = {
  id: number;
  x: number;
  y: number;
  rotation: number;
};

export type EnemyState = EnemyStateType;
export type PlayerAction = {
  type: PlayerActionType;
  targetId: number;
  startTime: number;
  duration: number;
};


const generateInitialEnemies = (): EnemyState[] => {
    const stationX = MAP_WIDTH / 2;
    const stationY = MAP_HEIGHT / 2;
    
    return [
    // Pirates
    { id: 1, type: 'chasseur', x: MAP_WIDTH / 2 + 1500, y: MAP_HEIGHT / 2 + 1500, vx: 0, vy: 0, health: 100, maxHealth: 100, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: false },
    { id: 2, type: 'chasseur', x: MAP_WIDTH / 2 - 1600, y: MAP_HEIGHT / 2 - 1200, vx: 0, vy: 0, health: 100, maxHealth: 100, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: false },
    { id: 3, type: 'frigate', x: MAP_WIDTH / 2 + 800, y: MAP_HEIGHT / 2 + 1800, vx: 0, vy: 0, health: 300, maxHealth: 300, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 10, lastEnergyUseTimestamp: 0, isAlly: false },
    { id: 4, type: 'staff', x: 850, y: 850, vx: 0.5, vy: -0.5, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 20, lastEnergyUseTimestamp: 0, isAlly: false },
    { id: 5, type: 'staff', x: 2800, y: 3000, vx: -0.5, vy: 0.5, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 20, lastEnergyUseTimestamp: 0, isAlly: false },

    // Allied Escort
    { id: 6, type: 'frigate', x: stationX - 150, y: stationY, vx: 0, vy: 0, health: 300, maxHealth: 300, lastShotTimestamp: 0, aiState: 'guarding', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: true, role: 'escort', patrolCenter: { x: stationX, y: stationY } },
    { id: 7, type: 'interceptor', x: stationX + 150, y: stationY - 100, vx: 0, vy: 0, health: 120, maxHealth: 120, lastShotTimestamp: 0, aiState: 'guarding', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: true, role: 'escort', patrolCenter: { x: stationX, y: stationY } },
    { id: 8, type: 'interceptor', x: stationX + 150, y: stationY + 100, vx: 0, vy: 0, health: 120, maxHealth: 120, lastShotTimestamp: 0, aiState: 'guarding', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: ENEMY_MAX_ENERGY, maxEnergy: ENEMY_MAX_ENERGY, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: true, role: 'escort', patrolCenter: { x: stationX, y: stationY } },

    // Allied Miners
    { id: 9, type: 'staff', x: stationX, y: stationY - 150, vx: 0, vy: 0, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: true, role: 'miner', patrolCenter: { x: stationX, y: stationY } },
    { id: 10, type: 'staff', x: stationX - 130, y: stationY - 75, vx: 0, vy: 0, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: true, role: 'miner', patrolCenter: { x: stationX, y: stationY } },
    { id: 11, type: 'staff', x: stationX + 130, y: stationY + 75, vx: 0, vy: 0, health: 50, maxHealth: 50, lastShotTimestamp: 0, aiState: 'patrolling', lastKnownPlayerPosition: null, stateChangeTimestamp: 0, energy: 0, maxEnergy: 0, cargo: 0, lastEnergyUseTimestamp: 0, isAlly: true, role: 'miner', patrolCenter: { x: stationX, y: stationY } },
]};


const generateInitialAsteroids = (): AsteroidState[] => [
    { id: 1, x: 1000, y: 1200, size: 80, rotation: 30, mineableCharges: MINING_CHARGES, cooldownUntil: 0 },
    { id: 2, x: 2800, y: 900, size: 120, rotation: 90, mineableCharges: MINING_CHARGES, cooldownUntil: 0 },
    { id: 3, x: 3200, y: 3000, size: 100, rotation: 180, mineableCharges: MINING_CHARGES, cooldownUntil: 0 },
    { id: 4, x: 500, y: 3500, size: 90, rotation: 270, mineableCharges: MINING_CHARGES, cooldownUntil: 0 },
];

const generateInitialStations = (): StationState[] => [
    { id: 1, x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, health: 5000, maxHealth: 5000, shield: 1000, maxShield: 1000, lastHitTimestamp: 0 },
];


export function GameContainer() {
  const { toast } = useToast();
  const [playerPosition, setPlayerPosition] = useState({ x: MAP_WIDTH / 2 + 200, y: MAP_HEIGHT / 2 + 200 });
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
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [controlScheme, setControlScheme] = useState<ControlScheme>('hybrid');
  const [zoom, setZoom] = useState(1);
  const [autoMoveTarget, setAutoMoveTarget] = useState<{ x: number, y: number } | null>(null);
  const [shipMode, setShipMode] = useState<ShipMode>('normal');
  const [cruiseState, setCruiseState] = useState<'idle' | 'charging' | 'cruising'>('idle');
  const [cooldowns, setCooldowns] = useState({ modeChange: 1, cruise: 1 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetId: number; targetType: ContextMenuTargetType; } | null>(null);
  const [miningIntent, setMiningIntent] = useState<number | null>(null);
  const [playerAction, setPlayerAction] = useState<PlayerAction | null>(null);
  
  const [playerData, setPlayerData] = useState<PlayerData>(JSON.parse(JSON.stringify(INITIAL_PLAYER_DATA)));
  const [vesselSystems, setVesselSystems] = useState<VesselSystemsData>({ shields: 'Online', weapons: 'Ready', power: 'Optimal' });
  const [isDocked, setIsDocked] = useState(false);

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

  const stationsRef = useRef(stations);
  useEffect(() => { stationsRef.current = stations; }, [stations]);

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

  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const miningIntentRef = useRef(miningIntent);
  useEffect(() => { miningIntentRef.current = miningIntent; }, [miningIntent]);
  
  const playerActionRef = useRef(playerAction);
  useEffect(() => { playerActionRef.current = playerAction; }, [playerAction]);
  
  const isPlayerActionInProgress = playerAction !== null;

  const resetGame = useCallback(() => {
    setPlayerPosition({ x: MAP_WIDTH / 2 + 200, y: MAP_HEIGHT / 2 + 200 });
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
    setContextMenu(null);
    setPlayerAction(null);
    modeChangeAvailableAtRef.current = 0;
    cruiseAvailableAtRef.current = 0;
    setCooldowns({ modeChange: 1, cruise: 1 });
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleActionSelect = useCallback((action: PlayerActionType | 'open_station_menu', targetId: number) => {
    setContextMenu(null);
    if (playerActionRef.current) return;

    if (action === 'open_station_menu') {
        const station = stationsRef.current.find(s => s.id === targetId);
        if (station) {
            const distance = Math.hypot(station.x - playerPositionRef.current.x, station.y - playerPositionRef.current.y);
            if (distance < STATION_INTERACTION_RADIUS) {
                setIsStationMenuOpen(true);
            } else {
              toast({ title: "Target out of range", description: "Get closer to interact with the station.", variant: 'destructive' });
            }
        }
        return;
    }

    const targetEnemy = enemiesRef.current.find(e => e.id === targetId);
    const targetAsteroid = asteroidsRef.current.find(a => a.id === targetId);
    
    if (action === 'mining' && targetAsteroid) {
        if (targetAsteroid.cooldownUntil > Date.now()) {
            toast({ title: "Mining Cooldown", description: "Asteroid is depleted. Try again later.", variant: "destructive" });
            return;
        }
        if (targetAsteroid.mineableCharges <= 0) {
            toast({ title: "No More Charges", description: "This asteroid is temporarily depleted.", variant: "destructive" });
            return;
        }

        const distanceToAsteroidEdge = Math.hypot(targetAsteroid.x - playerPositionRef.current.x, targetAsteroid.y - playerPositionRef.current.y) - (targetAsteroid.size * ASTEROID_COLLISION_RADIUS) - PLAYER_COLLISION_RADIUS;
        
        if (distanceToAsteroidEdge > ASTEROID_ACTION_MAX_RANGE) {
            const angleFromCenter = Math.atan2(
                playerPositionRef.current.y - targetAsteroid.y,
                playerPositionRef.current.x - targetAsteroid.x
            );
            const distanceToDock = (targetAsteroid.size * ASTEROID_COLLISION_RADIUS) + PLAYER_COLLISION_RADIUS + (ASTEROID_ACTION_MAX_RANGE / 2);
            
            const targetX = targetAsteroid.x + Math.cos(angleFromCenter) * distanceToDock;
            const targetY = targetAsteroid.y + Math.sin(angleFromCenter) * distanceToDock;

            setAutoMoveTarget({ x: targetX, y: targetY });
            setMiningIntent(targetId);
            return;
        }
        setPlayerAction({ type: 'mining', targetId, startTime: Date.now(), duration: MINING_DURATION_MS });
        return;
    }

    if (targetEnemy) {
      if (targetEnemy.isAlly) {
        toast({ title: "Invalid Target", description: "Cannot perform hostile actions on an allied ship." });
        return;
      }
      const distance = Math.hypot(targetEnemy.x - playerPositionRef.current.x, targetEnemy.y - playerPositionRef.current.y);
      if (distance > ACTION_MAX_RANGE) {
          toast({ title: "Target out of range", description: "Get closer to perform this action.", variant: 'destructive' });
          return;
      }
    } else {
        return;
    }

    switch(action) {
      case 'pillaging':
        if (playerDataRef.current.energy < PILLAGE_ENERGY_COST) {
            toast({ title: "Insufficient Energy", description: `Pillaging requires ${PILLAGE_ENERGY_COST} energy.`, variant: 'destructive' });
            return;
        }
        setPlayerData(d => ({ ...d, energy: d.energy - PILLAGE_ENERGY_COST }));
        lastEnergyUseTimestamp.current = Date.now();
        setPlayerAction({ type: 'pillaging', targetId, startTime: Date.now(), duration: PILLAGE_DURATION_MS });
        break;
      case 'boarding':
        if (playerDataRef.current.energy < BOARDING_ENERGY_COST) {
            toast({ title: "Insufficient Energy", description: `Boarding requires ${BOARDING_ENERGY_COST} energy.`, variant: 'destructive' });
            return;
        }
        setPlayerData(d => ({ ...d, energy: d.energy - BOARDING_ENERGY_COST }));
        lastEnergyUseTimestamp.current = Date.now();
        setPlayerAction({ type: 'boarding', targetId, startTime: Date.now(), duration: BOARDING_DURATION_MS });
        break;
    }
  }, [toast]);

  const applyDamage = useCallback((damage: number) => {
    setPlayerData(d => {
        if (d.health <= 0) return d;
        const energyCost = damage * SHIELD_DAMAGE_TO_ENERGY_COST;
        if (shipModeRef.current === 'shield' && d.energy >= energyCost) {
            lastEnergyUseTimestamp.current = Date.now();
            return { ...d, energy: Math.max(0, d.energy - energyCost) };
        }
        return { ...d, health: Math.max(0, d.health - damage) };
    });
  }, []);

  const handleModeChange = (newMode: ShipMode) => {
    const now = Date.now();
    if (now < modeChangeAvailableAtRef.current) {
        return;
    }
    if (cruiseStateRef.current !== 'idle') return;

    if (newMode === 'cruise') {
        if (now < cruiseAvailableAtRef.current) {
            return;
        }
        if (playerDataRef.current.energy < CRUISE_ENERGY_COST) {
            return;
        }
        setPlayerData(d => ({ ...d, energy: Math.max(0, d.energy - CRUISE_ENERGY_COST) }));
    }

    if (newMode === 'shield' && playerDataRef.current.energy <= 0) {
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

  const handleSellResource = useCallback((resource: 'ore' | 'gas', amount: number) => {
    setPlayerData(prev => {
        const newResources = { ...prev.resources };
        const price = RESOURCE_PRICES[resource];
        const currentAmount = newResources[resource];
        const sellAmount = Math.min(currentAmount, amount);
        
        if (sellAmount <= 0) return prev;
        
        newResources[resource] -= sellAmount;
        newResources.money += sellAmount * price;

        return { 
            ...prev, 
            resources: newResources,
            cargo: {
                current: prev.cargo.current - sellAmount
            }
        };
    });
  }, []);

  const handleBuyUpgrade = useCallback((upgrade: keyof PlayerUpgrades) => {
    const currentData = playerDataRef.current;
    const currentLevel = currentData.upgrades[upgrade];

    if (currentLevel >= UPGRADE_COSTS[upgrade].length) {
        return;
    }

    const cost = UPGRADE_COSTS[upgrade][currentLevel];
    if (currentData.resources.money < cost) {
        return;
    }

    const newUpgrades = { ...currentData.upgrades, [upgrade]: currentLevel + 1 };
    const newResources = { ...currentData.resources, money: currentData.resources.money - cost };
    
    setPlayerData(prev => ({ 
        ...prev, 
        upgrades: newUpgrades, 
        resources: newResources 
    }));
  }, []);

  const handleRepairHull = useCallback((amount: number, cost: number) => {
    if (playerDataRef.current.resources.money < cost) return;

    setPlayerData(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        money: prev.resources.money - cost,
      }
    }));

    setStations(prev => prev.map(s => 
      s.id === 1 ? { ...s, health: Math.min(s.maxHealth, s.health + amount) } : s
    ));
  }, []);
  
  const handleBuyShip = useCallback((shipClass: PlayerShipClass) => {
      const shipInfo = SHIP_DATA[shipClass];
      if (playerDataRef.current.resources.money < shipInfo.cost) {
          toast({ title: "Insufficient Funds", description: `You need ${shipInfo.cost} credits to buy a ${shipClass}.`, variant: "destructive" });
          return;
      }
      setPlayerData(prev => {
          const newMaxHealth = shipInfo.baseHealth + UPGRADE_VALUES.maxHealth[prev.upgrades.maxHealth];
          return {
            ...prev,
            resources: { ...prev.resources, money: prev.resources.money - shipInfo.cost },
            ship: { ...prev.ship, class: shipClass },
            health: newMaxHealth, // Heal to full on new ship purchase
          };
      });
      toast({ title: "Ship Purchased!", description: `You are now the captain of a new ${shipClass}.` });
  }, [toast]);
  
  const handleBuyAlly = useCallback(() => {
    if (playerDataRef.current.resources.money < ALLY_COST) {
        toast({ title: "Insufficient Funds", description: `You need ${ALLY_COST} credits to hire an escort.`, variant: "destructive" });
        return;
    }

    setPlayerData(prev => ({
        ...prev,
        resources: { ...prev.resources, money: prev.resources.money - ALLY_COST }
    }));

    const newAlly: EnemyState = {
        id: Date.now(),
        type: 'chasseur',
        x: playerPositionRef.current.x + (Math.random() - 0.5) * 100,
        y: playerPositionRef.current.y + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
        health: 100,
        maxHealth: 100,
        lastShotTimestamp: 0,
        aiState: 'following',
        lastKnownPlayerPosition: null,
        stateChangeTimestamp: 0,
        energy: ENEMY_MAX_ENERGY,
        maxEnergy: ENEMY_MAX_ENERGY,
        cargo: 0,
        lastEnergyUseTimestamp: 0,
        isAlly: true,
    };

    setEnemies(prev => [...prev, newAlly]);
    toast({ title: "Escort Hired!", description: `A Chasseur escort has joined your fleet.` });
  }, [toast]);

  const isModalOpen = isSettingsOpen || isGameOver || isStationMenuOpen;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsSettingsOpen(open => !open);
            setAutoMoveTarget(null);
            setContextMenu(null);
            return;
        }
        if (isModalOpen) return;
        
        keysPressed.current.add(event.key.toLowerCase());
        
        const isMovementKey = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase());
        if (isMovementKey && autoMoveTargetRef.current) {
            setAutoMoveTarget(null);
        }
    }
    const handleKeyUp = (event: KeyboardEvent) => keysPressed.current.delete(event.key.toLowerCase());
    const handleMouseMove = (event: MouseEvent) => mousePosition.current = { x: event.clientX, y: event.clientY };
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    
    const handleMouseDown = (event: MouseEvent) => {
      if (isModalOpen) return;
      if ((event.target as HTMLElement).closest('[data-ui-element="true"]')) return;
      
      const clickWorldX = playerPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoomRef.current;
      const clickWorldY = playerPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoomRef.current;
      
      if (event.button === 0) {
        isLeftMouseDown.current = true;
        setContextMenu(null);

        let enemyClicked = false;
        for (const enemy of enemiesRef.current) {
            const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
            if (distance < ENEMY_CLICK_RADIUS) {
                setTargetId(enemy.id === targetIdRef.current ? null : enemy.id);
                setAutoMoveTarget(null);
                enemyClicked = true;
                break; 
            }
        }
        if (!enemyClicked) setTargetId(null);
      } else if (event.button === 1) {
        event.preventDefault();
        setAutoMoveTarget({ x: clickWorldX, y: clickWorldY });
        setTargetId(null);
        setContextMenu(null);
      } else if (event.button === 2) {
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
          if (distance < asteroid.size * ASTEROID_CLICK_RADIUS) { 
            setContextMenu({ x: event.clientX, y: event.clientY, targetId: asteroid.id, targetType: 'asteroid' });
            return;
          }
        }
        for (const station of stationsRef.current) {
            const distance = Math.hypot(clickWorldX - station.x, clickWorldY - station.y);
            if (distance < STATION_INTERACTION_RADIUS) {
              setContextMenu({ x: event.clientX, y: event.clientY, targetId: station.id, targetType: 'station' });
              return;
            }
          }
      }
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) isLeftMouseDown.current = false;
    };
    
    const handleWheel = (event: WheelEvent) => {
        if (isModalOpen) return;
        event.preventDefault();
        setZoom(prevZoom => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom - event.deltaY * ZOOM_SENSITIVITY)));
    };

    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [viewSize, isModalOpen, handleActionSelect]);

  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const resizeObserver = new ResizeObserver(() => setViewSize({ width: container.clientWidth, height: container.clientHeight }));
      resizeObserver.observe(container);
      setViewSize({ width: container.clientWidth, height: container.clientHeight });
      return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
        const now = Date.now();
        const modeChangeProgress = Math.min(1, 1 - (Math.max(0, modeChangeAvailableAtRef.current - now) / MODE_CHANGE_COOLDOWN_MS));
        const cruiseProgress = Math.min(1, 1 - (Math.max(0, cruiseAvailableAtRef.current - now) / CRUISE_COOLDOWN_MS));
        setCooldowns({ modeChange: modeChangeProgress, cruise: cruiseProgress });
    }, 100);
    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    const { ship, upgrades, energy } = playerData;
    const maxHealth = SHIP_DATA[ship.class].baseHealth + UPGRADE_VALUES.maxHealth[upgrades.maxHealth];
    const newSystems: VesselSystemsData = {
        shields: 'Online',
        weapons: 'Ready',
        power: 'Optimal',
    };

    if (shipMode === 'cruise' || shipMode === 'scan' || isPlayerActionInProgress) newSystems.weapons = 'Offline';
    else if (energy < ENERGY_PER_SHOT) newSystems.weapons = 'Offline';

    if (shipMode === 'stealth') newSystems.shields = 'Offline';
    else if (shipMode === 'shield') newSystems.shields = 'Online';
    else if ((playerData.health / maxHealth * 100) < 50) newSystems.shields = 'Damaged';
    if (playerData.health <= 0) newSystems.shields = 'Offline';
    
    if (energy <= 0) newSystems.power = 'Offline';
    else if (energy < 40) newSystems.power = 'Damaged';

    setVesselSystems(newSystems);
  }, [playerData, shipMode, isPlayerActionInProgress]);

  useEffect(() => {
    const mainStation = stations[0];
    if (!mainStation) {
        setIsDocked(false);
        return;
    }
    const distanceToStation = Math.hypot(mainStation.x - playerPosition.x, mainStation.y - playerPosition.y);
    const currentlyDocked = distanceToStation < STATION_INTERACTION_RADIUS;
    
    if (!currentlyDocked && isDocked) setIsStationMenuOpen(false);

    setIsDocked(currentlyDocked);
  }, [playerPosition, stations, isDocked]);


  useEffect(() => {
    let animationFrameId: number;
    let lastCollisionTimestamp = 0;

    const gameLoop = (timestamp: number) => {
      if (isGameOver) {
        return;
      }
      
      if (cruiseStateRef.current === 'charging') {
        if (cruiseChargeStartTimestampRef.current === 0) cruiseChargeStartTimestampRef.current = timestamp;
        if (timestamp - cruiseChargeStartTimestampRef.current > CRUISE_CHARGE_TIME) {
            setCruiseState('cruising');
            cruiseChargeStartTimestampRef.current = 0;
        }
      }
      if (cruiseStateRef.current === 'cruising') {
          if (cruiseDurationStartTimestampRef.current === 0) cruiseDurationStartTimestampRef.current = timestamp;
          if (timestamp - cruiseDurationStartTimestampRef.current > CRUISE_DURATION) {
              setCruiseState('idle');
              setShipMode('normal');
              cruiseDurationStartTimestampRef.current = 0;
              cruiseAvailableAtRef.current = Date.now() + CRUISE_COOLDOWN_MS;
          }
      }

      let currentMaxSpeed = MAX_SPEED;
      let currentAccel = ACCELERATION;
      let currentStrafe = STRAFE_ACCELERATION;
      
      if (cruiseStateRef.current === 'cruising') {
          currentMaxSpeed = MAX_SPEED * 5;
          currentAccel = ACCELERATION * 4.0;
          currentStrafe = STRAFE_ACCELERATION * 0.1;
      } else if (shipModeRef.current === 'stealth') {
          currentMaxSpeed = MAX_SPEED * 0.8;
          currentAccel = ACCELERATION * 0.8;
      }
      
      const mouseWorldX = playerPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoomRef.current;
      const mouseWorldY = playerPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoomRef.current;
      const aimAngle = Math.atan2(mouseWorldY - playerPositionRef.current.y, mouseWorldX - playerPositionRef.current.x) * (180 / Math.PI);
      setAimRotation(aimAngle);
      
      if (isLeftMouseDown.current) {
        setPlayerRotation(aimAngle);
      }

      const accelVec = { x: 0, y: 0 };
      const isMovementDisabled = isPlayerActionInProgress || shipModeRef.current === 'scan' || cruiseStateRef.current === 'charging' || isModalOpen;

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
              const miningTargetId = miningIntentRef.current;
              if (miningTargetId) {
                  const targetAsteroid = asteroidsRef.current.find(a => a.id === miningTargetId);
                  if (targetAsteroid && targetAsteroid.cooldownUntil <= Date.now() && targetAsteroid.mineableCharges > 0) {
                    setPlayerAction({ type: 'mining', targetId: miningTargetId, startTime: Date.now(), duration: MINING_DURATION_MS });
                  }
                  setMiningIntent(null);
              }
          }
        } else {
            const cos = Math.cos(rotRad);
            const sin = Math.sin(rotRad);
            const moveControlScheme = shipModeRef.current === 'stealth' ? 'hybrid' : controlScheme;
            switch (moveControlScheme) {
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
      setSpeed(calculatedSpeed);

      if (calculatedSpeed > currentMaxSpeed) {
        newVx = (newVx / calculatedSpeed) * currentMaxSpeed;
        newVy = (newVy / calculatedSpeed) * currentMaxSpeed;
      }
      
      const newVelocity = { x: newVx, y: newVy };
      
      setVelocity(newVelocity);
      setPlayerPosition(p => ({
        x: Math.max(40, Math.min(MAP_WIDTH - 40, p.x + newVelocity.x)),
        y: Math.max(40, Math.min(MAP_HEIGHT - 40, p.y + newVelocity.y)),
      }));

      
      const currentTarget = enemiesRef.current.find(e => e.id === targetIdRef.current);
      const canShoot = playerDataRef.current.energy >= ENERGY_PER_SHOT && (shipMode === 'normal' || shipMode === 'stealth' || shipMode === 'shield') && cruiseStateRef.current === 'idle' && !isPlayerActionInProgress;
      const isTargeting = currentTarget && !currentTarget.isAlly;
      const isShootingManually = keysPressed.current.has(' ');

      if ((isTargeting || isShootingManually) && canShoot && timestamp - lastFiredTimestamp.current > FIRE_RATE_MS) {
        lastFiredTimestamp.current = timestamp;
        lastEnergyUseTimestamp.current = timestamp;
        
        let fireRotation = aimAngle;
        if (isTargeting) fireRotation = Math.atan2(currentTarget.y - playerPositionRef.current.y, currentTarget.x - playerPositionRef.current.x) * (180 / Math.PI);

        setPlayerProjectiles(prev => [...prev, { id: timestamp, x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: fireRotation }]);
        setPlayerData(d => ({ ...d, energy: d.energy - ENERGY_PER_SHOT }));
      }
      
      if (playerActionRef.current) {
          const action = playerActionRef.current;
          const elapsed = Date.now() - action.startTime;
          const progress = Math.min((elapsed / action.duration) * 100, 100);

          if (progress >= 100) {
              switch(action.type) {
                  case 'mining': {
                      const asteroid = asteroidsRef.current.find(a => a.id === action.targetId);
                      if (asteroid && asteroid.mineableCharges > 0) {
                          const oreGained = Math.floor(Math.random() * 26) + 25;
                          setPlayerData(d => {
                              const { ship, upgrades } = d;
                              const maxCargo = SHIP_DATA[ship.class].baseCargo + UPGRADE_VALUES.cargoCapacity[upgrades.cargoCapacity];
                              const availableSpace = maxCargo - d.cargo.current;
                              const oreToAdd = Math.min(oreGained, availableSpace);
                              
                              setTimeout(() => {
                                toast({ title: "Mining Successful", description: `Extracted ${oreToAdd} units of ore.` });
                              }, 0);

                              return {
                                  ...d,
                                  resources: { ...d.resources, ore: d.resources.ore + oreToAdd },
                                  cargo: { current: d.cargo.current + oreToAdd }
                              };
                          });
                          
                          setAsteroids(prev => prev.map(a => {
                              if (a.id === action.targetId) {
                                  const newCharges = a.mineableCharges - 1;
                                  if (newCharges <= 0) {
                                      setTimeout(() => {
                                        toast({ title: "Asteroid Depleted", description: `This asteroid needs time to recover.` });
                                      }, 0);
                                      return { ...a, mineableCharges: MINING_CHARGES, cooldownUntil: Date.now() + MINING_LONG_COOLDOWN_MS };
                                  }
                                  return { ...a, mineableCharges: newCharges };
                              }
                              return a;
                          }));
                      }
                      break;
                  }
                  case 'pillaging': {
                      const targetEnemy = enemiesRef.current.find(e => e.id === action.targetId);
                      if (targetEnemy) {
                          setEnemies(prev => prev.map(e => e.id === action.targetId ? { ...e, health: Math.max(0, e.health - PILLAGE_DAMAGE) } : e));
                          const newDebris: DebrisType = {
                              id: Date.now(), x: targetEnemy.x, y: targetEnemy.y,
                              resources: {
                                  money: Math.floor(Math.random() * 51),
                                  ore: Math.floor(Math.random() * 11),
                                  gas: Math.floor(Math.random() * 6),
                              }
                          };
                          setDebris(prev => [...prev, newDebris]);
                          setTimeout(() => {
                            toast({ title: "Pillage Successful", description: "Enemy ship damaged, cargo dropped." });
                          }, 0);
                      }
                      break;
                  }
                  case 'boarding': {
                      const targetEnemy = enemiesRef.current.find(e => e.id === action.targetId);
                      if (targetEnemy) {
                          const success = Math.random() < BOARDING_SUCCESS_CHANCE;
                          if (success) {
                              setEnemies(prev => prev.map(e => e.id === action.targetId ? { ...e, isAlly: true, aiState: 'following' } : e));
                              setTimeout(() => {
                                toast({ title: "Boarding Successful!", description: "The enemy ship is now under your control." });
                              }, 0);
                          } else {
                              applyDamage(BOARDING_FAIL_DAMAGE);
                              setTimeout(() => {
                                toast({ title: "Boarding Failed", description: "Your crew was repelled and sustained damage.", variant: 'destructive' });
                              }, 0);
                          }
                      }
                      break;
                  }
              }
              setPlayerAction(null);
          }
      }

      // Player stats and station regen
      const { ship, upgrades } = playerDataRef.current;
      const energyRechargeRate = UPGRADE_VALUES.energyRecharge[upgrades.energyRecharge];
      const nanobotRechargeRate = UPGRADE_VALUES.nanobots[upgrades.nanobots];
      const maxHealth = SHIP_DATA[ship.class].baseHealth + UPGRADE_VALUES.maxHealth[upgrades.maxHealth];
      const ENERGY_REGEN_DELAY_MS = 2000;

      if (shipModeRef.current === 'shield') {
          setPlayerData(d => {
              if (d.energy > 0) {
                  lastEnergyUseTimestamp.current = timestamp;
                  return { ...d, energy: Math.max(0, d.energy - SHIELD_ENERGY_DRAIN_RATE) };
              }
              return d;
          });
          if (playerDataRef.current.energy <= 0) setShipMode('normal');
      } else if (timestamp - lastEnergyUseTimestamp.current > ENERGY_REGEN_DELAY_MS) {
          setPlayerData(d => ({ ...d, energy: Math.min(100, d.energy + energyRechargeRate) }));
      }
      if(nanobotRechargeRate > 0) setPlayerData(d => ({...d, health: Math.min(maxHealth, d.health + nanobotRechargeRate)}));
      if (isDocked) setPlayerData(d => ({ ...d, health: Math.min(maxHealth, d.health + STATION_PLAYER_REGEN_RATE), energy: Math.min(100, d.energy + STATION_PLAYER_REGEN_RATE) }));
      
      setStations(prev => prev.map(station => {
        if (timestamp - station.lastHitTimestamp > STATION_SHIELD_REGEN_DELAY_MS) {
          return { ...station, shield: Math.min(station.maxShield, station.shield + STATION_SHIELD_REGEN_RATE) };
        }
        return station;
      }));
      
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

      const newEnemyProjectiles: ProjectileState[] = [];
      const hitPlayerProjectileIds = new Set<number>();
      const newDebrisFromKills: DebrisType[] = [];

      let processedEnemies = enemiesRef.current.map(enemy => {
          let updatedEnemy = { ...enemy };
          
          if (timestamp - updatedEnemy.lastEnergyUseTimestamp > ENEMY_ENERGY_REGEN_DELAY_MS) {
              updatedEnemy.energy = Math.min(updatedEnemy.maxEnergy, updatedEnemy.energy + ENEMY_ENERGY_REGEN_RATE);
          }
          
          let collisionRadius = ENEMY_COLLISION_RADIUS;
          if (enemy.type === 'frigate') collisionRadius = FRIGATE_COLLISION_RADIUS;
          else if (enemy.type === 'staff') collisionRadius = STAFF_COLLISION_RADIUS;

          for (const proj of playerProjectilesRef.current) {
              if (hitPlayerProjectileIds.has(proj.id)) continue;
              const distance = Math.hypot(proj.x - updatedEnemy.x, proj.y - updatedEnemy.y);
              if (distance < collisionRadius) {
                  hitPlayerProjectileIds.add(proj.id);
                  if (!updatedEnemy.isAlly) {
                    updatedEnemy.health -= PLAYER_PROJECTILE_DAMAGE;
                  }
                  if (updatedEnemy.aiState === 'patrolling' && updatedEnemy.type !== 'staff' && !updatedEnemy.isAlly) {
                    updatedEnemy.aiState = 'chasing';
                    updatedEnemy.stateChangeTimestamp = timestamp;
                    updatedEnemy.lastKnownPlayerPosition = { ...playerPositionRef.current };
                  }
              }
          }

          if (updatedEnemy.health <= 0) {
              newDebrisFromKills.push({
                  id: updatedEnemy.id + timestamp,
                  x: updatedEnemy.x,
                  y: updatedEnemy.y,
                  resources: { 
                    money: Math.floor(Math.random() * 51) + 20, 
                    ore: Math.floor(Math.random() * 21) + 5 + updatedEnemy.cargo, 
                    gas: Math.floor(Math.random() * 11) + 1 
                  }
              });
              if (updatedEnemy.id === targetIdRef.current) setTargetId(null);
              return null;
          }

          const { ship: playerShip, upgrades: playerUpgrades } = playerDataRef.current;
          const playerMaxHealth = SHIP_DATA[playerShip.class].baseHealth + UPGRADE_VALUES.maxHealth[playerUpgrades.maxHealth];
          const distanceToPlayer = Math.hypot(updatedEnemy.x - playerPositionRef.current.x, updatedEnemy.y - playerPositionRef.current.y);
          let aggroRadius = ENEMY_AGGRO_RADIUS;
          if (shipModeRef.current === 'scan') aggroRadius *= 1.5;
          else if (shipModeRef.current === 'stealth') aggroRadius = STEALTH_AGGRO_RADIUS;
          const canSeePlayer = distanceToPlayer < aggroRadius;

          if (updatedEnemy.isAlly) {
              if (updatedEnemy.role === 'escort' && updatedEnemy.patrolCenter) {
                  updatedEnemy.aiState = 'guarding';
              } else if (!updatedEnemy.role) {
                  updatedEnemy.aiState = 'following';
              }
          } else if(updatedEnemy.type !== 'staff') {
            const rammingHealthAdvantage = (updatedEnemy.health / updatedEnemy.maxHealth) > (playerDataRef.current.health / playerMaxHealth * ENEMY_RAM_HEALTH_ADVANTAGE);
            const shouldFlee = (updatedEnemy.health / updatedEnemy.maxHealth) < ENEMY_FLEE_HEALTH_THRESHOLD && updatedEnemy.energy < (ENEMY_ENERGY_PER_SHOT * 2);
            if (shouldFlee && updatedEnemy.aiState !== 'fleeing' && !updatedEnemy.isAlly) {
                updatedEnemy.aiState = 'fleeing';
                updatedEnemy.stateChangeTimestamp = timestamp;
            }
          }

          switch(updatedEnemy.aiState) {
            case 'guarding':
                if (updatedEnemy.patrolCenter) {
                    const distanceToCenter = Math.hypot(updatedEnemy.x - updatedEnemy.patrolCenter.x, updatedEnemy.y - updatedEnemy.patrolCenter.y);
                    if (distanceToCenter > GUARD_PATROL_RADIUS) {
                        const angleToCenter = Math.atan2(updatedEnemy.patrolCenter.y - updatedEnemy.y, updatedEnemy.patrolCenter.x - updatedEnemy.x);
                        updatedEnemy.vx = Math.cos(angleToCenter) * ENEMY_SPEED * 0.5;
                        updatedEnemy.vy = Math.sin(angleToCenter) * ENEMY_SPEED * 0.5;
                    } else {
                        if (Math.random() < 0.01) {
                            const randomAngle = Math.random() * 2 * Math.PI;
                            updatedEnemy.vx = Math.cos(randomAngle) * ENEMY_SPEED * 0.2;
                            updatedEnemy.vy = Math.sin(randomAngle) * ENEMY_SPEED * 0.2;
                        } else {
                            updatedEnemy.vx *= FRICTION;
                            updatedEnemy.vy *= FRICTION;
                        }
                    }
                }
                break;
            case 'patrolling':
                if (updatedEnemy.role === 'miner') {
                    const station = stationsRef.current[0];
                    if (updatedEnemy.cargo > 0) {
                        updatedEnemy.aiState = 'returning_to_base';
                        updatedEnemy.targetObjectId = station.id;
                    } else {
                        let closestAsteroid: AsteroidState | null = null;
                        let minDistance = Infinity;

                        for (const asteroid of asteroidsRef.current) {
                            if (asteroid.cooldownUntil > timestamp) continue;
                            const distance = Math.hypot(asteroid.x - updatedEnemy.x, asteroid.y - updatedEnemy.y);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestAsteroid = asteroid;
                            }
                        }
                        if (closestAsteroid) {
                            updatedEnemy.aiState = 'mining';
                            updatedEnemy.targetObjectId = closestAsteroid.id;
                            updatedEnemy.stateChangeTimestamp = 0;
                        } else if (updatedEnemy.patrolCenter) {
                            const distanceToCenter = Math.hypot(updatedEnemy.x - updatedEnemy.patrolCenter.x, updatedEnemy.y - updatedEnemy.patrolCenter.y);
                            if (distanceToCenter > 150) {
                                const angleToCenter = Math.atan2(updatedEnemy.patrolCenter.y - updatedEnemy.y, updatedEnemy.patrolCenter.x - updatedEnemy.x);
                                updatedEnemy.vx = Math.cos(angleToCenter) * ENEMY_SPEED * 0.3;
                                updatedEnemy.vy = Math.sin(angleToCenter) * ENEMY_SPEED * 0.3;
                            } else {
                                updatedEnemy.vx *= FRICTION;
                                updatedEnemy.vy *= FRICTION;
                            }
                        }
                    }
                } else if (canSeePlayer && !updatedEnemy.isAlly) {
                    updatedEnemy.aiState = 'chasing';
                    updatedEnemy.stateChangeTimestamp = timestamp;
                } else {
                    updatedEnemy.vx *= FRICTION;
                    updatedEnemy.vy *= FRICTION;
                }
                break;
            case 'mining': {
                const targetAsteroid = asteroidsRef.current.find(a => a.id === updatedEnemy.targetObjectId);
                if (!targetAsteroid || targetAsteroid.cooldownUntil > timestamp) {
                    updatedEnemy.aiState = 'patrolling';
                    break;
                }
                const distanceToAsteroid = Math.hypot(targetAsteroid.x - updatedEnemy.x, targetAsteroid.y - updatedEnemy.y);
                if (distanceToAsteroid > ASTEROID_ACTION_MAX_RANGE) {
                    const angleToAsteroid = Math.atan2(targetAsteroid.y - updatedEnemy.y, targetAsteroid.x - updatedEnemy.x);
                    updatedEnemy.vx = Math.cos(angleToAsteroid) * ENEMY_SPEED * 0.8;
                    updatedEnemy.vy = Math.sin(angleToAsteroid) * ENEMY_SPEED * 0.8;
                } else {
                    updatedEnemy.vx = 0;
                    updatedEnemy.vy = 0;
                    if (updatedEnemy.stateChangeTimestamp === 0) {
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    }
                    if (timestamp - updatedEnemy.stateChangeTimestamp > MINER_SIMULATED_MINE_TIME_MS) {
                        updatedEnemy.cargo = MINER_CARGO_PER_TRIP;
                        updatedEnemy.aiState = 'returning_to_base';
                        updatedEnemy.targetObjectId = stationsRef.current[0].id;
                    }
                }
                break;
            }
            case 'returning_to_base': {
                const mainStation = stationsRef.current.find(s => s.id === updatedEnemy.targetObjectId);
                if (!mainStation) {
                     updatedEnemy.aiState = 'patrolling';
                     break;
                }
                const distanceToStation = Math.hypot(mainStation.x - updatedEnemy.x, mainStation.y - updatedEnemy.y);
                if (distanceToStation > STATION_INTERACTION_RADIUS * 0.5) {
                    const angleToStation = Math.atan2(mainStation.y - updatedEnemy.y, mainStation.x - updatedEnemy.x);
                    updatedEnemy.vx = Math.cos(angleToStation) * ENEMY_SPEED * 0.8;
                    updatedEnemy.vy = Math.sin(angleToStation) * ENEMY_SPEED * 0.8;
                } else {
                    const creditsEarned = updatedEnemy.cargo * RESOURCE_PRICES.ore;
                    if (creditsEarned > 0) {
                         setTimeout(() => {
                            toast({ title: "Miner Drop-off", description: `An allied miner delivered resources, +${creditsEarned} credits.` });
                        }, 0);
                        setPlayerData(d => ({
                            ...d,
                            resources: { ...d.resources, money: d.resources.money + creditsEarned }
                        }));
                    }
                    updatedEnemy.cargo = 0;
                    updatedEnemy.aiState = 'patrolling';
                    updatedEnemy.targetObjectId = null;
                }
                break;
            }
            case 'chasing':
                if (canSeePlayer) {
                    const rammingHealthAdvantage = (updatedEnemy.health / updatedEnemy.maxHealth) > (playerDataRef.current.health / playerMaxHealth * ENEMY_RAM_HEALTH_ADVANTAGE);
                    updatedEnemy.lastKnownPlayerPosition = { ...playerPositionRef.current };
                    const angleToPlayer = Math.atan2(playerPositionRef.current.y - updatedEnemy.y, playerPositionRef.current.x - updatedEnemy.x);
                    
                    const preferredDistance = ENEMY_AGGRO_RADIUS * 0.6;
                    if (distanceToPlayer > preferredDistance && !rammingHealthAdvantage) {
                         updatedEnemy.vx = Math.cos(angleToPlayer) * ENEMY_SPEED;
                         updatedEnemy.vy = Math.sin(angleToPlayer) * ENEMY_SPEED;
                    } else if (rammingHealthAdvantage) {
                        updatedEnemy.vx = Math.cos(angleToPlayer) * ENEMY_SPEED;
                        updatedEnemy.vy = Math.sin(angleToPlayer) * ENEMY_SPEED;
                    } else {
                         updatedEnemy.vx *= FRICTION;
                         updatedEnemy.vy *= FRICTION;
                    }

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
          
          updatedEnemy.x += updatedEnemy.vx;
          updatedEnemy.y += updatedEnemy.vy;

          updatedEnemy.x = Math.max(collisionRadius, Math.min(MAP_WIDTH - collisionRadius, updatedEnemy.x));
          updatedEnemy.y = Math.max(collisionRadius, Math.min(MAP_HEIGHT - collisionRadius, updatedEnemy.y));
          
          return updatedEnemy;

      }).filter(Boolean) as EnemyState[];

      if (newEnemyProjectiles.length > 0) setEnemyProjectiles(prev => [...prev, ...newEnemyProjectiles]);
      if (hitPlayerProjectileIds.size > 0) setPlayerProjectiles(prev => prev.filter(p => !hitPlayerProjectileIds.has(p.id)));
      
      let playerVelocityUpdate = { ...velocityRef.current };
      if (timestamp - lastCollisionTimestamp > 500) {
          const speedFactor = 0.5 + (speed / (currentMaxSpeed || MAX_SPEED)) * 0.5;
          let collisionDamage = 0;
          let repulsionAngle = 0;
          let repulsionForce = 0.8;
          let collided = false;

          for (const asteroid of asteroidsRef.current) {
              const distance = Math.hypot(asteroid.x - playerPositionRef.current.x, asteroid.y - playerPositionRef.current.y);
              if (distance < (asteroid.size * ASTEROID_COLLISION_RADIUS) + PLAYER_COLLISION_RADIUS) {
                  collided = true;
                  collisionDamage = ASTEROID_COLLISION_DAMAGE * speedFactor;
                  repulsionAngle = Math.atan2(playerPositionRef.current.y - asteroid.y, playerPositionRef.current.x - asteroid.x);
                  break;
              }
          }
          if (!collided) {
              for (let i = 0; i < processedEnemies.length; i++) {
                  let enemy = processedEnemies[i];
                  let enemyRadius = ENEMY_COLLISION_RADIUS;
                  if (enemy.type === 'frigate') enemyRadius = FRIGATE_COLLISION_RADIUS;
                  else if (enemy.type === 'staff') enemyRadius = STAFF_COLLISION_RADIUS;
                  const distance = Math.hypot(enemy.x - playerPositionRef.current.x, enemy.y - playerPositionRef.current.y);
                  if (distance < enemyRadius + PLAYER_COLLISION_RADIUS) {
                      collided = true;
                      collisionDamage = ENEMY_COLLISION_DAMAGE * speedFactor;
                      repulsionAngle = Math.atan2(playerPositionRef.current.y - enemy.y, playerPositionRef.current.x - enemy.x);
                      const enemyRepulsionForce = repulsionForce * 0.8;
                      enemy.vx -= Math.cos(repulsionAngle) * enemyRepulsionForce;
                      enemy.vy -= Math.sin(repulsionAngle) * enemyRepulsionForce;
                      break;
                  }
              }
          }
          if (!collided) {
              for (const station of stationsRef.current) {
                  const distance = Math.hypot(station.x - playerPositionRef.current.x, station.y - playerPositionRef.current.y);
                  if (distance < STATION_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS) {
                      collided = true;
                      collisionDamage = STATION_COLLISION_DAMAGE * speedFactor;
                      repulsionAngle = Math.atan2(playerPositionRef.current.y - station.y, playerPositionRef.current.x - station.x);
                      break;
                  }
              }
          }

          if (collided) {
              lastCollisionTimestamp = timestamp;
              if (speed > COLLISION_SPEED_THRESHOLD) {
                applyDamage(collisionDamage);
              }
              playerVelocityUpdate.x += Math.cos(repulsionAngle) * repulsionForce;
              playerVelocityUpdate.y += Math.sin(repulsionAngle) * repulsionForce;
              setVelocity(playerVelocityUpdate);
          }
      }
      
      const hitEnemyProjectileIds = new Set<number>();
      let damageToPlayerFromProjectiles = 0;
      for (const proj of enemyProjectilesRef.current) {
        if (hitEnemyProjectileIds.has(proj.id)) continue;
        const distance = Math.hypot(proj.x - playerPositionRef.current.x, proj.y - playerPositionRef.current.y);
        if (distance < PLAYER_COLLISION_RADIUS) {
          hitEnemyProjectileIds.add(proj.id);
          damageToPlayerFromProjectiles += ENEMY_PROJECTILE_DAMAGE;
        }
      }
      if (damageToPlayerFromProjectiles > 0) applyDamage(damageToPlayerFromProjectiles);
      if (hitEnemyProjectileIds.size > 0) setEnemyProjectiles(prev => prev.filter(p => !hitEnemyProjectileIds.has(p.id)));
      
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
          setPlayerData(d => {
            const { ship, upgrades } = d;
            const maxCargo = SHIP_DATA[ship.class].baseCargo + UPGRADE_VALUES.cargoCapacity[upgrades.cargoCapacity];
            const cargoToAdd = collectedResources.ore + collectedResources.gas;
            const availableSpace = maxCargo - d.cargo.current;
            const amountToAdd = Math.min(cargoToAdd, availableSpace);
            
            const oreToAdd = Math.min(collectedResources.ore, amountToAdd);
            const gasToAdd = Math.min(collectedResources.gas, amountToAdd - oreToAdd);

            return {
              ...d,
              resources: {
                  money: d.resources.money + collectedResources.money,
                  ore: d.resources.ore + oreToAdd,
                  gas: d.resources.gas + gasToAdd,
              },
              cargo: {
                  current: Math.min(maxCargo, d.cargo.current + oreToAdd + gasToAdd),
              }
            }
          });
      }

      if (collectedDebrisIds.size > 0) {
          setDebris(prev => [...prev, ...newDebrisFromKills].filter(d => !collectedDebrisIds.has(d.id)));
      } else if (newDebrisFromKills.length > 0) {
          setDebris(prev => [...prev, ...newDebrisFromKills]);
      }
      setEnemies(processedEnemies);


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
  }, [viewSize, isModalOpen, controlScheme, isDocked, applyDamage, handleActionSelect, handleBuyAlly, handleBuyShip, handleBuyUpgrade, handleRepairHull, handleSellResource, resetGame, toast]);

  let radarRange = BASE_RADAR_RANGE;
  if (shipMode === 'scan') radarRange = BASE_RADAR_RANGE * 2;
  else if (shipMode === 'stealth') radarRange = STEALTH_DETECTION_RADIUS_NEAR;

  const visibleEnemies = React.useMemo(() => 
    enemies.filter(e => Math.hypot(e.x - playerPosition.x, e.y - playerPosition.y) < radarRange),
    [enemies, playerPosition.x, playerPosition.y, radarRange]
  );
  
  const visibleAsteroids = React.useMemo(() =>
    asteroids.filter(a => {
        const distance = Math.hypot(a.x - playerPosition.x, a.y - playerPosition.y);
        return shipMode === 'stealth' ? distance < STEALTH_AGGRO_RADIUS * 1.5 : distance < radarRange;
    }),
    [asteroids, playerPosition.x, playerPosition.y, radarRange, shipMode]
  );

  const visibleStations = React.useMemo(() =>
    stations.filter(s => {
        const distance = Math.hypot(s.x - playerPosition.x, s.y - playerPosition.y);
        return shipMode === 'stealth' ? distance < STEALTH_AGGRO_RADIUS * 1.5 : distance < radarRange;
    }),
    [stations, playerPosition.x, playerPosition.y, radarRange, shipMode]
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
      case 'interceptor':
        return <InterceptorShip key={enemy.id} {...props} />;
      default:
        return null;
    }
  };
  
  const mainStation = stations.find(s => s.id === 1);
  const currentStellarBaseData: StellarBaseData | null = mainStation ? {
      shields: mainStation.shield,
      maxShields: mainStation.maxShield,
      hull: mainStation.health,
      maxHull: mainStation.maxHealth,
  } : null;

  return (
    <div
      ref={containerRef}
      className={containerClass}
    >
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
        {visibleEnemies.map(renderEnemy)}
        {visibleAsteroids.map((a) => (
            <Asteroid key={a.id} x={a.x} y={a.y} size={a.size} rotation={a.rotation} />
        ))}
        {visibleStations.map((s) => (
            <SpaceStation key={s.id} x={s.x} y={s.y} />
        ))}
        {visibleDebris.map((d) => (
            <Debris key={d.id} x={d.x} y={d.y} />
        ))}
      </div>
      
      {playerAction && (
        <ActionProgress
          actionType={playerAction.type}
          progress={((Date.now() - playerAction.startTime) / playerAction.duration) * 100}
        />
       )}

      <MilitaryViewOverlay isOpen={zoom === MIN_ZOOM} />
      {cruiseState === 'cruising' && <CruiseStreaks />}
       {playerData.health < LOW_HEALTH_THRESHOLD && (
          <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ boxShadow: 'inset 0 0 80px 30px rgba(255, 0, 0, 0.4)' }} />
       )}
       {playerData.energy <= 0 && (
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px 30px rgba(0, 150, 255, 0.3)' }} />
       )}

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4" data-ui-element="true">
        <PlayerUpgradesDisplay upgrades={playerData.upgrades} />
        <VesselSystems systems={vesselSystems} />
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4" data-ui-element="true">
        <PlayerStatus data={playerData} />
        <ResourceDisplay resources={playerData.resources} />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-4" data-ui-element="true">
          {currentStellarBaseData && <StellarBaseStatus data={currentStellarBaseData} />}
          <ClientOnly>
            <ChatBox />
          </ClientOnly>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-4" data-ui-element="true">
        <Radar 
            playerPosition={playerPosition}
            enemies={visibleEnemies}
            stations={visibleStations}
            asteroids={visibleAsteroids}
            radarRange={radarRange}
        />
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
      
      <StationMenu
        isOpen={isStationMenuOpen}
        onOpenChange={setIsStationMenuOpen}
        playerData={playerData}
        stationData={mainStation || null}
        onSellResource={handleSellResource}
        onBuyUpgrade={handleBuyUpgrade}
        onRepairHull={handleRepairHull}
        onBuyShip={handleBuyShip}
        onBuyAlly={handleBuyAlly}
      />

      <GameOverOverlay isOpen={isGameOver} onRestart={resetGame} />
    </div>
  );
}
