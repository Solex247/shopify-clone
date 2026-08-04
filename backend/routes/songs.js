const express = require("express");
const multer = require("multer");
const router = express.Router();
const Song = require("../models/Song");
const cloudinary = require("../config/cloudinary");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Files land in memory as a buffer — we never write them to disk,
// we just stream the buffer straight to Cloudinary.
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload a buffer to Cloudinary and resolve with the result.
// resourceType is "video" for audio files (Cloudinary treats audio
// as a video resource) and "image" for cover art.
function uploadToCloudinary(buffer, resourceType, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// GET /api/songs — return every song, newest first
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch songs" });
  }
});

// GET /api/songs/:id — single song, used by the detail page
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid song id" });
  }
});

// POST /api/songs — upload an audio file + optional cover image straight
// to Cloudinary, then save the resulting URLs on the song document.
// Expects multipart/form-data with fields: title, artist, audio, cover
// Admin only — this is a write/mutation route.
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, artist, album, year } = req.body;
      const audioFile = req.files?.audio?.[0];
      const coverFile = req.files?.cover?.[0];

      if (!title || !artist || !audioFile) {
        return res
          .status(400)
          .json({ message: "title, artist, and an audio file are required" });
      }

      // Audio goes up as "video" resource type — that's just Cloudinary's
      // internal category for anything with a duration (audio or video).
      const audioResult = await uploadToCloudinary(
        audioFile.buffer,
        "video",
        "musify-mini/audio"
      );

      let coverUrl = "";
      if (coverFile) {
        const coverResult = await uploadToCloudinary(
          coverFile.buffer,
          "image",
          "musify-mini/covers"
        );
        coverUrl = coverResult.secure_url;
      }

      const song = await Song.create({
        title,
        artist,
        album,
        year: year ? Number(year) : undefined,
        coverUrl,
        audioUrl: audioResult.secure_url,
      });

      res.status(201).json(song);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to upload and create song" });
    }
  }
);

// PUT /api/songs/:id — update title/artist, and optionally replace the
// audio file and/or cover image. Admin only.
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const song = await Song.findById(req.params.id);
      if (!song) return res.status(404).json({ message: "Song not found" });

      const { title, artist, album, year } = req.body;
      if (title) song.title = title;
      if (artist) song.artist = artist;
      if (album !== undefined) song.album = album;
      if (year) song.year = Number(year);

      const audioFile = req.files?.audio?.[0];
      const coverFile = req.files?.cover?.[0];

      if (audioFile) {
        const audioResult = await uploadToCloudinary(
          audioFile.buffer,
          "video",
          "musify-mini/audio"
        );
        song.audioUrl = audioResult.secure_url;
      }

      if (coverFile) {
        const coverResult = await uploadToCloudinary(
          coverFile.buffer,
          "image",
          "musify-mini/covers"
        );
        song.coverUrl = coverResult.secure_url;
      }

      await song.save();
      res.json(song);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update song" });
    }
  }
);

// DELETE /api/songs/:id — admin only.
// Note: this removes the Mongo record but leaves the Cloudinary asset in
// place. Deleting from Cloudinary too requires storing the asset's
// "public_id" at upload time and calling cloudinary.uploader.destroy() —
// a good stretch goal to mention on camera.
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json({ message: "Song deleted", id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete song" });
  }
});

module.exports = router;
