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
      fetch(message.url, {
        signal: AbortSignal.timeout(10000),
      })
        .then(async (res) => {
          if (!res.ok) {
            sendResponse({ ok: false, error: `HTTP ${res.status}` });
            return;
          }
          const data = await res.json();
          sendResponse({ ok: true, data });
        })
        .catch((err: Error) => {
          sendResponse({ ok: false, error: err?.message || 'Fetch failed' });
        });

      return true;
    }
  });
});
