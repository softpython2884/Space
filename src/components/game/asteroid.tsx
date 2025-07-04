'use client';

interface AsteroidProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export function Asteroid({ x, y, size, rotation }: AsteroidProps) {
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
                    viewBox="-50 -50 100 100"
                    className="fill-gray-500/80 stroke-gray-400"
                    style={{ filter: 'drop-shadow(0 0 4px #222)' }}
                >
                    <circle cx="0" cy="0" r="45" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}
