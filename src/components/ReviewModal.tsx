// src/components/ReviewModal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  bookingId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (bookingId: string, rating: number, review: string) => void;
}

export default function ReviewModal({ bookingId, isOpen, onClose, onSubmitReview }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (!bookingId || rating === 0) return; // Basic validation
    onSubmitReview(bookingId, rating, review);
    // Reset state for next use
    setRating(0);
    setHoverRating(0);
    setReview('');
  };

  if (!isOpen || !bookingId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Service</DialogTitle>
          <DialogDescription>
            Booking ID: {bookingId.substring(0,8)}... <br/>
            Your feedback helps us improve and rewards good work!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center mt-1" id="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-7 w-7 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
             {rating === 0 && <p className="text-xs text-destructive mt-1">Please select a rating.</p>}
          </div>
          <div>
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>Submit Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
