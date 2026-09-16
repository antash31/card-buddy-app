// #genai: Server-sent events over XMLHttpRequest.
//
// React Native's `fetch` resolves with no readable `response.body`, so the usual
// `getReader()` streaming pattern silently degrades to handing the whole SSE payload to
// `response.json()` — which fails on the first `event:` line. XHR is the only transport that
// reports partial text on both React Native and the browser, so it is what this uses.
//
// `onprogress` is an optimisation, not a requirement: where it never fires, the final drain in
// `onload` still parses every frame, so the verdict arrives late rather than not at all.
// Extension included (unlike the rest of the app) so this module can be imported by plain Node
// with a stubbed `XMLHttpRequest` — the frame parser is worth exercising without a device.
import { ApiError } from './ApiError.js';

const SSE_CONTENT_TYPE = 'text/event-stream';

function parseFrame(frame) {
  let event = 'message';
  const data = [];

  for (const line of frame.split('\n')) {
    if (line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trim());
  }

  if (data.length === 0) return null;

  try {
    return { event, data: JSON.parse(data.join('\n')) };
  } catch {
    return null;
  }
}

function envelopeError(xhr) {
  let payload = null;
  try {
    payload = JSON.parse(xhr.responseText);
  } catch {
    payload = null;
  }

  return new ApiError({
    message: payload?.error?.message ?? 'Request failed',
    code: payload?.error?.code ?? 'http_error',
    status: xhr.status,
    details: payload?.error?.details ?? null,
  });
}

/**
 * POSTs `body` and streams the response.
 *
 * Resolves with the parsed JSON envelope's `data` when the server answers with plain JSON
 * (no `Accept` negotiation, an error, or a proxy that buffers), so callers get one shape either
 * way. `onEvent` receives `{ event, data }` for every SSE frame.
 */
export function streamSse({ url, headers = {}, body, onEvent, timeout = 60000 }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.timeout = timeout;

    for (const [name, value] of Object.entries(headers)) {
      xhr.setRequestHeader(name, value);
    }

    let consumed = 0;
    let buffer = '';
    let streamError = null;

    const drain = () => {
      const text = typeof xhr.responseText === 'string' ? xhr.responseText : '';
      if (text.length <= consumed) return;

      buffer += text.slice(consumed);
      consumed = text.length;

      // A frame is only complete once its blank-line terminator has arrived; whatever follows
      // the last one stays buffered so a token split across two chunks is never dropped.
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const parsed = parseFrame(frame);
        if (!parsed) continue;
        if (parsed.event === 'error') {
          streamError = new ApiError({
            message: parsed.data?.message ?? 'Request failed',
            code: parsed.data?.code ?? 'stream_error',
            status: 200,
            details: null,
          });
          continue;
        }
        onEvent?.(parsed);
      }
    };

    xhr.onprogress = () => {
      if (xhr.status >= 200 && xhr.status < 300) drain();
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(envelopeError(xhr));
        return;
      }

      const contentType = xhr.getResponseHeader('content-type') ?? '';

      if (!contentType.includes(SSE_CONTENT_TYPE)) {
        try {
          const payload = JSON.parse(xhr.responseText);
          resolve(payload?.data ?? payload);
        } catch {
          reject(
            new ApiError({
              message: 'The server sent a response this app could not read.',
              code: 'malformed_response',
              status: xhr.status,
              details: null,
            }),
          );
        }
        return;
      }

      drain();
      if (streamError) reject(streamError);
      else resolve(null);
    };

    const fail = (message, code) =>
      reject(new ApiError({ message, code, status: 0, details: null }));

    xhr.onerror = () => fail('Network request failed', 'network_error');
    xhr.ontimeout = () => fail('The request took too long.', 'timeout');
    xhr.onabort = () => fail('The request was cancelled.', 'aborted');

    xhr.send(body);
  });
}
