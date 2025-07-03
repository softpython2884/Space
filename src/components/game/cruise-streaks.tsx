'use client';

export const CruiseStreaks = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 50 }).map((_, i) => {
      const angle = Math.random() * 360;
      const duration = 0.2 + Math.random() * 0.2;
      const delay = Math.random() * 0.4;
      return (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 h-px w-48 bg-gradient-to-l from-purple-300/80 to-transparent"
          style={{
            transformOrigin: '0% 0%',
            transform: `rotate(${angle}deg)`,
            animation: `streak ${duration}s linear ${delay}s infinite`,
          }}
        />
      );
    })}
    <style jsx>{`
      @keyframes streak {
        from {
          transform: rotate(var(--angle)) translateX(20vw) scaleX(0.1);
          opacity: 1;
        }
        to {
          transform: rotate(var(--angle)) translateX(80vw) scaleX(1);
          opacity: 0;
        }
      }
    `}</style>
  </div>
);
