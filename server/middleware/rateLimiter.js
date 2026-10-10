const createLimiter = ({ limit, windowMs }) => {
  const hits = new Map();

  const check = (key) => {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      return { allowed: true };
    }

    if (entry.count >= limit) {
      const retryAfterSeconds = Math.ceil(
        (entry.windowStart + windowMs - now) / 1000
      );
      return { allowed: false, retryAfterSeconds };
    }

    entry.count += 1;
    return { allowed: true };
  };

  return { check };
};

const rateLimit = (limiter, getKey) => (req, res, next) => {
  const result = limiter.check(getKey(req));

  if (!result.allowed) {
    res.set("Retry-After", String(result.retryAfterSeconds));
    return res.status(429).json({
      error: "too many requests",
      retryAfterSeconds: result.retryAfterSeconds,
    });
  }
  next();
};

module.exports = { createLimiter, rateLimit };
