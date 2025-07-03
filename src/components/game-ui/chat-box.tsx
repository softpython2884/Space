import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

export function ChatBox() {
  return (
    <Card className="w-96 h-64 bg-black/60 border-primary/50 text-foreground backdrop-blur-sm flex flex-col">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-headline">System Chat</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
            <div className="text-sm space-y-2">
                <p><span className="text-yellow-400">[System]</span>: Welcome to Cosmic Clash Arena!</p>
                <p><span className="text-green-400">[Player1]</span>: GLHF everyone!</p>
                <p><span className="text-red-500">[Player2]</span>: you're going down!</p>
                <p><span className="text-cyan-400">[Player3]</span>: lol</p>
                <p><span className="text-yellow-400">[System]</span>: Asteroid field detected nearby.</p>
                 <p><span className="text-green-400">[Player1]</span>: ooh shiny rocks</p>
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <div className="flex w-full items-center space-x-2">
          <Input type="text" placeholder="Type a message..." className="bg-background/80" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
