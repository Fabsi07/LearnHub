import bcrypt from "bcryptjs";

// Cost 12 gemaess docs/auth-concept.md §4 — gaengiger Default fuer 2026.
const COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
