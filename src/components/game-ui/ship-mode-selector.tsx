'use client';

import { Shield, Wind, Ghost, Scan } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ShipMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ShipModeSelectorProps {
  currentMode: ShipMode;
  onModeChange: (mode: ShipMode) => void;
  cooldowns: { modeChange: number, cruise: number };
  playerEnergy: number;
  cruiseEnergyCost: number;
  isCruising: boolean;
}

const modes: { value: ShipMode; label: string; icon: React.ElementType }[] = [
  { value: 'normal', label: 'Normal Mode', icon: Shield },
  { value: 'cruise', label: 'Cruise Mode', icon: Wind },
  { value: 'stealth', label: 'Stealth Mode', icon: Ghost },
  { value: 'scan', label: 'Scan Mode', icon: Scan },
];

export function ShipModeSelector({ currentMode, onModeChange, cooldowns, playerEnergy, cruiseEnergyCost, isCruising }: ShipModeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={currentMode}
      onValueChange={(value: ShipMode) => {
        if (value) onModeChange(value);
      }}
      className="bg-black/60 border border-primary/50 p-1 rounded-lg backdrop-blur-sm"
    >
      <TooltipProvider>
        {modes.map((mode) => {
          const isGeneralCooldown = cooldowns.modeChange < 1;
          let isSpecificCooldown = false;
          let hasEnoughEnergy = true;
          let cooldownProgress = cooldowns.modeChange;
          
          if (mode.value === 'cruise') {
              isSpecificCooldown = cooldowns.cruise < 1;
              hasEnoughEnergy = playerEnergy >= cruiseEnergyCost;
              if (isSpecificCooldown) cooldownProgress = cooldowns.cruise;
          }

          const isDisabled = (isGeneralCooldown || isSpecificCooldown || !hasEnoughEnergy || isCruising) && mode.value !== currentMode;

          let tooltipText = mode.label;
          if (mode.value === 'cruise') {
              if (isSpecificCooldown) tooltipText = `Surchauffe (${Math.ceil((1 - cooldowns.cruise) * 5)}s)`;
              else if (!hasEnoughEnergy) tooltipText = `Énergie insuffisante (${cruiseEnergyCost} requis)`;
          }

          return (
            <Tooltip key={mode.value} delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="relative overflow-hidden rounded-md">
                  <ToggleGroupItem 
                    value={mode.value} 
                    aria-label={tooltipText} 
                    className={cn(
                      "w-14 h-12 flex-col gap-1 data-[state=on]:bg-primary/20 disabled:cursor-not-allowed",
                      isDisabled ? 'opacity-50' : ''
                    )}
                    disabled={isDisabled}
                  >
                    <mode.icon className="h-5 w-5" />
                    <span className="text-xs capitalize">{mode.value}</span>
                  </ToggleGroupItem>
                    {(cooldownProgress < 1 || (mode.value === 'cruise' && cooldowns.cruise < 1)) && (
                      <div
                          className="absolute bottom-0 left-0 w-full bg-primary/40 pointer-events-none"
                          style={{
                              height: `${(1 - (mode.value === 'cruise' ? cooldowns.cruise : cooldowns.modeChange)) * 100}%`,
                              transition: 'height 0.1s linear',
                          }}
                      />
                    )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </ToggleGroup>
  );
}
