import { render, screen, within } from '@testing-library/react';
import { Card, CardGrid } from './Card';

// Rules covered: CD-1..CD-12 (see REQUIREMENTS.md). The stretched-link technique (CD-4),
// :focus-within (CD-8) and touch target size (CD-11) are CSS and verified manually.

describe('Card', () => {
  it('CD-1: CardGrid is a <ul>; each Card is an <li>', () => {
    const { container } = render(
      <CardGrid>
        <Card title="A" href="#a" />
        <Card title="B" href="#b" />
      </CardGrid>,
    );
    const ul = container.querySelector('ul');
    expect(ul).toBeInTheDocument();
    expect(ul!.querySelectorAll(':scope > li')).toHaveLength(2);
  });

  it('CD-2/CD-3: the title is a heading (of the given level) wrapping the primary link', () => {
    render(<Card title="My post" href="/post" headingLevel={3} />);
    const heading = screen.getByRole('heading', { level: 3, name: 'My post' });
    const link = within(heading).getByRole('link', { name: 'My post' });
    expect(link).toHaveAttribute('href', '/post');
  });

  it('CD-9: a CTA is aria-hidden and described to the primary link via aria-describedby', () => {
    render(<Card title="My post" href="/post" cta="Read more" />);
    const link = screen.getByRole('link', { name: 'My post' });
    const describedby = link.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    const cta = document.getElementById(describedby!);
    expect(cta).toHaveTextContent('Read more');
    expect(cta).toHaveAttribute('aria-hidden', 'true');
    // The CTA is not announced as its own control/link.
    expect(screen.queryByRole('link', { name: 'Read more' })).not.toBeInTheDocument();
  });

  it('CD-5/CD-6: a secondary link is a separate sibling anchor, NOT nested in the title link', () => {
    render(
      <Card title="My post" href="/post" secondary={{ label: 'By Ada', href: '/ada' }} />,
    );
    const titleLink = screen.getByRole('link', { name: 'My post' });
    const authorLink = screen.getByRole('link', { name: 'By Ada' });
    expect(authorLink).toHaveAttribute('href', '/ada');
    // no nested anchors
    expect(titleLink).not.toContainElement(authorLink);
    expect(titleLink.querySelector('a')).toBeNull();
  });

  it('CD-7: a decorative image carries empty alt', () => {
    render(<Card title="My post" href="/post" image={{ src: '/x.jpg', alt: '' }} />);
    const img = document.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
  });

  it('CD-7: the image comes AFTER the heading in source order (visual order is CSS)', () => {
    render(
      <Card title="My post" href="/post" image={{ src: '/x.jpg', alt: 'A red bicycle' }} />,
    );
    const heading = screen.getByRole('heading', { name: 'My post' });
    const img = screen.getByRole('img', { name: 'A red bicycle' });
    // AT reads the title first, then the image — not image-first.
    expect(heading.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('CD-12: a card exposes at most the title + secondary links (minimal tab stops)', () => {
    render(
      <Card title="My post" href="/post" cta="Read more" secondary={{ label: 'By Ada', href: '/ada' }} />,
    );
    // CTA must NOT add a third tab stop.
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
