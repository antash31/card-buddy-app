// #genai: Avatar upload straight to Supabase Storage.
//
// This is the one call that bypasses the Express API. Storage enforces the same rules the API
// would: the bucket policy only accepts writes inside a folder named after the caller's user id,
// and the caller is identified by the very access token our API issued. Proxying the bytes
// through Express would add a hop without adding a check.
import { env } from '@/config/env';
import { StorageKeys } from '@/constants/storageKeys';
import { secureStorage } from '@/lib/storage';

const BUCKET = 'avatars';

function extensionFor(mimeType, uri) {
  if (mimeType?.includes('png')) return 'png';
  if (mimeType?.includes('webp')) return 'webp';
  if (mimeType?.includes('heic')) return 'heic';

  const fromUri = uri?.split('.').pop()?.toLowerCase();
  return fromUri && fromUri.length <= 4 ? fromUri : 'jpg';
}

export async function uploadAvatar({ userId, uri, mimeType }) {
  const token = await secureStorage.get(StorageKeys.accessToken);
  if (!token) throw new Error('You need to be signed in to upload a photo.');

  const extension = extensionFor(mimeType, uri);
  // A per-upload filename avoids stale CDN caches showing the previous photo.
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const form = new FormData();
  form.append('file', {
    uri,
    name: `avatar.${extension}`,
    type: mimeType || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
  });

  const response = await fetch(`${env.supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.supabaseAnonKey,
      'x-upsert': 'true',
    },
    // Content-Type is intentionally unset so the runtime can add the multipart boundary.
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || 'Could not upload that photo.');
  }

  return `${env.supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}
