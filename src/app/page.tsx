import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Wrench } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-900 p-8 font-body text-foreground">
      <div className="text-center mb-12">
        <h1 className="font-headline text-6xl font-bold text-primary animate-pulse">Cosmic Clash Arena</h1>
        <p className="text-muted-foreground text-lg mt-2">Forge your ship, conquer the cosmos.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/game" className="transform hover:scale-105 transition-transform duration-300">
          <Card className="bg-secondary/40 border-secondary h-full flex flex-col hover:border-primary/80 hover:bg-secondary/60">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-4">
                <Rocket className="h-8 w-8 text-primary" />
                Launch Game
              </CardTitle>
              <CardDescription>
                Jump into the cockpit and engage in cosmic battles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>Pilot your custom-built ship through asteroid fields, take on enemy fighters, and explore the vastness of space.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/ship-builder" className="transform hover:scale-105 transition-transform duration-300">
          <Card className="bg-secondary/40 border-secondary h-full flex flex-col hover:border-primary/80 hover:bg-secondary/60">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-4">
                <Wrench className="h-8 w-8 text-primary" />
                Ship Builder
              </CardTitle>
              <CardDescription>
                Design, build, and customize your own unique starships.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>Use the advanced editor to construct ships from individual modules. Export your designs for use in the game. (Dev Tool)</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
