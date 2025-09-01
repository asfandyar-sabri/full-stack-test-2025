// src/lib/stream.ts
export function openSSE(url: string, onToken: (t: string) => void, onDone: () => void) {
  const es = new EventSource(url, { withCredentials: false });
  es.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'token') onToken(msg.token as string);
      if (msg.type === 'done') { onDone(); es.close(); }
    } catch {}
  };
  es.onerror = () => { es.close(); };
  return () => es.close();
}
