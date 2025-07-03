import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Wrench, ShieldCheck } from "lucide-react";
import type { StellarBaseData } from "@/lib/types";

export function StellarBaseStatus({ data }: { data: StellarBaseData }) {
  const shieldPercentage = data.maxShields > 0 ? (data.shields / data.maxShields) * 100 : 0;
  const hullPercentage = data.maxHull > 0 ? (data.hull / data.maxHull) * 100 : 0;

  return (
    <Card className="w-96 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-headline">Stellar Base</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 grid gap-3">
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Shields</span>
              </div>
              <span className="text-muted-foreground">{Math.round(data.shields)} / {data.maxShields}</span>
            </div>
            <Progress value={shieldPercentage} className="h-2 [&>div]:bg-blue-500" />
        </div>
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
               <div className="flex items-center gap-1">
                <Wrench className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Hull Integrity</span>
               </div>
              <span className="ml-auto text-muted-foreground">{Math.round(data.hull)} / {data.maxHull}</span>
            </div>
            <Progress value={hullPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
