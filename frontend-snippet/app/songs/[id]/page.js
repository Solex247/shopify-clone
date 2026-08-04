"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./song-detail.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SongDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    async function fetchSong() {
      try {
        const res = await fetch(`${API_URL}/api/songs/${id}`);
        if (!res.ok) throw new Error("Song not found");
        const data = await res.json();
        setSong(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, [id]);

  function togglePlay() {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  }

  if (loading) {
    return <div className={styles.page}><p className={styles.status}>Loading…</p></div>;
  }

  if (error || !song) {
    return (
      <div className={styles.page}>
        <p className={styles.status}>{error || "Song not found"}</p>
        <button className={styles.backLink} onClick={() => router.push("/")}>
          ← Back to songs
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← Back to songs
      </Link>

      <div className={styles.content}>
        <img
          src={song.coverUrl || "https://placehold.co/400/1a1a1a/999?text=%E2%99%AA"}
          alt={song.title}
          className={styles.cover}
        />

        <div className={styles.info}>
          <span className={styles.kicker}>Song</span>
          <h1 className={styles.title}>{song.title}</h1>
          <p className={styles.artist}>{song.artist}</p>

          <div className={styles.metaRow}>
            {song.album && (
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Album</span> {song.album}
              </span>
            )}
            {song.year && (
              <span className={styles.metaItem}>
                <span className={styles.metaLabel}>Year</span> {song.year}
              </span>
            )}
          </div>

          <div className={styles.playerControls}>
            <button className={styles.playBtn} onClick={togglePlay}>
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            <div className={styles.progressBar} onClick={handleSeek}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
