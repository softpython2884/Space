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

const generateAsteroidPath = (id: number, size: number): string => {
    const numVertices = 12;
    const points: { x: number; y: number }[] = [];
    const angleStep = (Math.PI * 2) / numVertices;
    const radius = size / 2.2;

    for (let i = 0; i < numVertices; i++) {
        // Use a combination of ID and index for a unique seed per vertex
        const seed = id * (i + 1) * 3.14159;
        const randomValue = seededRandom(seed);
        
        // Vary radius for irregularity
        const r = radius * (0.8 + randomValue * 0.4);
        const angle = angleStep * i;

        points.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
        });
    }

    // Create an SVG path data string
    return "M" + points.map(p => `${p.x} ${p.y}`).join(" L ") + " Z";
}

export function Asteroid({ x, y, size, rotation, id }: AsteroidProps) {
    const pathData = generateAsteroidPath(id, size);

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
                    <path d={pathData} strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}
