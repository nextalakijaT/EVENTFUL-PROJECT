import crypto from 'crypto';

export function generateShortId(length = 8): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}