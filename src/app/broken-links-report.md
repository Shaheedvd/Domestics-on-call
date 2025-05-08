# Broken Links & Placeholder Navigation Report

This report identifies links and buttons in the Clean Slate application that currently:
- Point to non-existent pages (will likely result in a 404 error).
- Point to placeholder pages or sections that are not yet implemented.
- Have `href="#"` or are buttons without clear actions defined yet.

## Header (`src/components/layout/Header.tsx`)

- **Login Button**:
  - Desktop: `<Link href="/login">Login</Link>` - Leads to `src/app/login/page.tsx` (Implemented)
  - Mobile: `<Link href="/login">Login</Link>` - Leads to `src/app/login/page.tsx` (Implemented)
- **Book Now Button**:
  - `<Link href="/book">Book Now</Link>` - Leads to `src/app/book/page.tsx` (Implemented)
- **Main Navigation Items (`mainNavItems` in `src/lib/constants.ts`):**
  - `Services` -> `href: '/#services'` (Anchor link on HomePage - Implemented)
  - `How It Works` -> `href: '/#how-it-works'` (Anchor link on HomePage - Implemented)
  - `Become a Worker` -> `href: '/signup/worker'` - Leads to `src/app/signup/worker/page.tsx` (Implemented)
- **User Dropdown Navigation Items (`userDropdownNavItems` in `src/lib/constants.ts`):**
  - Customer:
    - `My Bookings`: `href: '/dashboard/customer/bookings'` - (Implemented)
    - `My Profile`: `href: '/dashboard/customer/profile'` - (Placeholder page created, basic info shown)
  - Worker:
    - `My Schedule`: `href: '/dashboard/worker/bookings'` - (Implemented - shows worker bookings)
    - `My Availability`: `href: '/dashboard/worker/availability'` - (Placeholder page created, basic date selection implemented)
    - `My Profile`: `href: '/dashboard/worker/profile'` - (Implemented - shows worker profile including training status)
    - `Earnings`: `href: '/dashboard/worker/earnings'` - (Placeholder page enhanced, shows mock earnings and rating)
  - Admin:
    - `Admin Dashboard`: `href: '/admin'` - (Implemented)
    - `Manage Workers`: `href: '/admin/workers'` - (Implemented)
    - `Manage Bookings`: `href: '/admin/bookings'` - (Implemented)
    - `HR Management`: `href: '/admin/hr'` - Currently redirects/links to `/admin/hr/recruitment`. A dedicated `/admin/hr` landing page is a TODO.
        - `Recruitment`: `href: '/admin/hr/recruitment'` (Implemented)
        - `Onboarding`: `href: '/admin/hr/onboarding'` (Placeholder page created)
        - `Training`: `href: '/admin/hr/training'` (Placeholder page created)
    - `Payroll`: `href: '/admin/payroll'` - (Placeholder page enhanced, shows list of worker payouts)
    - `Analytics`: `href: '/admin/analytics'` - (Placeholder page created)
  - Common:
    - `Settings`: `href: '/dashboard/settings'` - (Placeholder page created)
    - `Log Out`: Handled by `useMockAuth` - (Implemented)


## Footer (`src/components/layout/Footer.tsx`)

- **Social Media Links**:
  - Facebook: `<Link href="#" ...>` - Placeholder.
  - Twitter: `<Link href="#" ...>` - Placeholder.
  - Instagram: `<Link href="#" ...>` - Placeholder.
- **Services Links**:
  - Home Cleaning: `<Link href="/book?service=cleaning" ...>` - Leads to booking page. Query param not currently used for pre-selection.
  - Laundry & Ironing: `<Link href="/book?service=laundry" ...>` - Similar to above.
  - All Services: `<Link href="/services" ...>` - **Leads to `/services` which does not exist.**
- **Company Links**:
  - About Us: `<Link href="/about" ...>` - **Leads to `/about` which does not exist.**
  - Careers: `<Link href="/careers" ...>` - **Leads to `/careers` which does not exist.**
  - Contact: `<Link href="/contact" ...>` - **Leads to `/contact` which does not exist.**
  - Terms of Service: `<Link href="/terms" ...>` - **Leads to `/terms` which does not exist.**
  - Privacy Policy: `<Link href="/privacy" ...>` - **Leads to `/privacy` which does not exist.**

## Home Page (`src/app/page.tsx`)

- **Hero Section**:
  - `Book a Service`: `<Link href="/book">` - (Implemented)
  - `Explore Services`: `<Link href="/#services">` - (Anchor link, Implemented)
- **Services Section**:
  - `Book Services &rarr;`: `<Link href="/book">` - Leads to general booking page.
- **Smart Matching Section**:
  - `Learn More`: `<Link href="/learn-more/smart-matching">` - **Leads to `/learn-more/smart-matching` which does not exist.**
- **Call to Action Section**:
  - `Book a Service Today`: `<Link href="/book">` - (Implemented)
  - `Become a Worker`: `<Link href="/signup/worker">` - (Implemented)

## Login Page (`src/app/login/page.tsx`)

- `Forgot password?`: `<Link href="/forgot-password">` - **Leads to `/forgot-password` which does not exist.**
- `Sign Up`: `<Link href="/signup">` - Leads to `src/app/signup/page.tsx` (Implemented)

## Signup Choice Page (`src/app/signup/page.tsx`)

- `Sign Up as Customer`: `<Link href="/signup/customer">` - Leads to `src/app/signup/customer/page.tsx` (Implemented)
- `Apply as Worker`: `<Link href="/signup/worker">` - Leads to `src/app/signup/worker/page.tsx` (Implemented)
- `Log In`: `<Link href="/login">` - (Implemented)

## Customer Signup Page (`src/app/signup/customer/page.tsx`)

- `Terms & Conditions`: `<Link href="/terms" ...>` - **Leads to `/terms` which does not exist.**
- `Privacy Policy`: `<Link href="/privacy" ...>` - **Leads to `/privacy` which does not exist.**
- `Log In`: `<Link href="/login">` - (Implemented)

## Worker Signup Page (`src/app/signup/worker/page.tsx`)

- `Worker Terms & Conditions`: `<Link href="/terms-worker" ...>` - **Leads to `/terms-worker` which does not exist.**
- `Privacy Policy`: `<Link href="/privacy" ...>` - **Leads to `/privacy` which does not exist.**

## Booking Page (`src/app/book/page.tsx`)

- "Request Booking" button `onSubmit` handler now creates a mock booking. Actual payment gateway is a TODO.

## Booking Card (`src/components/BookingCard.tsx`)
- "Chat with Worker/Customer" buttons are placeholders and show a "Coming Soon" toast.

## Admin Pages
- `/admin/workers/[workerId]` page: Link "View Full Customer Profile" (`/admin/customers/${booking.customerId}`) is a **TODO page (`/admin/customers/[customerId]`)**. The `?tab=payroll` for worker link needs a payroll tab on worker detail.
- `/admin/hr/onboarding`: Link to `/admin/workers/${worker.id}?tab=onboarding` is a **TODO, as the `tab=onboarding` functionality on worker detail page is not yet implemented.**
- `/admin/hr/recruitment`: Invite New Applicant button links to `/signup/worker?source=admin_invite`. This query param is handled in worker signup.
- `/admin/bookings/[bookingId]`: Link to "View Full Customer Profile" (`/admin/customers/${booking.customerId}`) is a **TODO page (`/admin/customers/[customerId]`)**.

## Summary of Key Missing Pages/Routes:

- `/services` (for an overview page of all services)
- `/about`
- `/careers`
- `/contact`
- `/terms` (General Terms & Conditions)
- `/privacy` (Privacy Policy)
- `/learn-more/smart-matching`
- `/forgot-password`
- `/terms-worker` (Worker-specific Terms & Conditions)
- `/admin/customers/[customerId]` (Admin view of a customer's profile)
- `/admin/hr` (A dedicated landing page for HR section, currently links to recruitment)
- Full in-app chat functionality.
- Detailed payroll processing (beyond estimations).
- Advanced analytics charts and reporting.
- Full worker availability calendar with time slot management (currently day-based).

**Placeholder Pages Created / Enhanced (Need Full Implementation for some features):**
- `/dashboard/customer/profile` (Basic info, edit profile link is `#`)
- `/dashboard/worker/availability` (Basic day selection, advanced features TODO)
- `/dashboard/worker/earnings` (Shows mock data & basic calculations, full history/payouts TODO)
- `/dashboard/settings` (Basic switches, full functionality TODO)
- `/admin/hr/onboarding`
- `/admin/hr/training`
- `/admin/payroll` (Shows mock data & basic calculations, full processing TODO)
- `/admin/analytics` (Basic stats, charts TODO)

This list should help prioritize the creation of content and pages for these links.
