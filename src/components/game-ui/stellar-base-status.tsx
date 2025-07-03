import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Wrench } from "lucide-react";
import type { StellarBaseData } from "@/lib/types";

export function StellarBaseStatus({ data }: { data: StellarBaseData }) {
  return (
    <Card className="w-96 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-headline">Stellar Base</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 grid gap-3">
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Shields</span>
              </div>
              <span className="text-muted-foreground">{data.shields}%</span>
            </div>
            <Progress value={data.shields} className="h-2" />
        </div>
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
               <div className="flex items-center gap-1">
                <Wrench className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Hull Integrity</span>
               </div>
              <span className="ml-auto text-muted-foreground">{data.hull}%</span>
            </div>
            <Progress value={data.hull} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
