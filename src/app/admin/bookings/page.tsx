// src/app/admin/bookings/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useMockAuth } from '@/lib/mockAuth';
import { getAllBookings, updateBookingStatus as updateMockBookingStatus, notifyMockDataChanged, type MockBooking } from '@/lib/mockData';
import BookingCard from '@/components/BookingCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ListChecks, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { BookingStatus } from '@/lib/constants';

function AdminBookingsPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'All'>('All');
  const { toast } = useToast();

  const fetchBookings = () => {
    if (user && user.role === 'admin') {
      setIsLoadingBookings(true);
      setTimeout(() => { // Simulate API call
        const allBookingsData = getAllBookings();
        setBookings(filter === 'All' ? allBookingsData : allBookingsData.filter(b => b.status === filter));
        setIsLoadingBookings(false);
      }, 500);
    } else if (!authLoading && !user) {
      setIsLoadingBookings(false);
    }
  };
  
  useEffect(() => {
    fetchBookings();
  }, [user, authLoading, filter]);

  // Listen for custom event to refetch data
  useEffect(() => {
    const handleDataChange = () => fetchBookings();
    window.addEventListener('mockDataChanged', handleDataChange);
    return () => {
      window.removeEventListener('mockDataChanged', handleDataChange);
    };
  }, [filter]);

  const handleUpdateStatus = (bookingId: string, newStatus: MockBooking['status']) => {
    const success = updateMockBookingStatus(bookingId, newStatus);
    if (success) {
      toast({ title: 'Booking Updated', description: `Booking status changed to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.` });
      fetchBookings(); // Refetch to show updated status
      notifyMockDataChanged();
    } else {
      toast({ title: 'Error', description: 'Could not update booking status.', variant: 'destructive' });
    }
  };

  if (authLoading || isLoadingBookings) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'admin') {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }
  
  const bookingStatuses: (BookingStatus | 'All')[] = [
    'All', 'Requested', 'AwaitingWorkerConfirmation', 'ConfirmedByWorker', 
    'InProgress', 'CompletedByWorker', 'CustomerConfirmedAndRated', 
    'CancelledByCustomer', 'CancelledByWorker', 'CancelledByAdmin'
  ];


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ListChecks className="h-8 w-8 text-primary" /> All Bookings
        </h1>
         {/* Future: Button to manually create booking for a customer */}
      </div>
      
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium">Filter by status:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">{filter === 'All' ? 'All Statuses' : filter.replace(/([A-Z])/g, ' $1').trim()}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {bookingStatuses.map(statusOption => (
              <DropdownMenuItem key={statusOption} onClick={() => setFilter(statusOption)}>
                {statusOption === 'All' ? 'All Statuses' : statusOption.replace(/([A-Z])/g, ' $1').trim()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      {bookings.length === 0 ? (
         <div className="text-center py-10 border border-dashed rounded-lg">
          <Frown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No bookings found with status: "{filter}".</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {bookings.map(booking => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              userRole="admin"
              onUpdateStatus={handleUpdateStatus} // For admin direct actions like "Admin Cancel"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <AdminBookingsPageContent />
    </Suspense>
  )
}
