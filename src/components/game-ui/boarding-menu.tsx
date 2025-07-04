'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Anchor, Timer } from "lucide-react";
import type { EnemyState } from '@/lib/types';

interface BoardingMenuProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  targetEnemy: EnemyState | null;
  onComplete: (result: { success: boolean }) => void;
  playerEnergy: number;
}

const BOARDING_DURATION_MS = 7000;
const BOARDING_ENERGY_COST = 60;
const BOARDING_SUCCESS_CHANCE = 0.4;

export function BoardingMenu({ isOpen, onOpenChange, targetEnemy, onComplete, playerEnergy }: BoardingMenuProps) {
  const [isBoarding, setIsBoarding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsBoarding(false);
      setProgress(0);
      setResult(null);
      setError(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isBoarding) {
        startTimeRef.current = Date.now();
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / BOARDING_DURATION_MS) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                const success = Math.random() < BOARDING_SUCCESS_CHANCE;
                setResult({ success });
                onComplete({ success });
                setIsBoarding(false);
            }
        }, 50);
    } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isBoarding, onComplete]);

  const handleStartBoarding = () => {
    if (playerEnergy < BOARDING_ENERGY_COST) {
        setError(`Not enough energy. Requires ${BOARDING_ENERGY_COST}, you have ${Math.round(playerEnergy)}.`);
        return;
    }
    if (targetEnemy?.isAlly) {
        setError("Cannot board an allied ship.");
        return;
    }
    setError(null);
    setIsBoarding(true);
    setProgress(0);
    setResult(null);
  };

  if (!targetEnemy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent data-ui-element="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Anchor /> Boarding Operation</DialogTitle>
          <DialogDescription>
            Attempt to dock with the enemy vessel and take control of it. A risky maneuver with a high payoff.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <p>Target: {targetEnemy.type} #{targetEnemy.id}</p>

            {isBoarding && (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Boarding in progress...</p>
                    <Progress value={progress} />
                </div>
            )}
            
            {result && (
                <div className={`p-4 rounded-md text-center ${result.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                    <p className={`text-lg font-bold ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                        {result.success ? "Boarding Successful!" : "Boarding Failed!"}
                    </p>
                    <p>{result.success ? "The enemy ship is now under your control." : "Your crew was repelled, sustaining damage."}</p>
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
                {result ? (
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBoarding}>Cancel</Button>
                        <Button onClick={handleStartBoarding} disabled={isBoarding}>
                            <Timer className="mr-2 h-4 w-4" />
                            Start Boarding ({BOARDING_DURATION_MS / 1000}s)
                        </Button>
                    </>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
