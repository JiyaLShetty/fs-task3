const { isDeepStrictEqual } = require("util");
const Event = require("../models/event");
const Endpoint = require("../models/endpoint");
const cache = require("../helpers/cache");

const ENDPOINT_TTL_MS = 5 * 60 * 1000;

const getActiveEndpoints = async (userId) => {
  const key = "endpoints:" + userId;

  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  cache.recordDbQuery();
  const endpoints = await Endpoint.find({ userId, active: true }).lean();

  cache.set(key, endpoints, ENDPOINT_TTL_MS);
  return endpoints;
};

const createEvent = async (req, res) => {
  const { type, data } = req.body || {};
  const idempotencyKey = req.get("Idempotency-Key")?.trim();

  if (!idempotencyKey) {
    return res
      .status(400)
      .json({ error: "Idempotency-Key header is required" });
  }
  if (idempotencyKey.length > 255) {
    return res.status(400).json({ error: "Idempotency-Key is too long" });
  }
  if (typeof type !== "string" || !type.trim()) {
    return res.status(400).json({ error: "type is required" });
  }
  if (
    data !== undefined &&
    (typeof data !== "object" || data === null || Array.isArray(data))
  ) {
    return res.status(400).json({ error: "data must be an object" });
  }

  try {
    const endpoints = await getActiveEndpoints(req.user.id);

    const event = await Event.create({
      userId: req.user.id,
      type: type.trim(),
      data: data || {},
      idempotencyKey,
      endpointIds: endpoints.map((e) => e._id),
    });

    return res.status(201).json(event);
  } catch (err) {
    if (err.code === 11000) {
      try {
        const existing = await Event.findOne({
          userId: req.user.id,
          idempotencyKey,
        }).lean();

        if (existing) {
          const sameType = existing.type === type.trim();
          const sameData = isDeepStrictEqual(existing.data ?? {}, data ?? {});

          if (!sameType || !sameData) {
            return res.status(422).json({
              error:
                "Idempotency-Key was already used with a different request body",
            });
          }

          return res.status(200).json(existing);
        }
      } catch (findErr) {
        return res.status(500).json({ error: "server error" });
      }
    }
    return res.status(500).json({ error: "server error" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
};

module.exports = { createEvent, getEvents };
