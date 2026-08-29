// #genai: PKCE helpers for the OAuth flow (RFC 7636).
//
// The app is the OAuth client, so it generates the verifier and keeps it in memory; only the
// derived challenge is sent when requesting the consent URL. That means an intercepted
// authorization code is useless on its own — completing the exchange also requires the verifier,
// which never travels over the wire until the final, direct call to our API.
import * as Crypto from 'expo-crypto';

// 64 unreserved characters exactly, so `byte % length` introduces no modulo bias.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const VERIFIER_LENGTH = 64;

function toBase64Url(base64) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPkcePair() {
  const bytes = await Crypto.getRandomBytesAsync(VERIFIER_LENGTH);

  const verifier = Array.from(bytes)
    .map((byte) => ALPHABET[byte % ALPHABET.length])
    .join('');

  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });

  return { verifier, challenge: toBase64Url(digest) };
}

/** Pulls the authorization code out of the provider's redirect, from query or fragment. */
export function extractAuthCode(redirectUrl) {
  if (!redirectUrl) return { code: null, error: null };

  const [, queryPart = ''] = redirectUrl.split('?');
  const [search, fragment = ''] = queryPart.split('#');

  const params = new URLSearchParams(search);
  const fragmentParams = new URLSearchParams(fragment);

  const error = params.get('error_description') ?? params.get('error') ?? fragmentParams.get('error_description');

  return {
    code: params.get('code') ?? fragmentParams.get('code'),
    error,
  };
}
