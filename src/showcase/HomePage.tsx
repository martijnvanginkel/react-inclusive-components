import { components } from './registry';

export function HomePage() {
  return (
    <main id="main">
      <h1>Accessible Components</h1>
      <p>
        A small React component library of accessible UI primitives, adapting the patterns from{' '}
        <a href="https://inclusive-components.design/">Inclusive Components</a>. Built with React,
        TypeScript and CSS Modules. Choose a component:
      </p>

      <h2>Components</h2>
      <ul className="index">
        {components.map((c) => (
          <li key={c.id}>
            <a href={`#/${c.id}`}>{c.title}</a> — {c.blurb}
          </li>
        ))}
      </ul>
    </main>
  );
}
