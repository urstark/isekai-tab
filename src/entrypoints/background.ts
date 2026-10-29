export default defineBackground(() => {
  const runtime =
    typeof chrome !== 'undefined' && chrome.runtime
      ? chrome.runtime
      : typeof browser !== 'undefined' && (browser as unknown as { runtime?: typeof chrome.runtime }).runtime
        ? (browser as unknown as { runtime: typeof chrome.runtime }).runtime
        : null;

  if (!runtime?.onMessage) return;

  runtime.onMessage.addListener((message: unknown, _sender: unknown, sendResponse: (res: unknown) => void) => {
    if (
      message &&
      typeof message === 'object' &&
      'type' in message &&
      message.type === 'PROXY_FETCH_JSON' &&
      'url' in message &&
      typeof message.url === 'string'
    ) {
      const executeFetch = async (attempt = 0): Promise<void> => {
        try {
          const res = await fetch(message.url, {
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) {
            if ((res.status >= 500 || res.status === 429) && attempt < 1) {
              await new Promise((r) => setTimeout(r, 800));
              return executeFetch(attempt + 1);
            }
            sendResponse({ ok: false, error: `HTTP ${res.status}` });
            return;
          }
          const data = await res.json();
          sendResponse({ ok: true, data });
        } catch (err: unknown) {
          if (attempt < 1) {
            await new Promise((r) => setTimeout(r, 800));
            return executeFetch(attempt + 1);
          }
          const errorMsg = err instanceof Error ? err.message : 'Fetch failed';
          sendResponse({ ok: false, error: errorMsg });
        }
      };

      executeFetch();
      return true;
    }
  });
});
