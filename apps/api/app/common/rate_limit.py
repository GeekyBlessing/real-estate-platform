import time
from collections import defaultdict, deque

from app.common.exceptions import RateLimitedError


class InMemoryRateLimiter:
    """
    A per-process, in-memory stand-in for the Redis-backed rate limiter
    the architecture doc specifies for login attempts (section 8:
    "per account and per IP, Redis-backed, with progressive backoff").
    This version has the same interface and the same per-key sliding
    window logic, but two real gaps it does not paper over: it forgets
    every count on a process restart, and it does not work across more
    than one running instance. Both are exactly why the doc calls for
    Redis in real infrastructure. Swap this class's storage for Redis
    (INCR + EXPIRE, or a sorted set for a true sliding window) when
    this backend is actually deployed; nothing above this class needs
    to change since callers only see check_and_record().
    """

    def __init__(self, max_attempts: int, window_seconds: int):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check_and_record(self, key: str) -> None:
        now = time.monotonic()
        window_start = now - self.window_seconds
        hits = self._hits[key]
        while hits and hits[0] < window_start:
            hits.popleft()
        if len(hits) >= self.max_attempts:
            raise RateLimitedError("Too many attempts. Wait a moment before trying again.")
        hits.append(now)


# Deliberately separate limiters for account and IP keys, per the doc's
# "per account and per IP" wording: a single shared limiter would let
# an attacker exhaust a victim's account budget just by sharing an IP
# with other legitimate traffic, or vice versa.
login_attempts_by_account = InMemoryRateLimiter(max_attempts=5, window_seconds=300)
login_attempts_by_ip = InMemoryRateLimiter(max_attempts=20, window_seconds=300)
