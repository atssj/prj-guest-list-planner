
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail } from 'lucide-react';
import { auth } from '@/lib/firebase'; 
import { sendSignInLinkToEmail } from 'firebase/auth';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkSent?: (email: string) => void; 
}

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

export function AuthDialog({ isOpen, onClose, onLinkSent }: AuthDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/finish-sign-in`, // URL to redirect back to
        handleCodeInApp: true, // Must be true
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email); // Store email for completion
      
      toast({
        title: "Check Your Email",
        description: `A sign-in link has been sent to ${email}. Click the link to sign in.`,
      });
      if (onLinkSent) {
        onLinkSent(email);
      }
      // Optionally close dialog, or keep it open to show "check your email"
      // onClose(); 
    } catch (err: any) {
      console.error("Error sending sign-in link:", err);
      const errorMessage = err.message || "Failed to send sign-in link. Please try again.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Sending Link",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md AuthDialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Save Your Guest List
          </DialogTitle>
          <DialogDescription>
            Sign in or create an account to save your list. We'll send a magic link to your email to continue. No password needed!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSendMagicLink} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? "Sending..." : "Send Magic Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
