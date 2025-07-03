import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Zap, Container, Star } from "lucide-react";
import type { PlayerData } from "@/lib/types";

export function PlayerStatus({ data }: { data: PlayerData }) {
  return (
    <Card className="w-80 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{data.shipType}</span>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <span className="font-medium text-base">Lvl: {data.level}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 grid gap-3">
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">Health</span>
              </div>
              <span className="text-muted-foreground">{data.health}%</span>
            </div>
            <Progress value={data.health} className="h-2" />
        </div>
        <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
               <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">Energy</span>
               </div>
              <span className="ml-auto text-muted-foreground">{data.energy}%</span>
            </div>
            <Progress value={data.energy} className="h-2" />
        </div>
         <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Container className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Cargo</span>
              </div>
              <span className="ml-auto text-muted-foreground">{data.cargo.current} / {data.cargo.max}</span>
            </div>
            <Progress value={(data.cargo.current / data.cargo.max) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
