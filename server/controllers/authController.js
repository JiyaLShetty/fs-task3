const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
  res.json("test is working");
};

const userSignUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "password is required and must be at least 6 characters",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: "email is already taken" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: "username is already taken" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "signup failed" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, tokenVersion: user.refreshTokenVersion },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "login failed" });
  }
};

const userRefresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.token;
    if (!refreshToken) {
      return res.status(401).json({ error: "missing refresh token" });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(payload.id);

    if (!user || user.refreshTokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: "invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "invalid refresh token" });
  }
};

const userLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies.token;
    if (!refreshToken) {
      res.clearCookie("token");
      return res.status(200).json({ message: "logged out" });
    }
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.id, {
        $inc: { refreshTokenVersion: 1 },
      });
    } catch (err) {}
    res.clearCookie("token");
    return res.status(200).json({ message: "logged out" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "logout failed" });
  }
};

module.exports = {
  test,
  userSignUp,
  userLogin,
  userRefresh,
  userLogout,
};
