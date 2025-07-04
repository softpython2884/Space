'use client';

import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Ship, CircleDollarSign, TowerControl, Shield, Skull, UserPlus, CircleStop } from 'lucide-react';
import type { Resources, BotShipType, PlayerShipClass } from '@/lib/types';
import { SHIP_DATA, OUTPOST_COST, REINFORCEMENT_COST } from '@/lib/constants';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface TacticalViewOverlayProps {
    isOpen: boolean;
    playerResources: Resources;
    onBuildShip: (type: BotShipType) => void;
    onBuildOutpost: () => void;
    onAllFollow: () => void;
    onAllAttack: () => void;
    onAllHold: () => void;
    onCallReinforcements: () => void;
    canCallReinforcements: boolean;
    isPlacingReinforcements: boolean;
}

const ShipBuildCard = ({ shipInfo, canAfford, onBuildShip }: { shipInfo: (typeof SHIP_DATA)[PlayerShipClass], canAfford: boolean, onBuildShip: (type: BotShipType) => void }) => {
    return (
        <Card className="bg-background/20 hover:bg-background/40 transition-colors">
            <CardHeader className="p-3">
                <CardTitle className="text-base">{shipInfo.name}</CardTitle>
                <CardDescription className="text-xs">{shipInfo.description}</CardDescription>
            </CardHeader>
            <CardFooter className="p-3">
                <Button size="sm" className="w-full" disabled={!canAfford} onClick={() => onBuildShip(shipInfo.name as BotShipType)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Construire ({shipInfo.cost} C)
                </Button>
            </CardFooter>
        </Card>
    )
}

export function TacticalViewOverlay({ 
    isOpen, 
    playerResources, 
    onBuildShip, 
    onBuildOutpost, 
    onAllFollow, 
    onAllAttack,
    onAllHold,
    onCallReinforcements,
    canCallReinforcements,
    isPlacingReinforcements
}: TacticalViewOverlayProps) {
    if (!isOpen) {
        return null;
    }

    const buildableShips = Object.values(SHIP_DATA);
    const canAffordOutpost = playerResources.money >= OUTPOST_COST;

    return (
        <div
            className={cn(
                "absolute inset-0 z-20 pointer-events-none transition-opacity duration-500",
                isOpen ? "opacity-100" : "opacity-0"
            )}
            data-ui-element="true"
        >
            {/* Background effects */}
            <div className="absolute inset-0 bg-black/70" />
            <div 
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(hsl(var(--primary)/0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.05) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
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
                <Card className="w-96 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm" data-ui-element="true">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Tactical Command</CardTitle>
                        <CardDescription>Manage your fleet and issue orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div>
                            <h4 className="text-lg font-semibold mb-2">Global Orders</h4>
                             <div className="grid grid-cols-3 gap-2">
                                <Button onClick={onAllFollow}>
                                    <Shield className="mr-2 h-4 w-4"/>Follow
                                </Button>
                                <Button onClick={onAllHold}>
                                    <CircleStop className="mr-2 h-4 w-4"/>Hold
                                </Button>
                                <Button variant="destructive" onClick={onAllAttack}>
                                    <Skull className="mr-2 h-4 w-4"/>Attack
                                </Button>
                             </div>
                        </div>

                        <Separator />

                        <div>
                             <h4 className="text-lg font-semibold mb-2">Special Actions</h4>
                             <Button className="w-full" onClick={onCallReinforcements} disabled={!canCallReinforcements || isPlacingReinforcements}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                {isPlacingReinforcements ? 'Choisissez un emplacement...' : `Appel de renforts (${REINFORCEMENT_COST} C)`}
                             </Button>
                        </div>
                        
                        <Separator />

                        <div>
                            <h4 className="text-lg font-semibold mb-2">Reinforcements</h4>
                            <ScrollArea className="h-64 pr-2">
                                <div className="space-y-2">
                                    {buildableShips.map(shipInfo => (
                                        <ShipBuildCard 
                                            key={shipInfo.name}
                                            shipInfo={shipInfo}
                                            canAfford={playerResources.money >= shipInfo.cost}
                                            onBuildShip={onBuildShip}
                                        />
                                    ))}
                                    <Card className="bg-background/20 hover:bg-background/40 transition-colors">
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-base">Outpost</CardTitle>
                                            <CardDescription className="text-xs">Build a defensive outpost at the current view location.</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="p-3">
                                            <Button size="sm" className="w-full" disabled={!canAffordOutpost} onClick={onBuildOutpost}>
                                                <TowerControl className="mr-2 h-4 w-4"/>Build ({OUTPOST_COST} C)
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </ScrollArea>
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
