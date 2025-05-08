'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { UserPlus, Mail, Key, Phone, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SiteLogo from '@/components/layout/SiteLogo';

const customerSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^(\+27|0)[6-8][0-9]{8}$/, "Invalid South African phone number (e.g., 0821234567 or +27821234567)"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type CustomerSignupFormValues = z.infer<typeof customerSignupSchema>;

export default function CustomerSignupPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerSignupFormValues>({
    resolver: zodResolver(customerSignupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  async function onSubmit(data: CustomerSignupFormValues) {
    setIsLoading(true);
    console.log("Customer Signup Data:", data);
    // Here you would typically:
    // 1. Call Firebase Auth createUserWithEmailAndPassword
    // 2. Save additional customer data (fullName, phone) to Firestore, linked to the UID.
    // 3. Handle successful signup (e.g., redirect to dashboard or booking page)
    // 4. Handle errors (e.g., email already in use)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast({
      title: "Account Created!",
      description: "Welcome to Clean Slate! You can now log in and book services.",
    });
    // router.push('/login'); // Redirect to login or dashboard
    form.reset();
  }

  return (
    <div className="container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12 px-4 md:px-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <SiteLogo />
          </div>
          <CardTitle className="text-2xl font-bold">Create Your Customer Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign up to easily book and manage your home services.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><UserPlus className="h-4 w-4 text-muted-foreground"/>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. John Smith" {...field} /></FormControl>
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
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Key className="h-4 w-4 text-muted-foreground"/>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormDescription>
                        Must be 8+ characters with uppercase, lowercase, number, and special character.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Key className="h-4 w-4 text-muted-foreground"/>Confirm Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
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
                        I have read and agree to the Clean Slate <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                      </FormDescription>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                Create Account
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" size="sm" asChild className="px-0 text-primary">
                    <Link href="/login">Log In</Link>
                </Button>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
