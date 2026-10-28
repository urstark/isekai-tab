export async function fetchJsonSafe<T>(url: string, timeoutMs = 8000): Promise<T> {
  const runtime =
    typeof chrome !== 'undefined' && chrome.runtime
      ? chrome.runtime
      : typeof browser !== 'undefined' && (browser as unknown as { runtime?: typeof chrome.runtime }).runtime
        ? (browser as unknown as { runtime: typeof chrome.runtime }).runtime
        : null;

  if (runtime?.sendMessage) {
    try {
      const response = await new Promise<{ ok: boolean; data?: T; error?: string }>((resolve) => {
        runtime.sendMessage({ type: 'PROXY_FETCH_JSON', url }, (res) => {
          if (runtime.lastError || !res) {
            resolve({ ok: false, error: runtime.lastError?.message || 'No response' });
          } else {
            resolve(res);
          }
        });
      });

      if (response.ok && response.data !== undefined) {
        return response.data;
      }
    } catch {
      // Fall through to standard fetch
    }
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
