const express = require("express");
const {
  createEndpoint,
  getEndpoints,
  updateEndpoint,
  deleteEndpoint,
} = require("../controllers/endpointController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, createEndpoint);
router.get("/", requireAuth, getEndpoints);
router.patch("/:id", requireAuth, updateEndpoint);
router.delete("/:id", requireAuth, deleteEndpoint);

module.exports = router;
