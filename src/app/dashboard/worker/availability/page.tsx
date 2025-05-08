// src/app/dashboard/worker/availability/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import { Loader2, CalendarCheck, Frown, Save } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { format, parseISO, startOfDay } from 'date-fns';
import { getWorkerById, updateWorkerAvailability, notifyMockDataChanged, type MockWorker } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

function WorkerAvailabilityPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [worker, setWorker] = useState<MockWorker | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'worker') {
      setIsLoadingData(true);
      setTimeout(() => { // Simulate API call
        const workerData = getWorkerById(user.id);
        setWorker(workerData || null);
        if (workerData) {
          setSelectedDates(workerData.unavailableDates.map(dateStr => parseISO(dateStr)));
        }
        setIsLoadingData(false);
      }, 300);
    } else if (!authLoading && !user) {
      setIsLoadingData(false);
    }
  }, [user, authLoading]);

  const handleDayClick: CalendarProps['onSelect'] = (day, selectedDay, activeModifiers) => {
    if (!day) return;

    const dayStart = startOfDay(day);
    const isSelected = selectedDates.some(d => isEqual(startOfDay(d), dayStart));

    if (isSelected) {
      setSelectedDates(prev => prev.filter(d => !isEqual(startOfDay(d), dayStart)));
    } else {
      setSelectedDates(prev => [...prev, dayStart]);
    }
  };
  
  const isEqual = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };


  const handleSaveChanges = async () => {
    if (!worker) return;
    setIsSaving(true);
    const unavailableDateStrings = selectedDates.map(date => format(date, 'yyyy-MM-dd'));
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const success = updateWorkerAvailability(worker.id, unavailableDateStrings);
    
    if (success) {
      toast({ title: "Availability Updated", description: "Your unavailable dates have been saved." });
      notifyMockDataChanged(); // To refresh other components if needed
    } else {
      toast({ title: "Update Failed", description: "Could not save your availability. Please try again.", variant: "destructive" });
    }
    setIsSaving(false);
  };


  if (authLoading || isLoadingData) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'worker') {
    return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in as a worker to manage availability.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }
  
  if (!worker) {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Worker Profile Not Found</h1>
         <p className="text-muted-foreground mb-6">Could not load your worker profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <CalendarCheck className="h-9 w-9 text-primary" /> My Availability
        </h1>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Set Unavailable Dates</CardTitle>
          <CardDescription>
            Select the dates you are NOT available to take bookings. Click a date to mark it as unavailable, click again to make it available.
            Your hourly rate is R{worker.hourlyRate.toFixed(2)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDayClick}
            className="rounded-md border"
            disabled={(date) => date < startOfDay(new Date())} // Disable past dates
          />
          <div className="mt-4 text-sm text-muted-foreground">
            {selectedDates.length > 0 
              ? `Selected unavailable dates: ${selectedDates.map(d => format(d, 'PPP')).join(', ')}`
              : "You are currently marked as available on all future dates."}
          </div>
        </CardContent>
      </Card>
       <p className="text-center text-sm text-muted-foreground mt-8">
        This page allows you to mark entire days as unavailable. Specific time slot management for partially available days will be added in a future update.
      </p>
    </div>
  );
}


export default function WorkerAvailabilityPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <WorkerAvailabilityPageContent />
    </Suspense>
  );
}
