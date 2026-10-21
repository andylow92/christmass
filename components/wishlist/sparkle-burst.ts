// components/wishlist/sparkle-burst.ts

const COLORS = ['#D9A441', '#C23149', '#1D5A44', '#F1D58E', '#6CC79D'];
const PARTICLES = 14;

/** Little confetti burst from the middle of an element. Skipped under reduced motion. */
export function sparkleBurst(origin: HTMLElement | null) {
  if (!origin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rect = origin.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = 'burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
  burst.style.top = `${rect.top + rect.height / 2 + window.scrollY}px`;

  for (let i = 0; i < PARTICLES; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLES;
    const distance = 40 + (i % 3) * 14;
    const particle = document.createElement('i');
    particle.style.background = COLORS[i % COLORS.length];
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    burst.appendChild(particle);
  }

  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 800);
}
