import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wrench, Heart } from "lucide-react";

export function ShipSchematic() {
  return (
    <Card className="w-64 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-headline">Ship Schematic</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex justify-center items-center h-32">
          <p className="text-xs text-muted-foreground">Damage visualization coming soon.</p>
      </CardContent>
    </Card>
  );
}
