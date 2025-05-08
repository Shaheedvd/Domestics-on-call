// src/lib/themes.ts

export type UserAudience = 'businesswoman' | 'elderly' | 'default';

export interface UiTheme {
  id: string; // e.g., 'customer-businesswoman', 'worker-default', 'admin-high-contrast'
  role: 'customer' | 'worker' | 'admin';
  audience?: UserAudience; // Specific to customer role
  name: string; // User-friendly name, e.g., "Luxury Business Theme", "Elderly Accessible Blue"
  primary_color: string; // Hex
  secondary_color: string; // Hex
  accent_color: string; // Hex
  background_color: string; // Hex
  text_color: string; // Hex
  button_style: 'rounded' | 'sharp' | 'pilled';
  font_style: 'sans-serif-modern' | 'serif-classic' | 'sans-serif-legible';
  animation_enabled: boolean;
  ui_density: 'compact' | 'comfortable' | 'spacious';
}

export const uiThemes: UiTheme[] = [
  // --- Customer Themes ---
  {
    id: 'customer-businesswoman-calm-luxury',
    role: 'customer',
    audience: 'businesswoman',
    name: 'Calm Luxury (Businesswoman)',
    primary_color: '#264653', // Dark Slate Blue/Teal
    secondary_color: '#F4EAD5', // Cream/Soft Gold
    accent_color: '#E6A4B4', // Muted Rose Pink
    background_color: '#F8F9FA', // Very Light Grey/Off-white
    text_color: '#212529', // Near Black
    button_style: 'rounded',
    font_style: 'serif-classic',
    animation_enabled: true,
    ui_density: 'comfortable',
  },
  {
    id: 'customer-elderly-soft-blue',
    role: 'customer',
    audience: 'elderly',
    name: 'Soft Blue Accessible (Elderly)',
    primary_color: '#A0D2DB', // Soft Blue
    secondary_color: '#F0F0F0', // Light Grey
    accent_color: '#FFDAB9', // Gentle Peach
    background_color: '#FFFFFF', // White
    text_color: '#2F4F4F', // Dark Slate Gray (High Contrast)
    button_style: 'rounded',
    font_style: 'sans-serif-legible',
    animation_enabled: false,
    ui_density: 'spacious',
  },
  {
    id: 'customer-default-teal-orange',
    role: 'customer',
    audience: 'default',
    name: 'Default Customer Theme (Teal & Orange)',
    primary_color: '#4DB6AC', // Calm Teal (Current Primary)
    secondary_color: '#E0E0E0', // Soft Gray (Current Secondary)
    accent_color: '#FF8A65', // Warm Orange (Current Accent)
    background_color: '#F7F7F7', // Very Light Grey (Current Background)
    text_color: '#333333', // Dark Grayish Blue (Current Foreground)
    button_style: 'rounded',
    font_style: 'sans-serif-modern',
    animation_enabled: true,
    ui_density: 'comfortable',
  },

  // --- Worker Theme ---
  {
    id: 'worker-action-driven-teal',
    role: 'worker',
    name: 'Action-Driven Teal (Worker)',
    primary_color: '#00897B', // Stronger Teal
    secondary_color: '#90A4AE', // Blue Grey
    accent_color: '#FFCA28', // Amber/Yellow
    background_color: '#ECEFF1', // Light Functional Grey
    text_color: '#263238', // Darker Grey
    button_style: 'rounded',
    font_style: 'sans-serif-modern',
    animation_enabled: true,
    ui_density: 'comfortable',
  },

  // --- Admin Themes ---
  {
    id: 'admin-high-productivity-contrast',
    role: 'admin',
    name: 'High Productivity (Admin)',
    primary_color: '#1E88E5', // Strong Blue
    secondary_color: '#757575', // Medium Grey
    accent_color: '#66BB6A', // Green for success
    background_color: '#FAFAFA', // Off-white
    text_color: '#212121', // Near Black
    button_style: 'sharp',
    font_style: 'sans-serif-modern',
    animation_enabled: false,
    ui_density: 'compact',
  },
  {
    id: 'admin-dark-mode-focus',
    role: 'admin',
    name: 'Dark Focus Mode (Admin)',
    primary_color: '#4DB6AC', // Calm Teal (consistent accent)
    secondary_color: '#424242', // Darker Grey
    accent_color: '#FF8A65', // Warm Orange (consistent accent)
    background_color: '#212121', // Very Dark Grey
    text_color: '#E0E0E0', // Light Grey
    button_style: 'sharp',
    font_style: 'sans-serif-modern',
    animation_enabled: false,
    ui_density: 'compact',
  },
];

// Example on how you might get a theme (this would typically involve Firestore in a real app)
export function getThemeById(id: string): UiTheme | undefined {
  return uiThemes.find(theme => theme.id === id);
}

export function getThemesByRole(role: UiTheme['role'], audience?: UserAudience): UiTheme[] {
  return uiThemes.filter(theme => {
    if (theme.role !== role) return false;
    if (role === 'customer' && audience) {
      return theme.audience === audience;
    }
    return true;
  });
}
