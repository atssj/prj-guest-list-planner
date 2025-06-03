
"use client";

import React, { useState } from 'react';
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

// Remove the import for `auth` and `sendSignInLinkToEmail` for now
// import { auth } from '@/lib/firebase'; // Assuming you have this
// import { sendSignInLinkToEmail } from 'firebase/auth';


interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkSent?: (email: string) => void; // Optional: if you want to do something after attempting to send
}

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

    // Placeholder for actual Firebase logic
    // In a real implementation, you would call Firebase's sendSignInLinkToEmail here
    try {
      // const actionCodeSettings = {
      //   url: window.location.origin, // URL to redirect back to
      //   handleCodeInApp: true, // Must be true
      // };
      // await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // window.localStorage.setItem('emailForSignIn', email); // Store email for completion

      // For now, simulate success and show a toast
      setTimeout(() => {
        toast({
          title: "Magic Link (Placeholder)",
          description: `If this were implemented, a sign-in link would be sent to ${email}.`,
        });
        if (onLinkSent) {
          onLinkSent(email);
        }
        // onClose(); // Optionally close dialog, or keep it open to show "check your email"
      }, 1000);

    } catch (err: any) {
      console.error("Error sending sign-in link:", err);
      setError(err.message || "Failed to send sign-in link. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to send sign-in link.",
      });
    } finally {
      // Simulate delay even for placeholder
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
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
          <Button onClick={handleSendMagicLink} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Magic Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
