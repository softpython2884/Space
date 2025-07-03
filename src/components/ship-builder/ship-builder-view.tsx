'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Download, Trash2, Shield, Target, Zap, Snowflake, BrainCircuit, Ghost, Container, Power, ChevronsUpDown, LocateFixed, Crosshair, AppWindow, Atom, Waves, GitBranch, Wrench, Mountain, Gauge, Bot, Wind
} from 'lucide-react';
import Link from 'next/link';

type ModuleCategory = 'Coques' | 'Propulsion' | 'Réacteurs' | 'Défense' | 'Armes' | 'Systèmes';

type Module = {
  id: string;
  name: string;
  category: ModuleCategory;
  description: string;
  icon: React.ElementType;
  size: [number, number]; // [width, height] in grid units
  cost: number;
  mass: number;
  power: number; // generation is positive, consumption is negative
};

const GRID_SIZE = 32;
const CELL_SIZE_REM = 1.5;

const INITIAL_SHIP_DESIGN = {
  name: "Vaisseau de Test",
  modules: [
    { moduleId: "hull_medium", row: 15, col: 16 },
    { moduleId: "hull_medium", row: 15, col: 13 },
    { moduleId: "hull_medium", row: 16, col: 19 },
    { moduleId: "hull_medium", row: 16, col: 10 },
    { moduleId: "hull_light", row: 13, col: 16 },
    { moduleId: "hull_light", row: 13, col: 14 },
    { moduleId: "hull_medium", row: 10, col: 16 },
    { moduleId: "hull_medium", row: 10, col: 13 },
    { moduleId: "hull_medium", row: 7, col: 18 },
    { moduleId: "hull_medium", row: 7, col: 11 },
    { moduleId: "hull_medium", row: 19, col: 19 },
    { moduleId: "hull_medium", row: 19, col: 10 },
    { moduleId: "hull_medium", row: 8, col: 21 },
    { moduleId: "hull_medium", row: 8, col: 8 },
    { moduleId: "hull_medium", row: 10, col: 24 },
    { moduleId: "hull_medium", row: 10, col: 5 },
    { moduleId: "hull_medium", row: 13, col: 24 },
    { moduleId: "hull_medium", row: 13, col: 5 },
    { moduleId: "hull_medium", row: 16, col: 24 },
    { moduleId: "hull_medium", row: 16, col: 5 },
    { moduleId: "hull_medium", row: 19, col: 23 },
    { moduleId: "hull_medium", row: 19, col: 6 },
    { moduleId: "hull_medium", row: 22, col: 21 },
    { moduleId: "hull_medium", row: 22, col: 8 },
    { moduleId: "engine_basic", row: 22, col: 19 },
    { moduleId: "engine_basic", row: 22, col: 11 },
    { moduleId: "engine_basic", row: 22, col: 24 },
    { moduleId: "engine_basic", row: 22, col: 6 },
    { moduleId: "engine_basic", row: 25, col: 21 },
    { moduleId: "engine_basic", row: 25, col: 9 },
    { moduleId: "thruster_directional", row: 19, col: 26 },
    { moduleId: "thruster_directional", row: 19, col: 5 },
    { moduleId: "thruster_directional", row: 25, col: 23 },
    { moduleId: "thruster_directional", row: 25, col: 8 },
    { moduleId: "thruster_directional", row: 21, col: 9 },
    { moduleId: "thruster_directional", row: 21, col: 22 },
    { moduleId: "thruster_directional", row: 7, col: 21 },
    { moduleId: "thruster_directional", row: 7, col: 10 },
    { moduleId: "engine_basic", row: 7, col: 22 },
    { moduleId: "engine_basic", row: 7, col: 8 },
    { moduleId: "engine_basic", row: 9, col: 24 },
    { moduleId: "engine_basic", row: 9, col: 6 },
    { moduleId: "thruster_directional", row: 9, col: 26 },
    { moduleId: "thruster_directional", row: 9, col: 5 },
    { moduleId: "engine_basic", row: 6, col: 18 },
    { moduleId: "engine_basic", row: 6, col: 12 },
    { moduleId: "thruster_directional", row: 6, col: 20 },
    { moduleId: "thruster_directional", row: 6, col: 11 },
    { moduleId: "reactor_small", row: 17, col: 22 },
    { moduleId: "reactor_small", row: 17, col: 8 },
    { moduleId: "reactor_small", row: 15, col: 22 },
    { moduleId: "reactor_small", row: 15, col: 8 },
    { moduleId: "reactor_small", row: 13, col: 22 },
    { moduleId: "reactor_small", row: 13, col: 8 },
    { moduleId: "reactor_small", row: 11, col: 22 },
    { moduleId: "reactor_small", row: 11, col: 8 },
    { moduleId: "shield_light", row: 19, col: 22 },
    { moduleId: "shield_light", row: 19, col: 9 },
    { moduleId: "shield_light", row: 20, col: 22 },
    { moduleId: "shield_light", row: 20, col: 9 },
    { moduleId: "cooling_passive", row: 18, col: 13 },
    { moduleId: "cooling_passive", row: 18, col: 18 },
    { moduleId: "shield_light", row: 18, col: 14 },
    { moduleId: "shield_light", row: 18, col: 17 },
    { moduleId: "laser_light", row: 10, col: 27 },
    { moduleId: "laser_light", row: 10, col: 4 },
    { moduleId: "laser_light", row: 12, col: 27 },
    { moduleId: "laser_light", row: 12, col: 4 },
    { moduleId: "laser_light", row: 14, col: 27 },
    { moduleId: "laser_light", row: 14, col: 4 },
    { moduleId: "cannon_basic", row: 14, col: 20 },
    { moduleId: "cannon_basic", row: 14, col: 10 },
    { moduleId: "missile_pod", row: 11, col: 20 },
    { moduleId: "missile_pod", row: 11, col: 10 },
    { moduleId: "storage_small", row: 13, col: 18 },
    { moduleId: "storage_small", row: 13, col: 12 },
    { moduleId: "targeting_basic", row: 15, col: 19 },
    { moduleId: "targeting_basic", row: 15, col: 12 },
    { moduleId: "stealth_module", row: 9, col: 14 },
    { moduleId: "stealth_module", row: 9, col: 17 },
    { moduleId: "shield_light", row: 10, col: 20 },
    { moduleId: "shield_light", row: 10, col: 11 },
    { moduleId: "shield_light", row: 12, col: 19 },
    { moduleId: "shield_light", row: 12, col: 12 },
    { moduleId: "cooling_passive", row: 10, col: 19 },
    { moduleId: "cooling_passive", row: 10, col: 12 },
  ]
};

const MODULE_PALETTE: Record<ModuleCategory, Module[]> = {
  'Coques': [
    { id: 'hull_light', name: 'Coque Légère', category: 'Coques', description: "Structure de base, peu résistante mais légère.", icon: AppWindow, size: [2, 2], cost: 100, mass: 50, power: 0 },
    { id: 'hull_medium', name: 'Coque Moyenne', category: 'Coques', description: "Bon compromis entre résistance et poids.", icon: AppWindow, size: [3, 3], cost: 300, mass: 150, power: 0 },
    { id: 'hull_heavy', name: 'Coque Lourde', category: 'Coques', description: "Très résistante mais lourde.", icon: AppWindow, size: [4, 4], cost: 800, mass: 400, power: 0 },
  ],
  'Propulsion': [
    { id: 'engine_basic', name: 'Moteur Simple', category: 'Propulsion', description: "Propulsion de base.", icon: Zap, size: [2, 1], cost: 200, mass: 20, power: -20 },
    { id: 'engine_high_speed', name: 'Moteur à Grande Vitesse', category: 'Propulsion', description: "Optimisé pour la vitesse de pointe, moins d'accélération.", icon: Wind, size: [2, 1], cost: 400, mass: 15, power: -30 },
    { id: 'thruster_directional', name: 'Propulseur Latéral', category: 'Propulsion', description: "Améliore la manœuvrabilité.", icon: ChevronsUpDown, size: [1, 1], cost: 150, mass: 5, power: -5 },
  ],
  'Réacteurs': [
     { id: 'reactor_small', name: 'Petit Réacteur', category: 'Réacteurs', description: "Fournit une énergie limitée.", icon: Power, size: [2, 2], cost: 500, mass: 100, power: 100 },
     { id: 'reactor_fusion', name: 'Réacteur à Fusion', category: 'Réacteurs', description: "Très puissant mais instable et lourd.", icon: Atom, size: [3, 3], cost: 2000, mass: 250, power: 500 },
  ],
  'Défense': [
    { id: 'shield_light', name: 'Bouclier Léger', category: 'Défense', description: "Protection énergétique de base.", icon: Shield, size: [1, 1], cost: 300, mass: 15, power: -15 },
    { id: 'shield_heavy', name: 'Bouclier Lourd', category: 'Défense', description: "Haute capacité, recharge lente.", icon: Shield, size: [2, 2], cost: 700, mass: 40, power: -35 },
    { id: 'cooling_passive', name: 'Radiateur Passif', category: 'Défense', description: "Dissipe la chaleur des systèmes.", icon: Snowflake, size: [1, 2], cost: 100, mass: 10, power: -2 },
    { id: 'cooling_active', name: 'Ventilateur Actif', category: 'Défense', description: "Refroidissement puissant mais énergivore.", icon: Waves, size: [1, 1], cost: 250, mass: 15, power: -10 },
  ],
  'Armes': [
    { id: 'laser_light', name: 'Laser Léger', category: 'Armes', description: "Arme énergétique à tir rapide.", icon: Target, size: [1, 2], cost: 250, mass: 10, power: -10 },
    { id: 'cannon_basic', name: 'Canon Balistique', category: 'Armes', description: "Tire des projectiles physiques.", icon: Crosshair, size: [2, 2], cost: 400, mass: 30, power: -5 },
    { id: 'missile_pod', name: 'Lance-missiles', category: 'Armes', description: "Tire des missiles à tête chercheuse.", icon: LocateFixed, size: [2, 3], cost: 800, mass: 50, power: -8 },
  ],
  'Systèmes': [
    { id: 'storage_small', name: 'Soute Standard', category: 'Systèmes', description: "Stockage de cargo.", icon: Container, size: [2, 2], cost: 50, mass: 20, power: 0 },
    { id: 'targeting_basic', name: 'IA de Ciblage', category: 'Systèmes', description: "Aide à la visée.", icon: BrainCircuit, size: [1, 1], cost: 1000, mass: 5, power: -10 },
    { id: 'stealth_module', name: 'Module Furtif', category: 'Systèmes', description: "Réduit la signature radar.", icon: Ghost, size: [1, 1], cost: 1500, mass: 10, power: -30 },
    { id: 'jump_drive', name: 'Module de Saut', category: 'Systèmes', description: "Permet des déplacements rapides inter-systèmes.", icon: GitBranch, size: [2, 2], cost: 2500, mass: 70, power: -50 },
    { id: 'repair_nanobots', name: 'Nanobots de Réparation', category: 'Systèmes', description: "Répare lentement la coque en continu.", icon: Wrench, size: [1, 1], cost: 1800, mass: 15, power: -20 },
    { id: 'mining_laser', name: 'Laser d\'Extraction', category: 'Systèmes', description: "Pour le minage d'astéroïdes.", icon: Mountain, size: [1, 3], cost: 900, mass: 25, power: -15 },
    { id: 'overclocking_module', name: 'Module d\'Overclocking', category: 'Systèmes', description: "Boost temporaire des systèmes en échange de chaleur.", icon: Gauge, size: [1, 1], cost: 2000, mass: 5, power: -5 },
    { id: 'drone_bay', name: 'Baie à Drones', category: 'Systèmes', description: "Déploie des drones de combat ou de service.", icon: Bot, size: [2, 3], cost: 1500, mass: 40, power: -25 },
  ]
};

type PlacedModule = {
  instanceId: string;
  moduleId: string;
  row: number;
  col: number;
};

export function ShipBuilderView() {
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>(
    INITIAL_SHIP_DESIGN.modules.map((m, i) => ({ ...m, instanceId: `${m.moduleId}_${Date.now()}_${i}` }))
  );
  const [shipName, setShipName] = useState(INITIAL_SHIP_DESIGN.name);
  const [cellSize, setCellSize] = useState(24);
  const [draggedItem, setDraggedItem] = useState<{
    type: 'new';
    moduleId: string;
  } | {
    type: 'move';
    instanceId: string;
    moduleId: string;
  } | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{ row: number; col: number } | null>(null);
  const [isSymmetryEnabled, setIsSymmetryEnabled] = useState(false);

  useEffect(() => {
    const size = parseFloat(getComputedStyle(document.documentElement).fontSize) * CELL_SIZE_REM;
    setCellSize(size);
  }, []);

  const allModules: Record<string, Module> = useMemo(() => 
    Object.values(MODULE_PALETTE).flat().reduce((acc, module) => {
        acc[module.id] = module;
        return acc;
    }, {} as Record<string, Module>)
  , []);

  const getModuleById = (id: string) => allModules[id];
  
  const placedModuleDetails = useMemo(() => {
    return placedModules.map(pm => {
      const module = getModuleById(pm.moduleId);
      if (!module) return null;
      return { ...pm, module };
    }).filter(Boolean) as (PlacedModule & { module: Module })[];
  }, [placedModules, allModules]);


  const handlePaletteDragStart = (e: React.DragEvent<HTMLDivElement>, module: Module) => {
    setDraggedItem({ type: 'new', moduleId: module.id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGridDragStart = (e: React.DragEvent<HTMLDivElement>, placedModule: PlacedModule) => {
    setDraggedItem({ type: 'move', instanceId: placedModule.instanceId, moduleId: placedModule.moduleId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem) return;

    const gridRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (ghostPosition?.row !== row || ghostPosition?.col !== col) {
      setGhostPosition({ row, col });
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setGhostPosition(null);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setGhostPosition(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem || !ghostPosition) return;
  
    const { row, col } = ghostPosition;
    const module = getModuleById(draggedItem.moduleId);
    if (!module) return;
  
    if (row < 0 || col < 0 || row + module.size[1] > GRID_SIZE || col + module.size[0] > GRID_SIZE) return;
  
    const isColliding = (r: number, c: number, modulesToCheck: PlacedModule[]) => {
      const moduleToCheck = getModuleById(draggedItem.moduleId);
      if (!moduleToCheck) return true;
      const newModuleRect = { x1: c, y1: r, x2: c + moduleToCheck.size[0], y2: r + moduleToCheck.size[1] };
      for (const placed of modulesToCheck) {
        const placedModule = getModuleById(placed.moduleId);
        if (!placedModule) continue;
        const existingModuleRect = { x1: placed.col, y1: placed.row, x2: placed.col + placedModule.size[0], y2: placed.row + placedModule.size[1] };
        if (newModuleRect.x1 < existingModuleRect.x2 && newModuleRect.x2 > existingModuleRect.x1 &&
            newModuleRect.y1 < existingModuleRect.y2 && newModuleRect.y2 > existingModuleRect.y1) {
          return true;
        }
      }
      return false;
    };
  
    if (draggedItem.type === 'move') {
      const otherModules = placedModules.filter(p => p.instanceId !== draggedItem.instanceId);
      if (isColliding(row, col, otherModules)) return;
      setPlacedModules(prev => prev.map(p => p.instanceId === draggedItem.instanceId ? { ...p, row, col } : p));
    } else if (draggedItem.type === 'new') {
      if (isSymmetryEnabled) {
        const mirroredCol = GRID_SIZE - col - module.size[0];
        if (mirroredCol < 0 || (mirroredCol + module.size[0]) > GRID_SIZE) return;
        
        if (isColliding(row, col, placedModules)) return;
        if (isColliding(row, mirroredCol, placedModules)) return;

        const newModuleRect = { x1: col, y1: row, x2: col + module.size[0], y2: row + module.size[1] };
        const mirroredModuleRect = { x1: mirroredCol, y1: row, x2: mirroredCol + module.size[0], y2: row + module.size[1] };
        if (newModuleRect.x1 < mirroredModuleRect.x2 && newModuleRect.x2 > mirroredModuleRect.x1) return;

        setPlacedModules(prev => [...prev, 
          { instanceId: `${module.id}_${Date.now()}`, moduleId: module.id, row, col },
          { instanceId: `${module.id}_${Date.now()+1}`, moduleId: module.id, row, col: mirroredCol }
        ]);

      } else {
        if (isColliding(row, col, placedModules)) return;
        setPlacedModules(prev => [...prev, { instanceId: `${module.id}_${Date.now()}`, moduleId: module.id, row, col }]);
      }
    }
  
    setGhostPosition(null);
    setDraggedItem(null);
  };

  const handleRemoveModule = (instanceId: string) => {
    setPlacedModules(prev => prev.filter(p => p.instanceId !== instanceId));
  };

  const stats = useMemo(() => {
    return placedModuleDetails.reduce((acc, { module }) => {
      acc.cost += module.cost;
      acc.powerGenerated += Math.max(0, module.power);
      acc.powerConsumed += Math.abs(Math.min(0, module.power));
      acc.mass += module.mass;
      return acc;
    }, { cost: 0, powerGenerated: 0, powerConsumed: 0, mass: 0 });
  }, [placedModuleDetails]);

  const handleExport = () => {
    const shipDesign = {
      name: shipName,
      modules: placedModules.map(pm => ({
          moduleId: pm.moduleId,
          row: pm.row,
          col: pm.col,
      })),
      stats: {
        ...stats,
        powerNet: stats.powerGenerated - stats.powerConsumed,
      },
    };
    const json = JSON.stringify(shipDesign, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shipName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleClear = () => {
    setPlacedModules([]);
  };

  const draggedModule = draggedItem ? getModuleById(draggedItem.moduleId) : null;

  return (
    <div className="flex h-screen w-full bg-background p-4 gap-4">
      <div className="flex-grow flex flex-col gap-4">
        <Card className="bg-secondary/20 border-secondary">
           <CardHeader className="flex flex-row items-center justify-between p-4">
            <div>
              <CardTitle className="font-headline text-2xl">Constructeur de Vaisseau</CardTitle>
              <CardDescription>Concevez votre vaisseau en plaçant des modules sur la grille.</CardDescription>
            </div>
            <Link href="/">
              <Button variant="outline">Retour au Hub</Button>
            </Link>
           </CardHeader>
        </Card>
        <Card className="flex-grow bg-secondary/20 border-secondary p-4 flex items-center justify-center overflow-auto">
            <div 
              className="relative bg-black/30 border border-dashed border-primary/30"
              style={{
                  width: `${GRID_SIZE * CELL_SIZE_REM}rem`,
                  height: `${GRID_SIZE * CELL_SIZE_REM}rem`,
                  backgroundImage: `linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
                                    linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
                  backgroundSize: `${CELL_SIZE_REM}rem ${CELL_SIZE_REM}rem`,
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
            >
              <div className="absolute top-0 left-1/2 w-px h-full bg-primary/20 border-r border-dashed border-primary/30 pointer-events-none" />
              <div className="absolute left-0 top-1/2 h-px w-full bg-primary/20 border-b border-dashed border-primary/30 pointer-events-none" />

              {placedModuleDetails.map(pm => (
                <div 
                    key={pm.instanceId}
                    className="group absolute flex items-center justify-center bg-primary/20 border border-primary/50 text-primary-foreground hover:bg-primary/40 rounded-sm cursor-move"
                    style={{
                        left: `${pm.col * CELL_SIZE_REM}rem`,
                        top: `${pm.row * CELL_SIZE_REM}rem`,
                        width: `${pm.module.size[0] * CELL_SIZE_REM}rem`,
                        height: `${pm.module.size[1] * CELL_SIZE_REM}rem`,
                    }}
                    draggable="true"
                    onDragStart={(e) => handleGridDragStart(e, pm)}
                >
                    <pm.module.icon className="h-2/3 w-2/3 opacity-70 pointer-events-none"/>
                    <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => handleRemoveModule(pm.instanceId)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
              ))}
              
              {ghostPosition && draggedModule && (
                <>
                  <div
                    className="absolute bg-primary/40 border-2 border-dashed border-primary pointer-events-none rounded-sm"
                    style={{
                      left: `${ghostPosition.col * CELL_SIZE_REM}rem`,
                      top: `${ghostPosition.row * CELL_SIZE_REM}rem`,
                      width: `${draggedModule.size[0] * CELL_SIZE_REM}rem`,
                      height: `${draggedModule.size[1] * CELL_SIZE_REM}rem`,
                    }}
                  />
                  {isSymmetryEnabled && draggedItem?.type === 'new' && (
                     <div
                      className="absolute bg-primary/20 border-2 border-dashed border-primary/50 pointer-events-none rounded-sm"
                      style={{
                        left: `${(GRID_SIZE - ghostPosition.col - draggedModule.size[0]) * CELL_SIZE_REM}rem`,
                        top: `${ghostPosition.row * CELL_SIZE_REM}rem`,
                        width: `${draggedModule.size[0] * CELL_SIZE_REM}rem`,
                        height: `${draggedModule.size[1] * CELL_SIZE_REM}rem`,
                      }}
                    />
                  )}
                </>
              )}
            </div>
        </Card>
      </div>

      <div className="w-96 flex-shrink-0 flex flex-col gap-4">
        <Card className="bg-secondary/40 border-secondary">
          <CardHeader className="p-4">
            <CardTitle className="font-headline">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
             <div>
                <label htmlFor="shipName" className="text-sm font-medium text-muted-foreground">Nom du Vaisseau</label>
                <Input 
                  id="shipName"
                  value={shipName} 
                  onChange={(e) => setShipName(e.target.value)}
                  className="mt-1"
                />
             </div>
             <div className="flex items-center space-x-2 pt-2">
                <Switch 
                    id="symmetry-mode"
                    checked={isSymmetryEnabled}
                    onCheckedChange={setIsSymmetryEnabled}
                />
                <Label htmlFor="symmetry-mode">Mode Symétrie (X)</Label>
             </div>
             <Separator />
             <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Coût Total:</span> <span className="font-mono text-primary">{stats.cost} Crédits</span></div>
                <div className="flex justify-between">
                  <span>Énergie (Nette/Gén.):</span> 
                  <span className={`font-mono ${stats.powerGenerated - stats.powerConsumed < 0 ? 'text-red-500' : 'text-primary'}`}>
                    {stats.powerGenerated - stats.powerConsumed} / {stats.powerGenerated}
                  </span>
                </div>
                <div className="flex justify-between"><span>Masse:</span> <span className="font-mono text-primary">{stats.mass} tonnes</span></div>
             </div>
             <Separator />
             <div className="flex gap-2">
                 <Button onClick={handleClear} variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Vider
                 </Button>
                <Button onClick={handleExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Exporter
                </Button>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/40 border-secondary flex-grow flex flex-col">
          <CardHeader className="p-4">
            <CardTitle className="font-headline">Palette des Modules</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow">
            <ScrollArea className="h-full pr-3">
              <Accordion type="multiple" defaultValue={Object.keys(MODULE_PALETTE)} className="w-full">
                {(Object.keys(MODULE_PALETTE) as ModuleCategory[]).map(category => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="font-semibold">{category}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {MODULE_PALETTE[category].map(module => (
                          <div 
                            key={module.id} 
                            className="p-3 bg-background/50 rounded-lg border border-transparent hover:border-primary cursor-grab transition-all"
                            draggable="true"
                            onDragStart={(e) => handlePaletteDragStart(e, module)}
                            onDragEnd={handleDragEnd}
                          >
                              <div className="flex items-start gap-3">
                                <module.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-grow">
                                  <div className="flex justify-between items-center">
                                    <p className="font-semibold">{module.name}</p>
                                    <p className="text-xs text-muted-foreground">{module.size[0]}x{module.size[1]}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{module.description}</p>
                                </div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
