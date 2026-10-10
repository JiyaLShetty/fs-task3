const mongoose = require("mongoose");
const Endpoint = require("../models/endpoint");
const cache = require("../helpers/cache");

const isValidUrl = (value) => {
  if (typeof value !== "string") return false;
  if (!/^https?:\/\//i.test(value.trim())) return false;
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
};

const createEndpoint = async (req, res) => {
  try {
    const { url } = req.body;
    if (!isValidUrl(url)) {
      return res
        .status(400)
        .json({ error: "URL must start with http:// or https://" });
    }
    const endpoint = await Endpoint.create({
      userId: req.user.id,
      url: url.trim(),
    });
    cache.del("endpoints:" + req.user.id);
    res.status(201).json(endpoint);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

const getEndpoints = async (req, res) => {
  try {
    const endpoints = await Endpoint.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(endpoints);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

const updateEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "invalid endpoint id" });
    }

    const updates = {};
    if (req.body.url !== undefined) {
      if (!isValidUrl(req.body.url)) {
        return res
          .status(400)
          .json({ error: "URL must start with http:// or https://" });
      }
      updates.url = req.body.url.trim();
    }
    if (req.body.active !== undefined) {
      if (typeof req.body.active !== "boolean") {
        return res.status(400).json({ error: "active must be true or false" });
      }
      updates.active = req.body.active;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "nothing to update" });
    }

    const endpoint = await Endpoint.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true }
    );
    if (!endpoint) return res.status(404).json({ error: "endpoint not found" });

    cache.del("endpoints:" + req.user.id);
    res.json(endpoint);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

const deleteEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "invalid endpoint id" });
    }

    const endpoint = await Endpoint.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!endpoint) return res.status(404).json({ error: "endpoint not found" });

    cache.del("endpoints:" + req.user.id);
    res.json({ message: "endpoint deleted" });
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};

module.exports = {
  createEndpoint,
  getEndpoints,
  updateEndpoint,
  deleteEndpoint,
};
