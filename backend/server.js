const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const songsRouter = require("./routes/songs");
const authRouter = require("./routes/auth");

const app = express();

// This is the #1 beginner "why doesn't my fetch work" trap — always
// explain this on camera.
app.use(cors());
app.use(express.json());

app.use("/api/songs", songsRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Musify-mini API is running");
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env — see .env.example");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
