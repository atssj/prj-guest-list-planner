
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Metadata } from 'next'; // For potential page-specific metadata if needed later

// While metadata is usually in layout.tsx or page.tsx server components,
// we can define it here if this page were to be a server component.
// For client components, it's primarily handled by RootLayout.
// export const metadata: Metadata = {
//   title: 'Shaadi Planner - Effortless Wedding Guest List Management',
//   description: 'Plan your perfect Indian wedding guest list with Shaadi Planner. Easily add guests, manage preferences, and get a clear summary. Start planning today!',
// };

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem-1px)] text-center px-4 py-8 md:py-16 bg-gradient-to-br from-background to-secondary/30 animate-in fade-in-50 duration-1000">
      <main className="flex flex-col items-center space-y-8 max-w-2xl">
        <div className="p-4 bg-primary/10 rounded-full inline-block">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline text-primary">
          Shaadi Planner
        </h1>
        <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed">
          Your Partner in Perfect Wedding Guest Management.
          <br />
          Seamlessly organize your wedding invitations for your special day.
        </p>
        <p className="text-md text-muted-foreground">
          Add family names, specify guest counts, select food preferences, and watch your guest list grow.
          Designed with the warmth and vibrancy of Indian weddings in mind.
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
      <footer className="absolute bottom-6 text-center w-full">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Shaadi Planner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
