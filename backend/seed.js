// Run with: node seed.js
// Populates the database with sample songs so you're not fumbling
// with real file uploads during the recording.

const mongoose = require("mongoose");
require("dotenv").config();
const Song = require("./models/Song");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env — see .env.example");
  process.exit(1);
}

const sampleSongs = [
  {
    title: "Acoustic Breeze",
    artist: "Bensound",
    album: "Chill Sessions",
    year: 2019,
    coverUrl: "https://picsum.photos/seed/acoustic/400",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
  },
  {
    title: "Creative Minds",
    artist: "Bensound",
    album: "Chill Sessions",
    year: 2020,
    coverUrl: "https://picsum.photos/seed/creative/400",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
  },
  {
    title: "Sunny",
    artist: "Bensound",
    album: "Daylight",
    year: 2021,
    coverUrl: "https://picsum.photos/seed/sunny/400",
    audioUrl: "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Song.deleteMany({});
  await Song.insertMany(sampleSongs);
  console.log(`Seeded ${sampleSongs.length} songs`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
