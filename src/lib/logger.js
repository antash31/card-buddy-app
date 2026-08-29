// #genai: Thin logging wrapper so log transport can be swapped (Sentry, etc.) in one place.
import { isDev } from '@/config/env';

function format(scope, args) {
  return [`[${scope}]`, ...args];
}

export const logger = {
  debug: (scope, ...args) => {
    if (isDev) {
      // eslint-disable-next-line no-console -- debug output is intentionally dev-only
      console.log(...format(scope, args));
    }
  },
  warn: (scope, ...args) => console.warn(...format(scope, args)),
  error: (scope, ...args) => console.error(...format(scope, args)),
};
