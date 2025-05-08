// src/app/signup/worker/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { UserPlus, Phone, Mail, MapPin, Briefcase, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { workerServiceSpecializations as availableServiceCategories } from '@/lib/constants'; 
import { addWorker as addMockWorker, notifyMockDataChanged } from '@/lib/mockData'; // Import mock addWorker
import { useRouter, useSearchParams } from 'next/navigation';


const workerSignupSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().regex(/^(\+27|0)[6-8][0-9]{8}$/, "Invalid South African phone number"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is too short"),
  idNumber: z.string().min(13, "South African ID number must be 13 digits").max(13, "South African ID number must be 13 digits").regex(/^\d+$/, "ID number must only contain digits"),
  servicesOffered: z.array(z.string()).min(1, "Please select at least one service category you specialize in"),
  experience: z.string().min(10, "Please describe your experience briefly"),
  bankAccountNumber: z.string().min(6, "Invalid bank account number").max(16, "Invalid bank account number").regex(/^\d+$/, "Bank account number must only contain digits"),
  bankName: z.string().min(3, "Bank name is too short"),
  branchCode: z.string().min(6, "Branch code must be 6 digits").max(6, "Branch code must be 6 digits").regex(/^\d+$/, "Branch code must only contain digits"),
  criminalRecordCheck: z.boolean().refine(val => val === true, { message: "You must consent to a criminal record check" }),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions" }),
  profilePicture: z.any().optional(), 
  idDocument: z.any().optional(), 
  proofOfAddress: z.any().optional(), 
});

type WorkerSignupFormValues = z.infer<typeof workerSignupSchema>;

export default function WorkerSignupPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source'); // Check if invited by admin

  const form = useForm<WorkerSignupFormValues>({
    resolver: zodResolver(workerSignupSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      idNumber: '',
      servicesOffered: [],
      experience: '',
      bankAccountNumber: '',
      bankName: '',
      branchCode: '',
      criminalRecordCheck: false,
      agreeToTerms: false,
    },
  });

  async function onSubmit(data: WorkerSignupFormValues) {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Use the mock function to add a worker
      // The mock function internally handles setting ID, initial status, etc.
      const newWorker = addMockWorker({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        idNumber: data.idNumber,
        servicesOffered: data.servicesOffered,
        experience: data.experience,
        bankAccountNumber: data.bankAccountNumber,
        bankName: data.bankName,
        branchCode: data.branchCode,
        // `profilePicture` etc. are not passed to mockData add for now
      });
      notifyMockDataChanged();

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted. We will review it and get back to you soon.",
      });
      form.reset();
      if (source === 'admin_invite') {
        router.push(`/admin/workers/${newWorker.id}`); // Redirect admin to the new worker's profile
      } else {
         router.push('/'); // Redirect public applicants to homepage or a thank you page
      }

    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Become a Clean Slate Worker</CardTitle>
          <CardDescription className="text-muted-foreground">
            Join our team of trusted professionals and start earning. Fill out the form below to apply.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><UserPlus className="h-4 w-4 text-muted-foreground"/>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><Phone className="h-4 w-4 text-muted-foreground"/>Phone Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="e.g. 0821234567" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><Mail className="h-4 w-4 text-muted-foreground"/>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="e.g. jane.doe@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground"/>Physical Address</FormLabel>
                        <FormControl><Input placeholder="e.g. 123 Main Street, Suburb, City" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground"/>SA ID Number</FormLabel>
                        <FormControl><Input placeholder="13-digit ID number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-xl font-semibold text-foreground">Service Specializations</h3>
                 <FormField
                    control={form.control}
                    name="servicesOffered"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-muted-foreground"/>Which service categories can you offer?</FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {availableServiceCategories.map((category) => (
                            <FormField
                              key={category.id}
                              control={form.control}
                              name="servicesOffered"
                              render={({ field: checkboxField }) => { 
                                return (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-muted/50"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={checkboxField.value?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? checkboxField.onChange([...(checkboxField.value || []), category.id])
                                            : checkboxField.onChange(
                                                (checkboxField.value || []).filter(
                                                  (value) => value !== category.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center gap-1.5">
                                      <category.icon className={`h-4 w-4 ${category.textColorClass}`} />
                                      {category.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-muted-foreground"/>Work Experience</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Briefly describe your relevant experience, years in service, and any special skills related to the categories you selected." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Banking Details */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-xl font-semibold text-foreground">Banking Details (for Payouts)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl><Input placeholder="e.g. Standard Bank" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Account Number</FormLabel>
                            <FormControl><Input placeholder="Your account number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="branchCode"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Branch Code</FormLabel>
                            <FormControl><Input placeholder="6-digit code" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4 border-b pb-6">
                <h3 className="text-xl font-semibold text-foreground">Document Uploads</h3>
                <p className="text-sm text-muted-foreground">Please upload clear copies of the following documents. Max 5MB per file (PDF, JPG, PNG).</p>
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field: fileField }) => ( 
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground"/>Profile Picture</FormLabel>
                      <FormControl><Input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => fileField.onChange(e.target.files?.[0])} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idDocument"
                  render={({ field: fileField }) => ( 
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground"/>ID Document (Front & Back or Smart ID)</FormLabel>
                      <FormControl><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => fileField.onChange(e.target.files?.[0])} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="proofOfAddress"
                  render={({ field: fileField }) => ( 
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><FileText className="h-4 w-4 text-muted-foreground"/>Proof of Address (Not older than 3 months)</FormLabel>
                      <FormControl><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => fileField.onChange(e.target.files?.[0])} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Consents */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Consents & Agreements</h3>
                <FormField
                  control={form.control}
                  name="criminalRecordCheck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-muted-foreground"/>Consent to Criminal Record Check</FormLabel>
                        <FormDescription>
                          I consent to Clean Slate performing a criminal record check as part of the vetting process.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Agree to Terms & Conditions</FormLabel>
                        <FormDescription>
                          I have read and agree to the Clean Slate <Link href="/terms-worker" className="text-primary hover:underline">Worker Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                        </FormDescription>
                         <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Submit Application
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
