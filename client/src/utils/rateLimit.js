// utils/rateLimit.js
const delayMs = 350; // ~2.8 req/sec → safe under 3/sec

let lastRequestTime = 0;

export async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < delayMs) {
    await new Promise(r => setTimeout(r, delayMs - timeSinceLast));
  }
  lastRequestTime = Date.now();
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}