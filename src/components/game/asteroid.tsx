'use client';

interface AsteroidProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

// A few predefined asteroid shapes to avoid random generation on client/server
const shapes = [
    "20,0 40,10 50,30 45,50 25,60 5,55 0,35 5,15",
    "25,0 50,15 55,35 40,55 20,60 0,45 5,20",
    "15,0 45,5 60,25 50,50 25,55 5,40 0,20",
];

export function Asteroid({ x, y, size, rotation }: AsteroidProps) {
    const shape = shapes[Math.floor(rotation) % shapes.length]; // use rotation to pick a shape deterministically

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
                    viewBox="0 0 60 60"
                    className="fill-gray-500/80 stroke-gray-400"
                    style={{ filter: 'drop-shadow(0 0 4px #222)' }}
                >
                    <polygon points={shape} strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}
