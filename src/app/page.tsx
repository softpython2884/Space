import { Dashboard } from "@/components/dashboard";
import { Map } from "@/components/map";
import { UpgradeInterface } from "@/components/upgrade-interface";
import { Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <Rocket className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tighter font-headline text-foreground">
          Cosmic Clash Arena
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <UpgradeInterface />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Dashboard />
            <Map />
          </div>
        </div>
      </main>
    </div>
  );
}
