
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { AppHeader } from "@/components/AppHeader";
import { GuestForm } from "@/components/GuestForm";
// GuestSummary and related types/state are removed from this page
import type { Guest } from "@/lib/types";
// INITIAL_SUMMARY is removed
// AuthDialog is removed as saving is handled on other pages now
// useToast is removed if not used by other components on this page (GuestForm uses it internally)
import { scrollToElement } from "@/lib/utils";

const GUEST_LIST_STORAGE_KEY = "guestListData_v3"; 

export default function AddGuestPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  // summary state and its calculation useEffect are removed
  // isAuthDialogOpen state is removed
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const elementId = hash.substring(1); 
      if (elementId === 'guest-form-section') {
        scrollToElement(elementId);
      }
    }
  }, [router]); 


  const loadGuestsFromLocalStorage = () => {
    const storedGuests = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (storedGuests) {
      try {
        const parsedGuests = JSON.parse(storedGuests) as Guest[];
        if (Array.isArray(parsedGuests) && parsedGuests.every(g => typeof g.mealPreferences === 'object' && Array.isArray(g.mealPreferences.otherMeals))) {
          setGuests(parsedGuests);
        } else {
          console.warn("Local storage data has old format, clearing.");
          localStorage.removeItem(GUEST_LIST_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error parsing guests from local storage:", error);
        localStorage.removeItem(GUEST_LIST_STORAGE_KEY);
      }
    }
  };

  useEffect(() => {
    loadGuestsFromLocalStorage();
  }, []);


  // useEffect for summary calculation is removed

  useEffect(() => {
    localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(guests));
  }, [guests]);


  const handleAddGuest = (newGuest: Guest) => {
    setGuests((prevGuests) => [...prevGuests, newGuest]);
  };

  // handleSaveListClick is removed as AppHeader doesn't have save, and no save button on this page
  
  const handleViewListClick = () => {
    router.push('/guest-list');
  };

  return (
    <div className="container mx-auto px-4 py-2 md:px-6 md:py-4 flex flex-col flex-grow">
      <AppHeader onViewListClick={handleViewListClick} />
      <main className="mt-6 md:mt-8 flex-grow flex justify-center items-start"> {/* Simplified layout */}
        <div id="guest-form-section" className="w-full lg:max-w-lg scroll-mt-20"> {/* Centered form */}
          <GuestForm onAddGuest={handleAddGuest} />
        </div>
        {/* GuestSummary section is removed */}
      </main>
      <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Guest List Planner. Add Guests.
        </p>
      </footer>
      {/* AuthDialog is removed from this page */}
    </div>
  );
}
