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
    <svg width="60" height="70" viewBox="0 0 60 70" className={className}>
        <polygon points="30,0 45,25 40,70 20,70 15,25" strokeWidth="2" />
        <polygon points="30,10 40,30 35,35 25,35 20,30" />
        <path d="M 45 25 L 55 35 L 50 60 L 40 70" strokeWidth="2" fillOpacity="0.5" />
        <path d="M 15 25 L 5 35 L 10 60 L 20 70" strokeWidth="2" fillOpacity="0.5" />
        <rect x="25" y="65" width="10" height="5" />
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
    <svg width="80" height="120" viewBox="0 0 80 120" className={className}>
        <polygon points="20,10 60,10 70,30 70,90 60,110 20,110 10,90 10,30" strokeWidth="2.5" />
        <polygon points="30,0 50,0 55,10 25,10" strokeWidth="2" />
        <path d="M 15 35 L 65 35" strokeWidth="1" strokeDasharray="4 2" />
        <path d="M 15 85 L 65 85" strokeWidth="1" strokeDasharray="4 2" />
        <rect x="30" y="105" width="20" height="15" strokeWidth="1.5" />
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
    <svg width="30" height="50" viewBox="0 0 30 50" className={className}>
      <rect x="10" y="5" width="10" height="40" strokeWidth="2" />
      <rect x="5" y="10" width="20" height="8" />
      <rect x="5" y="32" width="20" height="8" />
      <polygon points="15,0 12,5 18,5" />
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
