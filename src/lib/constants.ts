import type { PlayerData, PlayerUpgrades, PlayerShipClass, WeaponConfig } from "@/lib/types";

export const INITIAL_PLAYER_UPGRADES: PlayerUpgrades = {
  maxHealth: 0,
  energyRecharge: 0,
  nanobots: 0,
  cargoCapacity: 0,
};

export const INITIAL_PLAYER_DATA: PlayerData = {
  level: 5,
  ship: {
    class: "Chasseur",
    role: "Combat",
    size: "S",
    upgrades: {
      "Laser Cannon": 2,
      "Deflector Shields": 1,
    },
  },
  health: 300,
  energy: 70,
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

export const SHIP_DATA: Record<PlayerShipClass, {
    name: PlayerShipClass;
    description: string;
    cost: number;
    baseHealth: number;
    baseCargo: number;
    miningBonus?: number;
    weapons: WeaponConfig;
}> = {
    'Chasseur': { name: 'Chasseur', description: 'Vaisseau de base polyvalent. 1 tourelle manuelle, améliorable avec 1 tourelle auto.', cost: 1000, baseHealth: 300, baseCargo: 200, weapons: { manualTurrets: { count: 1, type: 'basic', offsets: [{x: 0, y: -20}] }, autoTurrets: { count: 0, type: 'basic', offsets: [{x: -15, y: 10}, {x: 15, y: 10}] } } },
    'Intercepteur': { name: 'Intercepteur', description: 'Très rapide, faible soute. 2 tourelles manuelles, améliorable pour poser des mines.', cost: 1500, baseHealth: 225, baseCargo: 100, weapons: { manualTurrets: { count: 2, type: 'basic', offsets: [{x: -15, y: -5}, {x: 15, y: -5}] } } },
    'Frégate': { name: 'Frégate', description: 'Vaisseau de guerre lourd. 1 tourelle lourde manuelle, 2 automatiques, 1 rayon.', cost: 4000, baseHealth: 750, baseCargo: 150, weapons: { manualTurrets: { count: 1, type: 'heavy', offsets: [{x: 0, y: -25}] }, beam: { count: 1, type: 'basic', offsets: [{x: 0, y: 10}] }, autoTurrets: { count: 2, type: 'basic', offsets: [{x: -20, y: 20}, {x: 20, y: 20}] } } },
    'Destroyer': { name: 'Destroyer', description: 'Plateforme d\'armes ultime. 2 tourelles manuelles lourdes, 2 auto lourdes, 3 rayons.', cost: 10000, baseHealth: 1200, baseCargo: 250, weapons: { manualTurrets: { count: 2, type: 'heavy', offsets: [{x: -15, y: -30}, {x: 15, y: -30}] }, beam: { count: 3, type: 'heavy', offsets: [{x: 0, y: 0}, {x: -25, y: 15}, {x: 25, y: 15}] }, autoTurrets: { count: 2, type: 'heavy', offsets: [{x: -25, y: 30}, {x: 25, y: 30}] } } },
    'Porteur': { name: 'Porteur', description: 'Transporte des unités de soutien. Peut déployer 2 intercepteurs et 1 chasseur.', cost: 8000, baseHealth: 600, baseCargo: 300, weapons: { manualTurrets: { count: 0, type: 'basic', offsets: [] } } },
    'Cargo': { name: 'Cargo', description: 'Soute immense, coque résistante. 1 tourelle manuelle de défense.', cost: 3000, baseHealth: 450, baseCargo: 1000, weapons: { manualTurrets: { count: 1, type: 'basic', offsets: [{x: 0, y: 0}] } } },
    'Mineur': { name: 'Mineur', description: 'Extraction rapide des ressources. 1 tourelle manuelle. Vitesse de minage x1.5.', cost: 2000, baseHealth: 300, baseCargo: 500, miningBonus: 1.5, weapons: { manualTurrets: { count: 1, type: 'basic', offsets: [{x: 0, y: -15}] } } },
};

export const STATION_BASE_HEALTH = 45000;
export const STATION_BASE_SHIELD = 9000;
export const OUTPOST_COST = 5000;


export const ALLY_COST = 2500;

export const AI_HELP_RADIUS = 700;


export const UPGRADE_COSTS = {
  maxHealth: [100, 250, 500, 1000, 2000],
  energyRecharge: [150, 300, 600, 1200, 2500],
  nanobots: [500, 1000, 2000, 4000, 8000],
  cargoCapacity: [50, 150, 300, 600, 1200],
};

export const UPGRADE_VALUES = {
  maxHealth: [0, 60, 150, 300, 450, 600], // Additive Bonus HP
  energyRecharge: [0.02, 0.025, 0.03, 0.04, 0.05, 0.06],
  nanobots: [0, 0.005, 0.01, 0.015, 0.02, 0.03],
  cargoCapacity: [0, 50, 125, 250, 400, 600], // Additive Bonus Cargo
};

export const RESOURCE_PRICES = {
  ore: 5,
  gas: 12,
};
