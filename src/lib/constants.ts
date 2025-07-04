import type { PlayerData, PlayerUpgrades, PlayerShipClass } from "@/lib/types";

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
  health: 100,
  energy: 70,
  cargo: {
    current: 0,
  },
  resources: {
    money: 150,
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
}> = {
    'Chasseur': { name: 'Chasseur', description: 'Vaisseau de base polyvalent. Futur : 1 tourelle manuelle, améliorable avec 1 tourelle auto.', cost: 5, baseHealth: 100, baseCargo: 200 },
    'Intercepteur': { name: 'Intercepteur', description: 'Très rapide, faible soute. Futur : 2 tourelles manuelles, améliorable pour poser des mines.', cost: 5, baseHealth: 75, baseCargo: 100 },
    'Frégate': { name: 'Frégate', description: 'Vaisseau de guerre lourd. Futur : 2 tourelles auto, 1 tourelle lourde manuelle, 1 rayon.', cost: 5, baseHealth: 250, baseCargo: 150 },
    'Destroyer': { name: 'Destroyer', description: 'Plateforme d\'armes ultime. Futur : 3 rayons, 2 tourelles auto lourdes, 2 manuelles lourdes.', cost: 5, baseHealth: 400, baseCargo: 250 },
    'Porteur': { name: 'Porteur', description: 'Transporte des unités de soutien. Futur : peut déployer 2 intercepteurs et 1 chasseur.', cost: 5, baseHealth: 200, baseCargo: 300 },
    'Cargo': { name: 'Cargo', description: 'Soute immense, coque résistante. Futur : 1 tourelle manuelle de défense.', cost: 5, baseHealth: 150, baseCargo: 1000 },
    'Mineur': { name: 'Mineur', description: 'Extraction rapide des ressources. Futur : 1 tourelle manuelle. Vitesse de minage x1.5.', cost: 5, baseHealth: 100, baseCargo: 500, miningBonus: 1.5 },
};

export const ALLY_COST = 2500;

export const AI_HELP_RADIUS = 700;


export const UPGRADE_COSTS = {
  maxHealth: [100, 250, 500, 1000, 2000],
  energyRecharge: [150, 300, 600, 1200, 2500],
  nanobots: [500, 1000, 2000, 4000, 8000],
  cargoCapacity: [50, 150, 300, 600, 1200],
};

export const UPGRADE_VALUES = {
  maxHealth: [0, 20, 50, 100, 150, 200], // Additive Bonus HP
  energyRecharge: [0.02, 0.025, 0.03, 0.04, 0.05, 0.06],
  nanobots: [0, 0.005, 0.01, 0.015, 0.02, 0.03],
  cargoCapacity: [0, 50, 125, 250, 400, 600], // Additive Bonus Cargo
};

export const RESOURCE_PRICES = {
  ore: 5,
  gas: 12,
};
