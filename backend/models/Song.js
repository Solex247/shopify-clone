const mongoose = require("mongoose");

// Keeping the schema intentionally small on purpose — this is the
// beginner-facing "core" of a Spotify-style app. Real apps would add
// duration, genre, playCount, uploadedBy, etc.
const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    album: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: Number,
    },
    coverUrl: {
      type: String, // URL to album art image
      default: "",
    },
    audioUrl: {
      type: String, // URL to the actual mp3 file
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
