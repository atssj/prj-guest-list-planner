
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FOOD_PREFERENCES, type FoodPreference, type Guest } from "@/lib/types";
import { formatFoodPreference } from "@/lib/utils";
import { PlusCircle, Users, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useRef, useEffect } from "react";
import { parseGuestInfo, ParseGuestInfoOutput } from "@/ai/flows/parse-guest-info-flow";

const guestFormSchema = z.object({
  familyName: z.string().min(1, "Family name is required."),
  adults: z.coerce.number().min(0, "Number of adults must be 0 or more.").int(),
  children: z.coerce.number().min(0, "Number of children must be 0 or more.").int(),
  foodPreference: z.enum(FOOD_PREFERENCES, {
    required_error: "Please select a food preference.",
  }),
}).refine((data) => data.adults + data.children > 0, {
  message: "At least one guest (adult or child) is required.",
  path: ["adults"], 
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
  onAddGuest: (guest: Guest) => void;
}

export function GuestForm({ onAddGuest }: GuestFormProps) {
  const { toast } = useToast();
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      familyName: "",
      adults: 0,
      children: 0,
      foodPreference: undefined,
    },
  });

  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setHasSpeechRecognition(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = async (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setIsListening(false);
        if (transcript) {
          setVoiceError(null);
          setIsProcessingAI(true);
          try {
            const aiResponse = await parseGuestInfo({ transcript });
            if (aiResponse) {
              // Populate form fields if values are present in AI response
              if (aiResponse.familyName) form.setValue("familyName", aiResponse.familyName, { shouldValidate: true, shouldDirty: true });
              if (aiResponse.adults !== undefined) form.setValue("adults", aiResponse.adults, { shouldValidate: true, shouldDirty: true });
              if (aiResponse.children !== undefined) form.setValue("children", aiResponse.children, { shouldValidate: true, shouldDirty: true });
              if (aiResponse.foodPreference) form.setValue("foodPreference", aiResponse.foodPreference, { shouldValidate: true, shouldDirty: true });
              toast({ title: "Voice Input Processed", description: "Form fields populated. Please review and submit." });
            } else {
              toast({ variant: "destructive", title: "AI Processing Error", description: "Could not extract details from voice." });
            }
          } catch (error) {
            console.error("AI processing error:", error);
            toast({ variant: "destructive", title: "AI Error", description: "Failed to process voice input with AI." });
            setVoiceError("AI processing failed.");
          } finally {
            setIsProcessingAI(false);
          }
        } else {
          setVoiceError("No speech detected or transcript is empty.");
           toast({ variant: "destructive", title: "Voice Input Error", description: "No speech detected." });
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setIsProcessingAI(false);
        let errorMessage = "Voice input error.";
        if (event.error === 'no-speech') {
          errorMessage = "No speech was detected. Please try again.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Microphone problem. Please check your microphone.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
        }
        setVoiceError(errorMessage);
        toast({ variant: "destructive", title: "Voice Input Error", description: errorMessage });
      };

      recognitionInstance.onend = () => {
        if (isListening) { // Only set isListening to false if it was onend that stopped it, not user click
             setIsListening(false);
        }
      };
      recognitionRef.current = recognitionInstance;
    } else {
      setHasSpeechRecognition(false);
      console.warn("SpeechRecognition API not supported in this browser.");
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isListening removed to prevent re-initialization on listening state change

  const handleToggleListening = () => {
    if (!hasSpeechRecognition) {
      toast({ variant: "destructive", title: "Unsupported Browser", description: "Voice input is not supported in your browser." });
      return;
    }
    if (isProcessingAI) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      setVoiceError(null); // Clear previous errors
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        // This catch is for synchronous errors during .start() like "recognition busy"
        console.error("Error starting speech recognition:", error);
        setIsListening(false);
        const errorMessage = "Could not start voice input. Please try again.";
        setVoiceError(errorMessage);
        toast({ variant: "destructive", title: "Voice Input Error", description: errorMessage });
      }
    }
  };

  function onSubmit(data: GuestFormValues) {
    onAddGuest(data as Guest);
    toast({
      title: "Guest Added",
      description: `${data.familyName} family has been added to the list.`,
    });
    form.reset();
  }

  return (
    <Card className="shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Add Guest Family
          </CardTitle>
          {hasSpeechRecognition && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleToggleListening}
              disabled={isProcessingAI || !hasSpeechRecognition}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              className={isListening ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {isProcessingAI ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isListening ? (
                <Mic className="h-5 w-5 fill-current" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        {!hasSpeechRecognition && (
            <p className="text-xs text-muted-foreground">Voice input not supported by your browser.</p>
        )}
        {voiceError && <p className="text-xs text-destructive">{voiceError}</p>}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="familyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sharma Family" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="foodPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Preference</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a food preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FOOD_PREFERENCES.map((pref) => (
                        <SelectItem key={pref} value={pref}>
                          {formatFoodPreference(pref as FoodPreference)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Guest
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
