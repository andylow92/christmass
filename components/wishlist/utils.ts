// components/wishlist/utils.ts

// Literal class names so Tailwind generates them
const TONES = ['tone-0', 'tone-1', 'tone-2', 'tone-3', 'tone-4', 'tone-5'] as const;

/** Stable tint for a name or item, so the same person always gets the same colour. */
export function tone(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export const firstNameOf = (name: string | null | undefined) => name?.trim().split(/\s+/)[0] ?? '';

export const wishCount = (n: number) => `${n} ${n === 1 ? 'wish' : 'wishes'}`;

const URL_PATTERN = /https?:\/\/\S+/g;
// Punctuation that usually ends a sentence rather than the URL
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

/** The rounded "pill" used for a wish's links and price. */
export const chipClass =
  'inline-flex h-[30px] max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-[11px] text-[13px] font-medium text-ink-2 no-underline [&_svg]:size-3.5 [&_svg]:shrink-0';

export interface GiftLink {
  href: string;
  host: string;
}

/** Pulls http(s) links out of a description so they can show as chips; returns the remaining text. */
export function splitLinks(text: string | null | undefined): { rest: string; links: GiftLink[] } {
  const links: GiftLink[] = [];
  const rest = (text ?? '')
    .replace(URL_PATTERN, (match) => {
      const href = match.replace(TRAILING_PUNCTUATION, '');
      try {
        const url = new URL(href);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return match;
        links.push({ href: url.href, host: hostname(url.href) });
        return '';
      } catch {
        return match;
      }
    })
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { rest, links };
}

// "amazon.com/…" or "www.etsy.com/…": looks like a web address typed without https://
const BARE_DOMAIN = /^(www\.)?[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]{2,}(\/\S*)?$/i;

/** True when the whole text is a single web address, e.g. one pasted into the wish name. */
export function isBareUrl(text: string) {
  const value = text.trim();
  return /^\S+$/.test(value) && (/^https?:\/\//i.test(value) || /^www\./i.test(value));
}

/** Adds https:// to addresses typed without it, so they still show as links. */
export function normalizeLinks(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => (BARE_DOMAIN.test(part) ? `https://${part}` : part))
    .join(' ');
}

/**
 * The link has its own field in the forms but is stored at the end of the description,
 * so the database doesn't change and older wishes keep working.
 */
export function joinDescription(notes: string, link: string) {
  return [notes.trim(), normalizeLinks(link)].filter(Boolean).join('\n');
}

/** The reverse of joinDescription: the notes, and the links as one editable line. */
export function splitDescription(description: string | null | undefined) {
  const { rest, links } = splitLinks(description);
  return { notes: rest, link: links.map((link) => link.href).join(' ') };
}

export function hostname(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}

/** The next Christmas Day (today counts until it's over), measured in local calendar days. */
export function christmasCountdown(now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let year = now.getFullYear();
  if (today > Date.UTC(year, 11, 25)) year += 1;
  return { days: Math.round((Date.UTC(year, 11, 25) - today) / 86_400_000), year };
}

export function partOfDay(now = new Date()) {
  const hour = now.getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

/** "today", "yesterday", "Oct 12", or "Oct 12, 2025" for older years. */
export function formatAdded(createdAt: string | null | undefined, now = new Date()) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((day(now) - day(date)) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}
