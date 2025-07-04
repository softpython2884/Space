'use client';

import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Ship, CircleDollarSign, TowerControl } from 'lucide-react';
import type { Resources, BotShipType, PlayerShipClass } from '@/lib/types';
import { SHIP_DATA, OUTPOST_COST } from '@/lib/constants';

interface TacticalViewOverlayProps {
    isOpen: boolean;
    playerResources: Resources;
    onBuildShip: (type: BotShipType) => void;
    onBuildOutpost: () => void;
}

export function TacticalViewOverlay({ isOpen, playerResources, onBuildShip, onBuildOutpost }: TacticalViewOverlayProps) {
    if (!isOpen) {
        return null;
    }

    const buildableShips = Object.keys(SHIP_DATA) as PlayerShipClass[];
    const canAffordOutpost = playerResources.money >= OUTPOST_COST;

    return (
        <div
            className={cn(
                "absolute inset-0 z-20 pointer-events-none transition-opacity duration-500",
                isOpen ? "opacity-100" : "opacity-0"
            )}
            data-ui-element="true" // This is a transparent overlay, but we mark it so clicks don't go through to the game when visible
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-black/70" />
            <div 
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(white 0.5px, transparent 0.5px), linear-gradient(90deg, white 0.5px, transparent 0.5px)',
                    backgroundSize: '100px 100px',
                    opacity: 0.05,
                }}
            />
            <div 
                className="absolute w-full h-1 bg-cyan-300/50 animate-[scan_4s_linear_infinite]"
                style={{ top: '0%', animationName: 'scan' }}
            />
            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
            `}</style>

            {/* UI Panel */}
            <div className="absolute top-4 right-4 pointer-events-auto">
                <Card className="w-80 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm" data-ui-element="true">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Tactical Command</CardTitle>
                        <CardDescription>Manage your fleet and issue orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Reinforcements</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {(Object.values(SHIP_DATA)).map(shipInfo => {
                                    const cost = shipInfo.cost;
                                    const canAfford = playerResources.money >= cost;
                                    return (
                                        <Button key={shipInfo.name} className="w-full justify-start" disabled={!canAfford} onClick={() => onBuildShip(shipInfo.name as BotShipType)}>
                                            <PlusCircle className="mr-2"/>Build {shipInfo.name} ({cost} C)
                                        </Button>
                                    )
                                })}
                                 <Button className="w-full justify-start" disabled={!canAffordOutpost} onClick={onBuildOutpost}>
                                    <TowerControl className="mr-2"/>Build Outpost ({OUTPOST_COST} C)
                                </Button>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Fleet Orders</h4>
                            <div className="space-y-2">
                                <Button className="w-full justify-start" disabled><Ship className="mr-2"/>Form Fleet Alpha</Button>
                                <Button className="w-full justify-start" disabled><Ship className="mr-2"/>Disband Selected</Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='p-3'>
                        <div className="text-sm flex items-center gap-2 text-yellow-400">
                            <CircleDollarSign />
                            <span className="font-bold">{playerResources.money} Credits</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
