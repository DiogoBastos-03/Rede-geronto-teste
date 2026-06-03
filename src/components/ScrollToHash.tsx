import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Handles hash-based scroll after React Router navigations.
 * Mount once at the App level (inside BrowserRouter context).
 *
 * When the URL contains a hash (e.g. /#recursos), this component finds the
 * corresponding DOM element and scrolls smoothly to it.  It retries once
 * after 150 ms to handle cases where the target page hasn't painted yet
 * (e.g. cross-route navigation to home → then scroll to #recursos).
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1); // remove the leading '#'

    const scrollTo = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    if (!scrollTo()) {
      // Element not in DOM yet — retry after the page has had time to render
      const t = setTimeout(scrollTo, 150);
      return () => clearTimeout(t);
    }
  }, [pathname, hash]); // re-run on every location change that involves a hash

  return null;
}
