// components/wishlist/linkified-text.tsx
import { Fragment } from 'react';
import { ExternalLink } from 'lucide-react';

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g;
// Punctuation that usually ends a sentence rather than the URL
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

function toLink(candidate: string) {
  const trailing = candidate.match(TRAILING_PUNCTUATION)?.[0] ?? '';
  const href = trailing ? candidate.slice(0, -trailing.length) : candidate;

  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return { href: url.href, host: url.hostname.replace(/^www\./, ''), trailing };
  } catch {
    return null;
  }
}

export function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);

  return (
    <>
      {parts.map((part, i) => {
        // split() with a capture group puts matches at the odd indexes
        const link = i % 2 === 1 ? toLink(part) : null;
        if (!link) return <Fragment key={i}>{part}</Fragment>;

        return (
          <Fragment key={i}>
            <a
              href={link.href}
              title={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-0.5 rounded-sm font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.host}
              <ExternalLink className="h-3 w-3 shrink-0 self-center" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {link.trailing}
          </Fragment>
        );
      })}
    </>
  );
}
