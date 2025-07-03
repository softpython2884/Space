'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Codepen, Download, Trash2, Shield, Target, Zap, Snowflake, BrainCircuit, Ghost, Radar, Container, Power, ChevronsUpDown, LocateFixed, Crosshair, AppWindow
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

const MODULE_PALETTE: Record<ModuleCategory, Module[]> = {
  'Coques': [
    { id: 'hull_light', name: 'Coque Légère', category: 'Coques', description: "Structure de base, peu résistante mais légère.", icon: AppWindow, size: [2, 2], cost: 100, mass: 50, power: 0 },
    { id: 'hull_medium', name: 'Coque Moyenne', category: 'Coques', description: "Bon compromis entre résistance et poids.", icon: AppWindow, size: [3, 3], cost: 300, mass: 150, power: 0 },
  ],
  'Propulsion': [
    { id: 'engine_basic', name: 'Moteur Simple', category: 'Propulsion', description: "Propulsion de base.", icon: Zap, size: [2, 1], cost: 200, mass: 20, power: -20 },
    { id: 'thruster_directional', name: 'Propulseur Latéral', category: 'Propulsion', description: "Améliore la manœuvrabilité.", icon: ChevronsUpDown, size: [1, 1], cost: 150, mass: 5, power: -5 },
  ],
  'Réacteurs': [
     { id: 'reactor_small', name: 'Petit Réacteur', category: 'Réacteurs', description: "Fournit une énergie limitée.", icon: Power, size: [2, 2], cost: 500, mass: 100, power: 100 },
  ],
  'Défense': [
    { id: 'shield_light', name: 'Bouclier Léger', category: 'Défense', description: "Protection énergétique de base.", icon: Shield, size: [1, 1], cost: 300, mass: 15, power: -15 },
    { id: 'cooling_passive', name: 'Radiateur Passif', category: 'Défense', description: "Dissipe la chaleur des systèmes.", icon: Snowflake, size: [1, 2], cost: 100, mass: 10, power: -2 },
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
  ]
};

type ShipCell = {
  moduleId: string | null;
};

export function ShipBuilderView() {
  const [grid, setGrid] = useState<ShipCell[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ moduleId: null }))
  );
  const [shipName, setShipName] = useState('Mon Vaisseau Personnalisé');

  const handleExport = () => {
    const shipDesign = {
      name: shipName,
      grid,
      // We will add more stats and data here later
    };
    const json = JSON.stringify(shipDesign, null, 2);
    console.log(json);
    
    // Create a blob and download it
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shipName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleClear = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ moduleId: null })));
  }

  return (
    <div className="flex h-screen w-full bg-background p-4 gap-4">
      {/* Main Content: Grid */}
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
              className="grid bg-black/30 border border-dashed border-primary/30"
              style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1.5rem)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 1.5rem)`,
                  width: `${GRID_SIZE * 1.5}rem`,
                  height: `${GRID_SIZE * 1.5}rem`,
              }}
            >
              {grid.flat().map((cell, index) => (
                <div key={index} className="border border-primary/10 hover:bg-primary/20 transition-colors" />
              ))}
            </div>
        </Card>
      </div>

      {/* Right Sidebar: Palette and Stats */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-4">
        {/* Actions & Stats */}
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
             <Separator />
             <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Coût Total:</span> <span className="font-mono text-primary">0 Crédits</span></div>
                <div className="flex justify-between"><span>Énergie:</span> <span className="font-mono text-primary">0 / 0</span></div>
                <div className="flex justify-between"><span>Masse:</span> <span className="font-mono text-primary">0 tonnes</span></div>
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

        {/* Module Palette */}
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
                          <div key={module.id} className="p-3 bg-background/50 rounded-lg border border-transparent hover:border-primary cursor-grab transition-all">
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
