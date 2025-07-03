'use client';

interface GameMapProps {
  width: number;
  height: number;
}

export function GameMap({ width, height }: GameMapProps) {
  return (
    <div
      className="absolute top-0 left-0 bg-gray-800"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage:
          'linear-gradient(white 0.5px, transparent 0.5px), linear-gradient(90deg, white 0.5px, transparent 0.5px)',
        backgroundSize: '50px 50px',
        backgroundPosition: '-1px -1px',
        opacity: 0.1,
      }}
    ></div>
  );
}