import { ContentSlider } from '../../lib';

const slides = [210, 280, 150, 95].map((seed, i) => ({
  src: `https://picsum.photos/seed/${seed}/640/360`,
  alt: '',
  caption: `Artwork ${i + 1} of 4`,
}));

export function ContentSliderDemo() {
  return (
    <>
      <p className="note">
        A focusable <code>role="region"</code> you can scroll, arrow-key, or swipe — it never
        moves on its own. Instructions match your input method, images lazy-load as slides come
        into view, and the previous/next buttons snap slides into place.
      </p>

      <ContentSlider label="gallery" slides={slides} />
    </>
  );
}
