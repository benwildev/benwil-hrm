// Centralized password strength rule so every place a password is set
// (self-service change, admin reset, new portal login) enforces the same
// minimum — previously each call site hand-rolled its own `length < 6`
// check.
const MIN_LENGTH = 8;

export function assertStrongPassword(password: string): void {
  if (!password || password.length < MIN_LENGTH) {
    throw new Error(`Password must be at least ${MIN_LENGTH} characters long.`);
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Password must include at least one letter and one number.");
  }
}
