'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bot, Target, Zap } from "lucide-react";
import type { PlayerShipClass, WeaponConfig } from "@/lib/types";
import { SHIP_DATA } from "@/lib/constants";

interface WeaponControlProps {
  shipClass: PlayerShipClass;
  activeWeapons: {
    manualTurrets: boolean;
    autoTurrets: boolean;
    beam: boolean;
  };
  onToggleWeapon: (weapon: 'manualTurrets' | 'autoTurrets' | 'beam') => void;
}

export function WeaponControl({ shipClass, activeWeapons, onToggleWeapon }: WeaponControlProps) {
  const weaponConfig = SHIP_DATA[shipClass]?.weapons;

  if (!weaponConfig) return null;

  const hasWeapons = weaponConfig.manualTurrets?.count > 0 || weaponConfig.autoTurrets?.count > 0 || weaponConfig.beam?.count > 0;

  if (!hasWeapons) return null;

  return (
    <Card className="w-80 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm" data-ui-element="true">
      <CardHeader className="p-3">
        <CardTitle className="text-lg">Weapon Systems</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 grid gap-4">
        {weaponConfig.manualTurrets?.count > 0 && (
            <div className="flex items-center justify-between">
                <Label htmlFor="manual-turrets" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    <span>Primary Cannons</span>
                </Label>
                <Switch 
                    id="manual-turrets" 
                    checked={activeWeapons.manualTurrets} 
                    onCheckedChange={() => onToggleWeapon('manualTurrets')}
                />
            </div>
        )}
         {weaponConfig.autoTurrets?.count > 0 && (
            <div className="flex items-center justify-between">
                <Label htmlFor="auto-turrets" className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <span>Auto-Turrets</span>
                </Label>
                <Switch
                    id="auto-turrets"
                    checked={activeWeapons.autoTurrets}
                    onCheckedChange={() => onToggleWeapon('autoTurrets')}
                />
            </div>
        )}
         {weaponConfig.beam?.count > 0 && (
            <div className="flex items-center justify-between">
                <Label htmlFor="beam-weapons" className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-red-500" />
                    <span>Beam Emitters</span>
                </Label>
                <Switch
                    id="beam-weapons"
                    checked={activeWeapons.beam}
                    onCheckedChange={() => onToggleWeapon('beam')}
                />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
