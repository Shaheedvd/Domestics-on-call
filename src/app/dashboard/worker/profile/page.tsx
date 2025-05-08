// src/app/dashboard/worker/profile/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useMockAuth } from '@/lib/mockAuth';
import { getWorkerById, type MockWorker } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCircle, Mail, Phone, MapPin, Briefcase, CheckCircle, ShieldCheck, ListChecks, Frown, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { serviceCategories } from '@/lib/constants';

function WorkerProfilePageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const [workerData, setWorkerData] = useState<MockWorker | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user && user.role === 'worker') {
      setIsLoadingProfile(true);
      // Simulate API call
      setTimeout(() => {
        const data = getWorkerById(user.id);
        setWorkerData(data || null);
        setIsLoadingProfile(false);
      }, 500);
    } else if (!authLoading && !user) {
       setIsLoadingProfile(false);
    }
  }, [user, authLoading]);

  if (authLoading || isLoadingProfile) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }
  
  if (!user || user.role !== 'worker' || !workerData) {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">Please log in as a worker to view your profile or ensure your profile exists.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  const getServiceNames = (serviceIds: string[]): string[] => {
    return serviceIds.map(id => serviceCategories.find(cat => cat.id === id)?.name).filter(Boolean) as string[];
  };


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <UserCircle className="h-9 w-9 text-primary" /> My Worker Profile
        </h1>
        <Button variant="outline" asChild>
            {/* Link to a future edit profile page */}
            <Link href="#"><Edit className="mr-2 h-4 w-4"/>Edit Profile</Link> 
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={workerData.profilePictureUrl || `https://picsum.photos/seed/${workerData.id}/200`} alt={workerData.fullName} data-ai-hint="professional person"/>
              <AvatarFallback>{workerData.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{workerData.fullName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                Status: <Badge variant={workerData.status === 'Active' ? 'default' : 'secondary'}>{workerData.status.replace(/([A-Z])/g, ' $1').trim()}</Badge>
              </CardDescription>
               <CardDescription className="flex items-center gap-2 mt-1">
                 Hourly Rate: <span className="font-semibold">R{workerData.hourlyRate.toFixed(2)}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Contact Information</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email: {workerData.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Phone: {workerData.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Address: {workerData.address}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 text-primary">Professional Details</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> Experience:</p>
              <p className="pl-6 text-muted-foreground italic text-xs bg-muted/30 p-2 rounded">{workerData.experience || "No experience details provided."}</p>
              
              <p className="flex items-center gap-2 mt-2"><ListChecks className="h-4 w-4 text-muted-foreground" /> Services Offered:</p>
              {getServiceNames(workerData.servicesOffered).length > 0 ? (
                <ul className="list-disc list-inside pl-6 text-muted-foreground">
                  {getServiceNames(workerData.servicesOffered).map(service => <li key={service}>{service}</li>)}
                </ul>
              ) : (
                <p className="pl-6 text-muted-foreground italic">No specific services listed.</p>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 pt-4 border-t">
             <h3 className="font-semibold text-lg mb-3 text-primary">Verification & Compliance</h3>
              <div className="space-y-2">
                 <p className="flex items-center gap-2">
                  <ShieldCheck className={`h-4 w-4 ${workerData.trainingVerified ? 'text-green-600' : 'text-destructive'}`} /> 
                  Training Verified: 
                  <Badge variant={workerData.trainingVerified ? 'default' : 'destructive'}>
                    {workerData.trainingVerified ? 'Yes' : 'No - Pending'}
                  </Badge>
                </p>
                 <p className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4" /> SA ID Number: {workerData.idNumber.substring(0,6)}******{workerData.idNumber.slice(-1)} (Verified)</p>
              </div>
          </div>
           {/* Placeholder for Training & Certifications - to be expanded */}
          <div className="md:col-span-2 pt-4 border-t">
            <h3 className="font-semibold text-lg mb-3 text-primary">Training & Certifications</h3>
             <p className="text-muted-foreground">
              {workerData.trainingVerified ? "All initial training completed and verified." : "Some training may be pending or requires verification."}
            </p>
            <p className="text-muted-foreground text-xs mt-2">Detailed training records and certificates will be available here soon.</p>
            {/* <Button variant="link" className="p-0 h-auto text-primary">View Training History</Button> */}
          </div>


        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkerProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <WorkerProfilePageContent />
    </Suspense>
  )
}

