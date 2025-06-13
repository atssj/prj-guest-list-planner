"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Only import necessary Card parts
import { MailCheck, AlertTriangle, Home } from 'lucide-react';

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

export default function SignInHandler() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processSignIn = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      if (isSignInWithEmailLink(auth, window.location.href)) {
        setStatus('loading');
        let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
        if (!email) {
          setErrorMessage("Your email is required to complete sign-in. Please try sending the link again from the original device/browser or ensure cookies/localStorage are enabled.");
          setStatus('error');
          toast({
            variant: "destructive",
            title: "Sign-In Incomplete",
            description: "Email not found. Please try initiating the sign-in process again.",
          });
          return;
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
          setStatus('success');
          toast({
            title: "Sign-In Successful!",
            description: "You are now signed in.",
          });
          router.push('/profile');
        } catch (error: any) {
          console.error("Error signing in with email link:", error);
          let friendlyMessage = "An error occurred during sign-in. Please try again.";
          if (error.code === 'auth/invalid-action-code') {
            friendlyMessage = "The sign-in link is invalid or has expired. Please request a new one.";
          } else if (error.code === 'auth/user-disabled') {
            friendlyMessage = "This account has been disabled.";
          }
          setErrorMessage(friendlyMessage);
          setStatus('error');
          toast({
            variant: "destructive",
            title: "Sign-In Failed",
            description: friendlyMessage,
          });
        }
      } else {
        // Not a sign-in link, or link already used.
      }
    };

    processSignIn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, toast]); // router and toast are stable

  // Render the appropriate UI based on the status
  return (
    <>
      {status === 'loading' && (
        <CardHeader className="text-center">
          <div role="status" className="flex justify-center mb-3">
            <svg aria-hidden="true" className="w-10 h-10 text-primary animate-spin dark:text-gray-600 fill-accent" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <CardTitle className="text-2xl font-headline">Completing Sign-In...</CardTitle>
          <CardDescription>Please wait while we verify your sign-in link.</CardDescription>
        </CardHeader>
      )}
      {status === 'success' && (
         <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <MailCheck className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-headline">Sign-In Successful!</CardTitle>
          <CardDescription>You will be redirected shortly.</CardDescription>
        </CardHeader>
      )}
      {status === 'error' && (
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-headline">Sign-In Failed</CardTitle>
          <CardDescription>{errorMessage || "Something went wrong."}</CardDescription>
        </CardHeader>
      )}
       {status === 'idle' && typeof window !== 'undefined' && !isSignInWithEmailLink(auth, window.location.href) && (
         <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Invalid Link</CardTitle>
          <CardDescription>This page is used to complete the sign-in process. If you're trying to sign in, please use the link sent to your email.</CardDescription>
        </CardHeader>
      )}

      {(status === 'error' || (status === 'idle' && typeof window !== 'undefined' && !isSignInWithEmailLink(auth, window.location.href))) && (
        <div className="flex flex-col items-center space-y-4">
            <Button onClick={() => router.push('/')} variant="default">
              <Home className="mr-2 h-5 w-5" /> Go to Homepage
            </Button>
        </div>
      )}
    </>
  );
}