import { useId } from 'react';
import { makeSlots } from '../shared/slots';
import styles from './Card.module.css';

/** Styleable parts of `Card` (target via `data-ic-part` in CSS). */
type CardPart =
  | 'root'
  | 'media'
  | 'img'
  | 'body'
  | 'title'
  | 'titleLink'
  | 'description'
  | 'cta'
  | 'secondary'
  | 'secondaryLink';

export interface CardProps {
  /** Card title (rendered inside a heading, wrapping the primary link). */
  title: React.ReactNode;
  /** Primary link target — the whole card navigates here. */
  href: string;
  description?: React.ReactNode;
  /** Image. `alt` must be "" for decorative images, meaningful text otherwise. */
  image?: { src: string; alt: string };
  /** Optional decorative "read more" CTA — aria-hidden, described to the title link. */
  cta?: string;
  /** Optional secondary link (e.g. author) that stays independently clickable. */
  secondary?: { label: React.ReactNode; href: string };
  /** Heading level for the title. Default: 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * A grouped content teaser. The whole card is clickable via the title link's stretched
 * `::after` pseudo-element; the optional secondary link sits above it and stays usable.
 * Card-level hover/focus styling via `:focus-within`. Renders as an `<li>` — place cards
 * inside a `<ul>` (e.g. `<CardGrid>`).
 */
export function Card({
  title,
  href,
  description,
  image,
  cta,
  secondary,
  headingLevel = 2,
}: CardProps) {
  const ctaId = useId();
  const Heading = `h${headingLevel}` as const;
  const slot = makeSlots<CardPart>();

  return (
    <li {...slot('root', styles.card)}>
      {image && (
        <div {...slot('media', styles.media)}>
          <img src={image.src} alt={image.alt} {...slot('img', styles.img)} />
        </div>
      )}
      <div {...slot('body', styles.body)}>
        <Heading {...slot('title', styles.title)}>
          <a
            href={href}
            {...slot('titleLink', styles.titleLink)}
            aria-describedby={cta ? ctaId : undefined}
          >
            {title}
          </a>
        </Heading>
        {description && <p {...slot('description', styles.description)}>{description}</p>}
        {cta && (
          <span {...slot('cta', styles.cta)} id={ctaId} aria-hidden="true">
            {cta}
          </span>
        )}
        {secondary && (
          <small {...slot('secondary', styles.secondary)}>
            <a href={secondary.href} {...slot('secondaryLink', styles.secondaryLink)}>
              {secondary.label}
            </a>
          </small>
        )}
      </div>
    </li>
  );
}

/** Styleable parts of `CardGrid`. */
type CardGridPart = 'grid';

export interface CardGridProps {
  children: React.ReactNode;
}

/** Responsive `<ul>` grid wrapper for `<Card>`s (auto-fill + minmax columns). */
export function CardGrid({ children }: CardGridProps) {
  const slot = makeSlots<CardGridPart>();
  return <ul {...slot('grid', styles.grid)}>{children}</ul>;
}
