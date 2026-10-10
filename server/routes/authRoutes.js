const express = require("express");
const {
  test,
  userSignUp,
  userLogin,
  userRefresh,
  userLogout,
} = require("../controllers/authController");
const { createLimiter, rateLimit } = require("../middleware/rateLimiter");

const router = express.Router();

const loginLimiter = createLimiter({ limit: 5, windowMs: 60 * 1000 });

const loginKey = (req) =>
  req.ip + ":" + (req.body?.email || "").toString().trim().toLowerCase();

router.get("/", test);
router.post("/signup", userSignUp);
router.post("/login", rateLimit(loginLimiter, loginKey), userLogin);
router.post("/refresh", userRefresh);
router.post("/logout", userLogout);

module.exports = router;
