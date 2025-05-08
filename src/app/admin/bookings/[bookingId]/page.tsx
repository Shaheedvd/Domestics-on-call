// src/app/admin/bookings/[bookingId]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMockAuth } from '@/lib/mockAuth';
import { getBookingById, getWorkerById, updateBookingStatus as updateMockBookingStatus, notifyMockDataChanged, type MockBooking, type MockWorker } from '@/lib/mockData';
import BookingCard from '@/components/BookingCard'; // Re-use for consistent display
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User, Users, DollarSign, Clock, CalendarDays, MapPin, MessageSquare, Star, Edit3, AlertTriangle, Frown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

function AdminBookingDetailPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const { toast } = useToast();

  const [booking, setBooking] = useState<MockBooking | null>(null);
  const [worker, setWorker] = useState<MockWorker | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = () => {
     if (user && user.role === 'admin' && bookingId) {
        setIsLoadingData(true);
        setTimeout(() => { // Simulate API calls
            const bookingData = getBookingById(bookingId);
            setBooking(bookingData || null);
            if (bookingData) {
                const workerData = getWorkerById(bookingData.workerId);
                setWorker(workerData || null);
            }
            setIsLoadingData(false);
        }, 500);
    } else if (!authLoading && !user) {
        setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, authLoading, bookingId]);

  useEffect(() => {
    const handleDataChange = () => fetchData();
    window.addEventListener('mockDataChanged', handleDataChange);
    return () => {
      window.removeEventListener('mockDataChanged', handleDataChange);
    };
  }, [bookingId]);

  const handleUpdateStatus = (newStatus: MockBooking['status']) => {
    if (!booking) return;
    const success = updateMockBookingStatus(booking.id, newStatus);
    if (success) {
      toast({ title: 'Booking Status Updated', description: `Booking status changed to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.` });
      fetchData(); // Refetch to show updated status
      notifyMockDataChanged();
    } else {
      toast({ title: 'Error', description: 'Could not update booking status.', variant: 'destructive' });
    }
  };

  if (authLoading || isLoadingData) {
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

  if (!booking) {
    return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Booking Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested booking could not be found.</p>
        <Button onClick={() => router.push('/admin/bookings')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Bookings List
        </Button>
      </div>
    );
  }
  
  // Use BookingCard for primary display, then add admin specific details/actions below or around it.
  return (
    <div className="container py-8 px-4 md:px-6">
        <Button onClick={() => router.push('/admin/bookings')} variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Bookings List
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <BookingCard booking={booking} userRole="admin" onUpdateStatus={handleUpdateStatus} />
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p><strong>Name:</strong> {booking.customerName}</p>
                        <p><strong>ID:</strong> {booking.customerId}</p>
                        {/* Add more customer details if available, e.g., email, phone from a customer mock data store */}
                        <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                            <Link href={`/admin/customers/${booking.customerId}`}>View Full Customer Profile</Link>
                        </Button>
                    </CardContent>
                </Card>

                {worker && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Assigned Worker</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><strong>Name:</strong> {worker.fullName}</p>
                            <p><strong>ID:</strong> {worker.id}</p>
                            <p><strong>Status:</strong> <Badge variant={worker.status === 'Active' ? 'default' : 'secondary'}>{worker.status}</Badge></p>
                             <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                <Link href={`/admin/workers/${worker.id}`}>View Worker Profile</Link>
                            </Button>
                        </CardContent>
                        <CardFooter>
                             <Button variant="outline" size="sm" className="w-full">
                                <Edit3 className="mr-2 h-4 w-4"/> Reassign Worker (Future)
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/>Admin Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         {booking.status !== 'CancelledByAdmin' && (
                            <Button 
                                variant="destructive" 
                                className="w-full" 
                                onClick={() => handleUpdateStatus('CancelledByAdmin')}
                            >
                                Cancel Booking (Admin)
                            </Button>
                        )}
                        <Button variant="outline" className="w-full">Issue Refund (Future)</Button>
                        {/* More actions like modify booking, add internal notes etc. */}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}


export default function AdminBookingDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <AdminBookingDetailPageContent />
    </Suspense>
  )
}
