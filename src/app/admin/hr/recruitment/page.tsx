// src/app/admin/hr/recruitment/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserCog, Users, ListFilter, FilePlus, Frown, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { getWorkers, type MockWorker, updateWorkerStatus, notifyMockDataChanged } from '@/lib/mockData';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { WorkerStatus } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react';


function RecruitmentPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<MockWorker[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | 'All'>('All');

  const applicantRelevantStatuses: WorkerStatus[] = ['PendingApplication', 'PendingApproval', 'TrainingPending', 'Rejected'];

  const fetchApplicants = () => {
     if (user && user.role === 'admin') {
      setIsLoadingApplicants(true);
      setTimeout(() => {
        const allWorkers = getWorkers();
        let filteredApplicants = allWorkers.filter(w => applicantRelevantStatuses.includes(w.status));
        if(filterStatus !== 'All') {
          filteredApplicants = filteredApplicants.filter(w => w.status === filterStatus);
        }
        setApplicants(filteredApplicants);
        setIsLoadingApplicants(false);
      }, 300);
    } else if (!authLoading && !user) {
        setIsLoadingApplicants(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [user, authLoading, filterStatus]);
  
  useEffect(() => {
    const handleDataChange = () => fetchApplicants();
    window.addEventListener('mockDataChanged', handleDataChange);
    return () => window.removeEventListener('mockDataChanged', handleDataChange);
  }, [filterStatus]);


  const handleUpdateApplicantStatus = (workerId: string, newStatus: WorkerStatus) => {
    const success = updateWorkerStatus(workerId, newStatus);
    if (success) {
      toast({ title: 'Applicant Status Updated', description: `Status changed to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.` });
      fetchApplicants();
      notifyMockDataChanged();
      if(newStatus === 'TrainingPending'){
        router.push(`/admin/hr/onboarding?workerId=${workerId}`); // Redirect to onboarding for this worker
      }
    } else {
      toast({ title: 'Error', description: 'Could not update status.', variant: 'destructive' });
    }
  };


  if (authLoading || isLoadingApplicants) {
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
  
  const filterOptions: (WorkerStatus | 'All')[] = ['All', ...applicantRelevantStatuses];


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <UserCog className="h-8 w-8 text-primary" /> Recruitment & Applications
        </h1>
        <Button onClick={() => router.push('/signup/worker?source=admin_invite')}>
            <FilePlus className="mr-2 h-4 w-4"/> Invite New Applicant
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><ListFilter className="mr-2 h-4 w-4"/> Filter by Stage: {filterStatus === 'All' ? 'All Applicants' : filterStatus.replace(/([A-Z])/g, ' $1').trim()}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {filterOptions.map(status => (
                    <DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
                        {status === 'All' ? 'All Applicants' : status.replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {applicants.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
             <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg font-medium">No {filterStatus !== 'All' ? filterStatus.replace(/([A-Z])/g, ' $1').trim().toLowerCase() : ''} applications found.</p>
            <p className="text-sm">New applications from the "Become a Worker" page or admin invites will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applicants.map(applicant => (
            <Card key={applicant.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={applicant.profilePictureUrl || `https://picsum.photos/seed/${applicant.id}/100`} data-ai-hint="person avatar"/>
                            <AvatarFallback>{applicant.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-lg">{applicant.fullName}</CardTitle>
                    </div>
                    <Badge variant={applicant.status === 'Rejected' ? 'destructive' : (applicant.status === 'TrainingPending' ? 'default' : 'secondary')}>
                        {applicant.status.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                </div>
                <CardDescription>{applicant.email} &bull; {applicant.phone}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground line-clamp-2"><strong>Experience:</strong> {applicant.experience || "N/A"}</p>
                <p className="text-muted-foreground mt-1"><strong>Services:</strong> {applicant.servicesOffered.join(', ') || "N/A"}</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/admin/workers/${applicant.id}`}>View Full Application</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2"><MoreHorizontal className="h-4 w-4"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {applicant.status === 'PendingApplication' && (
                      <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'PendingApproval')}>
                        <Hourglass className="mr-2 h-4 w-4"/> Mark as Reviewing
                      </DropdownMenuItem>
                    )}
                    {applicant.status === 'PendingApproval' && (
                      <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'TrainingPending')} className="text-green-600 focus:text-green-700">
                        <CheckCircle className="mr-2 h-4 w-4"/>Approve for Onboarding
                      </DropdownMenuItem>
                    )}
                     {(applicant.status === 'PendingApplication' || applicant.status === 'PendingApproval') && (
                        <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'Rejected')} className="text-destructive focus:text-destructive">
                            <XCircle className="mr-2 h-4 w-4"/>Reject Application
                        </DropdownMenuItem>
                    )}
                    {applicant.status === 'TrainingPending' && (
                      <DropdownMenuItem onClick={() => router.push(`/admin/hr/onboarding?workerId=${applicant.id}`)}>
                        Manage Onboarding
                      </DropdownMenuItem>
                    )}
                     {applicant.status === 'Rejected' && (
                      <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'PendingApplication')}>
                        Re-open Application
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RecruitmentPage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <RecruitmentPageContent/>
        </Suspense>
    )
}
