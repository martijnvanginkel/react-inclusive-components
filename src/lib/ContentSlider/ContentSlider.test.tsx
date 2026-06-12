import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentSlider } from './ContentSlider';

// Rules covered: CS-1..CS-10 (see REQUIREMENTS.md §10). Scroll-snap (CS-5), native arrow-key
// scrolling of the focused region (CS-3), the CSS show/hide of instructions (CS-4 visual
// half) and the focus ring (CS-10) are browser/CSS behavior and verified manually. jsdom has
// no IntersectionObserver, so the default tests exercise the fallback path; a mock IO covers
// the enhanced path.

const SLIDES = [
  { src: '/a.jpg', alt: 'First artwork', caption: 'One' },
  { src: '/b.jpg', alt: 'Second artwork', caption: <a href="/two">Two</a> },
  { src: '/c.jpg', alt: 'Third artwork', caption: 'Three' },
];

describe('ContentSlider (fallback: no IntersectionObserver)', () => {
  it('CS-1: a labelled, focusable region described by its instructions', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const region = screen.getByRole('region', { name: 'gallery' });
    expect(region).toHaveAttribute('tabindex', '0');
    const describedby = region.getAttribute('aria-describedby')!;
    expect(document.getElementById(describedby)).toHaveTextContent(/arrow keys/);
  });

  it('CS-2: slides are list items containing figure + figcaption', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const list = within(screen.getByRole('region')).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(list.querySelectorAll('figure')).toHaveLength(3);
    expect(list.querySelectorAll('figcaption')).toHaveLength(3);
  });

  it('CS-4: all three input-modality instructions exist', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    expect(screen.getByText('scroll for more')).toBeInTheDocument();
    expect(screen.getByText('use your arrow keys for more')).toBeInTheDocument();
    expect(screen.getByText('swipe for more')).toBeInTheDocument();
  });

  it('CS-4: a first touch interaction switches the instructions to touch mode', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const instructions = document.querySelector('[data-ic-part="instructions"]')!;
    expect(instructions).not.toHaveAttribute('data-touch');
    act(() => {
      window.dispatchEvent(new Event('touchstart'));
    });
    expect(instructions).toHaveAttribute('data-touch', 'true');
  });

  it('CS-6: without IntersectionObserver all images load immediately', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs[0]).toHaveAttribute('src', '/a.jpg');
    expect(imgs[2]).toHaveAttribute('src', '/c.jpg');
  });

  it('CS-7: without IntersectionObserver no prev/next controls render', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    expect(screen.queryByRole('button', { name: 'previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'next' })).not.toBeInTheDocument();
  });
});

describe('ContentSlider (with IntersectionObserver)', () => {
  type IOCallback = (entries: Array<Partial<IntersectionObserverEntry>>, io: unknown) => void;
  let lastCallback: IOCallback;
  let observed: Element[];

  beforeEach(() => {
    observed = [];
    class MockIO {
      constructor(cb: IOCallback) {
        lastCallback = cb;
      }
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', MockIO);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const intersect = (el: Element, isIntersecting: boolean) =>
    act(() => {
      lastCallback([{ target: el, isIntersecting } as IntersectionObserverEntry], null);
    });

  it('CS-6: images start as placeholders and load when their slide intersects', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs[0].getAttribute('src')).toMatch(/^data:image\/svg/);
    expect(imgs[0]).toHaveAttribute('data-src', '/a.jpg');

    expect(observed).toHaveLength(3);
    intersect(observed[0], true);
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', '/a.jpg');
  });

  it('CS-7: prev/next controls render with labels, grouped under "[label] controls"', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const controls = screen.getByRole('list', { name: 'gallery controls' });
    expect(within(controls).getByRole('button', { name: 'previous' })).toBeInTheDocument();
    expect(within(controls).getByRole('button', { name: 'next' })).toBeInTheDocument();
  });

  it('CS-8: links in off-screen slides leave the tab order and return when visible', () => {
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const link = screen.getByRole('link', { name: 'Two' });

    intersect(observed[1], false);
    expect(link).toHaveAttribute('tabindex', '-1');

    intersect(observed[1], true);
    expect(link).not.toHaveAttribute('tabindex');
  });

  it('CS-7: next/previous buttons snap the adjacent slide into view', async () => {
    const user = userEvent.setup();
    render(<ContentSlider label="gallery" slides={SLIDES} />);
    const scroller = screen.getByRole('region', { name: 'gallery' });
    // jsdom has no layout: give the scroller a width so snap math has something to work with.
    Object.defineProperty(scroller, 'clientWidth', { value: 400, configurable: true });

    await user.click(screen.getByRole('button', { name: 'next' }));
    expect(scroller.scrollLeft).toBe(400);
    await user.click(screen.getByRole('button', { name: 'next' }));
    expect(scroller.scrollLeft).toBe(800);
    // Clamped at the last slide.
    await user.click(screen.getByRole('button', { name: 'next' }));
    expect(scroller.scrollLeft).toBe(800);
    await user.click(screen.getByRole('button', { name: 'previous' }));
    expect(scroller.scrollLeft).toBe(400);
  });

  it('CS-9: nothing moves without user action (no timers scheduled on mount)', () => {
    vi.useFakeTimers();
    try {
      render(<ContentSlider label="gallery" slides={SLIDES} />);
      expect(vi.getTimerCount()).toBe(0); // no auto-rotation timers
    } finally {
      vi.useRealTimers();
    }
  });
});
