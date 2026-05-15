import { SignJWT } from 'jose';
import { UploadTokenPayload } from '@/types';

export async function generateUploadToken(payload: UploadTokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(localStorage.getItem('jwt_secret') || 'changeme-in-settings');

  const expiryMap: Record<string, string> = {
    '1h': '1h',
    '24h': '24h',
    '7d': '7d',
  };

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiryMap[payload.expiresIn])
    .sign(secret);

  return token;
}

export function buildUploadUrl(token: string, poNumber?: string): string {
  const base = window.location.origin;
  const params = new URLSearchParams({ token });
  if (poNumber) params.set('po', poNumber);
  return `${base}/vendor-upload?${params.toString()}`;
}
