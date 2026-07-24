export const TIMEZONES = [
  { id: 'auto', name: 'Automatic', subtext: 'System Default', region: 'General' },
  { id: 'UTC', name: 'UTC', subtext: 'Universal Time', region: 'General' },
  { id: 'America/Los_Angeles', name: 'Pacific Time', subtext: 'Los Angeles, Vancouver', region: 'Americas' },
  { id: 'America/Denver', name: 'Mountain Time', subtext: 'Denver, Calgary', region: 'Americas' },
  { id: 'America/Chicago', name: 'Central Time', subtext: 'Chicago, Mexico City', region: 'Americas' },
  { id: 'America/New_York', name: 'Eastern Time', subtext: 'New York, Toronto', region: 'Americas' },
  { id: 'America/Sao_Paulo', name: 'Sao Paulo', subtext: 'Brazil Time (BRT)', region: 'Americas' },
  { id: 'Europe/London', name: 'London', subtext: 'GMT/BST', region: 'Europe & Africa' },
  { id: 'Europe/Paris', name: 'Paris / Berlin', subtext: 'CET/CEST', region: 'Europe & Africa' },
  { id: 'Africa/Johannesburg', name: 'Johannesburg', subtext: 'SAST', region: 'Europe & Africa' },
  { id: 'Africa/Cairo', name: 'Cairo', subtext: 'EET', region: 'Europe & Africa' },
  { id: 'Asia/Dubai', name: 'Dubai', subtext: 'Gulf Standard (GST)', region: 'Middle East & Asia' },
  { id: 'Asia/Kolkata', name: 'Kolkata', subtext: 'India Time (IST)', region: 'Middle East & Asia' },
  { id: 'Asia/Singapore', name: 'Singapore', subtext: 'Singapore Time (SGT)', region: 'Middle East & Asia' },
  { id: 'Asia/Tokyo', name: 'Tokyo', subtext: 'Japan Time (JST)', region: 'Middle East & Asia' },
  { id: 'Asia/Seoul', name: 'Seoul', subtext: 'Korea Time (KST)', region: 'Middle East & Asia' },
  { id: 'Australia/Sydney', name: 'Sydney', subtext: 'AEST/AEDT', region: 'Oceania' },
  { id: 'Pacific/Auckland', name: 'Auckland', subtext: 'NZST/NZDT', region: 'Oceania' },
] as const;

export const PRESET_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Don't count the days, make the days count.",
  "Your time is limited, don't waste it living someone else's life.",
  "Focus on being productive instead of busy.",
  "The secret of getting ahead is getting started.",
  "Deep work is the superpower of the 21st century.",
  "Quality is not an act, it is a habit.",
  "Do what you can, with what you have, where you are."
] as const;

export const CLOCK_FONTS = [
  { id: 'default', name: 'Default', class: 'font-default' },
  { id: 'minimal', name: 'Minimal', class: 'font-minimal' },
  { id: 'minimal-light', name: 'Minimal Light', class: 'font-minimal-light' },
  { id: 'serif', name: 'Serif', class: 'font-serif' },
  { id: 'serif-condensed', name: 'Serif Condensed', class: 'font-serif-condensed' },
  { id: 'handwritten', name: 'Handwritten', class: 'font-handwritten' },
  { id: 'mono', name: 'Classic Mono', class: 'font-mono' },
  { id: 'rounded', name: 'Soft Rounded', class: 'font-rounded' },
  { id: 'display', name: 'Display', class: 'font-display' },
  { id: 'retro', name: 'Retro', class: 'font-retro' },
] as const;

export const QUOTE_FONTS = [
  { id: 'serif', name: 'Elegant Serif', class: 'font-serif' },
  { id: 'minimal-light', name: 'Modern Sans', class: 'font-minimal-light' },
  { id: 'handwritten', name: 'Handwritten', class: 'font-handwritten' },
  { id: 'mono', name: 'Classic Mono', class: 'font-mono' },
  { id: 'rounded', name: 'Soft Rounded', class: 'font-rounded' },
  { id: 'serif-condensed', name: 'Condensed', class: 'font-serif-condensed' },
] as const;

export const ZEN_CLOCK_STYLES = [
  { id: 'flip', name: 'Flip Clock', class: 'font-mono' },
  { id: 'simple-flip', name: 'Simple Flip', class: 'font-mono' },
] as const;
