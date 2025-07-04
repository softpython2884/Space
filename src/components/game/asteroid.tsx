'use client';

interface AsteroidProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  id: number;
}

// Simple seeded random number generator to ensure consistent shapes between server/client
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export function Asteroid({ x, y, size, rotation, id }: AsteroidProps) {
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
                    className="fill-gray-500/80 stroke-gray-400"
                    style={{ filter: 'drop-shadow(0 0 4px #222)' }}
                >
                    <g>
                        <circle cx="0" cy="0" r={size / 2.2} strokeWidth="2" />
                        <circle cx={seededRandom(id * 1) * (size/6)} cy={seededRandom(id * 2) * (size/6)} r={size/4} className="fill-gray-500/50 stroke-gray-400/50" strokeWidth="1"/>
                        <circle cx={seededRandom(id * 3) * (size/5) - (size/10)} cy={seededRandom(id * 4) * (size/5) - (size/10)} r={size/5} className="fill-gray-600/50" />
                    </g>
                </svg>
            </div>
        </div>
    );
}
