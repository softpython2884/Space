'use client';

interface BeamProps {
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'heavy' | 'basic';
    isAlly?: boolean;
}

export function Beam({ id, x1, y1, x2, y2, type, isAlly }: BeamProps) {
    const isHeavy = type === 'heavy';
    let color: string;
    
    if (isAlly === true) {
        color = 'hsl(200 100% 60%)'; // Blue for allies
    } else if (isAlly === false) {
        color = 'hsl(0 100% 60%)'; // Red for enemies
    } else {
        color = 'hsl(60 100% 80%)'; // White/Yellow for neutral
    }

    const shadowId = `glow-${id}`;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" style={{ width: 8000, height: 8000 }}>
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
