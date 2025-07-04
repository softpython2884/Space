'use client';

import type { EnemyState, StationState, AsteroidState, Debris } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from 'react';
import { Package } from "lucide-react";

interface RadarProps {
    playerPosition: { x: number; y: number };
    enemies: EnemyState[];
    stations: StationState[];
    asteroids: AsteroidState[];
    debris: Debris[];
    radarRange: number;
}

const RADAR_SIZE = 256; // pixels

const RadarDot = ({ color, size = 'w-2 h-2', pulse = false, type = 'dot', children }: { color: string, size?: string, pulse?: boolean, type?: 'dot' | 'triangle' | 'square' | 'circle' | 'icon', children?: React.ReactNode }) => {
    const icon = () => {
        switch(type) {
            case 'triangle':
                return <div style={{width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid hsl(var(--primary))'}}/>
            case 'square':
                 return <div className={cn(size, color)} />;
            case 'circle':
                return <div className={cn("rounded-full", size, color, 'border-2')} />;
            case 'icon':
                return children;
            default:
                return <div className={cn("rounded-full", size, color)} />;
        }
    }
    
    return (
        <div className="relative flex items-center justify-center">
            {icon()}
            {pulse && <div className={cn("absolute -inset-0.5 rounded-full", color, "animate-ping")} />}
        </div>
    )
};

export function Radar({ playerPosition, enemies, stations, asteroids, debris, radarRange }: RadarProps) {

    const scale = RADAR_SIZE / (radarRange * 2);

    const renderObjectOnRadar = (obj: { x: number; y: number }, key: React.Key, icon: React.ReactNode) => {
        const dx = obj.x - playerPosition.x;
        const dy = obj.y - playerPosition.y;

        const minimapX = (dx * scale) + (RADAR_SIZE / 2);
        const minimapY = (dy * scale) + (RADAR_SIZE / 2);
        
        const distFromCenter = Math.hypot(minimapX - RADAR_SIZE / 2, minimapY - RADAR_SIZE / 2);
        if (distFromCenter > RADAR_SIZE / 2 - 8) return null;

        return (
            <div
                key={key}
                className="absolute"
                style={{
                    left: minimapX,
                    top: minimapY,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {icon}
            </div>
        );
    }
    
    const getEnemyIcon = (enemy: EnemyState) => {
        if (enemy.isAlly) return <RadarDot color="bg-green-500" type="triangle" />;

        switch(enemy.type) {
            case 'chasseur':
            case 'frigate':
                return <RadarDot color="bg-red-500" pulse />;
            case 'staff':
                return <RadarDot color="bg-gray-400" type="square" size="w-1.5 h-1.5" />;
            default:
                return <RadarDot color="bg-red-500" pulse />;
        }
    }

    return (
        <div 
            className="w-64 h-64 bg-black/60 border-2 border-primary/50 backdrop-blur-sm rounded-full relative overflow-hidden flex items-center justify-center"
            style={{
                boxShadow: 'inset 0 0 20px 5px hsl(var(--primary) / 0.2), 0 0 15px hsl(var(--primary) / 0.2)',
            }}
        >
            {/* Grid Lines */}
            <div className="absolute inset-0">
                <div className="w-full h-px bg-primary/20 absolute top-1/2 -translate-y-1/2" />
                <div className="h-full w-px bg-primary/20 absolute left-1/2 -translate-x-1/2" />
                <div className="w-[70.7%] h-[70.7%] rounded-full border border-dashed border-primary/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 <div className="w-1/2 h-1/2 rounded-full border border-dashed border-primary/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Sweep Animation */}
            <div 
                className="absolute w-full h-full top-0 left-0 animate-spin"
                style={{
                    animationDuration: '3s',
                    animationTimingFunction: 'linear',
                }}
            >
                 <div 
                    className="absolute w-1/2 h-1/2 top-0 left-0 origin-bottom-right"
                    style={{
                        background: 'conic-gradient(from 90deg, transparent 0%, hsl(var(--primary) / 0.3) 70%, transparent 100%)'
                    }}
                />
            </div>
            
            {/* Radar Contacts */}
            <div className="relative w-full h-full">
                {/* Player in center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <RadarDot color="bg-cyan-400" size="w-2.5 h-2.5" type="triangle" />
                </div>
                
                {enemies.map(e => renderObjectOnRadar(e, `enemy-${e.id}`, getEnemyIcon(e)))}
                {stations.map(s => renderObjectOnRadar(s, `station-${s.id}`, <RadarDot color="border-blue-400" type="circle" pulse />))}
                {asteroids.map(a => renderObjectOnRadar(a, `asteroid-${a.id}`, <RadarDot color="bg-gray-500" />))}
                {debris.map(d => renderObjectOnRadar(d, `debris-${d.id}`, <RadarDot color="" type="icon"><Package className="h-2.5 w-2.5 text-yellow-500" /></RadarDot>))}
            </div>

            <div className="absolute bottom-2 text-xs text-primary/70 tracking-widest font-mono">
                RANGE: {Math.round(radarRange)}
            </div>
        </div>
    );
}
