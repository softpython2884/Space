'use client';

import { Shield, Wind, Ghost, Scan } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ShipMode } from "@/lib/types";

interface ShipModeSelectorProps {
  currentMode: ShipMode;
  onModeChange: (mode: ShipMode) => void;
}

const modes: { value: ShipMode; label: string; icon: React.ElementType }[] = [
  { value: 'normal', label: 'Normal Mode', icon: Shield },
  { value: 'cruise', label: 'Cruise Mode', icon: Wind },
  { value: 'stealth', label: 'Stealth Mode', icon: Ghost },
  { value: 'scan', label: 'Scan Mode', icon: Scan },
];

export function ShipModeSelector({ currentMode, onModeChange }: ShipModeSelectorProps) {
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
        {modes.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={mode.value} aria-label={mode.label} className="w-14 h-12 flex-col gap-1 data-[state=on]:bg-primary/20">
                <mode.icon className="h-5 w-5" />
                <span className="text-xs capitalize">{mode.value}</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{mode.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </ToggleGroup>
  );
}
