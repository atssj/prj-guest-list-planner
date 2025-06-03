import { ClipboardList } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 md:py-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <ClipboardList className="h-10 w-10 md:h-12 md:w-12 text-primary" />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline text-primary">
          Shaadi Planner
        </h1>
      </div>
      <p className="text-md md:text-lg text-muted-foreground">
        Effortlessly manage your guest lists for any occasion.
      </p>
    </header>
  );
}
