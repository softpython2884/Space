'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ContextMenuTargetType, PlayerActionType } from "@/lib/types";
import { Mountain, Skull, Anchor } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  targetType: ContextMenuTargetType;
  onAction: (action: PlayerActionType) => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, targetType, onAction, onClose }: ContextMenuProps) {
    const handleActionClick = (action: PlayerActionType) => {
        onAction(action);
        onClose();
    };

    return (
        <div
          className="absolute z-50"
          style={{ top: y, left: x }}
          data-ui-element="true" // Prevents game clicks from propagating
        >
          <Card className="bg-black/80 border-primary/50 backdrop-blur-sm w-48">
              <CardContent className="p-2 flex flex-col gap-1">
                  {targetType === 'asteroid' && (
                      <Button variant="ghost" className="justify-start" onClick={() => handleActionClick('mining')}>
                          <Mountain className="mr-2 h-4 w-4" />
                          Mine
                      </Button>
                  )}
                  {targetType === 'enemy' && (
                      <>
                          <Button variant="ghost" className="justify-start" onClick={() => handleActionClick('pillaging')}>
                              <Skull className="mr-2 h-4 w-4" />
                              Pillage
                          </Button>
                          <Button variant="ghost" className="justify-start" onClick={() => handleActionClick('boarding')}>
                              <Anchor className="mr-2 h-4 w-4" />
                              Board
                          </Button>
                      </>
                  )}
              </CardContent>
          </Card>
        </div>
    );
}
