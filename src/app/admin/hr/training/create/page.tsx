// src/app/admin/hr/training/create/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { PlusCircle, Loader2, BookOpen, Frown, ArrowLeft } from 'lucide-react';
import { useState, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMockAuth } from '@/lib/mockAuth';
import { addMockTrainingModule, notifyMockDataChanged } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import type { TrainingModule } from '@/lib/constants';

const trainingModuleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(['Video', 'Document', 'Quiz', 'Mixed'], { required_error: "Please select a module type" }),
  estimatedDurationMinutes: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  contentUrl: z.string().url("Must be a valid URL (e.g., https://... or /docs/...)").optional().or(z.literal('')),
  quizId: z.string().optional(), // Placeholder for quiz linking
}).refine(data => {
    if ((data.type === 'Video' || data.type === 'Document' || data.type === 'Mixed') && !data.contentUrl) {
      return false; // Require contentUrl for these types
    }
    return true;
}, {
    message: "Content URL is required for Video, Document, or Mixed types.",
    path: ['contentUrl'],
}).refine(data => {
    if ((data.type === 'Quiz' || data.type === 'Mixed') && !data.quizId) {
      return false; // Require quizId for these types
    }
     return true;
}, {
    message: "Quiz ID is required for Quiz or Mixed types.",
    path: ['quizId'],
});


type TrainingModuleFormValues = z.infer<typeof trainingModuleSchema>;

function CreateTrainingModulePageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TrainingModuleFormValues>({
    resolver: zodResolver(trainingModuleSchema),
    defaultValues: {
      title: '',
      description: '',
      estimatedDurationMinutes: 30,
      contentUrl: '',
      quizId: '',
    },
  });

  async function onSubmit(data: TrainingModuleFormValues) {
    setIsSubmitting(true);
    
    try {
      // Simulate adding the module
      await new Promise(resolve => setTimeout(resolve, 500)); 
      addMockTrainingModule(data);
      notifyMockDataChanged(); // Notify other components like the training list

      toast({
        title: "Training Module Created!",
        description: `"${data.title}" has been added successfully.`,
      });
      router.push('/admin/hr/training'); // Redirect back to the list
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        title: "Creation Failed",
        description: "Could not create the training module. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
    // No need to reset form as we are redirecting
  }

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }
  
  if (!user || user.role !== 'admin') {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You do not have permission to perform this action.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Training Management
        </Button>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" /> Create New Training Module
          </CardTitle>
          <CardDescription>
            Fill in the details to add a new training resource for your workers.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Advanced Cleaning Techniques" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Briefly describe the module's content and objectives." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Document">Document</SelectItem>
                                <SelectItem value="Quiz">Quiz</SelectItem>
                                <SelectItem value="Mixed">Mixed (Content + Quiz)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="estimatedDurationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (Minutes)</FormLabel>
                        <FormControl><Input type="number" min="5" step="5" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                control={form.control}
                name="contentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content URL (for Video/Document/Mixed)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/video or /docs/mydoc.pdf" {...field} /></FormControl>
                    <FormDescription>Enter the full URL or a relative path to the content.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="quizId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz ID (for Quiz/Mixed)</FormLabel>
                    <FormControl><Input placeholder="Enter a unique ID for the quiz (e.g., quiz002)" {...field} /></FormControl>
                     <FormDescription>This links the module to a quiz created in the (future) Quiz Management section.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
                Create Module
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default function CreateTrainingModulePage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <CreateTrainingModulePageContent/>
        </Suspense>
    )
}

