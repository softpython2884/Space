'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Codepen, Download, Trash2, Shield, Target, Zap } from 'lucide-react';
import Link from 'next/link';

// Placeholder types, we'll expand these later
type Module = {
  id: string;
  name: string;
  type: 'Hull' | 'Cockpit' | 'Weapon' | 'Engine';
  icon: React.ElementType;
  size: [number, number]; // [width, height] in grid units
  cost: number;
  power: number; // can be negative for consumers
};

type ShipCell = {
  moduleId: string | null;
};

const GRID_SIZE = 20;

const AVAILABLE_MODULES: Module[] = [
  { id: 'cockpit_basic', name: 'Basic Cockpit', type: 'Cockpit', icon: Shield, size: [2, 2], cost: 100, power: 5 },
  { id: 'hull_small', name: 'Small Hull', type: 'Hull', icon: Codepen, size: [1, 1], cost: 10, power: 0 },
  { id: 'laser_light', name: 'Light Laser', type: 'Weapon', icon: Target, size: [1, 2], cost: 50, power: -10 },
  { id: 'engine_small', name: 'Small Engine', type: 'Engine', icon: Zap, size: [2, 1], cost: 80, power: -5 },
];

export function ShipBuilderView() {
  const [grid, setGrid] = useState<ShipCell[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ moduleId: null }))
  );
  const [shipName, setShipName] = useState('My Custom Ship');

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
              <CardTitle className="font-headline text-2xl">Ship Builder</CardTitle>
              <CardDescription>Drag and drop modules to design your ship.</CardDescription>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Hub</Button>
            </Link>
           </CardHeader>
        </Card>
        <Card className="flex-grow bg-secondary/20 border-secondary p-4 flex items-center justify-center">
            <div 
              className="grid bg-black/30 border border-dashed border-primary/30"
              style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 2rem)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 2rem)`,
                  width: `${GRID_SIZE * 2}rem`,
                  height: `${GRID_SIZE * 2}rem`,
              }}
            >
              {grid.flat().map((cell, index) => (
                <div key={index} className="border border-primary/10 hover:bg-primary/20 transition-colors" />
              ))}
            </div>
        </Card>
      </div>

      {/* Right Sidebar: Palette and Stats */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        {/* Actions & Stats */}
        <Card className="bg-secondary/40 border-secondary">
          <CardHeader className="p-4">
            <CardTitle className="font-headline">Ship Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
             <div>
                <label htmlFor="shipName" className="text-sm font-medium text-muted-foreground">Ship Name</label>
                <Input 
                  id="shipName"
                  value={shipName} 
                  onChange={(e) => setShipName(e.target.value)}
                  className="mt-1"
                />
             </div>
             <Separator />
             <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Cost:</span> <span className="font-mono">0 Credits</span></div>
                <div className="flex justify-between"><span>Power Usage:</span> <span className="font-mono">0 / 0</span></div>
                <div className="flex justify-between"><span>Mass:</span> <span className="font-mono">0 tons</span></div>
             </div>
             <Separator />
             <div className="flex gap-2">
                 <Button onClick={handleClear} variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear
                 </Button>
                <Button onClick={handleExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Export Design
                </Button>
             </div>
          </CardContent>
        </Card>

        {/* Module Palette */}
        <Card className="bg-secondary/40 border-secondary flex-grow flex flex-col">
          <CardHeader className="p-4">
            <CardTitle className="font-headline">Module Palette</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow">
            <ScrollArea className="h-full">
                <div className="space-y-2">
                {AVAILABLE_MODULES.map(module => (
                  <div key={module.id} className="p-3 bg-background/50 rounded-lg border border-transparent hover:border-primary cursor-grab transition-all">
                      <div className="flex items-center gap-3">
                        <module.icon className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-semibold">{module.name}</p>
                          <p className="text-xs text-muted-foreground">{module.type} - {module.size[0]}x{module.size[1]}</p>
                        </div>
                      </div>
                  </div>
                ))}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
