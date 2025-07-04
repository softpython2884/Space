'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface ChatBoxProps {
    messages: ChatMessage[];
}

export function ChatBox({ messages }: ChatBoxProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A slight delay ensures the DOM has updated before scrolling
        setTimeout(() => {
            if (scrollAreaRef.current) {
                 scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'auto' });
            }
        }, 100);
    }
  }, [messages]);

  return (
    <Card className="w-96 h-64 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm flex flex-col">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-headline">System Comms</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" viewportRef={scrollAreaRef}>
            <div className="text-sm space-y-2">
                {messages.map(msg => (
                    <p key={msg.id}>
                        <span className={cn("font-semibold", msg.color)}>
                            [{msg.sender}]
                        </span>
                        : {msg.text}
                    </p>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <div className="flex w-full items-center space-x-2">
          <Input type="text" placeholder="Type a message..." className="bg-background/80" disabled />
          <Button type="submit" size="icon" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
