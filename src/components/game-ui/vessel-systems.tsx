import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Target } from "lucide-react";
import type { VesselSystemStatus, VesselSystemsData } from "@/lib/types";

const statusConfig: Record<VesselSystemStatus, { text: string; className: string }> = {
    Online: { text: 'Online', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
    Ready: { text: 'Ready', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
    Optimal: { text: 'Optimal', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    Offline: { text: 'Offline', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
    Damaged: { text: 'Damaged', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
};


export function VesselSystems({ systems }: { systems: VesselSystemsData }) {
    const shieldStatus = statusConfig[systems.shields];
    const weaponStatus = statusConfig[systems.weapons];
    const powerStatus = statusConfig[systems.power];

    return (
        <Card className="w-64 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
            <CardHeader className="p-3">
                <CardTitle className="text-base font-headline">Vessel Systems</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 grid gap-3">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-cyan-400" />
                        <span>Shields</span>
                    </div>
                    <Badge variant="secondary" className={shieldStatus.className}>{shieldStatus.text}</Badge>
                </div>
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-500" />
                        <span>Weapons</span>
                    </div>
                    <Badge variant="secondary" className={weaponStatus.className}>{weaponStatus.text}</Badge>
                </div>
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span>Power</span>
                    </div>
                    <Badge variant="secondary" className={powerStatus.className}>{powerStatus.text}</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
