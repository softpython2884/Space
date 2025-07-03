import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { INITIAL_PLAYER_DATA } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Container, CircleDollarSign, Mountain, Flame, Star, Ship } from "lucide-react";

export function Dashboard() {
  const data = INITIAL_PLAYER_DATA;

  return (
    <Card className="bg-secondary/40 border-secondary">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Ship Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium">Level:</span>
                <Badge variant="secondary" className="ml-auto">{data.level}</Badge>
            </div>
            <div className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                <span className="font-medium">Class:</span>
                <Badge variant="secondary" className="ml-auto">{data.shipType}</Badge>
            </div>
        </div>

        <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">Health</span>
              <span className="ml-auto text-muted-foreground">{data.health}%</span>
            </div>
            <Progress value={data.health} aria-label={`${data.health}% Health`} />
        </div>

        <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">Energy</span>
              <span className="ml-auto text-muted-foreground">{data.energy}%</span>
            </div>
            <Progress value={data.energy} aria-label={`${data.energy}% Energy`} />
        </div>
        
        <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Container className="h-5 w-5 text-primary" />
              <span className="font-medium">Cargo</span>
              <span className="ml-auto text-muted-foreground">{data.cargo.current} / {data.cargo.max}</span>
            </div>
            <Progress value={(data.cargo.current / data.cargo.max) * 100} aria-label={`Cargo capacity`} />
        </div>
        
        <div>
            <h3 className="text-lg font-medium mb-4 font-headline">Resources</h3>
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-background/50 p-4 flex flex-col items-center justify-center gap-2">
                    <CircleDollarSign className="h-8 w-8 text-primary"/>
                    <div className="text-xl font-bold">{data.resources.money}</div>
                    <div className="text-xs text-muted-foreground">Credits</div>
                </Card>
                <Card className="bg-background/50 p-4 flex flex-col items-center justify-center gap-2">
                    <Mountain className="h-8 w-8 text-primary"/>
                    <div className="text-xl font-bold">{data.resources.ore}</div>
                    <div className="text-xs text-muted-foreground">Ore</div>
                </Card>
                <Card className="bg-background/50 p-4 flex flex-col items-center justify-center gap-2">
                    <Flame className="h-8 w-8 text-primary"/>
                    <div className="text-xl font-bold">{data.resources.gas}</div>
                    <div className="text-xs text-muted-foreground">Gas</div>
                </Card>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
