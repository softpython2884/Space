'use client';
import type { PlayerShipClass } from "@/lib/types";
import React from "react";

const ChasseurModel = ({ className }: { className?: string }) => (
    <svg width="40" height="40" viewBox="0 0 50 50" className={className}>
        <polygon points="25,0 28,8 22,8" className="fill-primary stroke-primary" strokeWidth="1" />
        <polygon points="25,5 45,45 25,35 5,45" strokeWidth="2" />
    </svg>
);

const InterceptorModel = ({ className }: { className?: string }) => (
    <svg width="40" height="40" viewBox="0 0 50 50" className={className}>
        <polygon points="25,5 35,45 25,35 15,45" strokeWidth="2" />
        <polygon points="25,10 30,25 20,25" />
    </svg>
);

const FrigateModel = ({ className }: { className?: string }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" className={className}>
        <polygon points="30,5 55,30 50,55 10,55 5,30" strokeWidth="2" />
        <polygon points="20,5 40,5 45,15 15,15" strokeWidth="1.5" />
        <rect x="27" y="15" width="6" height="25" />
        <polygon points="20,25 5,40 15,40" strokeWidth="1.5" />
        <polygon points="40,25 55,40 45,40" strokeWidth="1.5" />
    </svg>
);

const DestroyerModel = ({ className }: { className?: string }) => (
     <svg width="80" height="80" viewBox="0 0 80 80" className={className}>
        <polygon points="40,5 70,35 60,75 20,75 10,35" strokeWidth="2.5" />
        <polygon points="30,5 50,5 60,20 20,20" strokeWidth="2" />
        <rect x="25" y="20" width="30" height="40" strokeWidth="2" />
        <polygon points="35,75 45,75 50,65 30,65" strokeWidth="1.5" />
        <polygon points="5,40 20,40 20,60 5,60" strokeWidth="2" />
        <polygon points="75,40 60,40 60,60 75,60" strokeWidth="2" />
    </svg>
);

const CarrierModel = ({ className }: { className?: string }) => (
    <svg width="100" height="100" viewBox="0 0 100 100" className={className}>
        <polygon points="50,5 90,40 80,95 20,95 10,40" strokeWidth="3" />
        <rect x="35" y="15" width="30" height="15" strokeWidth="2"/>
        <path d="M 20 45 L 30 45 L 30 70 L 20 70 Z" strokeWidth="2" />
        <path d="M 80 45 L 70 45 L 70 70 L 80 70 Z" strokeWidth="2" />
        <rect x="40" y="50" width="20" height="30" strokeWidth="2" fillOpacity="0.5"/>
    </svg>
);

const CargoModel = ({ className }: { className?: string }) => (
    <svg width="70" height="90" viewBox="0 0 70 90" className={className}>
        <rect x="10" y="5" width="50" height="20" strokeWidth="2" />
        <rect x="5" y="25" width="60" height="40" strokeWidth="2.5" />
        <rect x="20" y="65" width="30" height="20" strokeWidth="2" />
    </svg>
);

const MinerModel = ({ className }: { className?: string }) => (
    <svg width="50" height="30" viewBox="0 0 50 30" className={className}>
      <rect x="5" y="10" width="40" height="10" strokeWidth="2" />
      <rect x="10" y="5" width="8" height="20" />
      <rect x="32" y="5" width="8" height="20" />
      <polygon points="0,15 5,12 5,18" />
    </svg>
);

export const ShipModel = ({ shipClass, isAlly, isPlayer }: { shipClass: PlayerShipClass, isAlly?: boolean, isPlayer?: boolean }) => {
    let ModelComponent;
    let baseClassName = "";
    
    if (isPlayer) {
        baseClassName = "fill-cyan-400 stroke-cyan-200";
    } else {
        switch (shipClass) {
            case 'Chasseur': baseClassName = isAlly ? "fill-blue-500/80 stroke-blue-300" : "fill-red-500/80 stroke-red-300"; break;
            case 'Intercepteur': baseClassName = isAlly ? "fill-blue-400/80 stroke-blue-200" : "fill-red-400/80 stroke-red-200"; break;
            case 'Frégate': baseClassName = isAlly ? "fill-blue-600/80 stroke-blue-400" : "fill-orange-600/80 stroke-orange-400"; break;
            case 'Mineur': baseClassName = isAlly ? "fill-blue-500/80 stroke-blue-300" : "fill-gray-500/80 stroke-gray-300"; break;
            default: baseClassName = isAlly ? "fill-blue-500/80 stroke-blue-300" : "fill-red-500/80 stroke-red-300"; break;
        }
    }
    
    const props = { className: baseClassName };

    switch (shipClass) {
        case 'Chasseur': ModelComponent = ChasseurModel; break;
        case 'Intercepteur': ModelComponent = InterceptorModel; break;
        case 'Frégate': ModelComponent = FrigateModel; break;
        case 'Destroyer': ModelComponent = DestroyerModel; break;
        case 'Porteur': ModelComponent = CarrierModel; break;
        case 'Cargo': ModelComponent = CargoModel; break;
        case 'Mineur': ModelComponent = MinerModel; break;
        default: ModelComponent = ChasseurModel; // Fallback
    }
    
    return <ModelComponent {...props} />;
}
