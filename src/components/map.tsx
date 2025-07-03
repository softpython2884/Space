import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Shield, AlertTriangle, GitBranch } from "lucide-react";

export function Map() {
  return (
    <Card className="bg-secondary/40 border-secondary">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Stellar Cartography</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src="https://placehold.co/800x450"
            alt="Star map"
            data-ai-hint="star map space"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          
          <div className="absolute top-[20%] left-[30%] animate-pulse">
            <Rocket className="h-6 w-6 text-green-400" />
            <span className="text-xs text-green-400 absolute -bottom-4 -right-2">Player</span>
          </div>

           <div className="absolute top-[50%] left-[60%] animate-ping">
            <Rocket className="h-6 w-6 text-red-500" />
          </div>
          <div className="absolute top-[50%] left-[60%]">
            <Rocket className="h-6 w-6 text-red-500" />
             <span className="text-xs text-red-500 absolute -bottom-4 -right-3">Enemy</span>
          </div>

          <div className="absolute top-[75%] left-[25%]">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-xs text-blue-400 absolute -bottom-4 right-0">Base</span>
          </div>

          <div className="absolute top-[15%] right-[15%]">
             <AlertTriangle className="h-7 w-7 text-yellow-400 animate-spin [animation-duration:3s]" />
             <span className="text-xs text-yellow-400 absolute -bottom-4 -right-8">Asteroids</span>
          </div>

          <div className="absolute bottom-[10%] right-[30%]">
            <GitBranch className="h-7 w-7 text-purple-400 animate-pulse" />
            <span className="text-xs text-purple-400 absolute -bottom-4 -right-6">Wormhole</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
