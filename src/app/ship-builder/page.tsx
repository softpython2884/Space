import { ShipBuilderView } from '@/components/ship-builder/ship-builder-view';

export default function ShipBuilderPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-900 font-body text-foreground">
      <ShipBuilderView />
    </main>
  );
}
