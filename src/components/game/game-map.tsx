'use client';

export function GameMap() {
  return (
    <div
      className="absolute inset-0 bg-gray-800"
      style={{
        backgroundImage:
          'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        backgroundPosition: '-1px -1px',
        opacity: 0.1,
      }}
    ></div>
  );
}
