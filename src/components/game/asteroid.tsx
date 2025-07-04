'use client';

interface AsteroidProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  id: number;
}

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
                    </g>
                </svg>
            </div>
        </div>
    );
}
