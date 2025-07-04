
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerShip } from './player-ship';
import { GameMap } from './game-map';
import { Projectile } from './projectile';
import { EnemyShip } from './enemy-ship';
import { FrigateShip } from './frigate-ship';
import { StaffShip } from './staff-ship';
import { InterceptorShip } from './interceptor-ship';
import { DestroyerShip } from './destroyer-ship';
import { CarrierShip } from './carrier-ship';
import { CargoShip } from './cargo-ship';
import { Asteroid } from './asteroid';
import { SpaceStation } from './space-station';
import { Outpost } from './outpost';
import { Debris } from './debris';
import { Beam } from './beam';
import { Radar } from '../game-ui/radar';
import { SpeedIndicator } from '../game-ui/speed-indicator';
import { SettingsMenu } from '../game-ui/settings-menu';
import { PlayerStatus } from '@/components/game-ui/player-status';
import { ResourceDisplay } from '@/components/game-ui/resource-display';
import { WeaponControl } from '@/components/game-ui/weapon-control';
import { ChatBox } from '@/components/game-ui/chat-box';
import { StellarBaseStatus } from '@/components/game-ui/stellar-base-status';
import { VesselSystems } from '@/components/game-ui/vessel-systems';
import { ShipModeSelector } from '@/components/game-ui/ship-mode-selector';
import { CruiseStreaks } from '@/components/game/cruise-streaks';
import { ElectricCloud } from './electric-cloud';
import { Vortex } from './vortex';
import { Explosion } from './explosion';
import { WarpInEffect } from './warp-in-effect';
import { BEAM_RANGE, INITIAL_PLAYER_DATA, INITIAL_FACTION_DATA, UPGRADE_VALUES, UPGRADE_COSTS, RESOURCE_PRICES, SHIP_DATA, ALLY_COST, STATION_BASE_HEALTH, STATION_BASE_SHIELD, OUTPOST_COST, OUTPOST_HEALTH, OUTPOST_RANGE, OUTPOST_FIRE_RATE_MS, AI_HELP_RADIUS, MAP_WIDTH, MAP_HEIGHT, ZONES, BEAM_DAMAGE_PER_FRAME, BEAM_ENERGY_DRAIN_PER_FRAME, REINFORCEMENT_COST, REINFORCEMENT_COOLDOWN_MS, STATION_FIRE_RATE_MS, STATION_RANGE, STATION_PROJECTILE_DAMAGE, STATION_DEFENSE_WAVE_COOLDOWN_MS, STATION_DEFENSE_WAVE_SIZE } from '@/lib/constants';
import type { ControlScheme, PlayerData, FactionData, VesselSystemsData, ShipMode, Debris as DebrisType, EnemyState, AsteroidState, StationState, BotShipType, ContextMenuTargetType, PlayerActionType, Resources, PlayerUpgrades, PlayerShipClass, BeamState, ProjectileState, PlayerAction, EnemyAiState, OutpostState, ChatMessage, Zone, Effect, StellarBaseData } from '@/lib/types';
import { ClientOnly } from '@/components/client-only';
import { GameOverOverlay } from './game-over-overlay';
import { TacticalViewOverlay } from '../game-ui/tactical-view-overlay';
import { ContextMenu } from '../game-ui/context-menu';
import { StationMenu } from '../game-ui/station-menu';
import { PlayerUpgradesDisplay } from '../game-ui/player-upgrades';
import { cn } from '@/lib/utils';
import { ActionProgress } from '../game-ui/action-progress';
import { useToast } from '@/hooks/use-toast';


let ACCELERATION = 0.1;
let STRAFE_ACCELERATION = 0.05;
const REVERSE_ACCELERATION = 0.06;
let MAX_SPEED = 4;
const FRICTION = 0.98;

const PROJECTILE_SPEED = 10;
const PROJECTILE_MAX_RANGE = 1500;
const FIRE_RATE_MS = 250; 
const AUTO_TURRET_FIRE_RATE_MS = 800;
const ENEMY_CLICK_RADIUS = 30;
const STATION_CLICK_RADIUS = 75;
const ASTEROID_CLICK_RADIUS = 1.0; 

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
const ASTEROID_COLLISION_RADIUS = 1.0; // Adjusted for circle visuals

const PLAYER_PROJECTILE_DAMAGE = 10;
const HEAVY_PLAYER_PROJECTILE_DAMAGE = 20;
const ENEMY_PROJECTILE_DAMAGE = 5;

const ASTEROID_COLLISION_DAMAGE = 5;
const ENEMY_COLLISION_DAMAGE = 10;
const STATION_COLLISION_DAMAGE = 20;
const COLLISION_SPEED_THRESHOLD = 1;

const ENERGY_PER_SHOT = 2;
const AUTO_TURRET_ENERGY_COST = 3;

const LOW_HEALTH_THRESHOLD = 30;

const ENEMY_AGGRO_RADIUS = 1200;
const STATION_AGGRO_RADIUS = 2500;
const ENEMY_FIRE_RATE_MS = 1500;
const ENEMY_SPEED = 4;

const STEALTH_AGGRO_RADIUS = 350;
const STEALTH_DETECTION_RADIUS_NEAR = 250;

// Cruise Mode Constants
const CRUISE_CHARGE_TIME = 2000;
const CRUISE_DURATION = 4000;
const CRUISE_ENERGY_COST = 50;
const CRUISE_COOLDOWN_MS = 5000;

// Shield Mode Constants
const SHIELD_ENERGY_DRAIN_RATE = 0.2;
const SHIELD_DAMAGE_TO_ENERGY_COST = 0.5;

// Mode Switching Constants
const MODE_CHANGE_COOLDOWN_MS = 2000;

// Enemy AI Constants
const ENEMY_MAX_ENERGY = 1000;
const ENEMY_ENERGY_PER_SHOT = 10;
const ENEMY_ENERGY_REGEN_RATE = 0.05;
const ENEMY_ENERGY_REGEN_DELAY_MS = 3000;
const ENEMY_FLEE_HEALTH_THRESHOLD = 0.3;
const LOW_ENERGY_FLEE_THRESHOLD = 0.2; // Flee if energy is below 20%
const GUARD_PATROL_RADIUS = 800;
const MINER_SIMULATED_MINE_TIME_MS = 8000;
const MINER_CARGO_PER_TRIP = 20;
const MINER_AVOIDANCE_RADIUS = 300;
const AI_SCAVENGE_RADIUS = 500;
const AI_SEPARATION_DISTANCE = 80;
const AI_PREFERRED_COMBAT_DISTANCE_FACTOR = 0.7;
const NEBULA_DAMAGE_PER_FRAME = 0.05;


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


let uniqueIdCounter = 0;
const getUniqueId = () => {
    uniqueIdCounter += 1;
    return Date.now() + uniqueIdCounter;
};


const generateInitialEnemies = (playerStation: StationState, enemyStation: StationState): EnemyState[] => {
    const fleet: EnemyState[] = [];
    let idCounter = 1;

    const createShip = (type: BotShipType, x: number, y: number, isAlly: boolean, aiState: EnemyAiState, options: Partial<EnemyState> = {}): EnemyState => {
        const shipData = SHIP_DATA[type];
        return {
            id: idCounter++, type, x, y, vx: 0, vy: 0, rotation: 0,
            health: shipData.baseHealth * 3,
            maxHealth: shipData.baseHealth * 3,
            lastShotTimestamp: 0, lastAutoShotTimestamp: 0,
            aiState, lastKnownPlayerPosition: null, stateChangeTimestamp: 0,
            energy: shipData.maxEnergy, maxEnergy: shipData.maxEnergy, cargo: 0, lastEnergyUseTimestamp: 0,
            isAlly, combatTargetId: null, lastAttackerId: null, patrolTarget: null,
            cruiseState: 'idle', cruiseAvailableAt: 0, cruiseChargeStartTimestamp: 0, cruiseDurationStartTimestamp: 0,
            ...options,
        };
    };

    const createFleetForFaction = (station: StationState, enemyBase: StationState, isAlly: boolean) => {
        const stationX = station.x;
        const stationY = station.y;
        
        // 3 Miners
        for (let i = 0; i < 3; i++) {
            fleet.push(createShip('Mineur', stationX + (Math.random() - 0.5) * 400, stationY + 150 + (Math.random() - 0.5) * 400, isAlly, 'patrolling', { role: 'miner', patrolCenter: { x: stationX, y: stationY } }));
        }

        // 1 Frigate with 2 Chasseur escorts (defense)
        const frigate = createShip('Frégate', stationX, stationY - 200, isAlly, 'guarding', { patrolCenter: { x: stationX, y: stationY } });
        fleet.push(frigate);
        for (let i = 0; i < 2; i++) {
            fleet.push(createShip('Chasseur', frigate.x + (i*100-50), frigate.y + 50, isAlly, 'following', { followTargetId: frigate.id, patrolCenter: { x: stationX, y: stationY } }));
        }

        const attackForceCommon = {
            aiState: 'guarding' as EnemyAiState, 
            role: 'attack' as const,
            patrolCenter: { x: stationX, y: stationY }
        };
        
        // 4 Interceptors
        for (let i = 0; i < 4; i++) {
            fleet.push(createShip('Intercepteur', stationX + (Math.random() - 0.5) * 300, stationY - 300 + (Math.random() - 0.5) * 100, isAlly, 'guarding', attackForceCommon));
        }
        
        // 7 Chasseurs
        for (let i = 0; i < 7; i++) {
            fleet.push(createShip('Chasseur', stationX + (Math.random() - 0.5) * 400, stationY - 400 + (Math.random() - 0.5) * 100, isAlly, 'guarding', attackForceCommon));
        }
        
        // 1 Destroyer
        fleet.push(createShip('Destroyer', stationX, stationY - 500, isAlly, 'guarding', attackForceCommon));
    };

    // Player Fleet
    createFleetForFaction(playerStation, enemyStation, true);
    // Enemy Fleet
    createFleetForFaction(enemyStation, playerStation, false);
    
    return fleet;
};


const generateInitialAsteroids = (zones: Zone[]): AsteroidState[] => {
    const asteroids: AsteroidState[] = [];
    let id = 1;
    zones.forEach(zone => {
        if (zone.type === 'asteroid_field') {
            const count = Math.floor(Math.PI * zone.radius * zone.radius / 100000) * (zone.density || 0.5);
            for (let i = 0; i < count; i++) {
                asteroids.push({
                    id: id++,
                    x: zone.x + Math.cos(Math.random() * 2 * Math.PI) * Math.random() * zone.radius,
                    y: zone.y + Math.sin(Math.random() * 2 * Math.PI) * Math.random() * zone.radius,
                    size: Math.random() * 60 + 60,
                    rotation: Math.random() * 360,
                    mineableCharges: MINING_CHARGES,
                    cooldownUntil: 0
                });
            }
        }
    });
    return asteroids;
};

const generateInitialStations = (): StationState[] => [
    { id: 1, owner: 'player', x: 2500, y: MAP_HEIGHT / 2, health: STATION_BASE_HEALTH, maxHealth: STATION_BASE_HEALTH, shield: STATION_BASE_SHIELD, maxShield: STATION_BASE_SHIELD, lastHitTimestamp: 0, lastAttackerId: null, defenseWaveCooldownUntil: 0 },
    { id: 2, owner: 'enemy', x: MAP_WIDTH - 2500, y: MAP_HEIGHT / 2, health: STATION_BASE_HEALTH, maxHealth: STATION_BASE_HEALTH, shield: STATION_BASE_SHIELD, maxShield: STATION_BASE_SHIELD, lastHitTimestamp: 0, lastAttackerId: null, defenseWaveCooldownUntil: 0 },
];


export function GameContainer() {
  const { toast } = useToast();
  const [playerPosition, setPlayerPosition] = useState({ x: 2500, y: MAP_HEIGHT / 2 + 200 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(0);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [aimRotation, setAimRotation] = useState(0);
  const [playerProjectiles, setPlayerProjectiles] = useState<ProjectileState[]>([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState<ProjectileState[]>([]);
  const [activeBeams, setActiveBeams] = useState<BeamState[]>([]);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [asteroids, setAsteroids] = useState<AsteroidState[]>([]);
  const [stations, setStations] = useState<StationState[]>([]);
  const [outposts, setOutposts] = useState<OutpostState[]>([]);
  const [debris, setDebris] = useState<DebrisType[]>([]);
  const [explosions, setExplosions] = useState<Effect[]>([]);
  const [warpEffects, setWarpEffects] = useState<Effect[]>([]);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  const [zones] = useState<Zone[]>(ZONES);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverResult, setGameOverResult] = useState<'victory' | 'defeat'>('defeat');
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [controlScheme, setControlScheme] = useState<ControlScheme>('hybrid');
  const [zoom, setZoom] = useState(1);
  const [autoMoveTarget, setAutoMoveTarget] = useState<{ x: number, y: number } | null>(null);
  const [shipMode, setShipMode] = useState<ShipMode>('normal');
  const [cruiseState, setCruiseState] = useState<'idle' | 'charging' | 'cruising'>('idle');
  const [cooldowns, setCooldowns] = useState({ modeChange: 1, cruise: 1 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; worldX: number, worldY: number; targetId: number | null; targetType: ContextMenuTargetType; } | null>(null);
  const [miningIntent, setMiningIntent] = useState<number | null>(null);
  const [playerAction, setPlayerAction] = useState<PlayerAction | null>(null);
  
  const [playerData, setPlayerData] = useState<PlayerData>(JSON.parse(JSON.stringify(INITIAL_PLAYER_DATA)));
  const [enemyFactionData, setEnemyFactionData] = useState<FactionData>(JSON.parse(JSON.stringify(INITIAL_FACTION_DATA)));

  const [vesselSystems, setVesselSystems] = useState<VesselSystemsData>({ shields: 'Online', weapons: 'Ready', power: 'Optimal' });
  const [isDocked, setIsDocked] = useState(false);
  const [selectedAllyIds, setSelectedAllyIds] = useState<number[]>([]);
  const [activeWeapons, setActiveWeapons] = useState({ manualTurrets: true, autoTurrets: true, beam: true });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [cheats, setCheats] = useState({ infiniteHealth: false, infiniteEnergy: false, infiniteMoney: false });


  // Tactical View State
  const [cameraPosition, setCameraPosition] = useState({ x: 2500, y: MAP_HEIGHT / 2 + 200 });
  const [isTacticalView, setIsTacticalView] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePosForPan = useRef({ x: 0, y: 0 });
  const lastAiFactionUpdate = useRef(0);
  const lastAttackWaveTimestamp = useRef(0);
  const nextAttackWaveTimestamp = useRef(180000); // 3 mins for first attack

  // Reinforcement state
  const [isPlacingReinforcements, setIsPlacingReinforcements] = useState(false);
  const reinforcementAvailableAt = useRef(0);

  const uniqueIdCounterRef = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const mousePosition = useRef({ x: 0, y: 0 });
  const isLeftMouseDown = useRef(false);
  const isRightMouseDown = useRef(false);
  const isMiddleMouseDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEnergyUseTimestamp = useRef(0);
  const lastFiredTimestamp = useRef(0);
  const lastPlayerAutoShotTimestamp = useRef(0);

  const modeChangeAvailableAtRef = useRef(0);
  const cruiseAvailableAtRef = useRef(0);
  const cruiseChargeStartTimestampRef = useRef<number>(0);
  const cruiseDurationStartTimestampRef = useRef<number>(0);
  
  const playerPositionRef = useRef(playerPosition);
  useEffect(() => { playerPositionRef.current = playerPosition; }, [playerPosition]);

  const cameraPositionRef = useRef(cameraPosition);
  useEffect(() => { cameraPositionRef.current = cameraPosition; }, [cameraPosition]);

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
  
  const outpostsRef = useRef(outposts);
  useEffect(() => { outpostsRef.current = outposts; }, [outposts]);

  const playerProjectilesRef = useRef(playerProjectiles);
  useEffect(() => { playerProjectilesRef.current = playerProjectiles; }, [playerProjectiles]);
  
  const enemyProjectilesRef = useRef(enemyProjectiles);
  useEffect(() => { enemyProjectilesRef.current = enemyProjectiles }, [enemyProjectiles]);

  const autoMoveTargetRef = useRef(autoMoveTarget);
  useEffect(() => { autoMoveTargetRef.current = autoMoveTarget; }, [autoMoveTarget]);

  const playerDataRef = useRef(playerData);
  useEffect(() => { playerDataRef.current = playerData; }, [playerData]);

  const enemyFactionDataRef = useRef(enemyFactionData);
  useEffect(() => { enemyFactionDataRef.current = enemyFactionData; }, [enemyFactionData]);

  const cruiseStateRef = useRef(cruiseState);
  useEffect(() => { cruiseStateRef.current = cruiseState; }, [cruiseState]);

  const debrisRef = useRef(debris);
  useEffect(() => { debrisRef.current = debris; }, [debris]);

  const shipModeRef = useRef(shipMode);
  useEffect(() => { shipModeRef.current = shipMode; }, [shipMode]);

  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const isTacticalViewRef = useRef(isTacticalView);
  useEffect(() => { isTacticalViewRef.current = isTacticalView; }, [isTacticalView]);

  const isPanningRef = useRef(isPanning);
  useEffect(() => { isPanningRef.current = isPanning; }, [isPanning]);

  const selectedAllyIdsRef = useRef(selectedAllyIds);
  useEffect(() => { selectedAllyIdsRef.current = selectedAllyIds; }, [selectedAllyIds]);


  const miningIntentRef = useRef(miningIntent);
  useEffect(() => { miningIntentRef.current = miningIntent; }, [miningIntent]);
  
  const playerActionRef = useRef(playerAction);
  useEffect(() => { playerActionRef.current = playerAction; }, [playerAction]);

  const activeBeamsRef = useRef(activeBeams);
  useEffect(() => { activeBeamsRef.current = activeBeams; }, [activeBeams]);
  
  const isPlayerActionInProgress = playerAction !== null;
  const radarRange = shipMode === 'scan' ? BASE_RADAR_RANGE * 1.5 : BASE_RADAR_RANGE;

  useEffect(() => {
    setIsTacticalView(zoom === MIN_ZOOM);
  }, [zoom]);

  const addChatMessage = useCallback((sender: string, text: string, color?: string) => {
    setChatMessages(prev => {
        const newId = getUniqueId();
        const newMessage: ChatMessage = { id: newId, sender, text, color };
        const newMessages = [...prev, newMessage];
        if (newMessages.length > 50) {
            return newMessages.slice(newMessages.length - 50);
        }
        return newMessages;
    });
  }, []);

  const handleRespawn = useCallback(() => {
    toast({
        variant: "destructive",
        title: "Vaisseau Détruit!",
        description: "Redéploiement à la base. Ressources de soute et une partie des crédits perdus.",
    });
    
    const playerBase = stationsRef.current.find(s => s.owner === 'player');
    if (playerBase) {
        setPlayerPosition({ x: playerBase.x, y: playerBase.y - 150 });
    }
    
    setVelocity({ x: 0, y: 0 });
    setTargetId(null);
    setPlayerAction(null);
    
    setPlayerData(prev => {
        const shipInfo = SHIP_DATA['Chasseur'];
        const maxHealth = shipInfo.baseHealth * 3 + UPGRADE_VALUES.maxHealth[prev.upgrades.maxHealth];
        return {
            ...prev,
            ship: { ...prev.ship, class: 'Chasseur' },
            health: maxHealth,
            energy: shipInfo.maxEnergy,
            resources: {
                ...prev.resources,
                money: Math.floor(prev.resources.money * 0.9), // Lose 10% money
                ore: 0,
                gas: 0,
            },
            cargo: { current: 0 }
        };
    });
  }, [addChatMessage, toast]);

  const resetGame = useCallback(() => {
    const newStations = generateInitialStations();
    const playerStation = newStations.find(s => s.owner === 'player')!;
    const enemyStation = newStations.find(s => s.owner === 'enemy')!;
    
    setStations(newStations);
    setPlayerPosition({ x: playerStation.x, y: playerStation.y + 200 });
    setCameraPosition({ x: playerStation.x, y: playerStation.y + 200 });
    setVelocity({ x: 0, y: 0 });
    setPlayerRotation(0);
    setPlayerProjectiles([]);
    setEnemyProjectiles([]);
    setActiveBeams([]);
    setEnemies(generateInitialEnemies(playerStation, enemyStation));
    setAsteroids(generateInitialAsteroids(zones));
    setOutposts([]);
    setDebris([]);
    setTargetId(null);
    setPlayerData(JSON.parse(JSON.stringify(INITIAL_PLAYER_DATA)));
    setEnemyFactionData(JSON.parse(JSON.stringify(INITIAL_FACTION_DATA)));
    setIsGameOver(false);
    setShipMode('normal');
    setCruiseState('idle');
    setContextMenu(null);
    setPlayerAction(null);
    setSelectedAllyIds([]);
    setChatMessages([{id: getUniqueId(), sender: 'System', text: 'Welcome to Cosmic Clash Arena!', color: 'text-yellow-400'}]);
    modeChangeAvailableAtRef.current = 0;
    cruiseAvailableAtRef.current = 0;
    setCooldowns({ modeChange: 1, cruise: 1 });
  }, [zones]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleActionSelect = useCallback((action: PlayerActionType, targetId: number | null, worldCoords?: { x: number, y: number }) => {
    setContextMenu(null);
    if (playerActionRef.current) return;
    
    if (action === 'tactical_move' || action === 'patrolling_order') {
        if (worldCoords && selectedAllyIdsRef.current.length > 0) {
            const newAiState = action === 'tactical_move' ? 'moving_to_order' : 'patrolling_order';
            addChatMessage('Commander', `Units ${selectedAllyIdsRef.current.join(', ')} ordered to ${newAiState === 'moving_to_order' ? 'move' : 'patrol'}.`, 'text-cyan-400');
            setEnemies(prev => prev.map(e => selectedAllyIdsRef.current.includes(e.id) ? { 
                ...e, 
                aiState: newAiState, 
                orderTarget: worldCoords, 
                combatTargetId: null 
            } : e));
        }
        return;
    }
    
    if (action === 'follow_target') {
        const target = enemiesRef.current.find(e => e.id === targetId);
        if (target && selectedAllyIdsRef.current.length > 0) {
            addChatMessage('Commander', `Units ${selectedAllyIdsRef.current.join(', ')} ordered to follow target ${target.id}.`, 'text-cyan-400');
            setEnemies(prev => prev.map(e => selectedAllyIdsRef.current.includes(e.id) ? { 
                ...e, 
                aiState: 'following', 
                followTargetId: target.id, 
                combatTargetId: null,
                orderTarget: null
            } : e));
        }
        return;
    }

    if (action === 'follow_player') {
        let idsToOrder = selectedAllyIdsRef.current;
        if(idsToOrder.length === 0 && targetId) {
            idsToOrder = [targetId]
        }
        if (idsToOrder.length > 0) {
            addChatMessage('Commander', `Units ${idsToOrder.join(', ')} ordered to follow me.`, 'text-cyan-400');
            setEnemies(prev => prev.map(e => idsToOrder.includes(e.id) ? { 
                ...e, 
                aiState: 'following', 
                followTargetId: -1, // -1 is player
                combatTargetId: null,
                orderTarget: null
            } : e));
        }
        return;
    }

    if (action === 'open_station_menu') {
        const station = stationsRef.current.find(s => s.id === targetId);
        if (station) {
            if (station.owner !== 'player') {
                addChatMessage('System', "Cannot interact with an enemy station.", 'text-red-400');
                return;
            }
            const distance = Math.hypot(station.x - playerPositionRef.current.x, station.y - playerPositionRef.current.y);
            if (distance < STATION_INTERACTION_RADIUS) {
                setIsStationMenuOpen(true);
            } else {
              addChatMessage('System', "Target out of range. Get closer to interact with the station.", 'text-red-400');
            }
        }
        return;
    }

    const targetEnemy = enemiesRef.current.find(e => e.id === targetId);
    const targetAsteroid = asteroidsRef.current.find(a => a.id === targetId);
    
    if (action === 'mining' && targetAsteroid) {
        if (targetAsteroid.cooldownUntil > Date.now()) {
            addChatMessage('System', "Asteroid is depleted. Try again later.", 'text-yellow-400');
            return;
        }
        if (targetAsteroid.mineableCharges <= 0) {
            addChatMessage('System', "This asteroid is temporarily depleted.", 'text-yellow-400');
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
            
            addChatMessage('Navigation', `Moving into optimal mining range.`, 'text-gray-400');
            setAutoMoveTarget({ x: targetX, y: targetY });
            setMiningIntent(targetId);
            return;
        }
        const shipInfo = SHIP_DATA[playerDataRef.current.ship.class];
        const miningDuration = shipInfo.miningBonus ? MINING_DURATION_MS / shipInfo.miningBonus : MINING_DURATION_MS;
        addChatMessage('System', `Mining laser engaged.`, 'text-green-400');
        setPlayerAction({ type: 'mining', targetId, startTime: Date.now(), duration: miningDuration });
        return;
    }

    if (targetEnemy) {
      if (targetEnemy.isAlly) {
        return;
      }
      const distance = Math.hypot(targetEnemy.x - playerPositionRef.current.x, targetEnemy.y - playerPositionRef.current.y);
      if (distance > ACTION_MAX_RANGE) {
          addChatMessage('System', "Target out of range. Get closer to perform this action.", 'text-red-400');
          return;
      }
    } else {
        return;
    }

    switch(action) {
      case 'pillaging':
        if (playerDataRef.current.energy < PILLAGE_ENERGY_COST) {
            addChatMessage('System', `Pillaging requires ${PILLAGE_ENERGY_COST} energy.`, 'text-red-400');
            return;
        }
        setPlayerData(d => ({ ...d, energy: d.energy - PILLAGE_ENERGY_COST }));
        lastEnergyUseTimestamp.current = Date.now();
        addChatMessage('Player', `Initiating pillage on enemy ${targetId}.`, 'text-orange-400');
        setPlayerAction({ type: 'pillaging', targetId, startTime: Date.now(), duration: PILLAGE_DURATION_MS });
        break;
      case 'boarding':
        if (playerDataRef.current.energy < BOARDING_ENERGY_COST) {
            addChatMessage('System', `Boarding requires ${BOARDING_ENERGY_COST} energy.`, 'text-red-400');
            return;
        }
        setPlayerData(d => ({ ...d, energy: d.energy - BOARDING_ENERGY_COST }));
        lastEnergyUseTimestamp.current = Date.now();
        addChatMessage('Player', `Attempting to board enemy ${targetId}.`, 'text-orange-400');
        setPlayerAction({ type: 'boarding', targetId, startTime: Date.now(), duration: BOARDING_DURATION_MS });
        break;
    }
  }, [addChatMessage]);

  const applyDamage = useCallback((damage: number) => {
    if (cheats.infiniteHealth) return;
    setPlayerData(d => {
        if (d.health <= 0) return d;
        const energyCost = damage * SHIELD_DAMAGE_TO_ENERGY_COST;
        if (shipModeRef.current === 'shield' && d.energy >= energyCost) {
            lastEnergyUseTimestamp.current = Date.now();
            return { ...d, energy: Math.max(0, d.energy - energyCost) };
        }
        return { ...d, health: Math.max(0, d.health - damage) };
    });
  }, [cheats.infiniteHealth]);

  const handleModeChange = (newMode: ShipMode) => {
    const now = Date.now();
    if (now < modeChangeAvailableAtRef.current) {
        addChatMessage('System', 'System mode change on cooldown.', 'text-yellow-400');
        return;
    }
    if (cruiseStateRef.current !== 'idle') {
        addChatMessage('System', 'Cannot change mode while cruising.', 'text-yellow-400');
        return;
    }

    if (newMode === 'cruise') {
        if (now < cruiseAvailableAtRef.current) {
            addChatMessage('System', 'Cruise drive is recharging.', 'text-yellow-400');
            return;
        }
        if (playerDataRef.current.energy < CRUISE_ENERGY_COST) {
            addChatMessage('System', 'Insufficient energy for cruise.', 'text-red-400');
            return;
        }
        setPlayerData(d => ({ ...d, energy: Math.max(0, d.energy - CRUISE_ENERGY_COST) }));
    }

    if (newMode === 'shield' && playerDataRef.current.energy <= 0) {
        addChatMessage('System', 'Insufficient energy for shields.', 'text-red-400');
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
    addChatMessage('System', `Engaging ${newMode} mode.`, 'text-cyan-400');
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
                current: Math.max(0, prev.cargo.current - sellAmount)
            }
        };
    });
  }, []);

  const handleBuyUpgrade = useCallback((upgrade: keyof PlayerUpgrades) => {
    const currentData = playerDataRef.current;
    const currentLevel = currentData.upgrades[upgrade];

    if (currentLevel >= UPGRADE_COSTS[upgrade].length) {
        addChatMessage('System', 'Upgrade already at max level.', 'text-yellow-400');
        return;
    }

    const cost = UPGRADE_COSTS[upgrade][currentLevel];
    if (currentData.resources.money < cost) {
        addChatMessage('System', 'Insufficient funds for upgrade.', 'text-red-400');
        return;
    }

    const newUpgrades = { ...currentData.upgrades, [upgrade]: currentLevel + 1 };
    const newResources = { ...currentData.resources, money: currentData.resources.money - cost };
    
    setPlayerData(prev => ({ 
        ...prev, 
        upgrades: newUpgrades, 
        resources: newResources 
    }));
    addChatMessage('System', `Upgraded ${upgrade} to level ${currentLevel + 1}.`, 'text-green-400');
  }, [addChatMessage]);

  const handleRepairHull = useCallback((amount: number, cost: number) => {
    if (playerDataRef.current.resources.money < cost) {
        addChatMessage('System', 'Insufficient funds for repair.', 'text-red-400');
        return;
    }

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
    addChatMessage('System', `Repaired station hull for ${amount} HP.`, 'text-green-400');
  }, [addChatMessage]);
  
  const handleBuyShip = useCallback((shipClass: PlayerShipClass) => {
      const shipInfo = SHIP_DATA[shipClass];
      if (playerDataRef.current.resources.money < shipInfo.cost) {
          addChatMessage('System', `Insufficient Funds. You need ${shipInfo.cost} credits to buy a ${shipClass}.`, 'text-red-400');
          return;
      }
      setPlayerData(prev => {
          const newMaxHealth = (shipInfo.baseHealth * 3) + UPGRADE_VALUES.maxHealth[prev.upgrades.maxHealth];
          return {
            ...prev,
            resources: { ...prev.resources, money: prev.resources.money - shipInfo.cost },
            ship: { ...prev.ship, class: shipClass },
            health: newMaxHealth, // Heal to full on new ship purchase
            energy: shipInfo.maxEnergy, // Refill energy
          };
      });
      addChatMessage('System', `You are now the captain of a new ${shipClass}.`, 'text-green-400');
  }, [addChatMessage]);
  
  const handleBuildShipFromTactical = useCallback((shipType: BotShipType) => {
      const shipInfo = SHIP_DATA[shipType];
      if (playerDataRef.current.resources.money < shipInfo.cost) {
          addChatMessage('System', `Insufficient Funds. You need ${shipInfo.cost} credits to build a ${shipType}.`, 'text-red-400');
          return;
      }

      setPlayerData(prev => ({
          ...prev,
          resources: { ...prev.resources, money: prev.resources.money - shipInfo.cost }
      }));

      const station = stationsRef.current.find(s => s.owner === 'player');
      const spawnX = station ? station.x + (Math.random() - 0.5) * 150 : playerPositionRef.current.x;
      const spawnY = station ? station.y + (Math.random() - 0.5) * 150 : playerPositionRef.current.y;
      
      const newAlly: EnemyState = {
          id: getUniqueId(),
          type: shipType,
          x: spawnX,
          y: spawnY,
          vx: 0, vy: 0, rotation: 0,
          health: shipInfo.baseHealth * 3,
          maxHealth: shipInfo.baseHealth * 3,
          lastShotTimestamp: 0, lastAutoShotTimestamp: 0,
          aiState: 'guarding', lastKnownPlayerPosition: null, stateChangeTimestamp: 0,
          energy: shipInfo.maxEnergy, maxEnergy: shipInfo.maxEnergy, cargo: 0, lastEnergyUseTimestamp: 0,
          isAlly: true, combatTargetId: null, lastAttackerId: null, patrolTarget: null, patrolCenter: {x: spawnX, y: spawnY},
          role: shipType === 'Mineur' ? 'miner' : 'attack',
          cruiseState: 'idle', cruiseAvailableAt: 0,
      };

      setEnemies(prev => [...prev, newAlly]);
      addChatMessage('System', `A new ${shipType} has been constructed at the base.`, 'text-blue-400');
  }, [addChatMessage]);
  
  const handleBuildOutpost = useCallback(() => {
    if (playerDataRef.current.resources.money < OUTPOST_COST) {
        addChatMessage('System', `Insufficient Funds. You need ${OUTPOST_COST} credits to build an Outpost.`, 'text-red-400');
        return;
    }
    
    setPlayerData(prev => ({
        ...prev,
        resources: { ...prev.resources, money: prev.resources.money - OUTPOST_COST }
    }));
    
    const newOutpost: OutpostState = {
        id: getUniqueId(),
        x: cameraPositionRef.current.x,
        y: cameraPositionRef.current.y,
        health: OUTPOST_HEALTH,
        maxHealth: OUTPOST_HEALTH,
        ownerId: -1, // -1 for player
        lastShotTimestamp: 0,
    };
    
    setOutposts(prev => [...prev, newOutpost]);
    addChatMessage('System', `A new defensive outpost is online.`, 'text-blue-400');

  }, [addChatMessage]);


  const handleBuyAlly = useCallback(() => {
    if (playerDataRef.current.resources.money < ALLY_COST) {
        addChatMessage('System', `Insufficient Funds. You need ${ALLY_COST} credits to hire an escort.`, 'text-red-400');
        return;
    }

    setPlayerData(prev => ({
        ...prev,
        resources: { ...prev.resources, money: prev.resources.money - ALLY_COST }
    }));

    const shipInfo = SHIP_DATA['Chasseur'];
    const newAlly: EnemyState = {
        id: getUniqueId(),
        type: 'Chasseur',
        x: playerPositionRef.current.x + (Math.random() - 0.5) * 100,
        y: playerPositionRef.current.y + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0,
        rotation: 0,
        health: shipInfo.baseHealth * 3,
        maxHealth: shipInfo.baseHealth * 3,
        lastShotTimestamp: 0,
        lastAutoShotTimestamp: 0,
        aiState: 'following',
        lastKnownPlayerPosition: null,
        stateChangeTimestamp: 0,
        energy: shipInfo.maxEnergy,
        maxEnergy: shipInfo.maxEnergy,
        cargo: 0,
        lastEnergyUseTimestamp: 0,
        isAlly: true,
        combatTargetId: null,
        lastAttackerId: null, 
        patrolTarget: null,
        cruiseState: 'idle',
        cruiseAvailableAt: 0,
    };

    setEnemies(prev => [...prev, newAlly]);
    addChatMessage('System', `A Chasseur escort has joined your fleet.`, 'text-blue-400');
  }, [addChatMessage]);

  const handleAllFollow = useCallback(() => {
    addChatMessage('Commander', 'All combat wings, form on me!', 'text-cyan-400');
    setEnemies(prev => prev.map(e => 
        (e.isAlly && e.type !== 'Mineur' && e.type !== 'Cargo') 
        ? { ...e, aiState: 'following', followTargetId: -1, combatTargetId: null, orderTarget: null } 
        : e
    ));
  }, [addChatMessage]);

  const handleAllAttack = useCallback(() => {
    const enemyBase = stationsRef.current.find(s => s.owner === 'enemy');
    if (!enemyBase) {
        addChatMessage('Commander', 'No enemy base detected.', 'text-red-400');
        return;
    }
    addChatMessage('Commander', 'All combat wings, attack the enemy base!', 'text-red-500');
    setEnemies(prev => prev.map(e => 
        (e.isAlly && e.type !== 'Mineur' && e.type !== 'Cargo') 
        ? { ...e, aiState: 'chasing', combatTargetId: enemyBase.id + 10000 } 
        : e
    ));
  }, [addChatMessage]);

  const handleAllHold = useCallback(() => {
    addChatMessage('Commander', 'All units, hold position!', 'text-cyan-400');
    setEnemies(prev => prev.map(e => 
        (e.isAlly && e.type !== 'Mineur' && e.type !== 'Cargo') 
        ? { ...e, aiState: 'holding_position', combatTargetId: null, orderTarget: null } 
        : e
    ));
  }, [addChatMessage]);

  const handleCallReinforcements = useCallback((position: { x: number, y: number }) => {
    const now = Date.now();
    if (now < reinforcementAvailableAt.current) {
        addChatMessage('System', `Reinforcements are on cooldown.`, 'text-yellow-400');
        return;
    }
    if (playerDataRef.current.resources.money < REINFORCEMENT_COST) {
        addChatMessage('System', `Insufficient funds to call reinforcements.`, 'text-red-400');
        return;
    }
    
    setPlayerData(prev => ({
        ...prev,
        resources: { ...prev.resources, money: prev.resources.money - REINFORCEMENT_COST }
    }));
    reinforcementAvailableAt.current = Date.now() + REINFORCEMENT_COOLDOWN_MS;

    const reinforcementCount = 8;
    const despawnTime = Date.now() + 120000; // 2 minutes
    const newWarpEffects: Effect[] = [];
    const newAllies: EnemyState[] = [];

    for (let i = 0; i < reinforcementCount; i++) {
        const shipInfo = SHIP_DATA['Chasseur'];
        const spawnOffset = { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200 };
        const spawnX = position.x + spawnOffset.x;
        const spawnY = position.y + spawnOffset.y;
        
        newWarpEffects.push({ id: getUniqueId(), x: spawnX, y: spawnY });

        const newAlly: EnemyState = {
            id: getUniqueId(),
            type: 'Chasseur',
            x: spawnX,
            y: spawnY,
            vx: 0, vy: 0, rotation: 0,
            health: shipInfo.baseHealth * 3,
            maxHealth: shipInfo.baseHealth * 3,
            lastShotTimestamp: 0, lastAutoShotTimestamp: 0,
            aiState: 'patrolling_order',
            orderTarget: { x: position.x, y: position.y },
            lastKnownPlayerPosition: null, stateChangeTimestamp: 0,
            energy: shipInfo.maxEnergy, maxEnergy: shipInfo.maxEnergy, cargo: 0, lastEnergyUseTimestamp: 0,
            isAlly: true, combatTargetId: null, lastAttackerId: null, patrolTarget: null,
            cruiseState: 'idle', cruiseAvailableAt: 0,
            despawnTimestamp: despawnTime,
        };
        newAllies.push(newAlly);
    }

    setWarpEffects(prev => [...prev, ...newWarpEffects]);
    setTimeout(() => {
        setEnemies(prev => [...prev, ...newAllies]);
    }, 500); // Spawn after warp effect starts

    addChatMessage('System', `${reinforcementCount} Chasseur reinforcements have arrived. They will depart in 2 minutes.`, 'text-green-400');
    setIsPlacingReinforcements(false);
  }, [addChatMessage]);


  const handleToggleWeapon = useCallback((weapon: 'manualTurrets' | 'autoTurrets' | 'beam') => {
    setActiveWeapons(prev => ({
        ...prev,
        [weapon]: !prev[weapon]
    }));
  }, []);

  const isModalOpen = isSettingsOpen || isGameOver || isStationMenuOpen;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsSettingsOpen(open => !open);
            setAutoMoveTarget(null);
            setContextMenu(null);
            setIsStationMenuOpen(false);
            if (isPlacingReinforcements) {
                setIsPlacingReinforcements(false);
                addChatMessage('Commander', 'Reinforcement call cancelled.', 'text-yellow-400');
            }
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
    
    const handleMouseMove = (event: MouseEvent) => {
        const oldMousePos = { ...mousePosition.current };
        mousePosition.current = { x: event.clientX, y: event.clientY };

        if (isPanningRef.current) {
            const dx = event.clientX - lastMousePosForPan.current.x;
            const dy = event.clientY - lastMousePosForPan.current.y;
            
            setCameraPosition(prev => ({
                x: Math.max(0, Math.min(MAP_WIDTH, prev.x - dx / zoomRef.current)),
                y: Math.max(0, Math.min(MAP_HEIGHT, prev.y - dy / zoomRef.current)),
            }));

            lastMousePosForPan.current = { x: event.clientX, y: event.clientY };
        }
    };

    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    
    const handleMouseDown = (event: MouseEvent) => {
      if (isModalOpen) return;
      if ((event.target as HTMLElement).closest('[data-ui-element="true"]')) return;
      
      const clickWorldX = cameraPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoomRef.current;
      const clickWorldY = cameraPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoomRef.current;
      
      if (isPlacingReinforcements && isTacticalViewRef.current) {
        handleCallReinforcements({x: clickWorldX, y: clickWorldY});
        return;
      }
      
      if (event.button === 0) { // Left Click
        isLeftMouseDown.current = true;
        setContextMenu(null);
        
        if (isTacticalViewRef.current) {
            let clickedOnAlly = false;
            for (const enemy of enemiesRef.current) {
                if (!enemy.isAlly) continue;
                const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
                 if (distance < ENEMY_CLICK_RADIUS) {
                    clickedOnAlly = true;
                    if (event.ctrlKey) {
                        setSelectedAllyIds(prev => prev.includes(enemy.id) ? prev.filter(id => id !== enemy.id) : [...prev, enemy.id]);
                    } else {
                        setSelectedAllyIds([enemy.id]);
                    }
                    break;
                 }
            }
            if (!clickedOnAlly) {
                if (!event.ctrlKey) setSelectedAllyIds([]);
            }
            return;
        }

        setSelectedAllyIds([]);

        let clickedOnSomething = false;
        // Check for enemy ship click
        for (const enemy of enemiesRef.current) {
            const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
            if (distance < ENEMY_CLICK_RADIUS && !enemy.isAlly) {
                setTargetId(enemy.id === targetIdRef.current ? null : enemy.id);
                setAutoMoveTarget(null);
                clickedOnSomething = true;
                break;
            }
        }
        // Check for enemy station click if no ship was clicked
        if (!clickedOnSomething) {
            for (const station of stationsRef.current) {
                if (station.owner === 'enemy') {
                    const distance = Math.hypot(clickWorldX - station.x, clickWorldY - station.y);
                    if (distance < STATION_CLICK_RADIUS) {
                        setTargetId(station.id + 10000 === targetIdRef.current ? null : station.id + 10000);
                        setAutoMoveTarget(null);
                        clickedOnSomething = true;
                        break;
                    }
                }
            }
        }
        if (!clickedOnSomething) {
            setTargetId(null);
        }

      } else if (event.button === 1) { // Middle Click
        event.preventDefault();
        isMiddleMouseDown.current = true;
        if (isTacticalViewRef.current) {
            setIsPanning(true);
            lastMousePosForPan.current = { x: event.clientX, y: event.clientY };
        } else {
            setAutoMoveTarget({ x: clickWorldX, y: clickWorldY });
            setTargetId(null);
            setContextMenu(null);
        }
      } else if (event.button === 2) { // Right Click
        event.preventDefault();
        isRightMouseDown.current = true;
        setContextMenu(null);

        if (isTacticalViewRef.current && selectedAllyIdsRef.current.length > 0) {
            let targetFound = false;
            // Order to attack enemy
            for (const enemy of enemiesRef.current) {
                if (enemy.isAlly) continue;
                const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
                if (distance < ENEMY_CLICK_RADIUS) {
                    addChatMessage('Commander', `Units ${selectedAllyIdsRef.current.join(', ')} ordered to attack target ${enemy.id}.`, 'text-cyan-400');
                    setEnemies(prev => prev.map(e => selectedAllyIdsRef.current.includes(e.id) ? { ...e, aiState: 'chasing', combatTargetId: enemy.id, orderTarget: null } : e));
                    targetFound = true;
                    break;
                }
            }
            if (!targetFound) {
                 addChatMessage('Commander', `Units ${selectedAllyIdsRef.current.join(', ')} ordered to move.`, 'text-cyan-400');
                 setEnemies(prev => prev.map(e => selectedAllyIdsRef.current.includes(e.id) ? { 
                    ...e, 
                    aiState: 'moving_to_order', 
                    orderTarget: {x: clickWorldX, y: clickWorldY}, 
                    combatTargetId: null 
                } : e));
            }
            return;
        }

        // Open context menu (non-tactical)
        for (const enemy of enemiesRef.current) {
          const distance = Math.hypot(clickWorldX - enemy.x, clickWorldY - enemy.y);
          if (distance < ENEMY_CLICK_RADIUS * 2) {
            setContextMenu({ x: event.clientX, y: event.clientY, worldX: clickWorldX, worldY: clickWorldY, targetId: enemy.id, targetType: enemy.isAlly ? 'ally' : 'enemy' });
            return;
          }
        }
        for (const asteroid of asteroidsRef.current) {
          const distance = Math.hypot(clickWorldX - asteroid.x, clickWorldY - asteroid.y);
          if (distance < asteroid.size * ASTEROID_COLLISION_RADIUS) { 
            setContextMenu({ x: event.clientX, y: event.clientY, worldX: clickWorldX, worldY: clickWorldY, targetId: asteroid.id, targetType: 'asteroid' });
            return;
          }
        }
        for (const station of stationsRef.current) {
            const distance = Math.hypot(clickWorldX - station.x, station.y - clickWorldY);
            if (distance < STATION_INTERACTION_RADIUS) {
              setContextMenu({ x: event.clientX, y: event.clientY, worldX: clickWorldX, worldY: clickWorldY, targetId: station.id, targetType: 'station' });
              return;
            }
          }
      }
    };
    
    const handleMouseUp = (event: MouseEvent) => {
        if (event.button === 0) {
            isLeftMouseDown.current = false;
        }
        if (event.button === 1) { // Middle mouse up
            isMiddleMouseDown.current = false;
            setIsPanning(false);
        }
        if (event.button === 2) { // Right mouse up
            isRightMouseDown.current = false;
        }
    };
    
    const handleWheel = (event: WheelEvent) => {
        if (isModalOpen) return;
        event.preventDefault();
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current - event.deltaY * ZOOM_SENSITIVITY));
        setZoom(newZoom);
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
  }, [viewSize, isModalOpen, handleActionSelect, isPlacingReinforcements, addChatMessage, handleCallReinforcements]);

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
    const shipInfo = SHIP_DATA[ship.class];
    const maxHealth = shipInfo.baseHealth * 3 + UPGRADE_VALUES.maxHealth[upgrades.maxHealth];
    const maxEnergy = shipInfo.maxEnergy;

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
    else if (energy < maxEnergy * 0.4) newSystems.power = 'Damaged';

    setVesselSystems(newSystems);
  }, [playerData, shipMode, isPlayerActionInProgress]);

  useEffect(() => {
    const mainStation = stations.find(s => s.owner === 'player');
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
      
      if (!isTacticalViewRef.current) {
        setCameraPosition(playerPositionRef.current);
      }

      // Apply environmental damage from zones
      for(const zone of zones) {
          if (zone.type === 'nebula') {
              const checkAndDamage = (entity: {x:number, y:number, health:number}, applyDmg: (d:number) => void, isAlly: boolean) => {
                  const distToCenter = Math.hypot(entity.x - zone.x, entity.y - zone.y);
                  if (distToCenter < zone.radius) {
                      applyDmg(NEBULA_DAMAGE_PER_FRAME);
                  }
              }
              checkAndDamage(playerPositionRef.current, (dmg) => applyDamage(dmg), true);
              setEnemies(prev => prev.map(e => {
                  const dist = Math.hypot(e.x - zone.x, e.y - zone.y);
                  if(dist < zone.radius) {
                      return {...e, health: e.health - NEBULA_DAMAGE_PER_FRAME};
                  }
                  return e;
              }));
          }
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
          currentMaxSpeed = MAX_SPEED * 40; // Increased speed
          currentAccel = ACCELERATION * 20.0;
          currentStrafe = STRAFE_ACCELERATION * 0.1;
      } else if (shipModeRef.current === 'stealth') {
          currentMaxSpeed = MAX_SPEED * 0.8;
          currentAccel = ACCELERATION * 0.8;
      }
      
      const mouseWorldX = cameraPositionRef.current.x + (mousePosition.current.x - viewSize.width / 2) / zoomRef.current;
      const mouseWorldY = cameraPositionRef.current.y + (mousePosition.current.y - viewSize.height / 2) / zoomRef.current;
      const aimAngle = Math.atan2(mouseWorldY - playerPositionRef.current.y, mouseWorldX - playerPositionRef.current.x) * (180 / Math.PI);
      setAimRotation(aimAngle);
      
      if (!isTacticalViewRef.current && isLeftMouseDown.current) {
        setPlayerRotation(aimAngle);
      }

      const accelVec = { x: 0, y: 0 };
      const isMovementDisabled = isPlayerActionInProgress || shipModeRef.current === 'scan' || cruiseStateRef.current === 'charging';

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
                    const shipInfo = SHIP_DATA[playerDataRef.current.ship.class];
                    const miningDuration = shipInfo.miningBonus ? MINING_DURATION_MS / shipInfo.miningBonus : MINING_DURATION_MS;
                    addChatMessage('System', `Mining laser engaged on asteroid #${miningTargetId}.`, 'text-green-400');
                    setPlayerAction({ type: 'mining', targetId: miningTargetId, startTime: Date.now(), duration: miningDuration });
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

      
      const currentTarget = targetIdRef.current !== null
        ? (targetIdRef.current >= 10000 
            ? stationsRef.current.find(s => s.id === targetIdRef.current! - 10000) 
            : enemiesRef.current.find(e => e.id === targetIdRef.current))
        : null;
      const canShoot = (shipMode === 'normal' || shipMode === 'stealth' || shipMode === 'shield') && cruiseStateRef.current === 'idle' && !isPlayerActionInProgress;
      const isShootingManually = keysPressed.current.has(' ');
      const playerShipConfig = SHIP_DATA[playerDataRef.current.ship.class];

      // Auto-fire on locked target
      if (activeWeapons.manualTurrets && playerShipConfig.weapons.manualTurrets && currentTarget && canShoot && timestamp - lastFiredTimestamp.current > FIRE_RATE_MS) {
        const { manualTurrets } = playerShipConfig.weapons;
        if (playerDataRef.current.energy >= ENERGY_PER_SHOT * manualTurrets.count) {
          lastFiredTimestamp.current = timestamp;
          lastEnergyUseTimestamp.current = timestamp;
          setPlayerData(d => ({ ...d, energy: d.energy - (ENERGY_PER_SHOT * manualTurrets.count) }));
          const shipRotRad = playerRotationRef.current * (Math.PI / 180);
          
          const newProjectiles: ProjectileState[] = [];
          for (const offset of manualTurrets.offsets) {
              const rotatedOffsetX = offset.x * Math.cos(shipRotRad) - offset.y * Math.sin(shipRotRad);
              const rotatedOffsetY = offset.x * Math.sin(shipRotRad) + offset.y * Math.cos(shipRotRad);
              const turretX = playerPositionRef.current.x + rotatedOffsetX;
              const turretY = playerPositionRef.current.y + rotatedOffsetY;
              const fireRotation = Math.atan2(currentTarget.y - turretY, currentTarget.x - turretX) * (180 / Math.PI);

              newProjectiles.push({ 
                  id: getUniqueId(), 
                  x: turretX, y: turretY, startX: turretX, startY: turretY,
                  rotation: fireRotation, ownerId: -1, type: manualTurrets.type 
              });
          }
          if (newProjectiles.length > 0) {
              setPlayerProjectiles(prev => [...prev, ...newProjectiles]);
          }
        }
      } 
      // Manual fire at cursor (no lock)
      else if (activeWeapons.manualTurrets && playerShipConfig.weapons.manualTurrets && isShootingManually && !currentTarget && canShoot && timestamp - lastFiredTimestamp.current > FIRE_RATE_MS) {
        const { manualTurrets } = playerShipConfig.weapons;
        if (playerDataRef.current.energy >= ENERGY_PER_SHOT * manualTurrets.count) {
            lastFiredTimestamp.current = timestamp;
            lastEnergyUseTimestamp.current = timestamp;
            setPlayerData(d => ({ ...d, energy: d.energy - (ENERGY_PER_SHOT * manualTurrets.count) }));
            const shipRotRad = playerRotationRef.current * (Math.PI / 180);
            
            const newProjectiles: ProjectileState[] = [];
            for (const offset of manualTurrets.offsets) {
                const rotatedOffsetX = offset.x * Math.cos(shipRotRad) - offset.y * Math.sin(shipRotRad);
                const rotatedOffsetY = offset.x * Math.sin(shipRotRad) + offset.y * Math.cos(shipRotRad);
                
                const turretX = playerPositionRef.current.x + rotatedOffsetX;
                const turretY = playerPositionRef.current.y + rotatedOffsetY;

                const mouseVecX = mouseWorldX - playerPositionRef.current.x;
                const mouseVecY = mouseWorldY - playerPositionRef.current.y;
                const adjustedMouseX = turretX + mouseVecX;
                const adjustedMouseY = turretY + mouseVecY;
                const fireRotation = Math.atan2(adjustedMouseY - turretY, adjustedMouseX - turretX) * (180 / Math.PI);

                newProjectiles.push({ 
                    id: getUniqueId(), 
                    x: turretX, y: turretY, startX: turretX, startY: turretY,
                    rotation: fireRotation, ownerId: -1, type: manualTurrets.type 
                });
            }
            if (newProjectiles.length > 0) {
                setPlayerProjectiles(prev => [...prev, ...newProjectiles]);
            }
        }
      }

      // Player auto-turret logic
      const { autoTurrets } = playerShipConfig.weapons;
      if (activeWeapons.autoTurrets && autoTurrets && autoTurrets.count > 0 && timestamp - lastPlayerAutoShotTimestamp.current > AUTO_TURRET_FIRE_RATE_MS) {
        if (playerDataRef.current.energy >= AUTO_TURRET_ENERGY_COST * autoTurrets.count) {
            let autoTarget: EnemyState | null = null;
            let minDistance = ENEMY_AGGRO_RADIUS;
            for (const enemy of enemiesRef.current) {
                if (!enemy.isAlly) {
                    const distance = Math.hypot(enemy.x - playerPositionRef.current.x, enemy.y - playerPositionRef.current.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        autoTarget = enemy;
                    }
                }
            }
            if (autoTarget) {
                lastPlayerAutoShotTimestamp.current = timestamp;
                setPlayerData(d => ({ ...d, energy: d.energy - AUTO_TURRET_ENERGY_COST * autoTurrets.count }));
                const shipRotRad = playerRotationRef.current * (Math.PI / 180);
                
                const newAutoProjectiles: ProjectileState[] = [];
                for (const offset of autoTurrets.offsets) {
                    const rotatedOffsetX = offset.x * Math.cos(shipRotRad) - offset.y * Math.sin(shipRotRad);
                    const rotatedOffsetY = offset.x * Math.sin(shipRotRad) + offset.y * Math.cos(shipRotRad);
                    const turretX = playerPositionRef.current.x + rotatedOffsetX;
                    const turretY = playerPositionRef.current.y + rotatedOffsetY;
                    const fireRotation = Math.atan2(autoTarget.y - turretY, autoTarget.x - turretX) * (180 / Math.PI);
                    newAutoProjectiles.push({ 
                        id: getUniqueId(), 
                        x: turretX,
                        y: turretY,
                        startX: turretX,
                        startY: turretY,
                        rotation: fireRotation, 
                        ownerId: -1, 
                        type: autoTurrets.type 
                    });
                }
                  if (newAutoProjectiles.length > 0) {
                    setPlayerProjectiles(prev => [...prev, ...newAutoProjectiles]);
                }
            }
        }
      }
        
      // Beam weapon logic for player (AUTOMATIC)
      const { beam } = playerShipConfig.weapons;
      const isBeamWeaponEnabled = activeWeapons.beam && beam && beam.count > 0 && canShoot;
      let beamTarget: EnemyState | null = null;

      // Find a target if the beam weapon is enabled
      if (isBeamWeaponEnabled && playerDataRef.current.energy > 0) {
          let minDistance = BEAM_RANGE;
          for (const enemy of enemiesRef.current) {
              if (!enemy.isAlly) {
                  const distance = Math.hypot(enemy.x - playerPositionRef.current.x, enemy.y - playerPositionRef.current.y);
                  if (distance < minDistance) {
                      minDistance = distance;
                      beamTarget = enemy;
                  }
              }
          }
      }

      // Manage active beams based on the target
      const existingPlayerBeams = activeBeamsRef.current.filter(b => b.sourceId === -1);

      if (beamTarget && playerDataRef.current.energy > 0) {
          setPlayerData(d => ({ ...d, energy: Math.max(0, d.energy - BEAM_ENERGY_DRAIN_PER_FRAME) }));
          lastEnergyUseTimestamp.current = timestamp;

          if (existingPlayerBeams.length === 0 && beam) {
              const newBeams: BeamState[] = [];
              for (const offset of beam.offsets) {
                  newBeams.push({
                      id: getUniqueId(),
                      sourceId: -1,
                      targetId: beamTarget.id,
                      type: beam.type,
                      sourceOffsetX: offset.x,
                      sourceOffsetY: offset.y,
                      isAlly: true
                  });
              }
              setActiveBeams(prev => [...prev, ...newBeams]);
          } else { 
              setActiveBeams(prev => prev.map(b => b.sourceId === -1 ? { ...b, targetId: beamTarget!.id } : b));
          }
      } else { 
          if (existingPlayerBeams.length > 0) {
              setActiveBeams(prev => prev.filter(b => b.sourceId !== -1));
          }
      }

      if (playerActionRef.current) {
          const action = playerActionRef.current;
          const elapsed = Date.now() - action.startTime;
          const progress = Math.min((elapsed / action.duration) * 100, 100);

          if (progress >= 100) {
              switch(action.type) {
                  case 'mining': {
                      addChatMessage('System', `Mining on asteroid #${action.targetId} complete.`, 'text-cyan-400');
                      const asteroid = asteroidsRef.current.find(a => a.id === action.targetId);
                      if (asteroid && asteroid.mineableCharges > 0) {
                          const oreGained = Math.floor(Math.random() * 26) + 25;
                          const gasGained = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0;
                          
                          setPlayerData(d => {
                              const { ship, upgrades, cargo } = d;
                              const maxCargo = SHIP_DATA[ship.class].baseCargo + UPGRADE_VALUES.cargoCapacity[upgrades.cargoCapacity];
                              const availableSpace = maxCargo - cargo.current;
                              
                              const cargoInDebris = oreGained + gasGained;
                              let oreToAdd = oreGained;
                              let gasToAdd = gasGained;

                              if (cargoInDebris > availableSpace && cargoInDebris > 0) {
                                  const overflowRatio = availableSpace / cargoInDebris;
                                  oreToAdd = Math.floor(oreToAdd * overflowRatio);
                                  gasToAdd = Math.floor(gasToAdd * overflowRatio);
                                  
                                  const overflowOre = oreGained - oreToAdd;
                                  const overflowGas = gasGained - gasToAdd;
                                  
                                  if (overflowOre > 0 || overflowGas > 0) {
                                      setDebris(prev => [...prev, {
                                          id: getUniqueId(),
                                          x: playerPositionRef.current.x + (Math.random() * 100 - 50) + 50,
                                          y: playerPositionRef.current.y + (Math.random() * 100 - 50) + 50,
                                          resources: { ore: overflowOre, gas: overflowGas, money: 0 }
                                      }]);
                                  }
                              }
                              
                              addChatMessage('System', `Extracted ${oreToAdd} ore and ${gasToAdd} gas.`, 'text-cyan-400');

                              return {
                                  ...d,
                                  resources: { 
                                      ...d.resources, 
                                      ore: d.resources.ore + oreToAdd,
                                      gas: d.resources.gas + gasToAdd,
                                  },
                                  cargo: { current: Math.max(0, cargo.current + oreToAdd + gasToAdd) }
                              };
                          });
                          
                          setAsteroids(prev => prev.map(a => {
                              if (a.id === action.targetId) {
                                  const newCharges = a.mineableCharges - 1;
                                  if (newCharges <= 0) {
                                      addChatMessage('System', `Asteroid #${a.id} depleted.`, 'text-yellow-400');
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
                              id: getUniqueId(), x: targetEnemy.x, y: targetEnemy.y,
                              resources: {
                                  money: Math.floor(Math.random() * 51),
                                  ore: Math.floor(Math.random() * 11),
                                  gas: Math.floor(Math.random() * 6),
                              }
                          };
                          setDebris(prev => [...prev, newDebris]);
                          addChatMessage('System', "Pillage successful, enemy cargo dropped.", 'text-green-400');
                      }
                      break;
                  }
                  case 'boarding': {
                      const targetEnemy = enemiesRef.current.find(e => e.id === action.targetId);
                      if (targetEnemy) {
                          const success = Math.random() < BOARDING_SUCCESS_CHANCE;
                          if (success) {
                              setEnemies(prev => prev.map(e => e.id === action.targetId ? { ...e, isAlly: true, aiState: 'following', followTargetId: -1 } : e));
                              addChatMessage('System', `Successfully boarded enemy ${targetEnemy.type}. It's now an ally.`, 'text-green-400');
                          } else {
                              applyDamage(BOARDING_FAIL_DAMAGE);
                              addChatMessage('System', 'Boarding Failed! Your crew was repelled and sustained damage.', 'text-red-400');
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
      const shipInfo = SHIP_DATA[ship.class];
      const maxHealth = shipInfo.baseHealth * 3 + UPGRADE_VALUES.maxHealth[upgrades.maxHealth];
      const maxEnergy = shipInfo.maxEnergy;
      
      const baseEnergyRecharge = shipInfo.baseEnergyRecharge + UPGRADE_VALUES.energyRecharge[upgrades.energyRecharge];
      const antimatterRechargeRate = UPGRADE_VALUES.antimatterReactor[upgrades.antimatterReactor] || 0;
      const nanobotRechargeRate = UPGRADE_VALUES.nanobots[upgrades.nanobots];
      const ENERGY_REGEN_DELAY_MS = 2000;

      if (cheats.infiniteMoney) {
          setPlayerData(d => ({ ...d, resources: {...d.resources, money: 999999 } }));
      }
      
      if (cheats.infiniteEnergy) {
          setPlayerData(d => ({ ...d, energy: maxEnergy }));
      } else {
        if (antimatterRechargeRate > 0) {
          setPlayerData(d => ({ ...d, energy: Math.min(maxEnergy, d.energy + antimatterRechargeRate) }));
        }

        if (shipModeRef.current === 'shield') {
          setPlayerData(d => {
              if (d.energy > 0) {
                  lastEnergyUseTimestamp.current = timestamp;
                  return { ...d, energy: Math.max(0, d.energy - SHIELD_ENERGY_DRAIN_RATE) };
              }
              return d;
          });
          if (playerDataRef.current.energy <= 0) {
              setShipMode('normal');
          }
        } else if (timestamp - lastEnergyUseTimestamp.current > ENERGY_REGEN_DELAY_MS) {
            setPlayerData(d => ({ ...d, energy: Math.min(maxEnergy, d.energy + baseEnergyRecharge) }));
        }
      }

      if (cheats.infiniteHealth) {
          setPlayerData(d => ({ ...d, health: maxHealth }));
      } else {
         if(nanobotRechargeRate > 0) setPlayerData(d => ({...d, health: Math.min(maxHealth, d.health + nanobotRechargeRate)}));
      }

      if (isDocked) {
          setPlayerData(d => ({ ...d, health: Math.min(maxHealth, d.health + STATION_PLAYER_REGEN_RATE), energy: Math.min(maxEnergy, d.energy + STATION_PLAYER_REGEN_RATE * 5) }));
      }
      
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
          .filter(p => {
              const dist = Math.hypot(p.x - p.startX, p.y - p.startY);
              if (dist > PROJECTILE_MAX_RANGE) return false;
              return p.x > -10 && p.x < MAP_WIDTH + 10 && p.y > -10 && p.y < MAP_HEIGHT + 10;
          })
      );
      setEnemyProjectiles(prev => prev
          .map(p => {
              const rad = p.rotation * (Math.PI / 180);
              return { ...p, x: p.x + Math.cos(rad) * PROJECTILE_SPEED, y: p.y + Math.sin(rad) * PROJECTILE_SPEED };
          })
          .filter(p => {
              const dist = Math.hypot(p.x - p.startX, p.y - p.startY);
              if (dist > PROJECTILE_MAX_RANGE) return false;
              return p.x > -10 && p.x < MAP_WIDTH + 10 && p.y > -10 && p.y < MAP_HEIGHT + 10;
          })
      );
      
      let newProjectilesFromStations: ProjectileState[] = [];
      setStations(prev => prev.map(station => {
          if (timestamp - station.lastHitTimestamp > STATION_FIRE_RATE_MS) {
              const visionSources = station.owner === 'player' 
                ? [playerPositionRef.current, ...enemiesRef.current.filter(e => e.isAlly)] 
                : [...enemiesRef.current.filter(e => !e.isAlly)];

              const potentialTargets = [...enemiesRef.current, { ...playerDataRef.current, id: -1, isAlly: true }].filter(
                  e => (station.owner === 'player' && !e.isAlly) || (station.owner === 'enemy' && e.isAlly)
              );
              
              let closestTarget: {id: number, x: number, y: number, dist: number} | null = null;
              
              for (const pTarget of potentialTargets) {
                  const canSee = visionSources.some(source => Math.hypot(source.x - pTarget.x, source.y - pTarget.y) < STATION_RANGE);
                  if (canSee) {
                     const dist = Math.hypot(station.x - pTarget.x, station.y - pTarget.y);
                     if (!closestTarget || dist < closestTarget.dist) {
                         closestTarget = { id: pTarget.id, x: pTarget.x, y: pTarget.y, dist };
                     }
                  }
              }

              if (closestTarget) {
                  const angleToTarget = Math.atan2(closestTarget.y - station.y, closestTarget.x - station.x);
                  newProjectilesFromStations.push({
                      id: getUniqueId(),
                      x: station.x, y: station.y,
                      startX: station.x, startY: station.y,
                      rotation: angleToTarget * (180 / Math.PI),
                      ownerId: station.id,
                      type: 'basic'
                  });
                  return { ...station, lastHitTimestamp: timestamp };
              }
          }
          return station;
      }));

      if (newProjectilesFromStations.length > 0) {
          // Determine if projectiles are from enemy or player station
          const fromPlayerStation = stationsRef.current.find(s => s.id === newProjectilesFromStations[0].ownerId)?.owner === 'player';
          if (fromPlayerStation) {
            setPlayerProjectiles(proj => [...proj, ...newProjectilesFromStations]);
          } else {
            setEnemyProjectiles(proj => [...proj, ...newProjectilesFromStations]);
          }
      }

      setOutposts(prev => prev.map(outpost => {
          if (timestamp - outpost.lastShotTimestamp > OUTPOST_FIRE_RATE_MS) {
              let closestEnemy: EnemyState | null = null;
              let minDistance = OUTPOST_RANGE;

              for (const enemy of enemiesRef.current) {
                  if (enemy.isAlly) continue;
                  const distance = Math.hypot(outpost.x - enemy.x, outpost.y - enemy.y);
                  if (distance < minDistance) {
                      minDistance = distance;
                      closestEnemy = enemy;
                  }
              }

              if (closestEnemy) {
                  const angleToTarget = Math.atan2(closestEnemy.y - outpost.y, closestEnemy.x - outpost.x);
                  const outpostX = outpost.x;
                  const outpostY = outpost.y;
                  setPlayerProjectiles(proj => [...proj, {
                      id: getUniqueId(),
                      x: outpostX,
                      y: outpostY,
                      startX: outpostX,
                      startY: outpostY,
                      rotation: angleToTarget * (180 / Math.PI),
                      ownerId: outpost.id,
                      type: 'basic'
                  }]);
                  return { ...outpost, lastShotTimestamp: timestamp };
              }
          }
          return outpost;
      }));


      const newEnemyProjectiles: ProjectileState[] = [];
      const hitProjectileIds = new Set<number>();
      const newDebrisFromKills: DebrisType[] = [];

      let currentActiveBeams = [...activeBeamsRef.current];
      const newExplosions: Effect[] = [];

      let processedEnemies = enemiesRef.current.map(enemy => {
          if (enemy.despawnTimestamp && timestamp > enemy.despawnTimestamp) {
            const warpId = getUniqueId();
            setWarpEffects(prev => [...prev, { id: warpId, x: enemy.x, y: enemy.y }]);
            if (enemy.id === targetIdRef.current) setTargetId(null);
            if (selectedAllyIdsRef.current.includes(enemy.id)) {
                setSelectedAllyIds(prev => prev.filter(id => id !== enemy.id));
            }
            return null; // This ship will be filtered out
          }
          let updatedEnemy = { ...enemy };
          const enemyShipInfo = SHIP_DATA[updatedEnemy.type];

          // Check if it's an ally following the player and the player is cruising
          if (updatedEnemy.isAlly && updatedEnemy.aiState === 'following') {
            const targetToFollow = updatedEnemy.followTargetId === -1 
                ? playerPositionRef.current
                : enemiesRef.current.find(e => e.id === updatedEnemy.followTargetId);
            
            if (targetToFollow) {
                const distanceToTarget = Math.hypot(targetToFollow.x - updatedEnemy.x, targetToFollow.y - updatedEnemy.y);
                const playerIsCruising = cruiseStateRef.current === 'cruising';
                const canCruise = timestamp >= (updatedEnemy.cruiseAvailableAt || 0) && updatedEnemy.energy >= CRUISE_ENERGY_COST;

                if ((playerIsCruising || distanceToTarget > 400) && updatedEnemy.cruiseState === 'idle' && canCruise) {
                    updatedEnemy.cruiseState = 'charging';
                    updatedEnemy.energy -= CRUISE_ENERGY_COST;
                } else if (!playerIsCruising && distanceToTarget < 300 && updatedEnemy.cruiseState !== 'idle') {
                    updatedEnemy.cruiseState = 'idle';
                }
            }
          }

          // --- AI CRUISE STATE MACHINE ---
          if (updatedEnemy.cruiseState === 'charging') {
              if (!updatedEnemy.cruiseChargeStartTimestamp) updatedEnemy.cruiseChargeStartTimestamp = timestamp;
              if (timestamp - (updatedEnemy.cruiseChargeStartTimestamp || 0) > CRUISE_CHARGE_TIME) {
                  updatedEnemy.cruiseState = 'cruising';
                  updatedEnemy.cruiseChargeStartTimestamp = 0;
                  updatedEnemy.cruiseDurationStartTimestamp = timestamp;
              }
          }
          if (updatedEnemy.cruiseState === 'cruising') {
              if (!updatedEnemy.cruiseDurationStartTimestamp) updatedEnemy.cruiseDurationStartTimestamp = timestamp;
              if (timestamp - (updatedEnemy.cruiseDurationStartTimestamp || 0) > CRUISE_DURATION) {
                  updatedEnemy.cruiseState = 'idle';
                  updatedEnemy.cruiseDurationStartTimestamp = 0;
                  updatedEnemy.cruiseAvailableAt = timestamp + CRUISE_COOLDOWN_MS;
              }
          }
          
          if (timestamp - updatedEnemy.lastEnergyUseTimestamp > ENEMY_ENERGY_REGEN_DELAY_MS) {
              updatedEnemy.energy = Math.min(updatedEnemy.maxEnergy, updatedEnemy.energy + enemyShipInfo.baseEnergyRecharge);
          }
          
          let collisionRadius = ENEMY_COLLISION_RADIUS;
          if (enemy.type === 'Frégate') collisionRadius = FRIGATE_COLLISION_RADIUS;
          else if (enemy.type === 'Mineur') collisionRadius = STAFF_COLLISION_RADIUS;

          // Projectile hits on this enemy
          for (const proj of [...playerProjectilesRef.current, ...enemyProjectilesRef.current]) {
              if (hitProjectileIds.has(proj.id)) continue;
              if (proj.ownerId === updatedEnemy.id) continue;
              
              const projOwnerIsPlayer = proj.ownerId === -1 || outpostsRef.current.some(o => o.id === proj.ownerId) || stationsRef.current.find(s => s.id === proj.ownerId)?.owner === 'player';
              const projOwner = enemiesRef.current.find(e => e.id === proj.ownerId);

              // Faction check: can't hit allies
              if ((projOwnerIsPlayer && updatedEnemy.isAlly) || (projOwner && projOwner.isAlly === updatedEnemy.isAlly)) {
                 continue;
              }

              const distance = Math.hypot(proj.x - updatedEnemy.x, proj.y - updatedEnemy.y);
              if (distance < collisionRadius) {
                  hitProjectileIds.add(proj.id);
                  const damage = projOwnerIsPlayer ? (proj.type === 'heavy' ? HEAVY_PLAYER_PROJECTILE_DAMAGE : PLAYER_PROJECTILE_DAMAGE) : ENEMY_PROJECTILE_DAMAGE;
                  updatedEnemy.health -= damage;
                  const attackerId = proj.ownerId === -1 ? -1 : (projOwner?.id || null);
                  updatedEnemy.lastAttackerId = attackerId;
                  
                  const attacker = projOwnerIsPlayer 
                    ? {x: playerPositionRef.current.x, y: playerPositionRef.current.y} 
                    : enemiesRef.current.find(e => e.id === proj.ownerId);

                  if (updatedEnemy.aiState !== 'fleeing') {
                      if (attacker && !updatedEnemy.isAlly) { // Don't make allies aggressive
                          updatedEnemy.combatTargetId = attackerId;
                          updatedEnemy.aiState = 'chasing';
                      }
                  }
              }
          }


          if (updatedEnemy.health <= 0) {
              newExplosions.push({ id: getUniqueId(), x: updatedEnemy.x, y: updatedEnemy.y, size: 1 });
              if (!updatedEnemy.isAlly) {
                newDebrisFromKills.push({
                    id: getUniqueId(),
                    x: updatedEnemy.x,
                    y: updatedEnemy.y,
                    resources: { 
                      money: Math.floor(Math.random() * 51) + 20, 
                      ore: Math.floor(Math.random() * 21) + 5 + updatedEnemy.cargo, 
                      gas: Math.floor(Math.random() * 6) + 1 
                    }
                });
                setEnemyFactionData(prev => ({
                    ...prev,
                    shipCounts: { ...prev.shipCounts, [updatedEnemy.type]: Math.max(0, prev.shipCounts[updatedEnemy.type] - 1) }
                }));
              }
              if (updatedEnemy.id === targetIdRef.current) setTargetId(null);
              if (selectedAllyIdsRef.current.includes(updatedEnemy.id)) {
                  setSelectedAllyIds(prev => prev.filter(id => id !== enemy.id));
              }
              return null;
          }

          // --- AI LOGIC ---
          const isLowHealth = (updatedEnemy.health / updatedEnemy.maxHealth) < ENEMY_FLEE_HEALTH_THRESHOLD;
          const isLowEnergy = (updatedEnemy.energy / updatedEnemy.maxEnergy) < LOW_ENERGY_FLEE_THRESHOLD;

          if (isLowHealth && updatedEnemy.aiState !== 'fleeing') {
              updatedEnemy.aiState = 'fleeing';
              updatedEnemy.combatTargetId = null;
          } else if (isLowEnergy && !isLowHealth && updatedEnemy.aiState === 'chasing' && updatedEnemy.aiState !== 'recharging') {
              updatedEnemy.aiState = 'recharging';
              updatedEnemy.combatTargetId = null;
              updatedEnemy.stateChangeTimestamp = timestamp;
          } else if (updatedEnemy.aiState === 'recharging' && !isLowEnergy) {
              updatedEnemy.aiState = 'patrolling';
          }
          
          
          // 1. Target Acquisition
          if (['patrolling', 'guarding', 'holding_position', 'deep_patrolling'].includes(updatedEnemy.aiState)) {
              const visionSources = updatedEnemy.isAlly 
                ? [playerPositionRef.current, ...enemiesRef.current.filter(e => e.isAlly)] 
                : [...enemiesRef.current.filter(e => !e.isAlly)];
              
              const potentialTargets = [
                  {id: -1, x: playerPositionRef.current.x, y: playerPositionRef.current.y, isAlly: true, health: playerDataRef.current.health}, 
                  ...enemiesRef.current,
                  ...stationsRef.current.map(s => ({id: s.id + 10000, x: s.x, y: s.y, isAlly: s.owner === 'player', health: s.health + s.shield})),
              ].filter(e => e.isAlly !== updatedEnemy.isAlly && e.health > 0);
              
              let closestTarget: {id: number, dist: number} | null = null;

              for (const pTarget of potentialTargets) {
                  const canSee = visionSources.some(source => Math.hypot(source.x - pTarget.x, source.y - pTarget.y) < ENEMY_AGGRO_RADIUS);
                  if (canSee) {
                     const dist = Math.hypot(updatedEnemy.x - pTarget.x, updatedEnemy.y - pTarget.y);
                     if (!closestTarget || dist < closestTarget.dist) {
                         closestTarget = { id: pTarget.id, dist };
                     }
                  }
              }

              if (closestTarget) {
                  if (updatedEnemy.aiState !== 'following') { // Don't interrupt follow order unless attacked
                    updatedEnemy.combatTargetId = closestTarget.id;
                    updatedEnemy.aiState = 'chasing';
                  }
              }
          }

          // 2. Execute State Action
          const speedMultiplier = updatedEnemy.cruiseState === 'cruising' ? 40 : 1;
          
          // Flocking / Separation
          let separation = { x: 0, y: 0 };
          for (const other of enemiesRef.current) {
              if (other.id !== updatedEnemy.id && other.isAlly === updatedEnemy.isAlly) {
                  const dist = Math.hypot(updatedEnemy.x - other.x, updatedEnemy.y - other.y);
                  if (dist > 0 && dist < AI_SEPARATION_DISTANCE) {
                      separation.x += (updatedEnemy.x - other.x) / dist;
                      separation.y += (updatedEnemy.y - other.y) / dist;
                  }
              }
          }
          
          const accelFromSeparation = { x: separation.x * 0.1, y: separation.y * 0.1 };
          let finalAccel = { x: accelFromSeparation.x, y: accelFromSeparation.y };

          switch(updatedEnemy.aiState) {
            case 'holding_position':
                // Do nothing, just wait for orders or threats.
                break;
            case 'moving_to_order': {
                if (updatedEnemy.orderTarget) {
                    const distance = Math.hypot(updatedEnemy.orderTarget.x - updatedEnemy.x, updatedEnemy.orderTarget.y - updatedEnemy.y);
                    if (distance > 20) {
                        const angleToTarget = Math.atan2(updatedEnemy.orderTarget.y - updatedEnemy.y, updatedEnemy.orderTarget.x - updatedEnemy.x);
                        finalAccel.x += Math.cos(angleToTarget) * ACCELERATION * 0.8 * speedMultiplier;
                        finalAccel.y += Math.sin(angleToTarget) * ACCELERATION * 0.8 * speedMultiplier;
                    } else {
                        updatedEnemy.aiState = 'holding_position';
                        updatedEnemy.orderTarget = null;
                    }
                } else {
                    updatedEnemy.aiState = 'guarding';
                }
                break;
            }
            case 'patrolling_order': {
                if (updatedEnemy.orderTarget) {
                    const distance = Math.hypot(updatedEnemy.orderTarget.x - updatedEnemy.x, updatedEnemy.orderTarget.y - updatedEnemy.y);
                     if (distance > GUARD_PATROL_RADIUS) {
                        const angleToTarget = Math.atan2(updatedEnemy.orderTarget.y - updatedEnemy.y, updatedEnemy.orderTarget.x - updatedEnemy.x);
                        finalAccel.x += Math.cos(angleToTarget) * ACCELERATION * 0.5 * speedMultiplier;
                        finalAccel.y += Math.sin(angleToTarget) * ACCELERATION * 0.5 * speedMultiplier;
                    } else {
                        updatedEnemy.aiState = 'patrolling';
                        updatedEnemy.patrolCenter = updatedEnemy.orderTarget;
                        updatedEnemy.orderTarget = null;
                    }
                } else {
                     updatedEnemy.aiState = 'patrolling';
                }
                break;
            }
            case 'guarding': {
                const playerBase = stationsRef.current.find(s => s.owner === (updatedEnemy.isAlly ? 'player' : 'enemy'));
                const center = playerBase ? {x: playerBase.x, y: playerBase.y} : {x: 1500, y: MAP_HEIGHT/2};
                
                if (!updatedEnemy.patrolTarget || Math.hypot(updatedEnemy.x - updatedEnemy.patrolTarget.x, updatedEnemy.y - updatedEnemy.patrolTarget.y) < 50) {
                     if (timestamp - updatedEnemy.stateChangeTimestamp > 5000) {
                        const randomAngle = Math.random() * 2 * Math.PI;
                        const randomDist = Math.random() * GUARD_PATROL_RADIUS;
                        updatedEnemy.patrolTarget = {
                            x: center.x + Math.cos(randomAngle) * randomDist,
                            y: center.y + Math.sin(randomAngle) * randomDist,
                        };
                        updatedEnemy.stateChangeTimestamp = timestamp;
                     }
                } else {
                    const angleToTarget = Math.atan2(updatedEnemy.patrolTarget.y - updatedEnemy.y, updatedEnemy.patrolTarget.x - updatedEnemy.x);
                    finalAccel.x += Math.cos(angleToTarget) * ACCELERATION * 0.3 * speedMultiplier;
                    finalAccel.y += Math.sin(angleToTarget) * ACCELERATION * 0.3 * speedMultiplier;
                }
                break;
            }
             case 'deep_patrolling':
            case 'patrolling': {
                 if (updatedEnemy.role === 'miner' && (updatedEnemy.cargo || 0) < MINER_CARGO_PER_TRIP) {
                    let closestAsteroid: AsteroidState | null = null;
                    let minDistance = Infinity;
                    for (const asteroid of asteroidsRef.current) {
                        if (asteroid.cooldownUntil > timestamp || asteroid.mineableCharges <= 0) continue;
                        const distance = Math.hypot(asteroid.x - updatedEnemy.x, asteroid.y - updatedEnemy.y);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestAsteroid = asteroid;
                        }
                    }
                    if (closestAsteroid) {
                        updatedEnemy.targetObjectId = closestAsteroid.id;
                        updatedEnemy.aiState = 'mining';
                        break;
                    }
                }

                const base = updatedEnemy.isAlly ? stationsRef.current.find(s => s.owner === 'player') : stationsRef.current.find(s => s.owner === 'enemy');
                const center = updatedEnemy.patrolCenter ?? (base ? {x: base.x, y: base.y} : {x: MAP_WIDTH/2, y: MAP_HEIGHT/2});
                const patrolRadius = updatedEnemy.aiState === 'deep_patrolling' ? MAP_WIDTH : GUARD_PATROL_RADIUS;

                if (!updatedEnemy.patrolTarget || Math.hypot(updatedEnemy.x - updatedEnemy.patrolTarget.x, updatedEnemy.y - updatedEnemy.patrolTarget.y) < 50) {
                     if (timestamp - updatedEnemy.stateChangeTimestamp > 5000) {
                        const randomAngle = Math.random() * 2 * Math.PI;
                        const randomDist = Math.random() * patrolRadius;
                        updatedEnemy.patrolTarget = {
                            x: center.x + Math.cos(randomAngle) * randomDist,
                            y: center.y + Math.sin(randomAngle) * randomDist,
                        };
                        updatedEnemy.stateChangeTimestamp = timestamp;
                     }
                } else {
                    const angleToTarget = Math.atan2(updatedEnemy.patrolTarget.y - updatedEnemy.y, updatedEnemy.patrolTarget.x - updatedEnemy.x);
                    finalAccel.x += Math.cos(angleToTarget) * ACCELERATION * 0.3 * speedMultiplier;
                    finalAccel.y += Math.sin(angleToTarget) * ACCELERATION * 0.3 * speedMultiplier;
                }
                
                if (updatedEnemy.role === 'miner' && updatedEnemy.cargo >= MINER_CARGO_PER_TRIP) {
                    updatedEnemy.aiState = 'returning_to_base';
                }
                break;
            }
            case 'mining': {
                if (updatedEnemy.role !== 'miner') {
                    updatedEnemy.aiState = 'patrolling';
                    break;
                }
                let targetAsteroid = asteroidsRef.current.find(a => a.id === updatedEnemy.targetObjectId);

                if (!targetAsteroid || targetAsteroid.cooldownUntil > timestamp || targetAsteroid.mineableCharges <= 0) {
                    updatedEnemy.aiState = 'patrolling';
                    updatedEnemy.targetObjectId = null;
                    break;
                }

                const distanceToAsteroid = Math.hypot(targetAsteroid.x - updatedEnemy.x, targetAsteroid.y - updatedEnemy.y);
                if (distanceToAsteroid > ASTEROID_ACTION_MAX_RANGE) {
                    const angleToAsteroid = Math.atan2(targetAsteroid.y - updatedEnemy.y, targetAsteroid.x - updatedEnemy.x);
                    finalAccel.x += Math.cos(angleToAsteroid) * ACCELERATION * 0.8;
                    finalAccel.y += Math.sin(angleToAsteroid) * ACCELERATION * 0.8;
                } else {
                    if (updatedEnemy.stateChangeTimestamp === 0) {
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    }
                    if (timestamp - updatedEnemy.stateChangeTimestamp > MINER_SIMULATED_MINE_TIME_MS) {
                        updatedEnemy.cargo = (updatedEnemy.cargo || 0) + MINER_CARGO_PER_TRIP;
                        updatedEnemy.aiState = 'returning_to_base';
                        updatedEnemy.targetObjectId = null;
                        updatedEnemy.stateChangeTimestamp = timestamp;
                    }
                }
                break;
            }
            case 'scavenging': {
                 const targetDebris = debrisRef.current.find(d => d.id === updatedEnemy.targetObjectId);
                 if (!targetDebris) {
                     updatedEnemy.aiState = 'patrolling';
                     updatedEnemy.targetObjectId = null;
                     break;
                 }
                 const angleToDebris = Math.atan2(targetDebris.y - updatedEnemy.y, targetDebris.x - updatedEnemy.x);
                 finalAccel.x += Math.cos(angleToDebris) * ACCELERATION * 0.5;
                 finalAccel.y += Math.sin(angleToDebris) * ACCELERATION * 0.5;
                 break;
            }
            case 'returning_to_base': {
                const faction = updatedEnemy.isAlly ? 'player' : 'enemy';
                const homeBase = stationsRef.current.find(s => s.owner === faction);
                if (!homeBase) {
                     updatedEnemy.aiState = 'patrolling';
                     break;
                }
                const distanceToStation = Math.hypot(homeBase.x - updatedEnemy.x, homeBase.y - updatedEnemy.y);
                if (distanceToStation > STATION_INTERACTION_RADIUS * 0.5) {
                    const angleToStation = Math.atan2(homeBase.y - updatedEnemy.y, homeBase.x - updatedEnemy.x);
                    finalAccel.x += Math.cos(angleToStation) * ACCELERATION * 0.8 * speedMultiplier;
                    finalAccel.y += Math.sin(angleToStation) * ACCELERATION * 0.8 * speedMultiplier;
                } else {
                    // Reached base
                    if (updatedEnemy.cargo > 0) {
                         if (updatedEnemy.isAlly) {
                            const creditsEarned = updatedEnemy.cargo * RESOURCE_PRICES.ore;
                            if (creditsEarned > 0) {
                                setPlayerData(d => ({ ...d, resources: {...d.resources, money: d.resources.money + creditsEarned} }));
                                addChatMessage('System', `Miner #${updatedEnemy.id} deposited resources for ${creditsEarned} credits.`, 'text-green-400')
                            }
                         } else {
                            const creditsEarned = updatedEnemy.cargo * RESOURCE_PRICES.ore;
                            if (creditsEarned > 0) {
                                setEnemyFactionData(d => ({ ...d, money: d.money + creditsEarned }));
                            }
                         }
                    }
                    updatedEnemy.cargo = 0;
                    updatedEnemy.aiState = 'patrolling';
                    updatedEnemy.health = updatedEnemy.maxHealth; // Full heal at base
                    updatedEnemy.energy = updatedEnemy.maxEnergy; // Full energy at base
                    updatedEnemy.targetObjectId = null;
                }
                break;
            }
            case 'chasing': {
                let targetShip: {x:number, y:number, health:number, id: number, isAlly?:boolean} | null = null;
                if(updatedEnemy.combatTargetId === -1) {
                    targetShip = { ...playerPositionRef.current, isAlly: true, health: playerDataRef.current.health, id: -1 };
                } else if(updatedEnemy.combatTargetId && updatedEnemy.combatTargetId >= 10000) {
                    const station = stationsRef.current.find(s => s.id === updatedEnemy.combatTargetId! - 10000);
                    if(station) targetShip = { x: station.x, y: station.y, health: station.health + station.shield, isAlly: station.owner === 'player', id: station.id + 10000 };
                } else {
                    const foundEnemy = enemiesRef.current.find(e => e.id === updatedEnemy.combatTargetId);
                    if(foundEnemy) targetShip = { ...foundEnemy };
                }

                if (targetShip && targetShip.health > 0) {
                    updatedEnemy.lastKnownPlayerPosition = { x: targetShip.x, y: targetShip.y };
                    const distanceToTarget = Math.hypot(targetShip.x - updatedEnemy.x, targetShip.y - updatedEnemy.y);
                    
                    if (distanceToTarget > ENEMY_AGGRO_RADIUS * 1.2) {
                        updatedEnemy.aiState = 'searching';
                        updatedEnemy.combatTargetId = null;
                        if (updatedEnemy.followTargetId) updatedEnemy.aiState = 'following'; // Return to following if it was the previous state
                        break;
                    }

                    const angleToTarget = Math.atan2(targetShip.y - updatedEnemy.y, targetShip.x - updatedEnemy.x);
                    
                    const preferredDistance = ENEMY_AGGRO_RADIUS * AI_PREFERRED_COMBAT_DISTANCE_FACTOR;
                    if (distanceToTarget > preferredDistance) {
                        finalAccel.x += Math.cos(angleToTarget) * ACCELERATION;
                        finalAccel.y += Math.sin(angleToTarget) * ACCELERATION;
                    }

                    if (timestamp - updatedEnemy.lastShotTimestamp > ENEMY_FIRE_RATE_MS && updatedEnemy.energy >= ENEMY_ENERGY_PER_SHOT) {
                        if (enemyShipInfo.weapons.manualTurrets.count > 0) {
                           const startX = updatedEnemy.x;
                           const startY = updatedEnemy.y;
                           newEnemyProjectiles.push({ id: getUniqueId(), x: startX, y: startY, startX, startY, rotation: angleToTarget * (180 / Math.PI), ownerId: updatedEnemy.id, type: 'basic' });
                           updatedEnemy.lastShotTimestamp = timestamp;
                           updatedEnemy.energy -= ENEMY_ENERGY_PER_SHOT;
                           updatedEnemy.lastEnergyUseTimestamp = timestamp;
                        }
                    }

                    if (enemyShipInfo.weapons.beam && enemyShipInfo.weapons.beam.count > 0 && updatedEnemy.energy > BEAM_ENERGY_DRAIN_PER_FRAME) {
                        const isAlreadyBeaming = currentActiveBeams.some(b => b.sourceId === updatedEnemy.id);

                        if (!isAlreadyBeaming) {
                            updatedEnemy.energy -= BEAM_ENERGY_DRAIN_PER_FRAME;
                            const newBeams: BeamState[] = [];
                            for (const offset of enemyShipInfo.weapons.beam.offsets) {
                                newBeams.push({
                                    id: getUniqueId(),
                                    sourceId: updatedEnemy.id,
                                    targetId: targetShip!.id,
                                    type: enemyShipInfo.weapons.beam.type,
                                    sourceOffsetX: offset.x,
                                    sourceOffsetY: offset.y,
                                    isAlly: updatedEnemy.isAlly
                                });
                            }
                           currentActiveBeams = [...currentActiveBeams, ...newBeams];
                        }
                    } else {
                        currentActiveBeams = currentActiveBeams.filter(b => b.sourceId !== updatedEnemy.id);
                    }

                } else {
                    updatedEnemy.aiState = 'searching';
                    updatedEnemy.combatTargetId = null;
                    updatedEnemy.stateChangeTimestamp = timestamp;
                    if (updatedEnemy.followTargetId) updatedEnemy.aiState = 'following'; // Return to following
                    currentActiveBeams = currentActiveBeams.filter(b => b.sourceId !== updatedEnemy.id);
                }
                break;
            }
            case 'searching':
                currentActiveBeams = currentActiveBeams.filter(b => b.sourceId !== updatedEnemy.id);
                if (timestamp - updatedEnemy.stateChangeTimestamp > 3000) {
                    updatedEnemy.aiState = 'patrolling';
                    updatedEnemy.lastKnownPlayerPosition = null;
                    updatedEnemy.stateChangeTimestamp = timestamp;
                } else if (updatedEnemy.lastKnownPlayerPosition) {
                    const distanceToLKP = Math.hypot(updatedEnemy.lastKnownPlayerPosition.x - updatedEnemy.x, updatedEnemy.lastKnownPlayerPosition.y - updatedEnemy.y);
                    if (distanceToLKP > 20) {
                        const angleToLKP = Math.atan2(updatedEnemy.lastKnownPlayerPosition.y - updatedEnemy.y, updatedEnemy.lastKnownPlayerPosition.x - updatedEnemy.x);
                        finalAccel.x += Math.cos(angleToLKP) * ACCELERATION * 0.5;
                        finalAccel.y += Math.sin(angleToLKP) * ACCELERATION * 0.5;
                    }
                }
                break;
            case 'fleeing': {
                currentActiveBeams = currentActiveBeams.filter(b => b.sourceId !== updatedEnemy.id);
                const fleeSpeedMultiplier = updatedEnemy.cruiseState === 'cruising' ? 5 : 1.2;
                
                let fleeTargetPos: {x: number, y: number} | null = null;
                const faction = updatedEnemy.isAlly ? 'player' : 'enemy';
                fleeTargetPos = stationsRef.current.find(s => s.owner === faction) || null;

                if (fleeTargetPos) { // Fleeing to base
                     const angleToBase = Math.atan2(fleeTargetPos.y - updatedEnemy.y, fleeTargetPos.x - updatedEnemy.x);
                     finalAccel.x += Math.cos(angleToBase) * ACCELERATION * fleeSpeedMultiplier;
                     finalAccel.y += Math.sin(angleToBase) * ACCELERATION * fleeSpeedMultiplier;
                } else { // No base, flee from threat
                    const lastAttacker = enemiesRef.current.find(e => e.id === updatedEnemy.lastAttackerId) || (updatedEnemy.lastAttackerId === -1 ? playerPositionRef.current : null);
                    const threat = updatedEnemy.fleeFrom || lastAttacker || updatedEnemy.lastKnownPlayerPosition;
                    if (threat) {
                         const angleAway = Math.atan2(updatedEnemy.y - threat.y, updatedEnemy.x - threat.x);
                         finalAccel.x += Math.cos(angleAway) * ACCELERATION * fleeSpeedMultiplier;
                         finalAccel.y += Math.sin(angleAway) * ACCELERATION * fleeSpeedMultiplier;
                    } else { 
                        updatedEnemy.aiState = 'patrolling';
                    }
                }

                 const distToBase = fleeTargetPos ? Math.hypot(updatedEnemy.x - fleeTargetPos.x, updatedEnemy.y - fleeTargetPos.y) : Infinity;
                 if (distToBase < STATION_INTERACTION_RADIUS * 1.5) {
                     updatedEnemy.aiState = updatedEnemy.isAlly ? 'guarding' : 'patrolling';
                 }

                break;
            }
            case 'recharging': {
                currentActiveBeams = currentActiveBeams.filter(b => b.sourceId !== updatedEnemy.id);
                let fleeFromThreat = false;
                const potentialThreats = [
                    {id: -1, x: playerPositionRef.current.x, y: playerPositionRef.current.y, isAlly: true },
                    ...enemiesRef.current
                ].filter(e => e.isAlly !== updatedEnemy.isAlly);

                for (const pTarget of potentialThreats) {
                    const dist = Math.hypot(updatedEnemy.x - pTarget.x, updatedEnemy.y - pTarget.y);
                    if (dist < ENEMY_AGGRO_RADIUS * 0.5) {
                        const angleAway = Math.atan2(updatedEnemy.y - pTarget.y, updatedEnemy.x - pTarget.x);
                        finalAccel.x += Math.cos(angleAway) * ACCELERATION * 0.8;
                        finalAccel.y += Math.sin(angleAway) * ACCELERATION * 0.8;
                        fleeFromThreat = true;
                        break;
                    }
                }
                
                if (!isLowEnergy) {
                    updatedEnemy.aiState = 'patrolling';
                    updatedEnemy.stateChangeTimestamp = timestamp;
                }
                break;
            }
            case 'following': {
                 // Check for nearby enemies to engage
                const potentialTargets = [...enemiesRef.current.filter(e => !e.isAlly)];
                if(!updatedEnemy.isAlly) potentialTargets.push({ ...playerDataRef.current, x: playerPositionRef.current.x, y: playerPositionRef.current.y, isAlly: true, id: -1 } as any);

                let closestTarget: {id: number, dist: number} | null = null;
                for (const pTarget of potentialTargets) {
                    if (pTarget.id === updatedEnemy.id) continue;
                    const dist = Math.hypot(updatedEnemy.x - pTarget.x, updatedEnemy.y - pTarget.y);
                    if (dist < ENEMY_AGGRO_RADIUS) {
                        updatedEnemy.aiState = 'chasing';
                        updatedEnemy.combatTargetId = pTarget.id;
                        closestTarget = {id: pTarget.id, dist }; // break and chase
                        break;
                    }
                }

                if (closestTarget) break; // Switched to chasing, so skip follow logic

                const targetToFollow = updatedEnemy.followTargetId === -1 
                    ? playerPositionRef.current
                    : enemiesRef.current.find(e => e.id === updatedEnemy.followTargetId);
                
                if (targetToFollow) {
                    const followDistance = 150;
                    const distanceToTarget = Math.hypot(targetToFollow.x - updatedEnemy.x, targetToFollow.y - updatedEnemy.y);

                    if (distanceToTarget > followDistance) {
                        const angleToTarget = Math.atan2(targetToFollow.y - updatedEnemy.y, targetToFollow.x - updatedEnemy.x);
                        finalAccel.x += Math.cos(angleToTarget) * ACCELERATION * 0.8;
                        finalAccel.y += Math.sin(angleToTarget) * ACCELERATION * 0.8;
                    }

                } else {
                    updatedEnemy.aiState = 'patrolling';
                    updatedEnemy.followTargetId = null;
                }
                break;
            }
          }

          let newEnemyVx = (updatedEnemy.vx + finalAccel.x) * FRICTION;
          let newEnemyVy = (updatedEnemy.vy + finalAccel.y) * FRICTION;
          
          const enemySpeed = Math.hypot(newEnemyVx, newEnemyVy);
          if (enemySpeed > ENEMY_SPEED) {
              newEnemyVx = (newEnemyVx / enemySpeed) * ENEMY_SPEED;
              newEnemyVy = (newEnemyVy / enemySpeed) * ENEMY_SPEED;
          }
          updatedEnemy.vx = newEnemyVx;
          updatedEnemy.vy = newEnemyVy;
          
          if (updatedEnemy.vx !== 0 || updatedEnemy.vy !== 0) {
            updatedEnemy.rotation = Math.atan2(updatedEnemy.vy, updatedEnemy.vx) * (180 / Math.PI);
          }

          updatedEnemy.x += updatedEnemy.vx;
          updatedEnemy.y += updatedEnemy.vy;

          updatedEnemy.x = Math.max(collisionRadius, Math.min(MAP_WIDTH - collisionRadius, updatedEnemy.x));
          updatedEnemy.y = Math.max(collisionRadius, Math.min(MAP_HEIGHT - collisionRadius, updatedEnemy.y));
          
          return updatedEnemy;

      }).filter(Boolean) as EnemyState[];
      if (newExplosions.length > 0) setExplosions(prev => [...prev, ...newExplosions]);

      if (newEnemyProjectiles.length > 0) setEnemyProjectiles(prev => [...prev, ...newEnemyProjectiles]);
      
      const finalBeams = currentActiveBeams.map(beam => {
          let source: { x: number; y: number; rotation?: number; energy?: number, maxEnergy?: number } | null = null;
          let target: { x: number; y: number; isAlly?: boolean } | null = null;
          
          if (beam.sourceId === -1) {
              source = { ...playerPositionRef.current, energy: playerDataRef.current.energy, rotation: playerRotationRef.current };
          } else {
              source = processedEnemies.find(e => e.id === beam.sourceId) || null;
          }
      
          if (beam.targetId === -1) {
              target = playerPositionRef.current;
          } else if(beam.targetId >= 10000) {
              const station = stationsRef.current.find(s => s.id === beam.targetId - 10000);
              if (station) {
                target = { x: station.x, y: station.y, isAlly: station.owner === 'player' };
              }
          } else {
              target = processedEnemies.find(e => e.id === beam.targetId) || null;
          }


          if (!source || !target) return null;
      
          const frameDamage = BEAM_DAMAGE_PER_FRAME;
          // Apply damage to ships only. Station damage is handled in a separate block.
          if (beam.targetId === -1) {
              applyDamage(frameDamage);
          } else if(beam.targetId < 10000) {
              processedEnemies = processedEnemies.map(e => e.id === beam.targetId ? { ...e, health: Math.max(0, e.health - frameDamage) } : e);
          }

          return beam;
      }).filter(Boolean) as BeamState[];
      
      setActiveBeams(finalBeams);
      
      let playerVelocityUpdate = { ...velocityRef.current };
      if (timestamp - lastCollisionTimestamp > 500) {
          const speedFactor = 0.5 + (speed / (MAX_SPEED || MAX_SPEED)) * 0.5;
          let collisionDamage = 0;
          let repulsionAngle = 0;
          let repulsionForce = 0.8;
          let collided = false;

          for (const asteroid of asteroidsRef.current) {
              const distance = Math.hypot(asteroid.x - playerPositionRef.current.x, asteroid.y - playerPositionRef.current.y);
              if (distance < (asteroid.size/2 * ASTEROID_COLLISION_RADIUS) + PLAYER_COLLISION_RADIUS) {
                  collided = true;
                  collisionDamage = ASTEROID_COLLISION_DAMAGE * speedFactor;
                  repulsionAngle = Math.atan2(playerPositionRef.current.y - asteroid.y, playerPositionRef.current.x - asteroid.x);
                  break;
              }
          }
          if (!collided) {
              for (let i = 0; i < processedEnemies.length; i++) {
                  let enemy = processedEnemies[i];
                  if (!enemy) continue;
                  let enemyRadius = ENEMY_COLLISION_RADIUS;
                  if (enemy.type === 'Frégate') enemyRadius = FRIGATE_COLLISION_RADIUS;
                  else if (enemy.type === 'Mineur') enemyRadius = STAFF_COLLISION_RADIUS;
                  const distance = Math.hypot(enemy.x - playerPositionRef.current.x, enemy.y - playerPositionRef.current.y);
                  if (distance < enemyRadius + PLAYER_COLLISION_RADIUS) {
                      collided = true;
                      if (!enemy.isAlly) {
                        collisionDamage = ENEMY_COLLISION_DAMAGE * speedFactor;
                      } else {
                        collisionDamage = 0; // No damage between allies
                      }
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
              if (speed > COLLISION_SPEED_THRESHOLD && collisionDamage > 0) {
                applyDamage(collisionDamage);
              }
              playerVelocityUpdate.x += Math.cos(repulsionAngle) * repulsionForce;
              playerVelocityUpdate.y += Math.sin(repulsionAngle) * repulsionForce;
              setVelocity(playerVelocityUpdate);
          }
      }
      
      let damageToPlayerFromProjectiles = 0;
      for (const proj of enemyProjectilesRef.current) {
        if (hitProjectileIds.has(proj.id) || proj.ownerId === -1) continue;
        
        const projOwner = enemiesRef.current.find(e => e.id === proj.ownerId);
        if(projOwner && projOwner.isAlly) continue;

        const distance = Math.hypot(proj.x - playerPositionRef.current.x, proj.y - playerPositionRef.current.y);
        if (distance < PLAYER_COLLISION_RADIUS) {
          hitProjectileIds.add(proj.id);
          const damage = proj.ownerId >= 10000 ? STATION_PROJECTILE_DAMAGE : ENEMY_PROJECTILE_DAMAGE;
          damageToPlayerFromProjectiles += proj.type === 'heavy' ? damage * 1.5 : damage;
        }
      }
      if (damageToPlayerFromProjectiles > 0) applyDamage(damageToPlayerFromProjectiles);
      
      // Damage calculation for stations
      const stationsWithDamage = [...stationsRef.current].map(station => {
          let newStation = {...station};
          
          // Projectile damage
          for (const proj of [...playerProjectilesRef.current, ...enemyProjectilesRef.current]) {
              if (hitProjectileIds.has(proj.id)) continue;
              
              const projOwnerIsPlayer = proj.ownerId === -1 || outpostsRef.current.some(o => o.id === proj.ownerId) || stationsRef.current.find(s => s.id === proj.ownerId)?.owner === 'player';
              const projOwner = enemiesRef.current.find(e => e.id === proj.ownerId);

              if ((station.owner === 'player' && (projOwnerIsPlayer || (projOwner && projOwner.isAlly))) || 
                  (station.owner === 'enemy' && (!projOwnerIsPlayer && (!projOwner || !projOwner.isAlly)))) {
                continue;
              }
              
              const distance = Math.hypot(proj.x - newStation.x, proj.y - newStation.y);
              if (distance < STATION_COLLISION_RADIUS) {
                  hitProjectileIds.add(proj.id);
                  const damage = projOwnerIsPlayer ? (proj.type === 'heavy' ? HEAVY_PLAYER_PROJECTILE_DAMAGE : PLAYER_PROJECTILE_DAMAGE) : ENEMY_PROJECTILE_DAMAGE;
                  let shieldDamage = Math.min(newStation.shield, damage);
                  let healthDamage = damage - shieldDamage;

                  newStation.shield -= shieldDamage;
                  newStation.health -= healthDamage;
                  newStation.lastHitTimestamp = timestamp;
                  
                  const attackerId = proj.ownerId < 10000 ? proj.ownerId : null; // Stations don't have attacker IDs in this system
                  newStation.lastAttackerId = attackerId;
              }
          }

          // Beam damage
          for (const beam of finalBeams) {
              if (beam.targetId === station.id + 10000) {
                  const frameDamage = BEAM_DAMAGE_PER_FRAME;
                  let shieldDamage = Math.min(newStation.shield, frameDamage);
                  let healthDamage = frameDamage - shieldDamage;

                  newStation.shield -= shieldDamage;
                  newStation.health -= healthDamage;
                  newStation.lastHitTimestamp = timestamp;
                  newStation.lastAttackerId = beam.sourceId;
              }
          }
          return newStation;
      });
      setStations(stationsWithDamage);


      if (hitProjectileIds.size > 0) {
        setPlayerProjectiles(prev => prev.filter(p => !hitProjectileIds.has(p.id)));
        setEnemyProjectiles(prev => prev.filter(p => !hitProjectileIds.has(p.id)));
      }
      
      const collectedDebrisIds = new Set<number>();
      const currentDebris = [...debrisRef.current, ...newDebrisFromKills];
      let newDebrisFromOverflow: DebrisType[] = [];

      for (const d of currentDebris) {
          if (collectedDebrisIds.has(d.id)) continue;
          
          const playerDist = Math.hypot(d.x - playerPositionRef.current.x, d.y - playerPositionRef.current.y);
          if (playerDist < DEBRIS_COLLISION_RADIUS + PLAYER_COLLISION_RADIUS) {
              const { ship, upgrades, cargo } = playerDataRef.current;
              const maxCargo = SHIP_DATA[ship.class].baseCargo + UPGRADE_VALUES.cargoCapacity[upgrades.cargoCapacity];
              const availableSpace = maxCargo - cargo.current;
              
              const debrisResources = d.resources;
              const cargoInDebris = (debrisResources.ore || 0) + (debrisResources.gas || 0);

              let moneyToAdd = debrisResources.money || 0;
              let oreToAdd = debrisResources.ore || 0;
              let gasToAdd = debrisResources.gas || 0;

              if (cargoInDebris > availableSpace && cargoInDebris > 0) {
                  const overflowRatio = availableSpace / cargoInDebris;
                  oreToAdd = Math.floor(oreToAdd * overflowRatio);
                  gasToAdd = Math.floor(gasToAdd * overflowRatio);
                  
                  const overflowOre = (debrisResources.ore || 0) - oreToAdd;
                  const overflowGas = (debrisResources.gas || 0) - gasToAdd;
                  
                  if (overflowOre > 0 || overflowGas > 0) {
                      newDebrisFromOverflow.push({
                          id: getUniqueId(),
                          x: d.x + (Math.random() - 0.5) * 80,
                          y: d.y + (Math.random() - 0.5) * 80,
                          resources: { ore: overflowOre, gas: overflowGas, money: 0 }
                      });
                  }
              }
              
              setPlayerData(prev => {
                const newCargo = Math.min(maxCargo, Math.max(0, prev.cargo.current + oreToAdd + gasToAdd));
                return {
                    ...prev,
                    resources: {
                        money: prev.resources.money + moneyToAdd,
                        ore: prev.resources.ore + oreToAdd,
                        gas: prev.resources.gas + gasToAdd,
                    },
                    cargo: {
                        current: newCargo,
                    }
                }
              });

              collectedDebrisIds.add(d.id);
              continue;
          }

          for (let i = 0; i < processedEnemies.length; i++) {
              if (collectedDebrisIds.has(d.id)) break;
              let enemyRadius = ENEMY_COLLISION_RADIUS;
              if (processedEnemies[i].type === 'Frégate') enemyRadius = FRIGATE_COLLISION_RADIUS;
              else if (processedEnemies[i].type === 'Mineur') enemyRadius = STAFF_COLLISION_RADIUS;
              const enemyDist = Math.hypot(d.x - processedEnemies[i].x, d.y - processedEnemies[i].y);
              if (enemyDist < DEBRIS_COLLISION_RADIUS + enemyRadius) {
                  const cargoToAdd = (d.resources.ore || 0) + (d.resources.gas || 0);
                  processedEnemies[i] = { ...processedEnemies[i], cargo: processedEnemies[i].cargo + cargoToAdd };
                  collectedDebrisIds.add(d.id);
                  break; 
              }
          }
      }
      
      const finalDebris = [...debrisRef.current, ...newDebrisFromKills, ...newDebrisFromOverflow].filter(d => !collectedDebrisIds.has(d.id));
      setDebris(finalDebris);

      setEnemies(processedEnemies);

      const activeEntities = new Set([-1, ...processedEnemies.map(e => e.id), ...stationsRef.current.map(s => s.id + 10000)]);
      setActiveBeams(prev => prev.filter(b => activeEntities.has(b.sourceId) && activeEntities.has(b.targetId)));


      // Faction AI Logic
      if (timestamp > nextAttackWaveTimestamp.current) {
        const enemyBase = stationsRef.current.find(s => s.owner === 'enemy');
        const playerBase = stationsRef.current.find(s => s.owner === 'player');

        if(enemyBase && playerBase) {
            addChatMessage('Enemy C&C', 'All attack wings, converge on the enemy base!', 'text-red-500');
            setEnemies(prev => prev.map(e => {
                if (!e.isAlly && e.role === 'attack') {
                    return { ...e, aiState: 'chasing', combatTargetId: playerBase.id + 10000 };
                }
                return e;
            }));
        }
        lastAttackWaveTimestamp.current = timestamp;
        nextAttackWaveTimestamp.current = timestamp + 120000 + Math.random() * 120000; // 2-4 mins for next wave
      }

      const stationsWithNewEnemies = [...stationsWithDamage];
      let newEnemiesFromStations: EnemyState[] = [];
      let newWarpEffectsFromStations: Effect[] = [];

      setStations(prev => prev.map(station => {
          let updatedStation = {...station};

          if (timestamp > station.defenseWaveCooldownUntil && timestamp - station.lastHitTimestamp < 5000) {
              const spawnBehindAngle = Math.atan2(station.y - MAP_HEIGHT / 2, station.x - MAP_WIDTH / 2) + Math.PI;

              for (let i = 0; i < STATION_DEFENSE_WAVE_SIZE; i++) {
                  const spawnOffset = { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200 };
                  const spawnX = station.x + Math.cos(spawnBehindAngle) * 200 + spawnOffset.x;
                  const spawnY = station.y + Math.sin(spawnBehindAngle) * 200 + spawnOffset.y;
                  
                  newWarpEffectsFromStations.push({ id: getUniqueId(), x: spawnX, y: spawnY });

                  const newShip = createNewShip('Chasseur', station.owner === 'player', { x: spawnX, y: spawnY }, 'guarding');
                  newEnemiesFromStations.push(newShip);
              }
              
              addChatMessage('System', `Base ${station.owner} launches defense fleet!`, station.owner === 'player' ? 'text-cyan-400' : 'text-red-400');
              updatedStation.defenseWaveCooldownUntil = timestamp + STATION_DEFENSE_WAVE_COOLDOWN_MS;
          }

          // Call nearby allies for help
          if(timestamp - station.lastHitTimestamp < 5000 && station.lastAttackerId) {
             const nearbyAllies = enemiesRef.current.filter(e => {
                const isAllyOfStation = (station.owner === 'player' && e.isAlly) || (station.owner === 'enemy' && !e.isAlly);
                if (!isAllyOfStation) return false;
                
                const distanceToStation = Math.hypot(e.x - station.x, e.y - station.y);
                const isIdle = ['patrolling', 'guarding', 'deep_patrolling', 'holding_position'].includes(e.aiState);
                
                return isIdle && distanceToStation < AI_HELP_RADIUS * 2;
             });

             if(nearbyAllies.length > 0) {
                 const attacker = enemiesRef.current.find(e => e.id === station.lastAttackerId) || (station.lastAttackerId === -1 ? playerPositionRef.current : null)
                 if (attacker) {
                     setEnemies(prev => prev.map(e => {
                         if (nearbyAllies.some(ally => ally.id === e.id)) {
                             return { ...e, aiState: 'chasing', combatTargetId: station.lastAttackerId };
                         }
                         return e;
                     }));
                 }
             }
          }
          return updatedStation;
      }));
      
      if(newWarpEffectsFromStations.length > 0) {
          setWarpEffects(prev => [...prev, ...newWarpEffectsFromStations]);
          setTimeout(() => {
              setEnemies(prev => [...prev, ...newEnemiesFromStations]);
          }, 500);
      }


      if (timestamp - lastAiFactionUpdate.current > 5000) { // Every 5 seconds
        lastAiFactionUpdate.current = timestamp;
        
        const enemyStation = stationsRef.current.find(s => s.owner === 'enemy');
        if (enemyStation) {
            let moneyToSpend = 0;
            const shipsToBuild: BotShipType[] = [];
            const updatedShipCounts = { ...enemyFactionDataRef.current.shipCounts };
            let currentMoney = enemyFactionDataRef.current.money;

            const buildQueue: { type: BotShipType, maxCount: number }[] = [
                { type: 'Mineur', maxCount: 3 },
                { type: 'Chasseur', maxCount: 7 },
                { type: 'Intercepteur', maxCount: 4 },
                { type: 'Destroyer', maxCount: 1 },
                { type: 'Frégate', maxCount: 1 },
            ];

            for (const item of buildQueue) {
                const shipInfo = SHIP_DATA[item.type];
                if (updatedShipCounts[item.type] < item.maxCount && currentMoney >= shipInfo.cost) {
                    shipsToBuild.push(item.type);
                    moneyToSpend += shipInfo.cost;
                    currentMoney -= shipInfo.cost;
                    updatedShipCounts[item.type]++;
                }
            }
            
            if (shipsToBuild.length > 0) {
                const newShips = shipsToBuild.map(type => createNewShip(type, false, {x: enemyStation.x, y: enemyStation.y}, 'patrolling'));
                setEnemies(e => [...e, ...newShips]);
                setEnemyFactionData(d => ({
                    ...d,
                    money: d.money - moneyToSpend,
                    shipCounts: updatedShipCounts
                }));
                addChatMessage('Enemy C&C', `Construction of new units is complete.`, 'text-red-400');
            }

            // AI reinforcement logic
            if (enemyFactionDataRef.current.money >= REINFORCEMENT_COST && timestamp >= enemyFactionDataRef.current.reinforcementAvailableAt) {
                const isBaseUnderAttack = enemiesRef.current.some(e => e.isAlly && e.combatTargetId === enemyStation.id + 10000);
                if (isBaseUnderAttack) {
                    const combatShips = enemiesRef.current.filter(e => !e.isAlly && e.role === 'attack');
                    if (combatShips.length > 0) {
                        const anchorShip = combatShips[Math.floor(Math.random() * combatShips.length)];
                        callAiReinforcements({ x: anchorShip.x, y: anchorShip.y });
                        setEnemyFactionData(d => ({ ...d, money: d.money - REINFORCEMENT_COST, reinforcementAvailableAt: timestamp + REINFORCEMENT_COOLDOWN_MS }));
                    }
                }
            }

            // Deep patrol logic
            if (Math.random() < 0.1) { // 10% chance every 5 seconds
                const patrolShip = enemiesRef.current.find(e => !e.isAlly && e.role === 'attack' && e.aiState === 'guarding');
                if (patrolShip) {
                    setEnemies(prev => prev.map(e => e.id === patrolShip.id ? { ...e, aiState: 'deep_patrolling' } : e));
                }
            }
        }
      }

      // Game Over check
      const playerBase = stationsRef.current.find(s => s.owner === 'player');
      const enemyBase = stationsRef.current.find(s => s.owner === 'enemy');
      
      if (playerBase && playerBase.health <= 0) {
          if (!isGameOver) setExplosions(prev => [...prev, {id: getUniqueId(), x: playerBase.x, y: playerBase.y, size: 3}]);
          setGameOverResult('defeat');
          setIsGameOver(true);
      } else if (enemyBase && enemyBase.health <= 0) {
          if (!isGameOver) setExplosions(prev => [...prev, {id: getUniqueId(), x: enemyBase.x, y: enemyBase.y, size: 3}]);
          setGameOverResult('victory');
          setIsGameOver(true);
      }


      if (playerDataRef.current.health <= 0) {
        if (playerBase && playerBase.health > 0) {
            handleRespawn();
        } else {
            setIsGameOver(true);
        }
      } else {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    const callAiReinforcements = (position: { x: number, y: number }) => {
        addChatMessage('System', `Enemy reinforcements detected!`, 'text-red-400');
        const reinforcementCount = 5; // AI gets fewer reinforcements
        const despawnTime = Date.now() + 90000; // 1.5 minutes
        const newWarpEffects: Effect[] = [];
        const newEnemies: EnemyState[] = [];
        
        for (let i = 0; i < reinforcementCount; i++) {
            const spawnOffset = { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200 };
            const spawnX = position.x + spawnOffset.x;
            const spawnY = position.y + spawnOffset.y;
            newWarpEffects.push({ id: getUniqueId(), x: spawnX, y: spawnY });
            
            const newShip = createNewShip('Chasseur', false, {x: spawnX, y: spawnY}, 'patrolling_order', { orderTarget: {x: spawnX, y: spawnY }, despawnTimestamp: despawnTime });
            newEnemies.push(newShip);
        }

        setWarpEffects(prev => [...prev, ...newWarpEffects]);
        setTimeout(() => {
            setEnemies(prev => [...prev, ...newEnemies]);
        }, 500);
    }

    const createNewShip = (type: BotShipType, isAlly: boolean, position: {x: number, y: number}, state: EnemyAiState = 'patrolling', options: Partial<EnemyState> = {}) => {
        const shipInfo = SHIP_DATA[type];
        return {
            id: getUniqueId(),
            type,
            x: position.x + (Math.random() - 0.5) * 150,
            y: position.y + (Math.random() - 0.5) * 150,
            vx: 0, vy: 0, rotation: 0,
            health: shipInfo.baseHealth * 3,
            maxHealth: shipInfo.baseHealth * 3,
            lastShotTimestamp: 0, lastAutoShotTimestamp: 0,
            aiState: state,
            lastKnownPlayerPosition: null, stateChangeTimestamp: 0,
            energy: shipInfo.maxEnergy, maxEnergy: shipInfo.maxEnergy, cargo: 0, lastEnergyUseTimestamp: 0,
            isAlly, combatTargetId: null, lastAttackerId: null, patrolTarget: null, patrolCenter: {x: position.x, y: position.y},
            role: type === 'Mineur' ? 'miner' : 'attack',
            cruiseState: 'idle' as 'idle' | 'charging' | 'cruising', cruiseAvailableAt: 0,
            ...options
        };
    };
    
    if(viewSize.width > 0 && !isGameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewSize, isGameOver, controlScheme, isDocked, applyDamage, handleActionSelect, handleBuyAlly, handleBuyShip, handleBuyUpgrade, handleRepairHull, handleSellResource, resetGame, addChatMessage, handleBuildShipFromTactical, handleBuildOutpost, handleRespawn, zones, cheats, handleCallReinforcements, handleAllAttack, handleAllFollow, handleAllHold]);

  const allies = React.useMemo(() => enemies.filter(e => e.isAlly), [enemies]);


  const isEntityVisible = useCallback((entity: { x: number; y: number }) => {
    // Player vision
    if (Math.hypot(entity.x - playerPosition.x, entity.y - playerPosition.y) < radarRange) {
        return true;
    }
    // Ally vision
    for (const ally of allies) {
        if (Math.hypot(entity.x - ally.x, entity.y - ally.y) < BASE_RADAR_RANGE) {
            return true;
        }
    }
    // Outpost vision
    for (const outpost of outposts) {
        if (Math.hypot(entity.x - outpost.x, entity.y - outpost.y) < OUTPOST_RANGE) {
            return true;
        }
    }
    return false;
  }, [playerPosition.x, playerPosition.y, radarRange, allies, outposts]);


  const visibleEnemies = React.useMemo(() => 
    enemies.filter(e => {
        if (e.isAlly) return true; // Always show allies
        if (isTacticalView) {
            return isEntityVisible(e);
        }
        const distanceToPlayer = Math.hypot(e.x - playerPosition.x, e.y - playerPosition.y);
        return distanceToPlayer < radarRange;
    }),
    [enemies, playerPosition.x, playerPosition.y, radarRange, isTacticalView, isEntityVisible]
  );
  
  const visibleAsteroids = React.useMemo(() =>
    asteroids.filter(a => {
        if(isTacticalView) return isEntityVisible(a);
        const distance = Math.hypot(a.x - cameraPosition.x, a.y - cameraPosition.y);
        return distance < radarRange * 1.5;
    }),
    [asteroids, cameraPosition.x, cameraPosition.y, radarRange, isTacticalView, isEntityVisible]
  );

  const visibleStations = React.useMemo(() =>
    stations.filter(s => {
        if(s.owner === 'player') return true;
        if(isTacticalView) return isEntityVisible(s);
        const distance = Math.hypot(s.x - cameraPosition.x, s.y - cameraPosition.y);
        return distance < radarRange * 1.5;
    }),
    [stations, cameraPosition.x, cameraPosition.y, radarRange, isTacticalView, isEntityVisible]
  );

  const visibleOutposts = React.useMemo(() =>
    outposts.filter(o => {
        if(isTacticalView) return isEntityVisible(o);
        return Math.hypot(o.x - cameraPosition.x, o.y - cameraPosition.y) < radarRange * 1.5
    }),
    [outposts, cameraPosition.x, cameraPosition.y, radarRange, isTacticalView, isEntityVisible]
  );
  
  const visibleDebris = React.useMemo(() =>
    debris.filter(d => {
        if(isTacticalView) return isEntityVisible(d);
        return Math.hypot(d.x - cameraPosition.x, d.y - cameraPosition.y) < radarRange * 1.5
    }),
    [debris, cameraPosition.x, cameraPosition.y, radarRange, isTacticalView, isEntityVisible]
  );
  
  const containerClass = cn(
    "relative w-full h-full overflow-hidden bg-gray-900",
    {
        'cursor-grab': isPanning,
        'cursor-crosshair': !isPanning && isTacticalView,
        'cursor-default': !isPanning && !isTacticalView,
    },
    shipMode === 'stealth' && 'stealth-effect',
    cruiseState === 'cruising' && 'cruise-effect',
    cruiseState === 'charging' && 'cruise-charging-effect',
    shipMode === 'scan' && 'scan-effect'
  );
  
  const mainStation = stations.find(s => s.owner === 'player');
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
          transform: `translate(${viewSize.width / 2}px, ${viewSize.height / 2}px) scale(${zoom}) translate(${-cameraPosition.x}px, ${-cameraPosition.y}px)`,
          willChange: 'transform',
          transformOrigin: 'top left'
      }}>
        <GameMap width={MAP_WIDTH} height={MAP_HEIGHT} />
        <ClientOnly>
        {zones.map(zone => {
            if (zone.type === 'nebula') return <ElectricCloud key={zone.id} {...zone} />;
            if (zone.type === 'vortex') return <Vortex key={zone.id} {...zone} />;
            return null;
        })}
        </ClientOnly>
        {playerProjectiles.map((p) => (
          <Projectile key={`player-proj-${p.id}`} x={p.x} y={p.y} rotation={p.rotation} type={p.type} />
        ))}
        {enemyProjectiles.map((p) => (
          <Projectile key={`enemy-proj-${p.id}`} x={p.x} y={p.y} rotation={p.rotation} type={p.type} />
        ))}
        {activeBeams.map(beam => {
            let sourceEntity: { x: number; y: number; rotation?: number } | null = null;
            if (beam.sourceId === -1) {
              sourceEntity = { x: playerPositionRef.current.x, y: playerPositionRef.current.y, rotation: playerRotationRef.current };
            } else {
              sourceEntity = enemiesRef.current.find(e => e.id === beam.sourceId) || null;
            }

            let targetEntity: {x: number, y: number} | null = null;
            if(beam.targetId === -1) {
                targetEntity = playerPositionRef.current;
            } else if (beam.targetId >= 10000) {
                targetEntity = stationsRef.current.find(s => s.id === beam.targetId - 10000) || null;
            } else {
                targetEntity = enemiesRef.current.find(e => e.id === beam.targetId) || null;
            }


            if (!sourceEntity || !targetEntity) return null;
            
            const sourceRotRad = (sourceEntity.rotation || 0) * (Math.PI / 180);
            const offsetX = beam.sourceOffsetX || 0;
            const offsetY = beam.sourceOffsetY || 0;

            const rotatedOffsetX = offsetX * Math.cos(sourceRotRad) - offsetY * Math.sin(sourceRotRad);
            const rotatedOffsetY = offsetX * Math.sin(sourceRotRad) + offsetY * Math.cos(sourceRotRad);

            const sourceX = sourceEntity.x + rotatedOffsetX;
            const sourceY = sourceEntity.y + rotatedOffsetY;

            return (
                <Beam 
                    key={beam.id}
                    id={beam.id}
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetEntity.x}
                    y2={targetEntity.y}
                    type={beam.type}
                    isAlly={beam.isAlly}
                />
            )
        })}
        <PlayerShip 
          x={playerPosition.x}
          y={playerPosition.y}
          rotation={playerRotation} 
          aimRotation={aimRotation}
          shipClass={playerData.ship.class}
          isShieldActive={shipMode === 'shield'} 
        />
        {visibleEnemies.map(enemy => {
          const props = {
            key: enemy.id,
            x: enemy.x,
            y: enemy.y,
            rotation: enemy.rotation,
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            isTargeted: enemy.id === targetId || (enemy.id + 10000) === targetId,
            isAlly: enemy.isAlly || false,
            isSelected: selectedAllyIds.includes(enemy.id),
          };
          switch (enemy.type) {
            case 'Chasseur':
              return <EnemyShip {...props} />;
            case 'Frégate':
              return <FrigateShip {...props} />;
            case 'Mineur':
              return <StaffShip {...props} />;
            case 'Intercepteur':
              return <InterceptorShip {...props} />;
            case 'Destroyer':
              return <DestroyerShip {...props} />;
            case 'Porteur':
              return <CarrierShip {...props} />;
            case 'Cargo':
              return <CargoShip {...props} />;
            default:
              return null;
          }
        })}
        {visibleAsteroids.map((a) => (
            <Asteroid key={a.id} id={a.id} x={a.x} y={a.y} size={a.size} rotation={a.rotation} />
        ))}
        {visibleStations.map((s) => (
            <SpaceStation 
              key={s.id} 
              x={s.x} 
              y={s.y} 
              isEnemy={s.owner === 'enemy'}
              health={s.health}
              maxHealth={s.maxHealth}
              shield={s.shield}
              maxShield={s.maxShield}
              isTargeted={s.id + 10000 === targetId}
            />
        ))}
        {visibleOutposts.map((o) => (
            <Outpost key={o.id} x={o.x} y={o.y} />
        ))}
        {visibleDebris.map((d) => (
            <Debris key={d.id} x={d.x} y={d.y} />
        ))}
        {explosions.map(effect => (
            <Explosion key={effect.id} {...effect} onComplete={(id) => setExplosions(prev => prev.filter(e => e.id !== id))} />
        ))}
        {warpEffects.map(effect => (
            <WarpInEffect key={effect.id} {...effect} onComplete={(id) => setWarpEffects(prev => prev.filter(e => e.id !== id))} />
        ))}
      </div>
      
      {playerAction && (
        <ActionProgress
          actionType={playerAction.type}
          progress={((Date.now() - playerAction.startTime) / playerAction.duration) * 100}
        />
       )}
      
      <TacticalViewOverlay 
        isOpen={isTacticalView}
        playerResources={playerData.resources}
        onBuildShip={handleBuildShipFromTactical}
        onBuildOutpost={handleBuildOutpost}
        onAllFollow={handleAllFollow}
        onAllAttack={handleAllAttack}
        onAllHold={handleAllHold}
        onCallReinforcements={() => setIsPlacingReinforcements(true)}
        canCallReinforcements={playerData.resources.money >= REINFORCEMENT_COST && Date.now() >= reinforcementAvailableAt.current}
        isPlacingReinforcements={isPlacingReinforcements}
      />
      <ClientOnly>
      {cruiseState === 'cruising' && <CruiseStreaks />}
      </ClientOnly>
       {playerData.health < LOW_HEALTH_THRESHOLD * 3 && ( // Adjusted for higher base health
          <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ boxShadow: 'inset 0 0 80px 30px rgba(255, 0, 0, 0.4)' }} />
       )}
       {playerData.energy <= 0 && (
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px 30px rgba(0, 150, 255, 0.3)' }} />
       )}

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-4" data-ui-element="true">
        <PlayerUpgradesDisplay upgrades={playerData.upgrades} />
        <VesselSystems systems={vesselSystems} />
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-4" data-ui-element="true">
        <PlayerStatus data={playerData} />
        <ResourceDisplay resources={playerData.resources} />
        <WeaponControl 
            shipClass={playerData.ship.class}
            activeWeapons={activeWeapons}
            onToggleWeapon={handleToggleWeapon}
        />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-4" data-ui-element="true">
          {currentStellarBaseData && <StellarBaseStatus data={currentStellarBaseData} />}
          <ClientOnly>
            <ChatBox messages={chatMessages} />
          </ClientOnly>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-4" data-ui-element="true">
        <Radar 
            playerPosition={playerPosition}
            enemies={visibleEnemies}
            stations={visibleStations}
            asteroids={visibleAsteroids}
            debris={visibleDebris}
            outposts={visibleOutposts}
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
          onAction={(action) => handleActionSelect(action, contextMenu.targetId, {x: contextMenu.worldX, y: contextMenu.worldY})}
          onClose={() => setContextMenu(null)}
        />
      )}

      <SettingsMenu
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        controlScheme={controlScheme}
        onControlSchemeChange={setControlScheme}
        cheats={cheats}
        onCheatsChange={setCheats}
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

      <GameOverOverlay isOpen={isGameOver} onRestart={resetGame} result={gameOverResult} />
    </div>
  );
}

    