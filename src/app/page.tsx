
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Import useRouter
import { AppHeader } from "@/components/AppHeader";
import { GuestForm } from "@/components/GuestForm";
import { GuestSummary } from "@/components/GuestSummary";
import type { Guest, GuestSummaryData, OtherMealPreference } from "@/lib/types";
import { INITIAL_SUMMARY } from "@/lib/types";
import { AuthDialog } from "@/components/AuthDialog"; 
import { useToast } from "@/hooks/use-toast"; 


// import { auth, db } from "@/lib/firebase"; // For future Firebase integration
// import { onAuthStateChanged, type User } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";

const GUEST_LIST_STORAGE_KEY = "guestListData_v3"; 

export default function GuestListPlannerPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<GuestSummaryData>(INITIAL_SUMMARY);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  // const [currentUser, setCurrentUser] = useState<User | null>(null); 
  // const [isSaving, setIsSaving] = useState(false); 
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter


  // Placeholder for Firebase Auth state listener
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setCurrentUser(user);
  //     if (user) {
  //       // User is signed in, try to load their list from Firestore
  //       // loadGuestListFromFirestore(user.uid);
  //       toast({ title: "Signed In", description: `Welcome ${user.email}` });
  //     } else {
  //       // User is signed out, load from localStorage
  //       loadGuestsFromLocalStorage();
  //     }
  //   });
  //   return () => unsubscribe();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Placeholder for handling sign-in with email link
  // useEffect(() => {
  //   if (isSignInWithEmailLink(auth, window.location.href)) {
  //     let email = window.localStorage.getItem('emailForSignIn');
  //     if (!email) {
  //       email = window.prompt('Please provide your email for confirmation');
  //     }
  //     if (email) {
  //       signInWithEmailLink(auth, email, window.location.href)
  //         .then((result) => {
  //           window.localStorage.removeItem('emailForSignIn');
  //           setCurrentUser(result.user);
  //           toast({ title: "Successfully Signed In!", description: "Your guest list can now be saved online."});
  //           // You can access the new user via result.user
  //           // Additional state operations like setting user/checking account etc.
  //         })
  //         .catch((error) => {
  //           console.error("Error signing in with email link", error);
  //           toast({ variant: "destructive", title: "Sign In Error", description: error.message });
  //         });
  //     }
  //   }
  // }, []);


  const loadGuestsFromLocalStorage = () => {
    const storedGuests = localStorage.getItem(GUEST_LIST_STORAGE_KEY);
    if (storedGuests) {
      try {
        const parsedGuests = JSON.parse(storedGuests) as Guest[];
        // Basic validation for the new structure
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

  // Load from local storage on initial mount
  useEffect(() => {
    // For now, always load from local storage.
    // This will be conditional when Firebase auth is fully integrated.
    loadGuestsFromLocalStorage();
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

  useEffect(() => {
    // Save to local storage if not logged in, or as a backup
    // if (!currentUser) { // This condition will be used when auth is integrated
      localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(guests));
    // }
  }, [guests /*, currentUser */]);


  const handleAddGuest = (newGuest: Guest) => {
    setGuests((prevGuests) => [...prevGuests, newGuest]);
  };

  const handleSaveListClick = () => {
    // if (currentUser) {
      // setIsSaving(true);
      // saveGuestListToFirestore(currentUser.uid, guests)
      //   .then(() => toast({ title: "List Saved!", description: "Your guest list has been saved online." }))
      //   .catch((e) => toast({ variant: "destructive", title: "Save Error", description: e.message }))
      //   .finally(() => setIsSaving(false));
    // } else {
      setIsAuthDialogOpen(true);
    // }
  };

  const handleViewListClick = () => {
    router.push('/guest-list');
  };

  // Placeholder for saving to Firestore
  // const saveGuestListToFirestore = async (userId: string, guestList: Guest[]) => {
  //   if (!db) throw new Error("Firestore not initialized");
  //   const userListRef = doc(db, "guestLists", userId);
  //   await setDoc(userListRef, { guests: guestList, updatedAt: new Date() });
  // };

  // Placeholder for loading from Firestore
  // const loadGuestListFromFirestore = async (userId: string) => {
  //   if (!db) return;
  //   const userListRef = doc(db, "guestLists", userId);
  //   const docSnap = await getDoc(userListRef);
  //   if (docSnap.exists()) {
  //     const data = docSnap.data();
  //     if (data.guests && Array.isArray(data.guests)) {
  //       // Simple merge: Firestore takes precedence if both exist
  //       // More sophisticated merging could be added (e.g. prompt user)
  //       setGuests(data.guests as Guest[]);
  //       toast({ title: "List Loaded", description: "Your guest list was loaded from the cloud." });
  //       localStorage.setItem(GUEST_LIST_STORAGE_KEY, JSON.stringify(data.guests)); // Sync to local
  //     }
  //   } else {
  //     // No list in Firestore, try local storage
  //     loadGuestsFromLocalStorage();
  //   }
  // };


  return (
    <div className="container mx-auto px-4 py-2 md:px-6 md:py-4 flex flex-col flex-grow">
      <AppHeader onSaveListClick={handleSaveListClick} onViewListClick={handleViewListClick} />
      <main className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 flex-grow">
        <div id="guest-form-section" className="lg:col-span-2 scroll-mt-20">
          <GuestForm onAddGuest={handleAddGuest} />
        </div>
        <div id="guest-summary-section" className="lg:col-span-3 scroll-mt-20">
          <GuestSummary summary={summary} onSaveListClick={handleSaveListClick} />
        </div>
      </main>
      <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Guest List Planner. All rights reserved.
        </p>
      </footer>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLinkSent={(email) => {
          // You might want to show a specific message or close the dialog here
          // For now, the dialog's internal toast handles the message.
          // setIsAuthDialogOpen(false); // Example: close dialog after link is "sent"
        }}
      />
    </div>
  );
}
