
// IMPORTANT: This is a pseudo-hash function for PROTOTYPE purposes only.
// It is NOT cryptographically secure and MUST NOT be used in production.
// For production, use a strong hashing library like bcryptjs.

export function pseudoHashPassword(password: string): string {
  if (!password) return ''; // Handle empty password case
  // A very simple, predictable transformation.
  const reversed = password.split('').reverse().join('');
  return `ph_${reversed}_slt`;
}

export function verifyPseudoHashedPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  return pseudoHashPassword(password) === storedHash;
}
