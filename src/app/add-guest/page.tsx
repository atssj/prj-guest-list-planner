
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { AppHeader } from "@/components/AppHeader";
import { GuestForm } from "@/components/GuestForm";
import type { Guest } from "@/lib/types";
import { scrollToElement } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, PlusCircle, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GUEST_LIST_STORAGE_KEY = "guestListData_v3"; 

export default function AddGuestPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestJustAdded, setGuestJustAdded] = useState<Guest | null>(null);
  const [showPostSubmitScreen, setShowPostSubmitScreen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const elementId = hash.substring(1); 
      if (elementId === 'guest-form-section' && !showPostSubmitScreen) {
        setTimeout(() => scrollToElement(elementId), 100);
      }
    }
  }, [showPostSubmitScreen]); 


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

  useEffect(() => {
    localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(guests));
  }, [guests]);


  const handleAddGuest = (newGuest: Guest) => {
    setGuests((prevGuests) => [...prevGuests, newGuest]);
    setGuestJustAdded(newGuest);
    setShowPostSubmitScreen(true);
    toast({
      title: "Guest Added Successfully!",
      description: `${newGuest.familyName} family has been added to your list.`,
      variant: "default", 
    });
    // Scroll to top to see the success message/options
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleAddAnotherGuest = () => {
    setShowPostSubmitScreen(false);
    setGuestJustAdded(null);
    // Ensure the form section is visible if scrolled away
    setTimeout(() => scrollToElement('guest-form-section'), 100);
  };

  const handleFinishAndRedirect = () => {
    router.push('/summary');
  };

  const handleViewListClick = () => {
    router.push('/guest-list');
  };

  return (
    <div className="container mx-auto px-4 py-2 md:px-6 md:py-4 flex flex-col flex-grow">
      <AppHeader onViewListClick={handleViewListClick} />
      <main className="mt-6 md:mt-8 flex-grow flex justify-center items-start">
        {showPostSubmitScreen && guestJustAdded ? (
          <Card className="w-full lg:max-w-lg shadow-xl animate-in fade-in-50 duration-500">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-headline">Guest Added!</CardTitle>
              <CardDescription>
                <span className="font-semibold">{guestJustAdded.familyName}</span> family has been successfully added to your guest list.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-muted-foreground">What would you like to do next?</p>
              <Button onClick={handleAddAnotherGuest} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Another Guest
              </Button>
              <Button onClick={handleFinishAndRedirect} variant="outline" className="w-full sm:w-auto">
                <ListChecks className="mr-2 h-5 w-5" /> Finish & View Summary
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div id="guest-form-section" className="w-full lg:max-w-lg scroll-mt-20">
            <GuestForm onAddGuest={handleAddGuest} key={guests.length} /> 
            {/* Using key to ensure GuestForm re-initializes if needed, though internal reset should handle it */}
          </div>
        )}
      </main>
    </div>
  );
}
