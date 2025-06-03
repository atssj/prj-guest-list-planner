
"use client";

import type React from 'react';
import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client after hydration
    setCurrentTime(new Date().toLocaleDateString());
  }, []);


  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col flex-grow">
      <header className="mb-6 md:mb-8">
        <div className="flex items-center">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" aria-label="Back to planner">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-headline text-primary text-center flex-grow px-4">
            User Profile
          </h1>
           <div className="w-10 h-10"></div> {/* Placeholder for spacing */}
        </div>
      </header>

      <main className="flex-grow flex justify-center items-start">
        <Card className="shadow-lg w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <UserCircle2 className="h-6 w-6 text-primary" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is your profile page. Account features are coming soon!
            </p>
            <div className="space-y-3">
              <div className="p-3 border rounded-md bg-secondary/20">
                <p className="text-sm font-medium">Email</p>
                <p className="text-lg">user@example.com <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
              </div>
              <div className="p-3 border rounded-md bg-secondary/20">
                <p className="text-sm font-medium">Joined</p>
                {currentTime !== null ? <p className="text-lg">{currentTime} <span className="text-xs text-muted-foreground">(Placeholder)</span></p> : <p className="text-lg">Loading date...</p>}
              </div>
               <div className="p-3 border rounded-md bg-secondary/20">
                <p className="text-sm font-medium">Membership Tier</p>
                <p className="text-lg">Free User <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
                 <Link href="/" passHref>
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Planner
                    </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </main>

       <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Guest List Planner. Profile Page.
        </p>
      </footer>
    </div>
  );
}
