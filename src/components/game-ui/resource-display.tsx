import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign, Mountain, Flame } from "lucide-react";
import type { Resources } from "@/lib/types";

export function ResourceDisplay({ resources }: { resources: Resources }) {
  return (
    <Card className="w-80 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
      <CardContent className="p-3 flex justify-around items-center gap-2">
        <div className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-yellow-400"/>
            <span className="font-bold">{resources.money}</span>
        </div>
        <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-gray-400"/>
            <span className="font-bold">{resources.ore}</span>
        </div>
        <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500"/>
            <span className="font-bold">{resources.gas}</span>
        </div>
      </CardContent>
    </Card>
  );
}
