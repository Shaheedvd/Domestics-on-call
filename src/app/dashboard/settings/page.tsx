// src/app/dashboard/settings/page.tsx
'use client';

import { useMockAuth } from '@/lib/mockAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, Bell, Lock, Palette, Frown } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function SettingsPageContent() {
  const { user, isLoading: authLoading } = useMockAuth();
  // Mock settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Assuming a theme switcher later

  useEffect(() => {
    // In a real app, fetch user's current settings
  }, [user]);

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>;
  }

  if (!user) {
     return (
      <div className="container py-12 text-center">
        <Frown className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Please log in to access your settings.</p>
        <Button asChild><Link href="/login">Log In</Link></Button>
      </div>
    );
  }


  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="h-9 w-9 text-primary" /> Account Settings
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary"/> Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Receive updates about bookings, promotions, and account activity.
                </span>
              </Label>
              <Switch
                id="email-notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
             {/* More notification settings (SMS, Push) can be added here */}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary"/> Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">Change Password</Button>
            {/* <Button variant="outline" className="w-full justify-start">Two-Factor Authentication (Future)</Button> */}
          </CardContent>
        </Card>
        
        <Card className="shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/> Appearance (Future)</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                 <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Toggle between light and dark themes.
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                disabled // Disabled for now
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">Theme switching is planned for a future update.</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-sm text-muted-foreground mt-10">
        More settings related to specific roles (e.g., worker availability, payment methods) will be available in respective profile sections.
      </p>
    </div>
  );
}

export default function SettingsPage(){
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>}>
            <SettingsPageContent/>
        </Suspense>
    )
}
