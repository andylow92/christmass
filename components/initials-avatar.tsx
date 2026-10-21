import { cn } from '@/lib/utils';

// Festive hues, all dark enough for cream initials to stay readable
const AVATAR_COLORS = [
  'hsl(350 60% 38%)', // cranberry
  'hsl(154 46% 28%)', // evergreen
  'hsl(32 70% 32%)', // gingerbread
  'hsl(280 32% 38%)', // plum
  'hsl(205 45% 33%)', // winter blue
  'hsl(12 55% 38%)', // copper
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-8 w-8 shrink-0 select-none place-items-center rounded-full text-xs font-semibold text-[#FBF6EC]',
        className
      )}
      style={{ backgroundColor: AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length] }}
    >
      {initialsOf(name)}
    </span>
  );
}
