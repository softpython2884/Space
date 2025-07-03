'use client';

import { Package } from "lucide-react";

interface DebrisProps {
  x: number;
  y: number;
}

export function Debris({ x, y }: DebrisProps) {
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        willChange: 'transform',
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-yellow-900/50 border border-yellow-600 animate-pulse">
            <Package className="h-5 w-5 text-yellow-400" />
        </div>
      </div>
    </div>
  );
}
