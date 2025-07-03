import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Target } from "lucide-react";

export function VesselSystems() {
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
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">Online</Badge>
                </div>
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-red-500" />
                        <span>Weapons</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">Ready</Badge>
                </div>
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span>Power</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Optimal</Badge>
                </div>
            </CardContent>
        </Card>
    );
}
