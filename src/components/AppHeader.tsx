
import type React from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onSaveListClick?: () => void;
  onViewListClick?: () => void;
}

export function AppHeader({ onSaveListClick, onViewListClick }: AppHeaderProps) {
  return (
    <header className="py-1 sm:py-2 md:py-2 text-center relative">
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
        <ClipboardList className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-primary" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline text-primary">
          Guest List Planner
        </h1>
      </div>
      <p className="text-sm sm:text-md md:text-lg text-muted-foreground mb-4">
        Effortlessly manage your guest lists for any occasion.
      </p>
    </header>
  );
}
