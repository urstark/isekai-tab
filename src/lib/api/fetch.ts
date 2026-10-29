export async function fetchJsonSafe<T>(url: string, timeoutMs = 8000, headers?: Record<string, string>): Promise<T> {
  const runtime =
    typeof chrome !== 'undefined' && chrome.runtime
      ? chrome.runtime
      : typeof browser !== 'undefined' && (browser as unknown as { runtime?: typeof chrome.runtime }).runtime
        ? (browser as unknown as { runtime: typeof chrome.runtime }).runtime
        : null;

  if (runtime?.sendMessage) {
    try {
      const response = await new Promise<{ ok: boolean; data?: T; error?: string }>((resolve) => {
        runtime.sendMessage({ type: 'PROXY_FETCH_JSON', url, headers }, (res) => {
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
      if (response.error && response.error.startsWith('HTTP ')) {
        throw new Error(response.error);
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('HTTP ')) {
        throw err;
      }
      // Fall through to direct fetch if runtime communication failed
    }
  }

  const directFetch = async (attempt = 0): Promise<T> => {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      if ((res.status >= 500 || res.status === 429) && attempt < 1) {
        await new Promise((r) => setTimeout(r, 800));
        return directFetch(attempt + 1);
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  };

  return directFetch();
}
