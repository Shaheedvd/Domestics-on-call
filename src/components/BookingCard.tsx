// src/components/BookingCard.tsx
'use client';

import type { MockBooking, MockWorker } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, DollarSign, User, Users, MapPin, Star, MessageSquare, CheckCircle, XCircle, Hourglass, Briefcase, MessageCircle as ChatIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getServiceItemsDetails } from '@/lib/mockData';
import type { UserRole } from '@/lib/constants';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


interface BookingCardProps {
  booking: MockBooking;
  workerDetails?: MockWorker; // Optional worker details if available
  userRole: UserRole; // To conditionally show actions
  onUpdateStatus?: (bookingId: string, newStatus: MockBooking['status']) => void; // For worker/admin actions
  onRateBooking?: (bookingId: string) => void; // For customer rating
}

export default function BookingCard({ booking, workerDetails, userRole, onUpdateStatus, onRateBooking }: BookingCardProps) {
  const serviceItems = getServiceItemsDetails(booking.serviceItemIds);
  const { toast } = useToast();

  const handleChatPlaceholder = () => {
    toast({
      title: "Chat Feature Coming Soon!",
      description: "Direct messaging will be available in a future update.",
    });
  };

  const getStatusBadgeVariant = (status: MockBooking['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Requested':
      case 'AwaitingWorkerConfirmation':
        return 'default'; // Primary color for pending actions
      case 'ConfirmedByWorker':
      case 'InProgress':
        return 'secondary'; // Accent or distinct color for active
      case 'CompletedByWorker':
        return 'default'; // Similar to primary or a success green (if custom variant added)
      case 'CustomerConfirmedAndRated':
        return 'outline'; // Greenish outline or success
      case 'CancelledByCustomer':
      case 'CancelledByWorker':
      case 'CancelledByAdmin':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Booking ID: {booking.id.substring(0,8)}...</CardTitle>
            <CardDescription>
              Booked on: {format(parseISO(booking.createdAt), "PPP p")}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs whitespace-nowrap">
            {booking.status.replace(/([A-Z])/g, ' $1').trim()} {/* Add spaces for readability */}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>Date: {format(parseISO(booking.bookingDate), "EEEE, dd MMMM yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Time: {format(parseISO(booking.bookingDate), "p")} (Est. {booking.estimatedDurationMinutes} mins)</span>
        </div>
         <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Location: {booking.location.address}</span>
        </div>
        {userRole === 'customer' && booking.workerName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Worker: {booking.workerName}</span>
          </div>
        )}
        {userRole !== 'customer' && (
           <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Customer: {booking.customerName} (ID: {booking.customerId.substring(0,7)})</span>
          </div>
        )}
        <div className="space-y-1 pt-1">
            <p className="font-medium flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary"/>Services:</p>
            <ul className="list-disc list-inside pl-2 text-xs text-muted-foreground">
                {booking.serviceNames.map(name => <li key={name}>{name}</li>)}
            </ul>
        </div>
         {booking.customerNotes && (
          <div className="pt-1">
            <p className="font-medium">Customer Notes:</p>
            <p className="text-xs text-muted-foreground italic p-2 bg-muted/50 rounded-md">{booking.customerNotes}</p>
          </div>
        )}
        <div className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>Total Price: R {booking.totalPrice.toFixed(2)}</span>
        </div>
        {booking.rating && (
          <div className="flex items-start gap-2 pt-1">
            <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Your Rating & Review:</p>
              {renderStars(booking.rating)}
              {booking.review && <p className="text-xs text-muted-foreground italic mt-1 p-2 bg-muted/50 rounded-md">{booking.review}</p>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 flex-wrap">
        {/* Customer Actions */}
        {userRole === 'customer' && booking.status === 'CompletedByWorker' && onRateBooking && (
          <Button onClick={() => onRateBooking(booking.id)} size="sm">
            <Star className="mr-2 h-4 w-4" /> Rate & Confirm Completion
          </Button>
        )}
        {userRole === 'customer' && (booking.status === 'Requested' || booking.status === 'AwaitingWorkerConfirmation' || booking.status === 'ConfirmedByWorker') && onUpdateStatus && (
          <Button variant="outline" size="sm" onClick={() => onUpdateStatus(booking.id, 'CancelledByCustomer')}>
            <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
          </Button>
        )}
         {userRole === 'customer' && ['ConfirmedByWorker', 'InProgress'].includes(booking.status) && (
          <Button variant="ghost" size="sm" onClick={handleChatPlaceholder}>
            <ChatIcon className="mr-2 h-4 w-4" /> Chat with Worker
          </Button>
        )}
        
        {/* Worker Actions */}
        {userRole === 'worker' && booking.status === 'AwaitingWorkerConfirmation' && onUpdateStatus && (
          <>
            <Button onClick={() => onUpdateStatus(booking.id, 'ConfirmedByWorker')} size="sm" variant="default">
              <CheckCircle className="mr-2 h-4 w-4" /> Accept Booking
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onUpdateStatus(booking.id, 'CancelledByWorker')}>
              <XCircle className="mr-2 h-4 w-4" /> Decline
            </Button>
          </>
        )}
        {userRole === 'worker' && booking.status === 'ConfirmedByWorker' && onUpdateStatus && (
          <Button onClick={() => onUpdateStatus(booking.id, 'InProgress')} size="sm">
            <Hourglass className="mr-2 h-4 w-4" /> Start Job
          </Button>
        )}
        {userRole === 'worker' && booking.status === 'InProgress' && onUpdateStatus && (
          <Button onClick={() => onUpdateStatus(booking.id, 'CompletedByWorker')} size="sm">
            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
          </Button>
        )}
        {userRole === 'worker' && ['ConfirmedByWorker', 'InProgress'].includes(booking.status) && (
          <Button variant="ghost" size="sm" onClick={handleChatPlaceholder}>
            <ChatIcon className="mr-2 h-4 w-4" /> Chat with Customer
          </Button>
        )}


        {/* Admin Actions */}
        {userRole === 'admin' && (
           <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/bookings/${booking.id}`}>View/Manage</Link>
            </Button>
        )}
         {userRole === 'admin' && booking.status !== 'CancelledByAdmin' && onUpdateStatus && (
             <Button variant="destructive" size="sm" onClick={() => onUpdateStatus(booking.id, 'CancelledByAdmin')}>
                <XCircle className="mr-2 h-4 w-4" /> Admin Cancel
            </Button>
        )}

      </CardFooter>
    </Card>
  );
}

