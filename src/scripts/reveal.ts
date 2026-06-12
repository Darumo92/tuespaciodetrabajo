// Reveal-on-scroll: IntersectionObserver, once, stagger via data-reveal-delay.
// No usa listeners de scroll. Si hay prefers-reduced-motion, no hace nada
// (el contenido ya es visible: motion.css solo oculta bajo no-preference).
export function initReveal(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (els.length === 0) return;

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay ?? 0);
        window.setTimeout(() => el.classList.add('is-visible'), delay);
        obs.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  els.forEach((el) => io.observe(el));
}
