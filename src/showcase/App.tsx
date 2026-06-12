import { useHashRoute } from './useHashRoute';
import { components } from './registry';
import { HomePage } from './HomePage';
import { ComponentPage, NotFoundPage } from './ComponentPage';

export default function App() {
  const route = useHashRoute();

  let page: React.ReactNode;
  if (route === '') {
    page = <HomePage />;
  } else {
    const entry = components.find((c) => c.id === route);
    page = entry ? <ComponentPage entry={entry} /> : <NotFoundPage />;
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {page}
    </>
  );
}
