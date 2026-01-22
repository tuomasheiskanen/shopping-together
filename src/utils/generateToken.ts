/**
 * Generate a random token for sharing lists
 * Uses a URL-safe alphabet
 */
export function generateToken(length: number = 12): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    token += alphabet[randomIndex];
  }

  return token;
}
