import type { ComponentEntry } from './registry';

export function ComponentPage({ entry }: { entry: ComponentEntry }) {
  const { title, blurb, Demo } = entry;
  return (
    <main id="main">
      <p>
        <a href="#/">← All components</a>
      </p>
      <h1>{title}</h1>
      <p>{blurb}</p>
      <hr />
      <Demo />
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main id="main">
      <p>
        <a href="#/">← All components</a>
      </p>
      <h1>Not found</h1>
      <p>No component matches that address.</p>
    </main>
  );
}
