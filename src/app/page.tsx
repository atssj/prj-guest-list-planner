
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem-1px)] text-center px-4 py-8 md:py-16 bg-gradient-to-br from-background to-secondary/30 animate-in fade-in-50 duration-1000">
      <main className="flex flex-col items-center space-y-8 max-w-2xl">
        <div className="p-4 bg-primary/10 rounded-full inline-block">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline text-primary">
          Guest Invite List
        </h1>
        <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed">
          Your friendly helper for easy guest list organization. <br /> Plan any event without the fuss.
        </p>
        <p className="text-md text-muted-foreground">
          Easily add guest names, how many are coming, their meal choices, and see your list come together. Perfect for parties, get-togethers, and all your special events.
        </p>
        <div className="mt-8">
          <Link href="/add-guest" passHref>
            <Button size="lg" className="text-lg py-6 px-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform duration-200">
              Start Your Guest List
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
