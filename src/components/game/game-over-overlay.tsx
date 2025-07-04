'use client';

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GameOverOverlayProps {
  isOpen: boolean;
  onRestart: () => void;
  result: 'victory' | 'defeat';
}

export function GameOverOverlay({ isOpen, onRestart, result }: GameOverOverlayProps) {
  if (!isOpen) return null;

  const isVictory = result === 'victory';

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-6">
      <h1 className={`text-7xl font-bold font-headline animate-pulse ${isVictory ? 'text-cyan-400' : 'text-red-500'}`}>
        {isVictory ? "VICTORY" : "DEFEAT"}
      </h1>
      <p className="text-lg text-muted-foreground">
        {isVictory ? "You have destroyed the enemy headquarters!" : "Your stellar base has been destroyed."}
      </p>
      <Button size="lg" onClick={onRestart}>
        <RefreshCw className="mr-2 h-5 w-5" />
        {isVictory ? "Play Again" : "Try Again"}
      </Button>
    </div>
  );
}
