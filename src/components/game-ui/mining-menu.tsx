'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mountain, Timer } from "lucide-react";
import type { AsteroidState } from '@/lib/types';

interface MiningMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  targetAsteroid: AsteroidState | null;
  onComplete: (resourcesGained: { ore: number }) => void;
}

const MINING_DURATION_MS = 5000;

export function MiningMenu({ isOpen, onOpenChange, targetAsteroid, onComplete }: MiningMenuProps) {
  const [isMining, setIsMining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [oreGained, setOreGained] = useState(0);

  const startTimeRef = useRef(0);
  const frameIdRef = useRef(0);

  useEffect(() => {
    // Reset state when menu is opened or closed
    if (!isOpen) {
        setIsMining(false);
        setProgress(0);
        setOreGained(0);
        cancelAnimationFrame(frameIdRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isMining) {
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / MINING_DURATION_MS) * 100, 100);
        setProgress(newProgress);
        
        if (newProgress < 100) {
          frameIdRef.current = requestAnimationFrame(animate);
        } else {
          const gained = Math.floor(Math.random() * 51) + 25;
          setOreGained(gained);
          onComplete({ ore: gained });
          setIsMining(false);
        }
      };

      frameIdRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    }
  }, [isMining, onComplete]);

  const handleStartMining = () => {
    setIsMining(true);
    setProgress(0);
    setOreGained(0);
  };

  if (!targetAsteroid) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent data-ui-element="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mountain /> Mining Operation</DialogTitle>
          <DialogDescription>
            Extract valuable resources from this asteroid. Starting the operation will lock your ship systems.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <p>Target: Asteroid #{targetAsteroid.id}</p>
            <p>Estimated Size: {targetAsteroid.size}m</p>
            
            {isMining && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Mining in progress...</p>
                    <Progress value={progress} />
                </div>
            )}

            {oreGained > 0 && (
                <div className="p-4 bg-green-900/50 rounded-md text-center">
                    <p className="text-lg font-bold text-green-300">Mining Complete!</p>
                    <p>You extracted {oreGained} units of ore.</p>
                </div>
            )}

            <div className="flex justify-end gap-2">
                {oreGained > 0 ? (
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMining}>Cancel</Button>
                        <Button onClick={handleStartMining} disabled={isMining}>
                            <Timer className="mr-2 h-4 w-4" />
                            Start Mining ({MINING_DURATION_MS / 1000}s)
                        </Button>
                    </>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
