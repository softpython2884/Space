'use client';

export const CruiseStreaks = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden mask-gradient">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="absolute h-px w-48 bg-gradient-to-l from-purple-300/80 to-transparent"
        style={{
          top: `${Math.random() * 100}%`,
          animation: `streak ${0.2 + Math.random() * 0.2}s linear ${Math.random() * 0.4}s infinite`,
        }}
      />
    ))}
    <style jsx>{`
      .mask-gradient {
        mask-image: radial-gradient(circle at center, white 20%, transparent 80%);
      }
    `}</style>
  </div>
);
