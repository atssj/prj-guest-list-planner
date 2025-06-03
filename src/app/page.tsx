"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { GuestForm } from "@/components/GuestForm";
import { GuestSummary } from "@/components/GuestSummary";
import type { Guest, GuestSummaryData, FoodPreference } from "@/lib/types";
import { INITIAL_SUMMARY } from "@/lib/types";

export default function GuestListPlannerPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<GuestSummaryData>(INITIAL_SUMMARY);

  useEffect(() => {
    let totalAdults = 0;
    let totalChildren = 0;
    const foodPreferencesCount: Record<FoodPreference, number> = {
      vegetarian: 0,
      nonVegetarian: 0,
      jain: 0,
      vegan: 0,
    };

    guests.forEach((guest) => {
      totalAdults += guest.adults;
      totalChildren += guest.children;
      foodPreferencesCount[guest.foodPreference]++;
    });

    setSummary({
      totalAdults,
      totalChildren,
      totalGuests: totalAdults + totalChildren,
      foodPreferences: foodPreferencesCount,
    });
  }, [guests]);

  const handleAddGuest = (newGuest: Guest) => {
    setGuests((prevGuests) => [...prevGuests, newGuest]);
  };

  return (
    <div className="container mx-auto px-4 py-2 md:px-6 md:py-4 flex flex-col flex-grow">
      <AppHeader />
      <main className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 flex-grow">
        <div className="lg:col-span-2">
          <GuestForm onAddGuest={handleAddGuest} />
        </div>
        <div className="lg:col-span-3">
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
