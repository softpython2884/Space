'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ActionProgressProps {
  actionType: string;
  progress: number; // 0 to 100
}

export function ActionProgress({ actionType, progress }: ActionProgressProps) {
  if (progress < 0 || progress >= 100) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-24 z-20 w-80" data-ui-element="true">
      <Card className="bg-black/70 border-primary/50 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex flex-col gap-2 text-center">
            <span className="font-headline text-lg capitalize">{actionType}...</span>
            <Progress value={progress} className="h-2 [&>div]:bg-yellow-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
