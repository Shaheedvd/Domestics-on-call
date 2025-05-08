// src/app/dashboard/customer/bookings/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useMockAuth } from '@/lib/mockAuth';
import { getBookingsForCustomer, addReviewToBooking, updateBookingStatus as updateMockBookingStatus, notifyMockDataChanged, type MockBooking } from '@/lib/mockData';
import BookingCard from '@/components/BookingCard';
import ReviewModal from '@/components/ReviewModal';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ListChecks, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CustomerBookingsPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [bookings, setBookings] = useState<MockBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBookings = () => {
    if (user && user.role === 'customer') {
      setIsLoadingBookings(true);
      // Simulate API call
      setTimeout(() => {
        setBookings(getBookingsForCustomer(user.id));
        setIsLoadingBookings(false);
      }, 500);
    } else if (!authLoading && !user) { // If auth is done and no user, stop loading
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

  const handleOpenReviewModal = (bookingId: string) => {
    setSelectedBookingForReview(bookingId);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedBookingForReview(null);
    setIsReviewModalOpen(false);
  };

  const handleSubmitReview = (bookingId: string, rating: number, review: string) => {
    const success = addReviewToBooking(bookingId, rating, review);
    if (success) {
      toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
      fetchBookings(); // Refetch to show updated status and review
      notifyMockDataChanged(); // Notify other components if any
    } else {
      toast({ title: 'Error', description: 'Could not submit review.', variant: 'destructive' });
    }
    handleCloseReviewModal();
  };
  
  const handleUpdateStatus = (bookingId: string, newStatus: MockBooking['status']) => {
    const success = updateMockBookingStatus(bookingId, newStatus);
    if (success) {
      toast({ title: 'Booking Updated', description: `Booking status changed to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.` });
      fetchBookings();
      notifyMockDataChanged();
    } else {
      toast({ title: 'Error', description: 'Could not update booking status.', variant: 'destructive' });
    }
  };


  if (authLoading || isLoadingBookings) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user || user.role !== 'customer') {
    return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in as a customer to view your bookings.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ListChecks className="h-8 w-8 text-primary" /> My Bookings
        </h1>
        <Button asChild>
          <Link href="/book">Book New Service</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-10 border border-dashed rounded-lg">
          <Frown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-xl font-medium text-muted-foreground">You have no bookings yet.</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Ready to get started?</p>
          <Button asChild variant="outline">
            <Link href="/book">Book Your First Service</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {bookings.map(booking => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              userRole="customer" 
              onRateBooking={handleOpenReviewModal}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      <ReviewModal
        bookingId={selectedBookingForReview}
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <CustomerBookingsPageContent />
    </Suspense>
  )
}
