'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { LogIn, Mail, Key, UserPlus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SiteLogo from '@/components/layout/SiteLogo';
import { useMockAuth, type MockAuthUser } from '@/lib/mockAuth';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/constants';

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Min 1 for demo
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isLoading: authIsLoading } = useMockAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Redirect if already logged in and auth is not loading
    if (!authIsLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'worker') {
        router.push('/dashboard/worker/bookings');
      } else {
        router.push('/dashboard/customer/bookings');
      }
    }
  }, [user, router, authIsLoading]);


  // Display loading or redirecting message if user is logged in or auth is still loading
  if (authIsLoading || (!authIsLoading && user)) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary"/> {authIsLoading ? 'Loading...' : 'Redirecting...'}</div>;
  }


  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    // Simulate API call & role detection based on email
    await new Promise(resolve => setTimeout(resolve, 1000));

    let mockUserToLogin: MockAuthUser | null = null;

    if (data.email.startsWith('customer')) {
      mockUserToLogin = { id: 'customer1', email: data.email, fullName: 'Valued Customer', role: 'customer' };
    } else if (data.email.startsWith('worker')) {
      mockUserToLogin = { id: 'worker1', email: data.email, fullName: 'Dedicated Worker', role: 'worker' };
    } else if (data.email.startsWith('admin')) {
      mockUserToLogin = { id: 'admin1', email: data.email, fullName: 'Site Administrator', role: 'admin' };
    }

    setIsLoading(false);

    if (mockUserToLogin) {
      login(mockUserToLogin);
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${mockUserToLogin.fullName}.`,
      });
      // Redirection will be handled by the useEffect hook
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again. (Hint: use customer@example.com, worker@example.com, or admin@example.com)",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12 px-4 md:px-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <SiteLogo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Log in to manage your bookings or your work schedule.
            <br/>
            <small className="text-xs">(Use customer@example.com, worker@example.com, or admin@example.com for demo)</small>
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Mail className="h-4 w-4 text-muted-foreground"/>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-right">
                <Button variant="link" size="sm" asChild className="px-0 text-primary">
                    <Link href="/forgot-password">Forgot password?</Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                Log In
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" size="sm" asChild className="px-0 text-primary">
                    <Link href="/signup">Sign Up</Link>
                </Button>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
