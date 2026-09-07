import { useEffect, useState } from 'react';

const STORAGE_KEY = 'trendpulse-admin';

/**
 * Whether to show the owner-only controls, currently just the scrape panel.
 *
 * Visit `?admin=1` once and the browser remembers; `?admin=0` forgets. There is
 * no login, so this is a curtain and not a lock: it keeps a visitor from
 * casually triggering a scrape and spending Firecrawl credits, but the edge
 * functions run with `verify_jwt = false` and can still be called directly by
 * anyone who reads the repository. Closing that properly needs real auth.
 *
 * Storage access throws in some privacy modes, so every call is guarded and the
 * unreadable case simply means "not admin".
 */
function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeStored(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do: the flag just will not persist for this visitor.
  }
}

export function useAdminMode(): boolean {
  const [isAdmin, setIsAdmin] = useState(readStored);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('admin');
    if (param === null) return;

    const enabled = param === '1' || param === 'true';
    writeStored(enabled);
    setIsAdmin(enabled);

    // Drop the parameter so the flag does not travel in a shared link.
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  }, []);

  return isAdmin;
}
