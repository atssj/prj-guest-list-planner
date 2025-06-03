
"use client";

import type React from 'react';
import Link from "next/link";
import { ArrowLeft, UserCircle2, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate auth state

  useEffect(() => {
    // Simulate fetching join date - only relevant if logged in
    if (isLoggedIn) {
      setCurrentTime(new Date().toLocaleDateString());
    } else {
      setCurrentTime(null); // Clear date if logged out
    }
  }, [isLoggedIn]);

  const handleToggleLoginState = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col flex-grow">
      <header className="mb-6 md:mb-8">
        <div className="flex items-center">
          <Link href="/add-guest" passHref>
            <Button variant="outline" size="icon" aria-label="Back to planner">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-headline text-primary text-center flex-grow px-4">
            {isLoggedIn ? "User Profile" : "Access Your Profile"}
          </h1>
           <div className="w-10 h-10 md:w-auto"></div> {/* Spacer for centering title */}
        </div>
      </header>

      <main className="flex-grow flex justify-center items-start">
        <Card className="shadow-lg w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <UserCircle2 className="h-6 w-6 text-primary" />
              {isLoggedIn ? "My Profile" : "Guest Access"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Welcome back! Here are your (placeholder) details.
                </p>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md bg-secondary/20">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-lg">user@example.com <span className="text-xs text-muted-foreground">(Logged In)</span></p>
                  </div>
                  <div className="p-3 border rounded-md bg-secondary/20">
                    <p className="text-sm font-medium">Joined</p>
                    {currentTime !== null ? <p className="text-lg">{currentTime}</p> : <p className="text-lg">Loading date...</p>}
                  </div>
                  <div className="p-3 border rounded-md bg-secondary/20">
                    <p className="text-sm font-medium">Membership Tier</p>
                    <p className="text-lg">Free User <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
                  </div>
                </div>
                <Button onClick={handleToggleLoginState} variant="outline" className="w-full mt-6">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <CardDescription className="mb-4 text-center">
                  Log in or create an account to save your guest lists, view your event history, and manage your preferences.
                </CardDescription>
                <Button onClick={handleToggleLoginState} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In / Sign Up (Simulated)
                </Button>
                 <p className="text-xs text-muted-foreground text-center mt-2">(This is a simulated login for prototype purposes)</p>
              </>
            )}
            <div className="mt-8 flex justify-center">
                 <Link href="/add-guest" passHref>
                    <Button variant="default"> 
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Planner
                    </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
