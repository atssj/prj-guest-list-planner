
"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { GuestForm } from "@/components/GuestForm";
import { GuestSummary } from "@/components/GuestSummary";
import type { Guest, GuestSummaryData } from "@/lib/types";
import { INITIAL_SUMMARY } from "@/lib/types";

const GUEST_LIST_STORAGE_KEY = "guestListData_v2"; // Version incremented due to data structure change

export default function GuestListPlannerPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<GuestSummaryData>(INITIAL_SUMMARY);

  useEffect(() => {
    const storedGuests = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (storedGuests) {
      try {
        const parsedGuests = JSON.parse(storedGuests) as Guest[];
        if (Array.isArray(parsedGuests) && parsedGuests.every(g => typeof g.mealPreferences === 'object')) {
          setGuests(parsedGuests);
        } else {
          // Invalid structure or old data, clear it
          localStorage.removeItem(GUEST_LIST_STORAGE_KEY);
        }
      } catch (error) {
        localStorage.removeItem(GUEST_LIST_STORAGE_KEY); 
      }
    }
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
        newMealCounts.other += guest.mealPreferences.otherCount || 0;
      }
    });

    setSummary({
      totalAdults,
      totalChildren,
      totalGuests: totalAdults + totalChildren,
      mealCounts: newMealCounts,
    });
  }, [guests]);

  useEffect(() => {
    localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(guests));
  }, [guests]);


  const handleAddGuest = (newGuest: Guest) => {
    setGuests((prevGuests) => [...prevGuests, newGuest]);
  };

  return (
    <div className="container mx-auto px-4 py-2 md:px-6 md:py-4 flex flex-col flex-grow">
      <AppHeader />
      <main className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 flex-grow">
        <div id="guest-form-section" className="lg:col-span-2 scroll-mt-20">
          <GuestForm onAddGuest={handleAddGuest} />
        </div>
        <div id="guest-summary-section" className="lg:col-span-3 scroll-mt-20">
          <GuestSummary summary={summary} />
        </div>
      </main>
      <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Guest List Planner. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
