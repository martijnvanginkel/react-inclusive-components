import { useEffect, useId, useRef, useState } from 'react';
import { makeSlots } from '../shared/slots';
import styles from './ContentSlider.module.css';

export interface Slide {
  src: string;
  /** "" for decorative images, meaningful text otherwise. */
  alt: string;
  /** Optional caption; may contain links (they are removed from the tab order while the
   *  slide is off-screen). */
  caption?: React.ReactNode;
}

/** Styleable parts (target via `data-ic-part` in CSS). */
type ContentSliderPart =
  | 'root'
  | 'scroller'
  | 'list'
  | 'slide'
  | 'figure'
  | 'image'
  | 'caption'
  | 'instructions'
  | 'instruction'
  | 'controls'
  | 'controlButton';

export interface ContentSliderProps {
  /** Accessible name for the scroll region (e.g. "gallery"). */
  label: string;
  slides: Slide[];
}

/** Tiny neutral SVG shown until a slide's real image lazy-loads. */
const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"></svg>');

/**
 * A manually-operated horizontal content slider (never auto-rotating). The scroll
 * container is a focusable, labelled `role="region"` — arrow keys scroll it natively.
 * Images lazy-load via IntersectionObserver (all load immediately when unsupported),
 * links in off-screen slides leave the tab order, and prev/next buttons snap adjacent
 * slides into view.
 */
export function ContentSlider({ label, slides }: ContentSliderProps) {
  const baseId = useId();
  const focusId = `${baseId}-focus`;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const slot = makeSlots<ContentSliderPart>();

  // Feature-detect per render so the fallback path (no IO → load everything, no buttons)
  // stays testable.
  const hasIO = typeof window !== 'undefined' && 'IntersectionObserver' in window;
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
  // Without IntersectionObserver every slide loads immediately (CS-6) — derived, not
  // seeded into state, so slides added after mount load too.
  const isLoaded = (i: number) => !hasIO || loaded.has(i);
  const [isTouch, setIsTouch] = useState(false);

  // Lazy-load images and manage link tabindex as slides enter/leave view (CS-6/CS-8).
  useEffect(() => {
    if (!hasIO) return;
    const items = Array.from(listRef.current?.children ?? []) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const li = entry.target as HTMLElement;
        const index = items.indexOf(li);
        const links = li.querySelectorAll('a');
        if (entry.isIntersecting) {
          setLoaded((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
          links.forEach((a) => a.removeAttribute('tabindex'));
        } else {
          links.forEach((a) => a.setAttribute('tabindex', '-1'));
        }
      });
    });
    items.forEach((li) => observer.observe(li));
    return () => observer.disconnect();
  }, [hasIO, slides.length]);

  // Show the touch instruction once a touch interaction is detected (CS-4).
  useEffect(() => {
    const onTouch = () => setIsTouch(true);
    window.addEventListener('touchstart', onTouch, { once: true });
    return () => window.removeEventListener('touchstart', onTouch);
  }, []);

  const snapTo = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width === 0) return;
    const current = Math.round(el.scrollLeft / width);
    const target = Math.min(Math.max(current + direction, 0), slides.length - 1);
    // Plain assignment; CSS scroll-behavior handles smoothness (off under reduced motion).
    el.scrollLeft = target * width;
  };

  return (
    <div {...slot('root', styles.root)}>
      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        aria-describedby={focusId}
        {...slot('scroller', styles.scroller)}
      >
        <ul ref={listRef} {...slot('list', styles.list)}>
          {slides.map((slide, i) => (
            <li key={i} {...slot('slide', styles.slide, isLoaded(i) ? 'loaded' : undefined)}>
              <figure {...slot('figure', styles.figure)}>
                <img
                  src={isLoaded(i) ? slide.src : PLACEHOLDER}
                  data-src={slide.src}
                  alt={slide.alt}
                  {...slot('image', styles.image)}
                />
                {slide.caption && (
                  <figcaption {...slot('caption', styles.captionText)}>{slide.caption}</figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {/* Input-appropriate usage instructions; CSS reveals the right one (CS-4). The focus
          instruction is the region's accessible description. */}
      <div {...slot('instructions', styles.instructions)} data-touch={isTouch || undefined}>
        <p {...slot('instruction', styles.hoverInstruction)} aria-hidden="true">
          scroll for more
        </p>
        <p id={focusId} {...slot('instruction', styles.focusInstruction)}>
          use your arrow keys for more
        </p>
        <p {...slot('instruction', styles.touchInstruction)} aria-hidden="true">
          swipe for more
        </p>
      </div>

      {/* Buttons depend on snap logic tied to IntersectionObserver support (CS-7). */}
      {hasIO && (
        <ul aria-label={`${label} controls`} {...slot('controls', styles.controls)}>
          <li>
            <button
              type="button"
              aria-label="previous"
              onClick={() => snapTo(-1)}
              {...slot('controlButton', styles.controlButton)}
            >
              <span aria-hidden="true">←</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              aria-label="next"
              onClick={() => snapTo(1)}
              {...slot('controlButton', styles.controlButton)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
