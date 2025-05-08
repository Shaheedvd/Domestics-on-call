import Link from 'next/link';

// Custom SVG component for the new logo
const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor" // Use current text color (text-primary from parent)
  >
    {/* Outer Circle */}
    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />

    {/* Simplified Lotus Flower */}
    {/* Central Petal Base */}
    <path d="M50 55 Q45 65 40 75 Q50 85 60 75 Q55 65 50 55 Z" />
    
    {/* Upper Central Petal */}
    <path d="M50 30 Q48 40 45 50 Q50 60 55 50 Q52 40 50 30 Z" />

    {/* Left Petals */}
    <path d="M40 45 Q30 50 35 60 Q40 55 40 45 Z" />
    <path d="M35 55 Q25 60 30 70 Q38 65 35 55 Z" />
    
    {/* Right Petals */}
    <path d="M60 45 Q70 50 65 60 Q60 55 60 45 Z" />
    <path d="M65 55 Q75 60 70 70 Q62 65 65 55 Z" />

    {/* Small decorative dots (simplified) */}
    <circle cx="50" cy="25" r="1.5" />
    <circle cx="40" cy="35" r="1.5" />
    <circle cx="60" cy="35" r="1.5" />
    <circle cx="35" cy="78" r="1.5" />
    <circle cx="65" cy="78" r="1.5" />
  </svg>
);

export default function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <CustomLogoIcon className="h-8 w-8" />
      <span className="text-2xl font-bold tracking-tight">Clean Slate</span>
    </Link>
  );
}
