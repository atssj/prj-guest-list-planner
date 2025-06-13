
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
import { PlusCircle, Users, Utensils, Salad, Beef, Grape, Wheat, Trash2, ArrowLeft, ArrowRight, Mic, Loader2, MicOff, MessageSquare } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
// Old flow: import { parseGuestInfo, type ParseGuestInfoOutput } from "@/ai/flows/parse-guest-info-flow";
import { processGuestUtterance, type ProcessGuestUtteranceInput, type ProcessGuestUtteranceOutput } from "@/ai/flows/process-guest-utterance-flow";
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

type ConversationStage = 'familyName' | 'adults' | 'children' | 'confirm' | 'done' | 'error';

interface GuestDataDraft {
  familyName?: string;
  adults?: number;
  children?: number;
}

export function GuestForm({ onAddGuest }: GuestFormProps) {
  const [currentFormStep, setCurrentFormStep] = useState(1); // 1 for guest details (maybe conversational), 2 for meals
  const { toast } = useToast();

  // States for Speech Recognition and AI processing
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState(false);
  const [isSpeechApiAvailable, setIsSpeechApiAvailable] = useState(false);
  
  // Conversational AI states
  const [conversationStage, setConversationStage] = useState<ConversationStage>('familyName');
  const [currentAiPromptText, setCurrentAiPromptText] = useState("Welcome! Let's add a new guest. What is the family name or the name of the primary guest?");
  const [guestDataDraft, setGuestDataDraft] = useState<GuestDataDraft>({});
  const [voiceModeActive, setVoiceModeActive] = useState(false);


  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  const resetConversation = (startVoiceMode = false) => {
    setConversationStage('familyName');
    setCurrentAiPromptText("Welcome! Let's add a new guest. What is the family name or the name of the primary guest?");
    setGuestDataDraft({});
    setLastTranscript("");
    setIsAiProcessing(false);
    if (startVoiceMode) {
        setVoiceModeActive(true);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setIsSpeechApiAvailable(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'bn-IN'; 

        recognition.onstart = () => {
          setIsListening(true);
          setLastTranscript("");
          setMicPermissionError(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = event.results[0][0].transcript;
          setLastTranscript(currentTranscript); // Show what was heard
          handleTranscriptProcessing(currentTranscript); // Process it
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

  const handleTranscriptProcessing = async (text: string) => {
    if (!text.trim() || conversationStage === 'done' || conversationStage === 'error') return;

    setIsAiProcessing(true);
    const inputForAi: ProcessGuestUtteranceInput = {
      stage: conversationStage as ProcessGuestUtteranceInput['stage'], // Cast because 'done'/'error' are filtered
      utterance: text,
      currentFamilyName: guestDataDraft.familyName,
      currentAdults: guestDataDraft.adults,
      currentChildren: guestDataDraft.children,
    };

    try {
      const result: ProcessGuestUtteranceOutput = await processGuestUtterance(inputForAi);
      let newDraft = { ...guestDataDraft };
      let nextStage: ConversationStage = conversationStage;
      let nextPrompt = result.nextAiPrompt || "Sorry, I'm not sure what to ask next. Please try again or fill manually.";


      if (result.parsingError) {
        toast({ variant: "destructive", title: "AI Parsing Issue", description: result.parsingError });
        // Keep current stage, AI might provide a re-prompt in nextAiPrompt
        if(result.nextAiPrompt) setCurrentAiPromptText(result.nextAiPrompt);
      } else {
        switch (conversationStage) {
          case 'familyName':
            if (result.extractedFamilyName) {
              newDraft.familyName = result.extractedFamilyName;
              nextStage = 'adults';
              setCurrentAiPromptText(result.nextAiPrompt || `How many adults in the ${newDraft.familyName} party?`);
            } else {
               setCurrentAiPromptText("I couldn't catch the family name. Could you please repeat it?");
            }
            break;
          case 'adults':
            if (result.extractedAdults !== undefined) {
              newDraft.adults = result.extractedAdults;
              nextStage = 'children';
              setCurrentAiPromptText(result.nextAiPrompt || `And how many children?`);
            } else {
              setCurrentAiPromptText("Sorry, how many adults was that?");
            }
            break;
          case 'children':
            if (result.extractedChildren !== undefined) {
              newDraft.children = result.extractedChildren;
              nextStage = 'confirm';
              setCurrentAiPromptText(result.nextAiPrompt || `So that's ${newDraft.familyName}, ${newDraft.adults} adults, ${newDraft.children} children. Correct? (Yes/No)`);
            } else {
              setCurrentAiPromptText("My apologies, how many children?");
            }
            break;
          case 'confirm':
            if (result.isConfirmed === true) {
              nextStage = 'done';
              form.setValue("familyName", newDraft.familyName || "", { shouldValidate: true });
              form.setValue("adults", newDraft.adults !== undefined ? newDraft.adults : 0, { shouldValidate: true });
              form.setValue("children", newDraft.children !== undefined ? newDraft.children : 0, { shouldValidate: true });
              toast({ title: "Details Confirmed!", description: "Guest details captured. Proceed to meal preferences." });
              setCurrentAiPromptText(result.nextAiPrompt || "Details confirmed! Please review and proceed to meal preferences below.");
              setVoiceModeActive(false); // Exit voice mode, show the main form part
              setCurrentFormStep(1); // Ensure main form part for details is visible before advancing to meals
            } else if (result.isConfirmed === false) {
              toast({ title: "Okay, let's restart.", description: "Restarting guest details."});
              resetConversation(true); // Restart, keep voice mode active
              // nextStage will be 'familyName' due to resetConversation
              nextStage = 'familyName'; 
              newDraft = {}; // Clear draft as we are restarting
              nextPrompt = "Okay, let's try that again. What is the family name?"; // Override AI prompt for clarity
            } else {
              // Unclear confirmation
              setCurrentAiPromptText(result.nextAiPrompt || "Sorry, I didn't catch that. Is the information correct, yes or no?");
            }
            break;
        }
        setGuestDataDraft(newDraft);
        setConversationStage(nextStage);
        if (nextPrompt && nextStage !== 'done') setCurrentAiPromptText(nextPrompt);
      }
    } catch (error) {
      console.error("AI processing error:", error);
      toast({
        variant: "destructive",
        title: "AI System Error",
        description: "An error occurred while processing your request with AI. Please try manual entry.",
      });
      setConversationStage('error');
      setCurrentAiPromptText("An AI system error occurred. Please use manual form entry.");
      setVoiceModeActive(false);
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
      setMicPermissionError(false); 
      speechRecognitionRef.current.start();
    }
  };

  const startVoiceMode = () => {
    resetConversation();
    setVoiceModeActive(true);
    setCurrentFormStep(1); // Ensure we are on the details step
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
    setCurrentFormStep(1); 
    setLastTranscript("");
    resetConversation(); // Reset AI conversation state
    setVoiceModeActive(false); // Exit voice mode after successful submission
  }

  const adultsCount = form.watch("adults");
  const childrenCount = form.watch("children");
  const totalPeople = (adultsCount || 0) + (childrenCount || 0);

  const handleNextStepToMeals = async () => {
    // Trigger validation for the first step fields if they were filled manually
    const isValidStep1 = await form.trigger(["familyName", "adults", "children"]);
    
    if (isValidStep1) {
       const adults = form.getValues("adults");
       const children = form.getValues("children");
       if (adults + children === 0) {
         form.setError("adults", { type: "manual", message: "At least one guest (adult or child) is required." });
         return;
       }
      setCurrentFormStep(2);
      setVoiceModeActive(false); // Ensure voice mode is off when moving to meals
    }
  };

  const handlePrevStepToDetails = () => {
    setCurrentFormStep(1);
    // Optionally, re-activate voice mode if user was in it, or let them choose
    // setVoiceModeActive(true); 
    // resetConversation(); // if we want to restart voice on going back
  };

  const StepIndicator = () => (
    <div className="mb-4 text-center">
      <p className="text-sm text-muted-foreground">
        Step {currentFormStep} of 2: {currentFormStep === 1 ? "Guest Details" : "Meal Preferences"}
      </p>
      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${currentFormStep * 50}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-1">
          {currentFormStep === 1 ? <Users className="h-6 w-6 text-primary" /> : <Utensils className="h-6 w-6 text-primary" />}
          {currentFormStep === 1 ? (voiceModeActive ? "Conversational Entry" : "Add Guest Details") : "Set Meal Preferences"}
        </CardTitle>
         {!isSpeechApiAvailable && currentFormStep === 1 && (
            <Alert variant="default" className="mt-2">
              <MicOff className="h-4 w-4" />
              <AlertTitle>Voice Input Not Available</AlertTitle>
              <AlertDescription>
                Your browser does not support speech recognition. Please enter guest details manually.
              </AlertDescription>
            </Alert>
          )}
          {micPermissionError && currentFormStep === 1 && (
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

        {currentFormStep === 1 && !voiceModeActive && (
            <Button 
                type="button" 
                onClick={startVoiceMode} 
                variant="outline" 
                className="w-full mb-4"
                disabled={!isSpeechApiAvailable || micPermissionError}
            >
                <MessageSquare className="mr-2 h-4 w-4" /> Use Conversational AI Entry
            </Button>
        )}

        {currentFormStep === 1 && voiceModeActive && conversationStage !== 'done' && conversationStage !== 'error' && (
          <div className="mb-4 space-y-3 p-3 border rounded-md bg-secondary/20">
            <div className="text-center">
                <p className="font-medium text-primary">{currentAiPromptText}</p>
                {lastTranscript && !isAiProcessing && (
                    <p className="text-xs text-muted-foreground mt-1">Heard: <span className="italic">"{lastTranscript}"</span></p>
                )}
            </div>
            <Button 
              type="button" 
              onClick={toggleListening} 
              variant="default" 
              className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
              disabled={isAiProcessing || !isSpeechApiAvailable || micPermissionError}
            >
              {isListening ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
              {isListening ? "Listening..." : (isAiProcessing ? "AI Processing..." : "Speak Response")}
            </Button>
             {isAiProcessing && (
               <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI is thinking...
              </p>
            )}
             <Button 
                type="button" 
                onClick={() => { setVoiceModeActive(false); resetConversation(); }} 
                variant="link" 
                size="sm"
                className="w-full text-muted-foreground"
            >
                Exit Conversational Mode / Enter Manually
            </Button>
          </div>
        )}
        
        {conversationStage === 'error' && currentFormStep === 1 && (
            <Alert variant="destructive" className="my-4">
                <MicOff className="h-4 w-4" />
                <AlertTitle>AI Error</AlertTitle>
                <AlertDescription>
                {currentAiPromptText}. Please use the manual form entry below or try conversational entry again later.
                 <Button onClick={() => {resetConversation(true);}} variant="link" className="p-0 h-auto ml-1 text-destructive hover:underline">Try AI again?</Button>
                </AlertDescription>
            </Alert>
        )}
         {conversationStage === 'done' && currentFormStep === 1 && (
             <Alert variant="default" className="my-4 bg-green-50 border-green-200 text-green-700">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Guest Details Captured!</AlertTitle>
                <AlertDescription>
                {currentAiPromptText} The form below is pre-filled. Review and click "Next" for meal preferences.
                <Button onClick={() => {resetConversation(true);}} variant="link" className="p-0 h-auto ml-1 text-green-700 hover:underline">Re-enter with AI?</Button>
                </AlertDescription>
            </Alert>
        )}


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentFormStep === 1 && !voiceModeActive && (
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
                {form.formState.errors.adults?.message && !form.getFieldState("adults").isDirty && ( // Show general error if adults field isn't specifically touched yet
                    <FormMessage>{form.formState.errors.adults.message}</FormMessage>
                )}
              </>
            )}
            
            {/* Hidden fields if in voice mode but not done, or always visible if not in voice mode */}
            {currentFormStep === 1 && voiceModeActive && (conversationStage === 'done' || conversationStage === 'error') && (
                 <>
                    <p className="text-sm text-muted-foreground my-2">Review or edit the details captured by AI below:</p>
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
                     {form.formState.errors.adults?.message && !form.getFieldState("adults").isDirty && (
                        <FormMessage>{form.formState.errors.adults.message}</FormMessage>
                    )}
                </>
            )}


            {currentFormStep === 2 && (
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
                 {form.formState.errors.mealPreferences?.veg?.message && (
                    <FormMessage>{form.formState.errors.mealPreferences.veg.message}</FormMessage>
                )}
              </>
            )}

            <div className="flex gap-2 justify-end pt-2">
              {currentFormStep === 2 && (
                <Button type="button" variant="outline" onClick={handlePrevStepToDetails}>
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
              )}
              {currentFormStep === 1 && (
                <Button type="button" onClick={handleNextStepToMeals} className="bg-primary hover:bg-primary/90" disabled={voiceModeActive && conversationStage !== 'done'}>
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              {currentFormStep === 2 && (
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
