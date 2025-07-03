'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Bot, Warehouse } from "lucide-react";
import type { PlayerUpgrades } from "@/lib/types";

interface PlayerUpgradesDisplayProps {
    upgrades: PlayerUpgrades;
}

const upgradeConfig: { key: keyof PlayerUpgrades, name: string, icon: React.ElementType }[] = [
    { key: 'maxHealth', name: 'Hull', icon: Heart },
    { key: 'energyRecharge', name: 'Reactor', icon: Zap },
    { key: 'cargoCapacity', name: 'Cargo', icon: Warehouse },
    { key: 'nanobots', name: 'Nanobots', icon: Bot },
];

export function PlayerUpgradesDisplay({ upgrades }: PlayerUpgradesDisplayProps) {

    const hasUpgrades = Object.values(upgrades).some(level => level > 0);

    if (!hasUpgrades) return null;

    return (
        <Card className="w-64 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
            <CardHeader className="p-3">
                <CardTitle className="text-base font-headline">Ship Enhancements</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 grid grid-cols-2 gap-3">
                {upgradeConfig.map(config => {
                    const level = upgrades[config.key];
                    if (level === 0) return null;
                    return (
                        <div key={config.key} className="flex items-center text-sm gap-2">
                            <config.icon className="h-4 w-4 text-cyan-400" />
                            <span>{config.name}</span>
                            <Badge variant="secondary" className="ml-auto">Lvl {level}</Badge>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
