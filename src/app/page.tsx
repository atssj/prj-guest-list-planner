
"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { GuestForm } from "@/components/GuestForm";
import { GuestSummary } from "@/components/GuestSummary";
import type { Guest, GuestSummaryData, FoodPreference } from "@/lib/types";
import { INITIAL_SUMMARY } from "@/lib/types";

const GUEST_LIST_STORAGE_KEY = "guestListData_v1";

export default function GuestListPlannerPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<GuestSummaryData>(INITIAL_SUMMARY);

  // Load guests from localStorage on initial client-side render
  useEffect(() => {
    const storedGuests = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (storedGuests) {
      try {
        const parsedGuests = JSON.parse(storedGuests) as Guest[];
        // Basic validation: check if it's an array
        if (Array.isArray(parsedGuests)) {
          // You could add more detailed validation here if needed,
          // e.g., checking if objects have the required Guest properties.
          setGuests(parsedGuests);
        } else {
          localStorage.removeItem(GUEST_LIST_STORAGE_KEY); // Clear invalid data
        }
      } catch (error) {
        localStorage.removeItem(GUEST_LIST_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []); // Empty dependency array: runs only once on mount (client-side)

  // Update summary when guests change
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
      // Ensure foodPreference is a valid key before incrementing
      if (guest.foodPreference && foodPreferencesCount.hasOwnProperty(guest.foodPreference)) {
        foodPreferencesCount[guest.foodPreference]++;
      }
    });

    setSummary({
      totalAdults,
      totalChildren,
      totalGuests: totalAdults + totalChildren,
      foodPreferences: foodPreferencesCount,
    });
  }, [guests]);

  // Save guests to localStorage when guests change
  useEffect(() => {
    // This effect runs after the initial render and whenever 'guests' state changes.
    // It ensures that if guests were loaded from localStorage, they are not immediately
    // overwritten by an empty array if the load effect updates 'guests' state.
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
