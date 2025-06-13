
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Guest } from "@/lib/types";
import { PlusCircle, Users, Utensils, Salad, Beef, Grape, Wheat, Trash2, ArrowLeft, ArrowRight, Mic, Loader2, MicOff } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { parseGuestInfo, type ParseGuestInfoOutput } from "@/ai/flows/parse-guest-info-flow";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const otherMealPreferenceSchema = z.object({
  name: z.string().min(1, "Meal name is required."),
  count: z.coerce.number().min(1, "Count must be at least 1.").int("Must be a whole number."),
});

const mealPreferencesSchema = z.object({
  veg: z.coerce.number().min(0, "Cannot be negative").int("Must be a whole number"),
  nonVeg: z.coerce.number().min(0, "Cannot be negative").int("Must be a whole number"),
  childMeal: z.coerce.number().min(0, "Cannot be negative").int("Must be a whole number"),
  otherMeals: z.array(otherMealPreferenceSchema).optional(),
});

const guestFormSchema = z.object({
  familyName: z.string().min(1, "Family name is required."),
  adults: z.coerce.number().min(0, "Number of adults must be 0 or more.").int(),
  children: z.coerce.number().min(0, "Number of children must be 0 or more.").int(),
  mealPreferences: mealPreferencesSchema,
})
.refine((data) => data.adults + data.children > 0, {
  message: "At least one guest (adult or child) is required.",
  path: ["adults"], 
})
.refine(
  (data) => {
    const totalPeople = data.adults + data.children;
    if (totalPeople === 0) return true; 
    const otherMealsCount = data.mealPreferences.otherMeals?.reduce((sum, meal) => sum + (meal.count || 0), 0) || 0;
    const totalMeals =
      (data.mealPreferences.veg || 0) +
      (data.mealPreferences.nonVeg || 0) +
      (data.mealPreferences.childMeal || 0) +
      otherMealsCount;
    return totalMeals === totalPeople;
  },
  {
    message: "Total number of meals must equal the total number of guests.",
    path: ["mealPreferences.veg"], 
  }
);

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
  onAddGuest: (guest: Guest) => void;
}

export function GuestForm({ onAddGuest }: GuestFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  // States for Speech Recognition and AI processing
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [micPermissionError, setMicPermissionError] = useState(false);
  const [isSpeechApiAvailable, setIsSpeechApiAvailable] = useState(false);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechApiAvailable(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Changed to Indian English

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript("");
          setAiError(null);
          setMicPermissionError(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = event.results[0][0].transcript;
          setTranscript(currentTranscript);
          handleTranscript(currentTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setMicPermissionError(true);
            toast({
              variant: "destructive",
              title: "Microphone Access Denied",
              description: "Please allow microphone access in your browser settings to use voice input.",
            });
          } else if (event.error === 'no-speech') {
             toast({ variant: "default", title: "No Speech Detected", description: "Please try speaking again."});
          } else {
            toast({ variant: "destructive", title: "Voice Input Error", description: `Could not process voice input: ${event.error}` });
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };
        speechRecognitionRef.current = recognition;
      } else {
        setIsSpeechApiAvailable(false);
      }
    }
  }, [toast]);


  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      familyName: "",
      adults: 0,
      children: 0,
      mealPreferences: {
        veg: 0,
        nonVeg: 0,
        childMeal: 0,
        otherMeals: [],
      },
    },
    mode: "onChange", 
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mealPreferences.otherMeals",
  });

  const handleTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsAiProcessing(true);
    setAiError(null);
    try {
      const result: ParseGuestInfoOutput = await parseGuestInfo({ transcript: text });
      if (result.familyName) form.setValue("familyName", result.familyName, { shouldValidate: true });
      if (result.adults !== undefined) form.setValue("adults", result.adults, { shouldValidate: true });
      if (result.children !== undefined) form.setValue("children", result.children, { shouldValidate: true });
      
      const familyName = result.familyName || "Guest";
      const adults = result.adults !== undefined ? result.adults : "no";
      const children = result.children !== undefined ? result.children : "no";
      
      toast({
        title: "Guest Info Parsed",
        description: `${familyName}, ${adults} adult(s), ${children} child(ren) details extracted. Please review and proceed.`,
      });
      if((result.adults || 0) + (result.children || 0) > 0) {
         setCurrentStep(1); // Stay on step 1 to review, or auto-advance if needed
      }

    } catch (error) {
      console.error("AI parsing error:", error);
      setAiError("Failed to parse guest information. Please enter manually.");
      toast({
        variant: "destructive",
        title: "AI Parsing Error",
        description: "Could not understand the guest details from your voice input. Please try again or enter manually.",
      });
    } finally {
      setIsAiProcessing(false);
    }
  };
  
  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
       toast({ variant: "destructive", title: "Voice Input Not Available", description: "Speech recognition is not supported by your browser."});
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
      // Reset any previous permission error display before trying again
      setMicPermissionError(false); 
      speechRecognitionRef.current.start();
    }
  };


  function onSubmit(data: GuestFormValues) {
    const guestData: Guest = {
      ...data,
      mealPreferences: {
        ...data.mealPreferences,
        otherMeals: data.mealPreferences.otherMeals || [],
      },
    };
    onAddGuest(guestData);
    form.reset();
    setCurrentStep(1); 
    setTranscript("");
    setAiError(null);
  }

  const adultsCount = form.watch("adults");
  const childrenCount = form.watch("children");
  const totalPeople = (adultsCount || 0) + (childrenCount || 0);

  const handleNextStep = async () => {
    const isValidStep1 = await form.trigger(["familyName", "adults", "children"]);
    
    if (isValidStep1) {
       const adults = form.getValues("adults");
       const children = form.getValues("children");
       if (adults + children === 0) {
         form.setError("adults", { type: "manual", message: "At least one guest (adult or child) is required." });
         return;
       }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const StepIndicator = () => (
    <div className="mb-4 text-center">
      <p className="text-sm text-muted-foreground">
        Step {currentStep} of 2: {currentStep === 1 ? "Guest Details" : "Meal Preferences"}
      </p>
      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${currentStep * 50}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-1">
          {currentStep === 1 ? <Users className="h-6 w-6 text-primary" /> : <Utensils className="h-6 w-6 text-primary" />}
          {currentStep === 1 ? "Add Guest Details" : "Set Meal Preferences"}
        </CardTitle>
         {!isSpeechApiAvailable && currentStep === 1 && (
            <Alert variant="default" className="mt-2">
              <MicOff className="h-4 w-4" />
              <AlertTitle>Voice Input Not Available</AlertTitle>
              <AlertDescription>
                Your browser does not support speech recognition. Please enter guest details manually.
              </AlertDescription>
            </Alert>
          )}
          {micPermissionError && currentStep === 1 && (
             <Alert variant="destructive" className="mt-2">
                <MicOff className="h-4 w-4" />
                <AlertTitle>Microphone Access Denied</AlertTitle>
                <AlertDescription>
                Please enable microphone permissions in your browser settings to use voice input, then refresh or try again.
                </AlertDescription>
            </Alert>
          )}
      </CardHeader>
      <CardContent>
        <StepIndicator />
        {currentStep === 1 && isSpeechApiAvailable && !micPermissionError && (
          <div className="mb-4 space-y-2">
            <Button 
              type="button" 
              onClick={toggleListening} 
              variant="outline" 
              className="w-full"
              disabled={isAiProcessing}
            >
              {isListening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
              {isListening ? "Listening..." : (transcript ? "Speak Again" : "Use Voice Input")}
            </Button>
            {transcript && !isAiProcessing && (
              <p className="text-sm text-muted-foreground p-2 border rounded-md bg-secondary/20">
                Heard: <span className="italic">"{transcript}"</span>
                {isAiProcessing && " Processing..."}
              </p>
            )}
            {isAiProcessing && (
               <p className="text-sm text-muted-foreground p-2 border rounded-md bg-secondary/20 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing AI...
              </p>
            )}
            {aiError && <p className="text-sm text-destructive">{aiError}</p>}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 1 && (
              <>
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
                {form.formState.errors.adults && (
                    <FormMessage>{form.formState.errors.adults.message}</FormMessage>
                )}
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-3 border p-3 rounded-md shadow-sm bg-card">
                  <FormDescription>
                    Total meals for <span className="font-semibold">{form.getValues("familyName") || "this family"}</span> should sum up to {totalPeople} (total adults + children).
                  </FormDescription>

                  <FormField
                    control={form.control}
                    name="mealPreferences.veg"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="flex items-center gap-1"><Salad className="h-4 w-4 text-green-600"/>Vegetarian</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} min="0" className="w-20 text-center" />
                          </FormControl>
                        </div>
                        <FormMessage className="text-right" /> 
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mealPreferences.nonVeg"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="flex items-center gap-1"><Beef className="h-4 w-4 text-red-600"/>Non-Vegetarian</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} min="0" className="w-20 text-center" />
                          </FormControl>
                        </div>
                        <FormMessage className="text-right" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mealPreferences.childMeal"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="flex items-center gap-1"><Grape className="h-4 w-4 text-purple-600"/>Child Meal</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} min="0" className="w-20 text-center" />
                          </FormControl>
                        </div>
                        <FormMessage className="text-right" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-1"><Wheat className="h-4 w-4 text-yellow-600"/>Other Meal(s)</FormLabel>
                    {fields.map((item, index) => (
                      <div key={item.id} className="p-2 border rounded-md bg-background/50 shadow-inner">
                        <div className="grid grid-cols-10 gap-2 items-start">
                          <FormField
                            control={form.control}
                            name={`mealPreferences.otherMeals.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="col-span-7"> 
                                <FormLabel className="sr-only">Other Meal Name {index + 1}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Meal Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`mealPreferences.otherMeals.${index}.count`}
                            render={({ field }) => (
                              <FormItem className="col-span-2"> 
                                <FormLabel className="sr-only">Other Meal Count {index + 1}</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" {...field} min="1" className="text-center" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="link"
                            size="icon"
                            onClick={() => remove(index)}
                            className="col-span-1 text-destructive mt-1 focus-visible:ring-destructive focus-visible:ring-offset-0"
                            aria-label={`Remove other meal ${index + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", count: 1 })}
                      className="w-full"
                    >
                      <PlusCircle className="mr-1 h-4 w-4" /> Add Other Meal
                    </Button>
                    {form.formState.errors.mealPreferences?.otherMeals?.root?.message && (
                        <FormMessage>{form.formState.errors.mealPreferences.otherMeals.root.message}</FormMessage>
                    )}
                    {Array.isArray(form.formState.errors.mealPreferences?.otherMeals) &&
                        form.formState.errors.mealPreferences.otherMeals.map((error, index) => (
                        <div key={index}>
                            {error?.name && <FormMessage>{`Other Meal ${index + 1} Name: ${error.name.message}`}</FormMessage>}
                            {error?.count && <FormMessage>{`Other Meal ${index + 1} Count: ${error.count.message}`}</FormMessage>}
                        </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 justify-end pt-2">
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              )}
              {currentStep === 1 && (
                <Button type="button" onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              {currentStep === 2 && (
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-1 h-5 w-5" />
                  Add Guest to List
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}

    