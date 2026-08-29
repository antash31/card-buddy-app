// #genai: Indirection between the axios client and the auth store.
//
// The client must be able to persist a refreshed session and signal a hard expiry, but importing
// the store from the client (which the store itself calls into) would create a cycle. The store
// registers its handlers here at startup instead.
const noop = () => {};

let handlers = {
  onSessionRefreshed: noop,
  onSessionExpired: noop,
};

export function configureSessionBridge(next) {
  handlers = { ...handlers, ...next };
}

export function notifySessionRefreshed(session) {
  handlers.onSessionRefreshed(session);
}

export function notifySessionExpired() {
  handlers.onSessionExpired();
}
