/**
 * Generate a cryptographically secure random code
 * @param length - Length of the code to generate (default: 16)
 * @returns A secure random code suitable for tokens and invite codes
 */
export function generateSecureCode(length: number = 16): string {
  if (typeof window !== 'undefined') {
    // Client-side: Use Web Crypto API
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').substring(0, length);
  } else {
    // Server-side: Use Node crypto
    const crypto = require('crypto');
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
  }
}

/**
 * Generate a cryptographically secure token
 * @param byteLength - Number of bytes for the token (default: 32)
 * @returns A base64url-encoded secure token
 */
export function generateSecureToken(byteLength: number = 32): string {
  if (typeof window !== 'undefined') {
    const array = new Uint8Array(byteLength);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } else {
    const crypto = require('crypto');
    return crypto.randomBytes(byteLength)
      .toString('base64url');
  }
}

/**
 * Get a cryptographically secure random index for array selection
 * @param arrayLength - Length of the array to select from
 * @returns A random index between 0 and arrayLength-1
 */
export function getSecureRandomIndex(arrayLength: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % arrayLength;
}

/**
 * Hash a string using SHA-256
 * @param value - The string to hash
 * @returns The hex-encoded hash
 */
export async function hashValue(value: string): Promise<string> {
  if (typeof window !== 'undefined') {
    // Client-side: Use Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Server-side: Use Node crypto
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
