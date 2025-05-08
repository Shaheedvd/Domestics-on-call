
'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Clock, Users, DollarSign, Loader2, Info, Sparkles, UserCog, Frown } from 'lucide-react'; // Users icon changed to UserCog or similar if needed for worker selection
import { serviceCategories, ServiceCategory, ServiceItem, WORKER_HOURLY_RATE } from '@/lib/constants';
import { intelligentWorkerMatching, IntelligentWorkerMatchingInput, IntelligentWorkerMatchingOutput } from '@/ai/flows/smart-matching';
import { useToast } from '@/hooks/use-toast';
import { useMockAuth } from '@/lib/mockAuth'; // For customer ID
import { addBooking as addMockBooking, getWorkers, isWorkerAvailable, notifyMockDataChanged, type MockWorker, getServiceItemsDetails } from '@/lib/mockData';


const bookingFormSchema = z.object({
  selectedServices: z.array(z.string()).min(1, "Please select at least one service"),
  bookingType: z.enum(['one-time', 'weekly'], { required_error: "Please select a booking type" }),
  location: z.string().min(3, "Please enter your address or use GPS"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  date: z.date({ required_error: "Please select a date" }),
  timeSlot: z.string().min(1, "Please select a time slot"),
  notes: z.string().optional(),
  paymentMethod: z.enum(['prepaid', 'subscription'], { required_error: "Please select a payment method" }),
  selectedWorkerId: z.string().min(1, "Please select a worker"), // New field for worker selection
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const timeSlots = [ 
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00"
];


function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: customer, isLoading: authLoading } = useMockAuth();
  const { toast } = useToast();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isMatching
  const [calculatedQuote, setCalculatedQuote] = useState<{ durationHours: number; totalCost: number; materialFee: number, workerHourlyRate: number } | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<MockWorker[]>([]);

  useEffect(() => {
    // Fetch workers - in real app, this might be filtered by location/availability upfront
    setAvailableWorkers(getWorkers().filter(w => w.status === 'Active'));
  }, []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      selectedServices: [],
      bookingType: 'one-time',
      location: '',
      notes: '',
      paymentMethod: 'prepaid',
      timeSlot: '09:00',
      selectedWorkerId: '',
    },
  });

  const selectedServiceIds = form.watch('selectedServices');
  const selectedWorkerId = form.watch('selectedWorkerId');
  const selectedDate = form.watch('date');
  const selectedTimeSlot = form.watch('timeSlot');


  useEffect(() => {
    if (selectedServiceIds && selectedServiceIds.length > 0 && selectedWorkerId) {
      const worker = availableWorkers.find(w => w.id === selectedWorkerId);
      if (!worker) {
        setCalculatedQuote(null);
        return;
      }

      const serviceItemsDetails = getServiceItemsDetails(selectedServiceIds);
      let totalMinutes = 0;
      let totalMaterialFee = 0;
      
      serviceItemsDetails.forEach(item => {
        totalMinutes += item.estimatedTimeMinutes;
        totalMaterialFee += item.materialFee;
      });

      const durationHours = totalMinutes / 60;
      const laborCost = durationHours * worker.hourlyRate; // Use worker's specific rate
      const totalCost = laborCost + totalMaterialFee;
      
      setCalculatedQuote({ durationHours, totalCost, materialFee: totalMaterialFee, workerHourlyRate: worker.hourlyRate });
    } else {
      setCalculatedQuote(null);
    }
  }, [selectedServiceIds, selectedWorkerId, availableWorkers]);
  
  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          form.setValue('latitude', latitude);
          form.setValue('longitude', longitude);
          form.setValue('location', `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (GPS)`);
          setIsLoadingLocation(false);
          toast({ title: "Location captured", description: "Current location set successfully." });
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          toast({ title: "Location Error", description: "Could not retrieve current location. Please enter manually.", variant: "destructive" });
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({ title: "Location Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
    }
  };

  async function onSubmit(data: BookingFormValues) {
    if (!customer) {
      toast({ title: "Not Logged In", description: "Please log in to make a booking.", variant: "destructive" });
      router.push('/login?redirect=/book');
      return;
    }
    
    setIsSubmitting(true);

    if ((!data.latitude || !data.longitude) && !data.location.includes('Lat:')) { // Simple check for GPS or manual
        toast({ title: "Location Missing", description: "Please provide your location using GPS or by typing your address.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    if (!calculatedQuote) {
        toast({ title: "Quote Error", description: "Please select services and a worker to get a quote.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    const bookingDateTimeISO = new Date(data.date.toDateString() + " " + data.timeSlot).toISOString();
    
    // Check worker availability (mocked)
    if (!isWorkerAvailable(data.selectedWorkerId, bookingDateTimeISO, calculatedQuote.durationHours * 60)) {
        toast({ title: "Worker Not Available", description: "The selected worker is not available at this time. Please choose a different time or worker.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    // Simulate booking creation
    try {
      // For this stage, directly add to mock data instead of calling AI flow for matching,
      // as worker is pre-selected by user.
      // The AI flow 'intelligentWorkerMatching' is more for when system assigns worker.
      // If we still want AI to *confirm* or *adjust* pre-selected worker's quote, we can call it.
      // For simplicity now, direct booking:
      
      const newBooking = addMockBooking({
        customerId: customer.id,
        workerId: data.selectedWorkerId,
        serviceItemIds: data.selectedServices,
        bookingDate: bookingDateTimeISO,
        estimatedDurationMinutes: calculatedQuote.durationHours * 60,
        totalPrice: calculatedQuote.totalCost,
        customerNotes: data.notes,
        location: { 
            address: data.location, 
            lat: data.latitude, 
            lng: data.longitude 
        },
      });
      notifyMockDataChanged(); // Notify other components like dashboard

      toast({ title: "Booking Request Sent!", description: `Your request (ID: ${newBooking.id.substring(0,7)}) has been sent to the worker for confirmation. Price: R${newBooking.totalPrice.toFixed(2)}` });
      form.reset();
      setCalculatedQuote(null);
      // Consider redirecting to customer's booking list
      router.push('/dashboard/customer/bookings');

    } catch (error) {
      console.error("Error creating booking:", error);
      toast({ title: "Booking Failed", description: (error as Error).message || "Could not create your booking. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!customer) {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Please Log In</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to book a service.</p>
        <Button asChild><Link href={`/login?redirect=${encodeURIComponent('/book')}`}>Log In to Book</Link></Button>
      </div>
    );
  }


  return (
    <div className="container py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary">Book Your Home Services</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Select services, choose a worker, and we'll calculate the time and cost.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              {/* Service Selection */}
              <FormField
                control={form.control}
                name="selectedServices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Select Services</FormLabel>
                    <Accordion type="multiple" className="w-full">
                      {serviceCategories.map((category) => (
                        <AccordionItem value={category.id} key={category.id}>
                          <AccordionTrigger className="text-base hover:no-underline">
                            <div className="flex items-center gap-2">
                              <category.icon className={`h-5 w-5 ${category.textColorClass}`} />
                              {category.name}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-2 pt-2 pl-4">
                            {category.items.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="selectedServices"
                                render={({ field: checkboxField }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={checkboxField.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? checkboxField.onChange([...(checkboxField.value || []), item.id])
                                            : checkboxField.onChange(
                                                (checkboxField.value || []).filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal flex justify-between w-full">
                                      <span className="flex items-center gap-1.5"> {item.icon && <item.icon className="h-4 w-4 text-muted-foreground"/>} {item.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({item.estimatedTimeMinutes} min, R{item.materialFee} materials)
                                      </span>
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Worker Selection */}
               <FormField
                control={form.control}
                name="selectedWorkerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-primary"/>Select Worker
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an available worker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableWorkers.length > 0 ? availableWorkers.map(worker => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.fullName} (R{worker.hourlyRate}/hr)
                          </SelectItem>
                        )) : <SelectItem value="none" disabled>No workers available</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      Worker availability for selected date/time will be checked upon submission.
                    </FormDescription>
                  </FormItem>
                )}
              />


              {/* Calculated Quote Display */}
              {calculatedQuote && (
                <Card className="bg-accent/10 border-accent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md text-accent flex items-center gap-2">
                      <Info className="h-5 w-5" /> Provisional Quote
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>Estimated Duration: <span className="font-semibold">{calculatedQuote.durationHours.toFixed(2)} hours</span></p>
                    <p>Labour Cost (R{calculatedQuote.workerHourlyRate}/hr): <span className="font-semibold">R{(calculatedQuote.durationHours * calculatedQuote.workerHourlyRate).toFixed(2)}</span></p>
                    <p>Material Fees: <span className="font-semibold">R{calculatedQuote.materialFee.toFixed(2)}</span></p>
                    <p className="font-bold">Total Estimated Cost: <span className="font-semibold">R{calculatedQuote.totalCost.toFixed(2)}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Final confirmation upon worker acceptance.</p>
                  </CardContent>
                </Card>
              )}


              {/* Booking Type */}
              <FormField
                control={form.control}
                name="bookingType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Booking Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="one-time" /></FormControl>
                          <FormLabel className="font-normal">One-Time Service</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="weekly" /></FormControl>
                          <FormLabel className="font-normal">Weekly Recurring</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" /> Location
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Enter your address" {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            if (form.getValues('latitude') || form.getValues('longitude')) {
                                form.setValue('latitude', undefined);
                                form.setValue('longitude', undefined);
                            }
                          }}
                        />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={isLoadingLocation}>
                        {isLoadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4"/>} {/* Changed Users to MapPin */}
                         GPS
                      </Button>
                    </div>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      If using GPS, coordinates will be used. Otherwise, enter your full address.
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Date & Preferred Time Slot */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-lg font-semibold">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single" selected={field.value} onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Prevents past dates
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Preferred Start Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select preferred start" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special instructions for the worker? (e.g., gate code, pet information)" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {/* Payment Method */}
               <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-4">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="prepaid" /></FormControl>
                          <FormLabel className="font-normal">Prepaid (Card/EFT)</FormLabel>
                        </FormItem>
                        {form.getValues('bookingType') === 'weekly' && (
                           <FormItem className="flex items-center space-x-3 space-y-0">
                             <FormControl><RadioGroupItem value="subscription" /></FormControl>
                             <FormLabel className="font-normal">Subscription (Debit Order)</FormLabel>
                           </FormItem>
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
               <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !calculatedQuote || !selectedWorkerId}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Request Booking
              </Button>
              {!calculatedQuote && !isSubmitting && (
                 <p className="text-sm text-center text-muted-foreground">Please select services and a worker to get a quote and submit a booking request.</p>
              )}
              {isSubmitting && (
                <p className="text-sm text-center text-muted-foreground">Submitting your booking request...</p>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container py-12 px-4 md:px-6 flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <BookingPageContent />
    </Suspense>
  );
}

