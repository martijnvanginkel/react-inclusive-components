import { Card, CardGrid } from '../../lib';

const posts = [
  {
    title: 'Designing for keyboard users',
    href: '#card-1',
    description: 'Why a visible focus ring is non-negotiable, and how to style one well.',
    author: 'Ada Lovelace',
    seed: 210,
  },
  {
    title: 'The trouble with the title attribute',
    href: '#card-2',
    description:
      'It is invisible to keyboard and touch users. Here is what to reach for instead, with examples that scale to longer descriptions.',
    author: 'Grace Hopper',
    seed: 280,
  },
  {
    title: 'Live regions, politely',
    href: '#card-3',
    description: 'Announcing change without stealing focus.',
    author: 'Radia Perlman',
    seed: 150,
  },
];

export function CardDemo() {
  return (
    <>
      <p className="note">
        The whole card is clickable via the title link’s stretched <code>::after</code>, but the
        author link stays independently clickable. Focus styling uses <code>:focus-within</code>.
        Cards live inside a <code>&lt;ul&gt;</code> grid.
      </p>

      <CardGrid>
        {posts.map((p) => (
          <Card
            key={p.href}
            title={p.title}
            href={p.href}
            description={p.description}
            cta="Read more"
            secondary={{ label: `By ${p.author}`, href: '#author' }}
            image={{ src: `https://picsum.photos/seed/${p.seed}/480/270`, alt: '' }}
          />
        ))}
      </CardGrid>
    </>
  );
}
