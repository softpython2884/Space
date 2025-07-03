import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Shield, AlertTriangle } from "lucide-react";

export function Minimap() {
  return (
    <Card className="w-64 h-64 bg-black/60 border-primary/50 backdrop-blur-sm">
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-headline">Minimap</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative w-full h-[calc(100%-2.5rem)]">
        <Image
          src="https://placehold.co/256x256"
          alt="Minimap"
          data-ai-hint="star map space"
          fill
          className="object-cover rounded-b-lg"
        />
        {/* Simplified icons for minimap */}
        <div className="absolute top-[20%] left-[30%]">
          <Rocket className="h-4 w-4 text-green-400" />
        </div>
        <div className="absolute top-[50%] left-[60%]">
          <Rocket className="h-4 w-4 text-red-500" />
        </div>
        <div className="absolute top-[75%] left-[25%]">
          <Shield className="h-4 w-4 text-blue-400" />
        </div>
        <div className="absolute top-[15%] right-[15%]">
           <AlertTriangle className="h-4 w-4 text-yellow-400" />
        </div>
      </CardContent>
    </Card>
  );
}
