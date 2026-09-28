// A minimal in-memory login throttle: no Redis, no extra infrastructure,
// appropriate for a single-company app that (per its architecture) runs as
// one long-lived Node process rather than a fleet of serverless functions.
//
// Caveat worth knowing about: this state is per-process. If this app is
// ever deployed across multiple server instances/replicas behind a load
// balancer, each instance tracks attempts independently, so the effective
// limit becomes "N attempts x number of instances." For a single-company
// deployment on one server that's a non-issue; if that ever changes, this
// should move to a shared store (e.g. the database) instead.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

type Attempt = { count: number; firstAttemptAt: number };
const attemptsByKey = new Map<string, Attempt>();

// Bound the map's growth — an attacker cycling through many fake emails
// shouldn't be able to leak memory indefinitely.
const MAX_TRACKED_KEYS = 10_000;

function keyFor(email: string, ip: string | null) {
  return `${email.toLowerCase()}|${ip ?? "unknown"}`;
}

export function isLoginRateLimited(email: string, ip: string | null): boolean {
  const key = keyFor(email, ip);
  const entry = attemptsByKey.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    attemptsByKey.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(email: string, ip: string | null): void {
  const key = keyFor(email, ip);
  const entry = attemptsByKey.get(key);
  const now = Date.now();

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    if (attemptsByKey.size >= MAX_TRACKED_KEYS) attemptsByKey.clear();
    attemptsByKey.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  entry.count += 1;
}

export function clearLoginAttempts(email: string, ip: string | null): void {
  attemptsByKey.delete(keyFor(email, ip));
}
