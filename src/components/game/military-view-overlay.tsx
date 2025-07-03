'use client';

import { cn } from '@/lib/utils';

interface MilitaryViewOverlayProps {
    isOpen: boolean;
}

export function MilitaryViewOverlay({ isOpen }: MilitaryViewOverlayProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center gap-6 text-white pointer-events-none transition-opacity duration-500",
                isOpen ? "opacity-100" : "opacity-0"
            )}
        >
            <h1 className="text-5xl font-bold text-cyan-300 font-headline animate-pulse">
                TACTICAL VIEW
            </h1>
            <p className="text-lg text-muted-foreground">Fleet management will be available in a future update.</p>
        </div>
    );
}
