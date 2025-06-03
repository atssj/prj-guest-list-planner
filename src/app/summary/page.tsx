
"use client";

import type React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestSummary } from "@/components/GuestSummary";
import type { Guest, GuestSummaryData, OtherMealPreference } from "@/lib/types";
import { INITIAL_SUMMARY } from "@/lib/types";
import { AuthDialog } from "@/components/AuthDialog";
import { useToast } from "@/hooks/use-toast";

const GUEST_LIST_STORAGE_KEY = "guestListData_v3";

export default function SummaryPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<GuestSummaryData>(INITIAL_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { toast } = useToast(); // if needed for save notifications

  useEffect(() => {
    const storedGuests = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (storedGuests) {
      try {
        const parsedGuests = JSON.parse(storedGuests) as Guest[];
        if (Array.isArray(parsedGuests)) {
          setGuests(parsedGuests);
        }
      } catch (error) {
        console.error("Error parsing guests from local storage:", error);
        // Optionally clear localStorage if data is corrupt
        // localStorage.removeItem(GUEST_LIST_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let totalAdults = 0;
    let totalChildren = 0;
    const newMealCounts = { veg: 0, nonVeg: 0, childMeal: 0, other: 0 };

    guests.forEach((guest) => {
      totalAdults += guest.adults;
      totalChildren += guest.children;
      
      if (guest.mealPreferences) {
        newMealCounts.veg += guest.mealPreferences.veg || 0;
        newMealCounts.nonVeg += guest.mealPreferences.nonVeg || 0;
        newMealCounts.childMeal += guest.mealPreferences.childMeal || 0;
        if (guest.mealPreferences.otherMeals) {
          guest.mealPreferences.otherMeals.forEach((otherMeal: OtherMealPreference) => {
            newMealCounts.other += otherMeal.count || 0;
          });
        }
      }
    });

    setSummary({
      totalAdults,
      totalChildren,
      totalGuests: totalAdults + totalChildren,
      mealCounts: newMealCounts,
    });
  }, [guests]);

  const handleSaveListClick = () => {
    // Logic to open AuthDialog, actual saving would be handled after authentication
    setIsAuthDialogOpen(true);
    // Placeholder toast, actual save would be async
    // toast({ title: "Save Action", description: "Authentication required to save." });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading summary...</p>
      </div>
    );
  }

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
            Guest Summary
          </h1>
           <div className="w-10 h-10"></div> {/* Placeholder for spacing */}
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center"> {/* Changed to flex-col for button placement */}
         <div className="w-full lg:max-w-2xl">
            <GuestSummary 
              summary={summary} 
              onSaveListClick={handleSaveListClick} 
              isSaveDisabled={guests.length === 0}
            />
         </div>
         <div className="mt-8 flex justify-center">
            <Link href="/" passHref>
                <Button variant="default">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Planner
                </Button>
            </Link>
        </div>
      </main>
       <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Guest List Planner. Summary Page.
        </p>
      </footer>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLinkSent={(email) => {
          // Handle post-link sent logic if needed
        }}
      />
    </div>
  );
}

