import { Card, CardContent } from "@/components/ui/card";
import { Compass } from "lucide-react";

interface SpeedIndicatorProps {
  speed: number;
  rotation: number;
}

const getDirection = (rotation: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  // atan2 rotation: 0 is E, 90 is S, 180 is W, -90 is N
  // We add 90 to align North with 0 degrees for easier calculation.
  const angle = (rotation + 360 + 90) % 360; 
  const index = Math.round(angle / 45) % 8;
  return directions[index];
};

export function SpeedIndicator({ speed, rotation }: SpeedIndicatorProps) {
  const currentSpeed = (speed * 10).toFixed(0); // Arbitrary multiplier for display
  const direction = getDirection(rotation);

  return (
    <Card className="w-64 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
      <CardContent className="p-3 flex justify-around items-center gap-4">
        <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Speed</span>
            <span className="font-bold text-2xl">{currentSpeed}</span>
        </div>
         <div className="w-px h-10 bg-primary/50" />
        <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Heading</span>
            <div className="flex items-center gap-2">
                <Compass className="h-6 w-6 text-primary" />
                <span className="font-bold text-2xl">{direction}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
