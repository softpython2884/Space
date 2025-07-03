import { PlayerStatus } from '@/components/game-ui/player-status';
import { ResourceDisplay } from '@/components/game-ui/resource-display';
import { Minimap } from '@/components/game-ui/minimap';
import { ChatBox } from '@/components/game-ui/chat-box';
import { StellarBaseStatus } from '@/components/game-ui/stellar-base-status';
import { VesselSystems } from '@/components/game-ui/vessel-systems';
import { ClientOnly } from '@/components/client-only';
import { GameContainer } from '@/components/game/game-container';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-900 font-body text-foreground">
      {/* Game view in the background */}
      <ClientOnly>
        <GameContainer />
      </ClientOnly>

      {/* UI Elements */}
      <div className="absolute top-4 left-4 z-10">
        <VesselSystems />
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4">
        <PlayerStatus />
        <ResourceDisplay />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-4">
          <StellarBaseStatus />
          <ClientOnly>
            <ChatBox />
          </ClientOnly>
      </div>
    </main>
  );
}
