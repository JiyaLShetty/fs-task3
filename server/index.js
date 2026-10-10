const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./middleware/authMiddleware");
const cache = require("./helpers/cache");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected."))
  .catch((err) => console.log("Database not connected.", err));

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Retry-After"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/endpoints", require("./routes/endpointRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));

const port = 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
