const express = require("express");
const { createEvent, getEvents } = require("../controllers/eventController");
const { requireAuth } = require("../middleware/authMiddleware");
const { createLimiter, rateLimit } = require("../middleware/rateLimiter");

const router = express.Router();

const eventLimiter = createLimiter({ limit: 30, windowMs: 60 * 1000 });

router.post(
  "/",
  requireAuth,
  rateLimit(eventLimiter, (req) => req.user.id),
  createEvent
);
router.get("/", requireAuth, getEvents);

module.exports = router;
