import { GameContainer } from '@/components/game/game-container';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-900 font-body text-foreground">
      <GameContainer />
    </main>
  );
}
