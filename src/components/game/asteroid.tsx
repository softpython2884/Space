'use client';

import React from 'react';

interface AsteroidProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  id: number;
}

// Memoize the generated path to avoid recalculating on every render for the same size
const pathCache = new Map<number, string>();

const generateAsteroidPath = (size: number): string => {
    if (pathCache.has(size)) {
        return pathCache.get(size)!;
    }

    const numVertices = Math.floor(size / 8) + 8; // More vertices for larger asteroids
    const radius = size / 2.2;
    let pathData = 'M ';

    for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * 2 * Math.PI;
        const randomFactor = 0.6 + Math.random() * 0.4; // vary radius from 60% to 100%
        const currentRadius = radius * randomFactor;
        const x = Math.cos(angle) * currentRadius;
        const y = Math.sin(angle) * currentRadius;

        if (i === 0) {
            pathData += `${x.toFixed(2)},${y.toFixed(2)}`;
        } else {
            pathData += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
        }
    }
    pathData += ' Z';
    pathCache.set(size, pathData);
    return pathData;
};


export function Asteroid({ x, y, size, rotation, id }: AsteroidProps) {
    const asteroidPath = React.useMemo(() => generateAsteroidPath(size), [size]);

    return (
        <div
            className="absolute top-0 left-0"
            style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                willChange: 'transform',
            }}
        >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
                <svg
                    width={size}
                    height={size}
                    viewBox={`${-size/2} ${-size/2} ${size} ${size}`}
                    className="fill-gray-600/80 stroke-gray-500"
                    style={{ filter: 'drop-shadow(0 0 4px #222)' }}
                >
                    <path d={asteroidPath} strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}
