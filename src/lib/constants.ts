import type { PlayerData, PlayerUpgrades, PlayerShipClass, WeaponConfig, FactionData, Zone } from "@/lib/types";

export const INITIAL_PLAYER_UPGRADES: PlayerUpgrades = {
  maxHealth: 0,
  energyRecharge: 0,
  nanobots: 0,
  cargoCapacity: 0,
  antimatterReactor: 0,
};

export const INITIAL_PLAYER_DATA: PlayerData = {
  level: 5,
  ship: {
    class: "Chasseur",
    role: "Combat",
    size: "S",
    upgrades: {
    },
  },
  health: 900,
  energy: 1000,
  cargo: {
    current: 0,
  },
  resources: {
    money: 15000,
    ore: 0,
    gas: 0,
  },
  upgrades: INITIAL_PLAYER_UPGRADES,
};

export const INITIAL_FACTION_DATA: FactionData = {
    money: 5000,
    ships: [],
    shipCounts: {
        'Chasseur': 0,
        'Frégate': 0,
        'Mineur': 0,
        'Intercepteur': 0,
        'Destroyer': 0,
        'Porteur': 0,
        'Cargo': 0
    },
    reinforcementAvailableAt: 0,
}


export const SHIP_DATA: Record<PlayerShipClass, {
    name: PlayerShipClass;
    description: string;
    cost: number;
    baseHealth: number;
    baseCargo: number;
    maxEnergy: number;
    baseEnergyRecharge: number;
    miningBonus?: number;
    weapons: WeaponConfig;
}> = {
    'Chasseur': { name: 'Chasseur', description: 'Vaisseau de base polyvalent, équipé de tourelles manuelles.', cost: 1000, baseHealth: 300, baseCargo: 200, maxEnergy: 10000, baseEnergyRecharge: 0.1, weapons: { manualTurrets: { count: 2, type: 'basic', offsets: [{x: -15, y: 10}, {x: 15, y: 10}] }, autoTurrets: { count: 2, type: 'basic', offsets: [{x: -20, y: 20}, {x: 20, y: 20}] }, beam: { count: 1, type: 'basic', offsets: [{x: 0, y: 0}]} } },
    'Intercepteur': { name: 'Intercepteur', description: 'Très rapide, faible soute. 2 tourelles manuelles, améliorable pour poser des mines.', cost: 1500, baseHealth: 225, baseCargo: 100, maxEnergy: 12000, baseEnergyRecharge: 0.15, weapons: { manualTurrets: { count: 2, type: 'basic', offsets: [{x: -15, y: -5}, {x: 15, y: -5}] } } },
    'Frégate': { name: 'Frégate', description: 'Vaisseau de guerre lourd. 1 tourelle lourde manuelle, 2 automatiques, 1 rayon.', cost: 4000, baseHealth: 750, baseCargo: 150, maxEnergy: 25000, baseEnergyRecharge: 0.2, weapons: { manualTurrets: { count: 1, type: 'heavy', offsets: [{x: 0, y: -25}] }, beam: { count: 1, type: 'basic', offsets: [{x: 0, y: 10}] }, autoTurrets: { count: 2, type: 'basic', offsets: [{x: -20, y: 20}, {x: 20, y: 20}] } } },
    'Destroyer': { name: 'Destroyer', description: 'Plateforme d\'armes ultime. 2 tourelles manuelles lourdes, 2 auto lourdes, 3 rayons.', cost: 10000, baseHealth: 1200, baseCargo: 250, maxEnergy: 50000, baseEnergyRecharge: 0.25, weapons: { manualTurrets: { count: 2, type: 'heavy', offsets: [{x: -15, y: -30}, {x: 15, y: -30}] }, beam: { count: 3, type: 'heavy', offsets: [{x: 0, y: -15}, {x: -25, y: 15}, {x: 25, y: 15}] }, autoTurrets: { count: 2, type: 'heavy', offsets: [{x: -25, y: 30}, {x: 25, y: 30}] } } },
    'Porteur': { name: 'Porteur', description: 'Transporte des unités de soutien. Peut déployer 2 intercepteurs et 1 chasseur.', cost: 8000, baseHealth: 600, baseCargo: 300, maxEnergy: 30000, baseEnergyRecharge: 0.1, weapons: { manualTurrets: { count: 0, type: 'basic', offsets: [] } } },
    'Cargo': { name: 'Cargo', description: 'Soute immense, coque résistante. 1 tourelle manuelle de défense.', cost: 3000, baseHealth: 450, baseCargo: 1000, maxEnergy: 15000, baseEnergyRecharge: 0.08, weapons: { manualTurrets: { count: 1, type: 'basic', offsets: [{x: 0, y: 0}] } } },
    'Mineur': { name: 'Mineur', description: 'Extraction rapide des ressources. 1 tourelle manuelle. Vitesse de minage x1.5.', cost: 2000, baseHealth: 300, baseCargo: 500, maxEnergy: 15000, baseEnergyRecharge: 0.08, miningBonus: 1.5, weapons: { manualTurrets: { count: 1, type: 'basic', offsets: [{x: 0, y: -15}] } } },
};

export const GAS_ASTEROID_EXPLOSION_RADIUS = 250;
export const GAS_ASTEROID_EXPLOSION_DAMAGE = 50;
export const MINING_DEPLETION_CHARGES = 4;
export const ELECTRIC_ASTEROID_ENERGY_YIELD = 2500;

export const BEAM_DAMAGE_PER_FRAME = 0.5;
export const BEAM_ENERGY_DRAIN_PER_FRAME = 0.3;
export const BEAM_RANGE = 1000;
export const STATION_BASE_HEALTH = 50000;
export const STATION_BASE_SHIELD = 15000;

export const OUTPOST_COST = 5000;
export const OUTPOST_HEALTH = 2000;
export const OUTPOST_RANGE = 900;
export const OUTPOST_FIRE_RATE_MS = 1000;
export const OUTPOST_REGEN_RADIUS = 250;
export const OUTPOST_REGEN_RATE = 0.05;

export const STATION_FIRE_RATE_MS = 2000;
export const STATION_RANGE = 2000;
export const STATION_PROJECTILE_DAMAGE = 15;
export const STATION_DEFENSE_WAVE_COOLDOWN_MS = 60000; // 1 minute
export const STATION_DEFENSE_WAVE_SIZE = 3;


export const ALLY_COST = 2500;
export const REINFORCEMENT_COST = 3000;
export const REINFORCEMENT_COOLDOWN_MS = 180000; // 3 minutes

export const AI_HELP_RADIUS = 1500;

export const MAP_WIDTH = 12000;
export const MAP_HEIGHT = 12000;

export const ZONES: Zone[] = [
    { id: 'start_field_1', type: 'asteroid_field', subtype: 'ore', x: 4000, y: MAP_HEIGHT / 2, radius: 1500, density: 0.4 },
    { id: 'start_field_2', type: 'asteroid_field', subtype: 'ore', x: 2500, y: MAP_HEIGHT/2 - 2000, radius: 1000, density: 0.3 },
    { id: 'enemy_field_1', type: 'asteroid_field', subtype: 'ore', x: MAP_WIDTH - 4000, y: MAP_HEIGHT / 2, radius: 1500, density: 0.4 },
    { id: 'enemy_field_2', type: 'asteroid_field', subtype: 'ore', x: MAP_WIDTH - 2500, y: MAP_HEIGHT/2 + 2000, radius: 1000, density: 0.3 },
    { id: 'center_field_dense', type: 'asteroid_field', subtype: 'ore', x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, radius: 2000, density: 1.0 },
    { id: 'top_gas_field', type: 'asteroid_field', subtype: 'gas', x: MAP_WIDTH / 2 - 3000, y: 2000, radius: 1000, density: 0.2 },
    { id: 'bottom_gas_field', type: 'asteroid_field', subtype: 'gas', x: MAP_WIDTH / 2 + 3000, y: MAP_HEIGHT - 2000, radius: 1000, density: 0.2 },
    { id: 'top_left_nebula', type: 'nebula', x: 2000, y: 2000, radius: 1800, color: 'hsl(260 80% 50% / 0.15)' },
    { id: 'bottom_right_nebula', type: 'nebula', x: MAP_WIDTH - 2000, y: MAP_HEIGHT-2000, radius: 1800, color: 'hsl(190 80% 50% / 0.15)' },
    { id: 'center_vortex', type: 'vortex', x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, radius: 500 },
];

export const UPGRADE_COSTS = {
  maxHealth: [100, 250, 500, 1000, 2000],
  energyRecharge: [150, 300, 600, 1200, 2500],
  nanobots: [500, 1000, 2000, 4000, 8000],
  cargoCapacity: [50, 150, 300, 600, 1200],
  antimatterReactor: [5000, 12000],
};

export const UPGRADE_VALUES = {
  maxHealth: [0, 60, 150, 300, 450, 600], // Additive Bonus HP
  energyRecharge: [0, 0.02, 0.03, 0.04, 0.05, 0.06], // Additive Bonus to base ship recharge
  nanobots: [0, 0.01, 0.02, 0.03, 0.04, 0.05], // HP per frame
  cargoCapacity: [0, 50, 125, 250, 400, 600], // Additive Bonus Cargo
  antimatterReactor: [0, 0.1, 0.25], // Additive Bonus to recharge, always active
};

export const RESOURCE_PRICES = {
  ore: 5,
  gas: 12,
};
