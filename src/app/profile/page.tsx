
"use client";

import type React from 'react';
import Link from "next/link";
import { ArrowLeft, UserCircle2, LogIn, LogOut, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { AuthDialog } from "@/components/AuthDialog";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
          toast({
            title: "Browsing as Guest",
            description: "You're currently exploring as a guest. Your lists are saved on this device.",
          });
        } catch (error: any) {
          console.error("Error signing in anonymously:", error);
          setUser(null); 
          let toastMessage = "Could not start a guest session. Some features might be unavailable.";
          if (error.code === 'auth/admin-restricted-operation') {
            toastMessage = "Guest sign-in failed. Please ensure Anonymous sign-in is enabled in your Firebase project's Authentication settings.";
          }
          toast({
            variant: "destructive",
            title: "Guest Sign-In Failed",
            description: toastMessage,
          });
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out. You are now browsing as a guest.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col flex-grow items-center justify-center">
        <div role="status" className="flex flex-col items-center">
          <svg aria-hidden="true" className="w-12 h-12 text-primary animate-spin dark:text-gray-600 fill-accent" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <p className="mt-3 text-muted-foreground">Loading profile...</p>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col flex-grow">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center">
            <Link href="/add-guest" passHref>
              <Button variant="outline" size="icon" aria-label="Back to planner">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-headline text-primary text-center flex-grow px-4">
              {user?.isAnonymous ? "Guest Profile" : (user ? "User Profile" : "Access Your Profile")}
            </h1>
            <div className="w-10 h-10"></div> 
          </div>
        </header>

        <main className="flex-grow flex justify-center items-start">
          <Card className="shadow-lg w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                {user?.isAnonymous ? <ShieldQuestion className="h-6 w-6 text-primary" /> : <UserCircle2 className="h-6 w-6 text-primary" />}
                {user?.isAnonymous ? "Guest User" : (user ? "My Profile" : "Sign In / Up")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <>
                  {user.isAnonymous ? (
                    <CardDescription className="mb-4 text-center">
                      You&apos;re currently exploring as a guest. Your lists are saved on this device.
                      To keep your lists safe and use them on other devices, feel free to Log In or Sign Up!
                    </CardDescription>
                  ) : (
                    <p className="text-muted-foreground mb-4">
                      Welcome back, {user.email || "User"}!
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="p-3 border rounded-md bg-secondary/20">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-lg">{user.isAnonymous ? "Guest User (not signed in)" : user.email}</p>
                    </div>
                    {user.metadata.creationTime && !user.isAnonymous && (
                      <div className="p-3 border rounded-md bg-secondary/20">
                        <p className="text-sm font-medium">Joined</p>
                        <p className="text-lg">{new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                      </div>
                    )}
                     <div className="p-3 border rounded-md bg-secondary/20">
                      <p className="text-sm font-medium">Account Status</p>
                      <p className="text-lg">
                        {user.isAnonymous ? "Guest Session" : (user.emailVerified ? "Account Verified" : "Email Not Verified")}
                      </p>
                    </div>
                  </div>
                  
                  {user.isAnonymous ? (
                    <Button onClick={() => setIsAuthDialogOpen(true)} className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In / Sign Up with Email
                    </Button>
                  ) : (
                    <Button onClick={handleLogout} variant="outline" className="w-full mt-6">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <CardDescription className="mb-4 text-center">
                    Sign in or create an account to save your guest lists, view your event history, and manage your preferences.
                  </CardDescription>
                  <Button onClick={() => setIsAuthDialogOpen(true)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In / Sign Up with Email
                  </Button>
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
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLinkSent={(email) => {
          setIsAuthDialogOpen(false);
        }}
      />
    </>
  );
}
    
