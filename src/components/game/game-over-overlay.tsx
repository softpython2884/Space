'use client';

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface GameOverOverlayProps {
  isOpen: boolean;
  onRestart: () => void;
}

export function GameOverOverlay({ isOpen, onRestart }: GameOverOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center gap-6">
      <h1 className="text-7xl font-bold text-red-500 font-headline animate-pulse">
        GAME OVER
      </h1>
      <Button size="lg" onClick={onRestart}>
        <RefreshCw className="mr-2 h-5 w-5" />
        Restart Game
      </Button>
    </div>
  );
}
