'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skull, Timer } from "lucide-react";
import type { EnemyState } from '@/lib/types';

interface PillageMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  targetEnemy: EnemyState | null;
  onComplete: () => void;
  playerEnergy: number;
}

const PILLAGE_DURATION_MS = 2000;
const PILLAGE_ENERGY_COST = 40;

export function PillageMenu({ isOpen, onOpenChange, targetEnemy, onComplete, playerEnergy }: PillageMenuProps) {
  const [isPillaging, setIsPillaging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
        setIsPillaging(false);
        setProgress(0);
        setIsFinished(false);
        setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPillaging && progress < 100) {
      timer = setInterval(() => {
        setProgress(prev => Math.min(prev + (100 / (PILLAGE_DURATION_MS / 100)), 100));
      }, 100);
    } else if (progress >= 100 && isPillaging) {
        onComplete();
        setIsPillaging(false);
        setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isPillaging, progress, onComplete]);

  const handleStartPillaging = () => {
    if (playerEnergy < PILLAGE_ENERGY_COST) {
        setError(`Not enough energy. Requires ${PILLAGE_ENERGY_COST}, you have ${Math.round(playerEnergy)}.`);
        return;
    }
    setError(null);
    setIsPillaging(true);
    setProgress(1);
  };

  if (!targetEnemy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent data-ui-element="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Skull /> Pillage Operation</DialogTitle>
          <DialogDescription>
            Perform a high-speed attack run to damage the enemy and force them to drop cargo. This action consumes a significant amount of energy.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <p>Target: {targetEnemy.type} #{targetEnemy.id}</p>
            
            {isPillaging && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pillaging in progress...</p>
                    <Progress value={progress} />
                </div>
            )}

            {isFinished && (
                <div className="p-4 bg-green-900/50 rounded-md text-center">
                    <p className="text-lg font-bold text-green-300">Pillage Complete!</p>
                    <p>Check the vicinity for dropped cargo.</p>
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
                {isFinished ? (
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPillaging}>Cancel</Button>
                        <Button onClick={handleStartPillaging} disabled={isPillaging}>
                            <Timer className="mr-2 h-4 w-4" />
                            Start Pillage ({PILLAGE_DURATION_MS / 1000}s)
                        </Button>
                    </>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
