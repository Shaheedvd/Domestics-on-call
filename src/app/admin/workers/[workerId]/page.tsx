// src/app/admin/workers/[workerId]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMockAuth } from '@/lib/mockAuth';
import { 
    getWorkerById, 
    getBookingsForWorker, 
    updateWorkerStatus as updateMockWorkerStatus, 
    updateWorkerOnboardingStep,
    assignTrainingModuleToWorker,
    updateWorkerTrainingModuleStatus,
    notifyMockDataChanged, 
    type MockWorker, 
    type MockBooking,
    type OnboardingStep,
    type AssignedTrainingModule,
    getMockTrainingModules, // Import function to get all modules
    getMockTrainingModuleById, // Import function to get module details by ID
    MOCK_DATA_CHANGED_EVENT
} from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Mail, Phone, MapPin, Briefcase, CheckCircle, ShieldCheck, ListChecks, ArrowLeft, FileText, Banknote, ShieldBan, Hourglass, XCircle, Frown, BookOpen, Edit3, Send, ChevronsUpDown, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { serviceCategories, type WorkerStatus, type TrainingModule as AppTrainingModule } from '@/lib/constants'; // Removed mockTrainingModules import
import BookingCard from '@/components/BookingCard';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from 'date-fns';


function AdminWorkerDetailPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = params.workerId as string;
  const defaultTab = searchParams.get('tab') || 'profile';
  const { toast } = useToast();

  const [workerData, setWorkerData] = useState<MockWorker | null>(null);
  const [workerBookings, setWorkerBookings] = useState<MockBooking[]>([]);
  const [allTrainingModules, setAllTrainingModules] = useState<AppTrainingModule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = () => {
    if (user && user.role === 'admin' && workerId) {
      setIsLoadingData(true);
      // Fetch all modules first for the Select dropdown and details
      const modules = getMockTrainingModules();
      setAllTrainingModules(modules);
      
      setTimeout(() => {
        const data = getWorkerById(workerId);
        setWorkerData(data || null);
        if (data) {
          setWorkerBookings(getBookingsForWorker(workerId));
        }
        setIsLoadingData(false);
      }, 500); // Simulate combined fetching delay
    } else if (!authLoading && !user) {
      setIsLoadingData(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [user, authLoading, workerId]);

  useEffect(() => {
    const handleDataChange = () => fetchData();
    window.addEventListener(MOCK_DATA_CHANGED_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(MOCK_DATA_CHANGED_EVENT, handleDataChange);
    };
  }, [workerId]); // Rerun if workerId changes (though unlikely on detail page)


  const handleUpdateStatus = (newStatus: WorkerStatus) => {
    if (!workerData) return;
    const success = updateMockWorkerStatus(workerData.id, newStatus);
    if (success) {
      toast({ title: 'Worker Status Updated', description: `${workerData.fullName}'s status changed to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.` });
      fetchData(); 
      notifyMockDataChanged();
    } else {
      toast({ title: 'Error', description: 'Could not update worker status.', variant: 'destructive' });
    }
  };

  const handleOnboardingStepChange = (stepId: string, completed: boolean) => {
    if (!workerData) return;
    const success = updateWorkerOnboardingStep(workerData.id, stepId, completed);
    if(success) {
        toast({title: "Onboarding Updated", description: "Step status changed."});
        fetchData();
        notifyMockDataChanged();
    } else {
        toast({title: "Error", description: "Could not update onboarding step.", variant: "destructive"});
    }
  };
  
  const handleAssignTraining = (moduleId: string) => {
    if(!workerData || !moduleId) return;
    const success = assignTrainingModuleToWorker(workerData.id, moduleId);
    if (success) {
        toast({ title: "Training Assigned", description: "Module assigned to worker."});
        fetchData();
        notifyMockDataChanged();
    } else {
        toast({ title: "Error", description: "Could not assign training. It might already be assigned.", variant: "destructive" });
    }
  };

  const handleTrainingModuleStatusUpdate = (moduleId: string, status: AssignedTrainingModule['status']) => {
    if(!workerData) return;
    
    let score: number | undefined = undefined;
    const moduleDetails = getMockTrainingModuleById(moduleId);

    if(status === 'Completed' && moduleDetails && (moduleDetails.type === 'Quiz' || moduleDetails.type === 'Mixed')) {
        // Prompt for score if it's a quiz type
        const scoreInput = prompt(`Enter quiz score (%) for "${moduleDetails.title}":`);
        if (scoreInput !== null) {
            const parsedScore = parseInt(scoreInput, 10);
            if (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100) {
                score = parsedScore;
            } else {
                toast({ title: "Invalid Score", description: "Please enter a number between 0 and 100.", variant: "destructive" });
                return; // Don't proceed if score is invalid
            }
        } else {
            return; // User cancelled the prompt
        }
    }
    
    const success = updateWorkerTrainingModuleStatus(workerData.id, moduleId, status, score);
     if (success) {
        toast({ title: "Training Status Updated", description: `Module status set to ${status}${score !== undefined ? ` with score ${score}%` : ''}.`});
        fetchData();
        notifyMockDataChanged();
    } else {
        toast({ title: "Error", description: "Could not update training status.", variant: "destructive" });
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
  
  if (!workerData) {
    return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Worker Not Found</h1>
        <p className="text-muted-foreground mb-6">The requested worker profile could not be found.</p>
        <Button onClick={() => router.push('/admin/workers')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Worker List
        </Button>
      </div>
    );
  }

  const getServiceNames = (serviceIds: string[]): string[] => {
    return serviceIds.map(id => serviceCategories.find(cat => cat.id === id)?.name).filter(Boolean) as string[];
  };

  const onboardingProgress = workerData.onboardingSteps.filter(s => s.completed).length / workerData.onboardingSteps.length * 100;
  const allOnboardingStepsComplete = workerData.onboardingSteps.every(s => s.completed);


  return (
    <div className="container py-8 px-4 md:px-6">
      <Button onClick={() => router.push('/admin/workers')} variant="outline" size="sm" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Worker List
      </Button>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="profile">Profile Overview</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding ({onboardingProgress.toFixed(0)}%)</TabsTrigger>
          <TabsTrigger value="training">Training ({workerData.assignedTrainingModules.filter(t => t.status === 'Completed').length}/{workerData.assignedTrainingModules.length})</TabsTrigger>
          <TabsTrigger value="bookings">Booking History ({workerBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <Card className="shadow-xl">
                <CardHeader className="border-b pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={workerData.profilePictureUrl || `https://picsum.photos/seed/${workerData.id}/200`} alt={workerData.fullName} data-ai-hint="professional person"/>
                        <AvatarFallback>{workerData.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{workerData.fullName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                        Status: <Badge variant={workerData.status === 'Active' ? 'default' : (workerData.status === 'Suspended' || workerData.status === 'Rejected' ? 'destructive': 'secondary') }>{workerData.status.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                        </CardDescription>
                        <CardDescription className="flex items-center gap-2 mt-1">
                        Hourly Rate: <span className="font-semibold">R{workerData.hourlyRate.toFixed(2)}</span>
                        </CardDescription>
                    </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm"><ChevronsUpDown className="mr-2 h-4 w-4"/> Status Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {workerData.status === 'PendingApproval' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('TrainingPending')}><Hourglass className="mr-2 h-4 w-4"/>Approve for Onboarding</DropdownMenuItem>
                            )}
                            {workerData.status === 'TrainingPending' && (
                                <DropdownMenuItem onClick={() => router.push(`/admin/hr/onboarding?workerId=${workerData.id}`)}>Manage Onboarding</DropdownMenuItem>
                            )}
                             {/* Only allow activation if onboarding is complete */}
                            {workerData.status === 'OnboardingComplete' && ( 
                                <DropdownMenuItem onClick={() => handleUpdateStatus('Active')} className="text-green-600 focus:text-green-700"><CheckCircle className="mr-2 h-4 w-4"/>Activate Worker</DropdownMenuItem>
                            )}
                            {workerData.status === 'Active' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('Suspended')} className="text-orange-600 focus:text-orange-700"><ShieldBan className="mr-2 h-4 w-4"/>Suspend Worker</DropdownMenuItem>
                            )}
                            {workerData.status === 'Suspended' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('Active')} className="text-green-600 focus:text-green-700"><CheckCircle className="mr-2 h-4 w-4"/>Reactivate Worker</DropdownMenuItem>
                            )}
                            {(workerData.status === 'PendingApplication' || workerData.status === 'PendingApproval' || workerData.status === 'TrainingPending') && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('Rejected')} className="text-red-600 focus:text-red-700"><XCircle className="mr-2 h-4 w-4"/>Reject Application</DropdownMenuItem>
                            )}
                            {workerData.status === 'PendingApplication' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus('PendingApproval')}><Hourglass className="mr-2 h-4 w-4"/>Mark as Reviewing</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                    <h3 className="font-semibold text-lg mb-3 text-primary">Verification &amp; Compliance</h3>
                    <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <ShieldCheck className={`h-4 w-4 ${workerData.trainingVerified ? 'text-green-600' : 'text-destructive'}`} /> 
                          Overall Training Verified: 
                          <Badge variant={workerData.trainingVerified ? 'default' : 'destructive'}>
                            {workerData.trainingVerified ? 'Yes' : 'No - Pending'}
                          </Badge>
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /> SA ID Number: {workerData.idNumber} (Full ID for admin)</p>
                    </div>
                </div>
                <div className="md:col-span-2 pt-4 border-t">
                    <h3 className="font-semibold text-lg mb-3 text-primary">Banking Details</h3>
                    <div className="space-y-2 text-muted-foreground">
                        <p className="flex items-center gap-2"><Banknote className="h-4 w-4" /> Bank: {workerData.bankName}</p>
                        <p className="flex items-center gap-2"><FileText className="h-4 w-4" /> Account Number: {workerData.bankAccountNumber}</p>
                        <p className="flex items-center gap-2"><FileText className="h-4 w-4" /> Branch Code: {workerData.branchCode}</p>
                    </div>
                </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="onboarding">
            <Card>
                <CardHeader>
                    <CardTitle>Onboarding Checklist</CardTitle>
                    <CardDescription>Track completion of onboarding steps for {workerData.fullName}. Current status: {workerData.status.replace(/([A-Z])/g, ' $1').trim()}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={onboardingProgress} className="mb-4 h-3" />
                    <div className="space-y-4">
                        {workerData.onboardingSteps.map(step => (
                            <div key={step.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Checkbox 
                                        id={`step-${step.id}`} 
                                        checked={step.completed} 
                                        onCheckedChange={(checked) => handleOnboardingStepChange(step.id, !!checked)}
                                        disabled={workerData.status === 'Active'} // Don't allow changes if already active
                                    />
                                    <Label htmlFor={`step-${step.id}`} className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {step.label}
                                    </Label>
                                </div>
                                {step.notes && <p className="text-xs text-muted-foreground italic">{step.notes}</p>}
                                 <Badge variant={step.completed ? 'default' : 'secondary'}>{step.completed ? 'Completed' : 'Pending'}</Badge>
                            </div>
                        ))}
                    </div>
                     {allOnboardingStepsComplete && workerData.status === 'OnboardingComplete' && workerData.status !== 'Active' && (
                        <div className="mt-6 text-center">
                            <p className="text-green-600 font-semibold mb-2">All onboarding steps completed!</p>
                            <Button onClick={() => handleUpdateStatus('Active')} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4"/> Mark as Active Worker
                            </Button>
                        </div>
                    )}
                     {workerData.status === 'Active' && (
                         <p className="text-green-600 font-semibold text-center mt-6">This worker is Active.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="training">
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Training Modules</CardTitle>
                    <CardDescription>Manage and track training for {workerData.fullName}. Overall Training Verified: {workerData.trainingVerified ? 'Yes' : 'No'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <h4 className="text-md font-semibold mb-2">Assign New Module</h4>
                        <div className="flex gap-2">
                             <Select onValueChange={(moduleId) => { if(moduleId && moduleId !== 'none') handleAssignTraining(moduleId); }}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select a training module to assign..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {allTrainingModules.filter(mtm => !workerData.assignedTrainingModules.find(atm => atm.moduleId === mtm.id)).map(module => (
                                        <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
                                    ))}
                                    {allTrainingModules.filter(mtm => !workerData.assignedTrainingModules.find(atm => atm.moduleId === mtm.id)).length === 0 && (
                                        <SelectItem value="none" disabled>All modules assigned or no modules available.</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {workerData.assignedTrainingModules.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No training modules assigned yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {workerData.assignedTrainingModules.map(assignedModule => {
                                const moduleDetails = allTrainingModules.find(m => m.id === assignedModule.moduleId);
                                return (
                                    <Card key={assignedModule.moduleId} className="bg-muted/50 p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h5 className="font-semibold">{assignedModule.title}</h5>
                                                <p className="text-xs text-muted-foreground">{moduleDetails?.description}</p>
                                            </div>
                                            <Badge variant={assignedModule.status === 'Completed' ? 'default' : (assignedModule.status === 'In Progress' ? 'secondary' : 'outline')}>{assignedModule.status}</Badge>
                                        </div>
                                        {assignedModule.status === 'Completed' && assignedModule.completionDate && (
                                            <p className="text-xs text-muted-foreground mt-1">Completed: {format(parseISO(assignedModule.completionDate), "PPP")} {assignedModule.score !== undefined ? `(Score: ${assignedModule.score}%)` : ''}</p>
                                        )}
                                        <div className="mt-2 flex gap-2 justify-end">
                                            {assignedModule.status !== 'Completed' && (
                                                <Button size="xs" variant="outline" onClick={() => handleTrainingModuleStatusUpdate(assignedModule.moduleId, 'In Progress')}>Mark In Progress</Button>
                                            )}
                                            {assignedModule.status !== 'Completed' && (
                                                <Button size="xs" variant="default" onClick={() => handleTrainingModuleStatusUpdate(assignedModule.moduleId, 'Completed')}>Mark Completed</Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="bookings">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Booking History</h2>
            {workerBookings.length === 0 ? (
              <p className="text-muted-foreground">This worker has no booking history yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {workerBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} userRole="admin" />
                ))}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminWorkerDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
      <AdminWorkerDetailPageContent />
    </Suspense>
  )
}

