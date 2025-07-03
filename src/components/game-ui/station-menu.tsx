'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PlayerData, PlayerUpgrades, PlayerShipClass } from "@/lib/types";
import { UPGRADE_COSTS, UPGRADE_VALUES, RESOURCE_PRICES } from "@/lib/constants";
import { CircleDollarSign, Mountain, Flame, Heart, Zap, ChevronsUp, Warehouse, Bot } from "lucide-react";

interface StationMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  playerData: PlayerData;
  onSellResource: (resource: 'ore' | 'gas', amount: number) => void;
  onBuyUpgrade: (upgrade: keyof PlayerUpgrades) => void;
}

const UpgradeCard = ({ title, icon: Icon, level, maxLevel, cost, onUpgrade, canAfford }: {
    title: string;
    icon: React.ElementType;
    level: number;
    maxLevel: number;
    cost: number | undefined;
    onUpgrade: () => void;
    canAfford: boolean;
}) => (
    <Card className="bg-background/50">
        <CardContent className="p-4 flex items-center gap-4">
            <Icon className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">Lvl {level}</p>
                </div>
                <Progress value={(level / maxLevel) * 100} className="h-2 my-1" />
                {level < maxLevel ? (
                    <div className="text-xs flex justify-between items-center mt-1">
                        <span className="text-muted-foreground">Cost: {cost} <CircleDollarSign className="inline h-3 w-3" /></span>
                        <Button size="sm" className="h-6" onClick={onUpgrade} disabled={!canAfford}>Upgrade</Button>
                    </div>
                ) : (
                    <p className="text-xs text-primary text-center mt-1">Max Level</p>
                )}
            </div>
        </CardContent>
    </Card>
)

const ShipCard = ({ name, description }: { name: string, description: string }) => (
    <Card className="bg-background/50">
        <CardHeader>
            <CardTitle className="text-lg">{name}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
            <Button disabled className="w-full">Coming Soon</Button>
        </CardFooter>
    </Card>
)

const playerShips: {name: PlayerShipClass, description: string}[] = [
    { name: 'Chasseur', description: 'Vaisseau de base polyvalent, évolutif.' },
    { name: 'Intercepteur', description: 'Petit et rapide, idéal pour les raids éclairs.' },
    { name: 'Frégate', description: 'Vaisseau de guerre lourdement armé.' },
    { name: 'Destroyer', description: 'Plateforme d\'armement mobile, dévastatrice.' },
    { name: 'Porteur', description: 'Transporte et déploie une escouade de drones.' },
    { name: 'Cargo', description: 'Soute immense et coque résistante, mais lent.' },
    { name: 'Mineur', description: 'Équipé pour une extraction de ressources rapide et efficace.' },
];

export function StationMenu({ isOpen, onOpenChange, playerData, onSellResource, onBuyUpgrade }: StationMenuProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-gray-900/80 border-primary/50 text-foreground backdrop-blur-sm flex flex-col" data-ui-element="true">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">Stellar Base</DialogTitle>
          <DialogDescription>
            Welcome, pilot. Manage your resources, ship, and career here.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="commerce" className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="commerce">Commerce</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            <TabsTrigger value="hangar">Hangar</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow mt-4 pr-4">
            <TabsContent value="commerce">
                <Card className="bg-transparent border-0">
                    <CardHeader>
                        <CardTitle>Trade Hub</CardTitle>
                        <CardDescription>Sell your mined resources for credits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-around p-4 rounded-lg bg-background/50">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Credits</p>
                                <p className="text-2xl font-bold flex items-center gap-2"><CircleDollarSign className="h-6 w-6 text-yellow-400" /> {playerData.resources.money}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Ore</p>
                                <p className="text-2xl font-bold flex items-center gap-2"><Mountain className="h-6 w-6 text-gray-400" /> {playerData.resources.ore}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Gas</p>
                                <p className="text-2xl font-bold flex items-center gap-2"><Flame className="h-6 w-6 text-orange-500" /> {playerData.resources.gas}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-background/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">Sell Ore</CardTitle>
                                    <CardDescription>Price: {RESOURCE_PRICES.ore} credits / unit</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => onSellResource('ore', playerData.resources.ore)} disabled={playerData.resources.ore <= 0}>Sell All ({playerData.resources.ore * RESOURCE_PRICES.ore} credits)</Button>
                                </CardFooter>
                            </Card>
                            <Card className="bg-background/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">Sell Gas</CardTitle>
                                    <CardDescription>Price: {RESOURCE_PRICES.gas} credits / unit</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => onSellResource('gas', playerData.resources.gas)} disabled={playerData.resources.gas <= 0}>Sell All ({playerData.resources.gas * RESOURCE_PRICES.gas} credits)</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="upgrades">
                <Card className="bg-transparent border-0">
                    <CardHeader>
                        <CardTitle>Ship Upgrades</CardTitle>
                        <CardDescription>Improve your ship's systems and capabilities.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <UpgradeCard 
                            title="Hull Reinforcement"
                            icon={Heart}
                            level={playerData.upgrades.maxHealth}
                            maxLevel={UPGRADE_COSTS.maxHealth.length}
                            cost={UPGRADE_COSTS.maxHealth[playerData.upgrades.maxHealth]}
                            onUpgrade={() => onBuyUpgrade('maxHealth')}
                            canAfford={playerData.resources.money >= (UPGRADE_COSTS.maxHealth[playerData.upgrades.maxHealth] || Infinity)}
                        />
                        <UpgradeCard 
                            title="Energy Reactor"
                            icon={Zap}
                            level={playerData.upgrades.energyRecharge}
                            maxLevel={UPGRADE_COSTS.energyRecharge.length}
                            cost={UPGRADE_COSTS.energyRecharge[playerData.upgrades.energyRecharge]}
                            onUpgrade={() => onBuyUpgrade('energyRecharge')}
                            canAfford={playerData.resources.money >= (UPGRADE_COSTS.energyRecharge[playerData.upgrades.energyRecharge] || Infinity)}
                        />
                        <UpgradeCard 
                            title="Cargo Hold"
                            icon={Warehouse}
                            level={playerData.upgrades.cargoCapacity}
                            maxLevel={UPGRADE_COSTS.cargoCapacity.length}
                            cost={UPGRADE_COSTS.cargoCapacity[playerData.upgrades.cargoCapacity]}
                            onUpgrade={() => onBuyUpgrade('cargoCapacity')}
                            canAfford={playerData.resources.money >= (UPGRADE_COSTS.cargoCapacity[playerData.upgrades.cargoCapacity] || Infinity)}
                        />
                        <UpgradeCard 
                            title="Repair Nanobots"
                            icon={Bot}
                            level={playerData.upgrades.nanobots}
                            maxLevel={UPGRADE_COSTS.nanobots.length}
                            cost={UPGRADE_COSTS.nanobots[playerData.upgrades.nanobots]}
                            onUpgrade={() => onBuyUpgrade('nanobots')}
                            canAfford={playerData.resources.money >= (UPGRADE_COSTS.nanobots[playerData.upgrades.nanobots] || Infinity)}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="hangar">
                <Card className="bg-transparent border-0">
                    <CardHeader>
                        <CardTitle>Shipyard</CardTitle>
                        <CardDescription>Purchase a new vessel.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {playerShips.map(ship => (
                            <ShipCard key={ship.name} name={ship.name} description={ship.description} />
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
