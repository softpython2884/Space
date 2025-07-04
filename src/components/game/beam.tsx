'use client';

interface BeamProps {
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'heavy' | 'basic';
}

export function Beam({ id, x1, y1, x2, y2, type }: BeamProps) {
    const isHeavy = type === 'heavy';
    const color = isHeavy ? 'hsl(0 100% 60%)' : 'hsl(180 100% 60%)';
    const shadowId = `glow-${id}`;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" style={{ width: 4000, height: 4000 }}>
            <defs>
                <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation={isHeavy ? "5" : "3"} />
                </filter>
            </defs>
            <line
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke={color}
                strokeWidth={isHeavy ? 3 : 1.5}
                strokeLinecap="round"
                style={{ filter: `url(#${shadowId})`, opacity: 0.7 }}
            />
             <line
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="white"
                strokeWidth={isHeavy ? 1 : 0.5}
                strokeLinecap="round"
                style={{ opacity: 0.9 }}
            />
        </svg>
    )
}
