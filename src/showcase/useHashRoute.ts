import { useEffect, useState } from 'react';

/**
 * Minimal hash router. Returns the current route slug — the part after "#/".
 * Empty string means the homepage. No dependencies, works in dev/build/preview.
 */
export function useHashRoute(): string {
  const read = () => window.location.hash.replace(/^#\/?/, '');
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
