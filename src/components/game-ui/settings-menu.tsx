'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { ControlScheme } from "@/lib/types";

interface SettingsMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  controlScheme: ControlScheme;
  onControlSchemeChange: (scheme: ControlScheme) => void;
  cheats: { infiniteHealth: boolean, infiniteEnergy: boolean, infiniteMoney: boolean };
  onCheatsChange: (cheats: { infiniteHealth: boolean, infiniteEnergy: boolean, infiniteMoney: boolean }) => void;
}

export function SettingsMenu({
  isOpen,
  onOpenChange,
  controlScheme,
  onControlSchemeChange,
  cheats,
  onCheatsChange,
}: SettingsMenuProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/80 border-primary/50 text-foreground backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Press Escape to close this menu.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Control Scheme</h3>
            <RadioGroup
              value={controlScheme}
              onValueChange={(value) => onControlSchemeChange(value as ControlScheme)}
              className="gap-4"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="relative" id="relative" />
                <Label htmlFor="relative" className="flex flex-col gap-1 cursor-pointer">
                  <span>Relative</span>
                  <span className="text-xs font-normal text-muted-foreground">Ship-oriented movement. W/S for thrust, A/D for strafing.</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="absolute" id="absolute" />
                <Label htmlFor="absolute" className="flex flex-col gap-1 cursor-pointer">
                  <span>Absolute</span>
                  <span className="text-xs font-normal text-muted-foreground">Map-oriented movement. Controls always move you up/down/left/right on the map.</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <Label htmlFor="hybrid" className="flex flex-col gap-1 cursor-pointer">
                  <span>Hybrid</span>
                  <span className="text-xs font-normal text-muted-foreground">Relative thrust (W/S) with absolute map-based strafing (A/D).</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
          <div>
            <h3 className="mb-4 text-lg font-medium">Developer Cheats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="infinite-health">Infinite Health</Label>
                <Switch id="infinite-health" checked={cheats.infiniteHealth} onCheckedChange={(checked) => onCheatsChange({ ...cheats, infiniteHealth: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="infinite-energy">Infinite Energy</Label>
                <Switch id="infinite-energy" checked={cheats.infiniteEnergy} onCheckedChange={(checked) => onCheatsChange({ ...cheats, infiniteEnergy: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="infinite-money">Infinite Money</Label>
                <Switch id="infinite-money" checked={cheats.infiniteMoney} onCheckedChange={(checked) => onCheatsChange({ ...cheats, infiniteMoney: checked })} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
