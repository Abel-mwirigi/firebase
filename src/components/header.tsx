import { SightGuideLogo } from '@/components/sightguide-logo';

export function Header() {
  return (
    <header className="py-4 px-4 md:px-8 border-b border-border/50 bg-card">
      <div className="container mx-auto flex items-center gap-3">
        <SightGuideLogo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          SightGuide
        </h1>
      </div>
    </header>
  );
}
