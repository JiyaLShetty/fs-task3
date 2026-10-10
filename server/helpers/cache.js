const store = new Map();

const stats = { hits: 0, misses: 0, dbQueries: 0 };

const get = (key) => {
  const entry = store.get(key);
  if (!entry) {
    stats.misses += 1;
    return undefined;
  }

  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    stats.misses += 1;
    return undefined;
  }

  stats.hits += 1;
  return entry.value;
};

const set = (key, value, ttlMs) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const del = (key) => {
  store.delete(key);
};

const recordDbQuery = () => {
  stats.dbQueries += 1;
};

const getStats = () => ({ ...stats, size: store.size });

module.exports = { get, set, del, recordDbQuery, getStats };
