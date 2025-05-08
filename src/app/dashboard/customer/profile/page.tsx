// src/app/dashboard/customer/profile/page.tsx
'use client';

import { useMockAuth, type MockAuthUser } from '@/lib/mockAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Mail, Phone, MapPin, Edit, Frown } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

// Mock customer details - in a real app, this would come from a database
interface CustomerProfileDetails extends MockAuthUser {
  address?: string;
  phone?: string;
  preferences?: {
    communication?: 'email' | 'sms';
    defaultPaymentMethod?: string; // e.g., 'card_****1234'
  };
}

function CustomerProfilePageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [profile, setProfile] = useState<CustomerProfileDetails | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user && user.role === 'customer') {
      setIsLoadingProfile(true);
      // Simulate fetching detailed profile
      setTimeout(() => {
        setProfile({
          ...user,
          address: '123 Sunshine Avenue, Happyville', // Mocked
          phone: '0812345678', // Mocked
          preferences: { communication: 'email' } // Mocked
        });
        setIsLoadingProfile(false);
      }, 500);
    } else if (!authLoading && !user) {
        setIsLoadingProfile(false);
    }
  }, [user, authLoading]);

  if (authLoading || isLoadingProfile) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }
  
  if (!user || user.role !== 'customer' || !profile) {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">Please log in as a customer to view your profile.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <UserCircle className="h-9 w-9 text-primary" /> My Profile
        </h1>
        <Button variant="outline" asChild>
            {/* Link to a future edit profile page */}
            <Link href="#"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link> 
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="border-b pb-4">
            <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
            <CardDescription>Manage your personal information and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
            <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Contact Information</h3>
                <div className="space-y-2">
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email: {profile.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Phone: {profile.phone || 'Not set'}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Address: {profile.address || 'Not set'}</p>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Preferences</h3>
                <div className="space-y-2">
                    <p className="flex items-center gap-2">Communication: {profile.preferences?.communication || 'Email'}</p>
                    <p className="flex items-center gap-2">Default Payment: {profile.preferences?.defaultPaymentMethod || 'Not set'}</p>
                    {/* More preferences can be added here */}
                </div>
            </div>
             <div className="md:col-span-2 pt-4 border-t">
                 <h3 className="font-semibold text-lg mb-3 text-primary">Account Security</h3>
                 <Button variant="outline" size="sm">Change Password</Button>
             </div>
        </CardContent>
      </Card>
       <p className="text-center text-sm text-muted-foreground mt-8">
        This is a placeholder page. Full profile editing and more detailed preferences will be implemented.
      </p>
    </div>
  );
}

export default function CustomerProfilePage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <CustomerProfilePageContent/>
        </Suspense>
    )
}
