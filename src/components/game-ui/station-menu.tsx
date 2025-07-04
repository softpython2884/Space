'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PlayerData, PlayerUpgrades, PlayerShipClass, StationState } from "@/lib/types";
import { UPGRADE_COSTS, UPGRADE_VALUES, RESOURCE_PRICES, SHIP_DATA, ALLY_COST } from "@/lib/constants";
import { CircleDollarSign, Mountain, Flame, Heart, Zap, ChevronsUp, Warehouse, Bot, Wrench, Ship, ShieldPlus } from "lucide-react";

interface StationMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  playerData: PlayerData;
  stationData: StationState | null;
  onSellResource: (resource: 'ore' | 'gas', amount: number) => void;
  onBuyUpgrade: (upgrade: keyof PlayerUpgrades) => void;
  onRepairHull: (amount: number, cost: number) => void;
  onBuyShip: (shipClass: PlayerShipClass) => void;
  onBuyAlly: () => void;
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

const ShipCard = ({ shipClass, playerData, onBuyShip }: { shipClass: PlayerShipClass, playerData: PlayerData, onBuyShip: (shipClass: PlayerShipClass) => void }) => {
    const shipInfo = SHIP_DATA[shipClass];
    const isOwned = playerData.ship.class === shipClass;
    const canAfford = playerData.resources.money >= shipInfo.cost;

    return (
    <Card className="bg-background/50 flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg">{shipInfo.name}</CardTitle>
            <CardDescription>{shipInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-sm">
            <div className="flex justify-between"><span>Coque:</span> <span>{shipInfo.baseHealth} HP</span></div>
            <div className="flex justify-between"><span>Soute:</span> <span>{shipInfo.baseCargo} unités</span></div>
        </CardContent>
        <CardFooter>
            {isOwned ? (
                 <Button disabled className="w-full">Possédé</Button>
            ) : (
                 <Button onClick={() => onBuyShip(shipClass)} disabled={!canAfford} className="w-full">
                    Acheter ({shipInfo.cost} <CircleDollarSign className="inline h-3 w-3 ml-1" />)
                </Button>
            )}
        </CardFooter>
    </Card>
    )
};


export function StationMenu({ isOpen, onOpenChange, playerData, stationData, onSellResource, onBuyUpgrade, onRepairHull, onBuyShip, onBuyAlly }: StationMenuProps) {

  const repairAmount = 100;
  const repairCost = 50;
  const canRepair = stationData && stationData.health < stationData.maxHealth && playerData.resources.money >= repairCost;
  const canBuyAlly = playerData.resources.money >= ALLY_COST;

  const maxCargo = SHIP_DATA[playerData.ship.class].baseCargo + UPGRADE_VALUES.cargoCapacity[playerData.upgrades.cargoCapacity];

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
                        <CardTitle>Trade & Repair Hub</CardTitle>
                        <CardDescription>Sell resources and repair the station hull.</CardDescription>
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
                                <p className="text-sm text-muted-foreground">Cargo</p>
                                <p className="text-2xl font-bold flex items-center gap-2"><Warehouse className="h-6 w-6 text-gray-400" /> {playerData.cargo.current}/{maxCargo}</p>
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
                        <Separator />
                         <Card className="bg-background/30">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2"><Wrench /> Station Hull Repair</CardTitle>
                                {stationData && (
                                  <>
                                    <Progress value={(stationData.health / stationData.maxHealth) * 100} className="h-2 my-1" />
                                    <CardDescription>
                                        Current Hull: {Math.round(stationData.health)} / {stationData.maxHealth}. Contribute to the station's integrity.
                                    </CardDescription>
                                  </>
                                )}
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full" onClick={() => onRepairHull(repairAmount, repairCost)} disabled={!canRepair}>
                                    Repair {repairAmount} HP ({repairCost} credits)
                                </Button>
                            </CardFooter>
                        </Card>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="upgrades">
                <Card className="bg-transparent border-0">
                    <CardHeader>
                        <CardTitle>Ship Upgrades</CardTitle>
                        <CardDescription>Improve your current ship's systems and capabilities.</CardDescription>
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
                <div className="space-y-6">
                    <Card className="bg-transparent border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Ship /> Shipyard</CardTitle>
                            <CardDescription>Purchase a new vessel. This will replace your current ship.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(Object.keys(SHIP_DATA) as PlayerShipClass[]).map(shipClass => (
                                <ShipCard key={shipClass} shipClass={shipClass} playerData={playerData} onBuyShip={onBuyShip} />
                            ))}
                        </CardContent>
                    </Card>
                    <Separator />
                    <Card className="bg-transparent border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldPlus /> Fleet Support</CardTitle>
                            <CardDescription>Hire mercenary ships to assist you in combat.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Card className="bg-background/50 max-w-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Chasseur Escort</CardTitle>
                                    <CardDescription>A basic but reliable combat ship that will follow and defend you.</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                     <Button onClick={onBuyAlly} disabled={!canBuyAlly} className="w-full">
                                        Hire for {ALLY_COST} credits
                                    </Button>
                                </CardFooter>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
