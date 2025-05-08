// src/app/dashboard/worker/bookings/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useMockAuth } from '@/lib/mockAuth';
import { getBookingsForWorker, updateBookingStatus as updateMockBookingStatus, notifyMockDataChanged, type MockBooking } from '@/lib/mockData';
import BookingCard from '@/components/BookingCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarDays, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function WorkerBookingsPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const { toast } = useToast();

  const fetchBookings = () => {
    if (user && user.role === 'worker') {
      setIsLoadingBookings(true);
      setTimeout(() => { // Simulate API call
        setBookings(getBookingsForWorker(user.id));
        setIsLoadingBookings(false);
      }, 500);
    } else if (!authLoading && !user) {
      setIsLoadingBookings(false);
    }
  };
  
  useEffect(() => {
    fetchBookings();
  }, [user, authLoading]);

  // Listen for custom event to refetch data
  useEffect(() => {
    const handleDataChange = () => fetchBookings();
    window.addEventListener('mockDataChanged', handleDataChange);
    return () => {
      window.removeEventListener('mockDataChanged', handleDataChange);
    };
  }, []);

  const handleUpdateStatus = (bookingId: string, newStatus: MockBooking['status']) => {
    const success = updateMockBookingStatus(bookingId, newStatus);
    if (success) {
      toast({ title: 'Booking Updated', description: `Booking status changed to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.` });
      fetchBookings(); // Refetch to show updated status
      notifyMockDataChanged(); // Notify other components
    } else {
      toast({ title: 'Error', description: 'Could not update booking status.', variant: 'destructive' });
    }
  };

  if (authLoading || isLoadingBookings) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'worker') {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in as a worker to view your schedule.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => !['CompletedByWorker', 'CustomerConfirmedAndRated', 'CancelledByAdmin', 'CancelledByCustomer', 'CancelledByWorker'].includes(b.status));
  const pastBookings = bookings.filter(b => ['CompletedByWorker', 'CustomerConfirmedAndRated', 'CancelledByAdmin', 'CancelledByCustomer', 'CancelledByWorker'].includes(b.status));


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-primary" /> My Schedule
        </h1>
        {/* Maybe a button to manage availability in future */}
      </div>

      {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
         <div className="text-center py-10 border border-dashed rounded-lg">
          <Frown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">You have no bookings assigned yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Keep an eye on this page for new assignments.</p>
        </div>
      ) : (
        <>
          {upcomingBookings.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-foreground mb-4 pb-2 border-b">Upcoming Bookings</h2>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} userRole="worker" onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            </section>
          )}

          {pastBookings.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 pb-2 border-b">Past Bookings</h2>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} userRole="worker" onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}


export default function WorkerBookingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <WorkerBookingsPageContent />
    </Suspense>
  )
}
