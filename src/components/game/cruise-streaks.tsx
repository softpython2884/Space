'use client';

import { useState, useEffect } from 'react';

interface Streak {
    angle: number;
    duration: number;
    delay: number;
}

export const CruiseStreaks = () => {
    const [streaks, setStreaks] = useState<Streak[]>([]);

    useEffect(() => {
        const generateStreaks = () => {
            return Array.from({ length: 50 }).map(() => ({
                angle: Math.random() * 360,
                duration: 0.2 + Math.random() * 0.2,
                delay: Math.random() * 0.4,
            }));
        };
        setStreaks(generateStreaks());
    }, []);

    // Render nothing on the server, and nothing on the client until `useEffect` runs.
    if (streaks.length === 0) {
        return null;
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {streaks.map((streak, i) => (
                <div
                    key={i}
                    className="absolute top-1/2 left-1/2 h-px w-48 bg-gradient-to-l from-purple-300/80 to-transparent"
                    style={{
                        transformOrigin: '0% 0%',
                        transform: `rotate(${streak.angle}deg)`,
                        animation: `streak ${streak.duration}s linear ${streak.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
};
