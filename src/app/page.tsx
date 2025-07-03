import { PlayerStatus } from '@/components/game-ui/player-status';
import { ResourceDisplay } from '@/components/game-ui/resource-display';
import { Minimap } from '@/components/game-ui/minimap';
import { ChatBox } from '@/components/game-ui/chat-box';
import { StellarBaseStatus } from '@/components/game-ui/stellar-base-status';
import { VesselSystems } from '@/components/game-ui/vessel-systems';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black font-body text-foreground">
      {/* Fullscreen Map Background */}
      <Image
        src="https://placehold.co/1920x1080"
        alt="Main star map"
        data-ai-hint="star map space"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/30" /> {/* Overlay for better text readability */}

      {/* UI Elements */}
      <div className="absolute top-4 left-4">
        <VesselSystems />
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-4">
        <PlayerStatus />
        <ResourceDisplay />
      </div>
      
      <div className="absolute bottom-4 left-4 flex flex-col items-start gap-4">
          <StellarBaseStatus />
          <ChatBox />
      </div>

      <div className="absolute bottom-4 right-4">
        <Minimap />
      </div>
    </main>
  );
}
