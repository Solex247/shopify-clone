"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import styles from "./musify.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const { user, isAdmin, logout } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch(`${API_URL}/api/songs`);
        if (!res.ok) throw new Error("Server responded with an error");
        const data = await res.json();
        setSongs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  return (
    <div className={styles.app}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>musify</div>
        <nav className={styles.nav}>
          <span className={styles.navItemActive}>Home</span>
          <span className={styles.navItem}>Search</span>
          <span className={styles.navItem}>Your Library</span>
        </nav>
        <div className={styles.libraryList}>
          {songs.map((song) => (
            <Link
              key={song._id}
              href={`/songs/${song._id}`}
              className={styles.libraryItem}
            >
              <img
                src={song.coverUrl || "https://placehold.co/40/1a1a1a/999?text=%E2%99%AA"}
                alt=""
                className={styles.libraryCover}
              />
              <div className={styles.libraryInfo}>
                <span className={styles.libraryTitle}>{song.title}</span>
                <span className={styles.libraryArtist}>{song.artist}</span>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.greeting}>Good afternoon</h1>

          <div className={styles.account}>
            {!user && (
              <Link href="/login" className={styles.accountLink}>
                Admin login
              </Link>
            )}
            {user && isAdmin && (
              <>
                <Link href="/admin" className={styles.accountLink}>
                  Admin dashboard
                </Link>
                <button className={styles.accountLink} onClick={logout}>
                  Log out
                </button>
              </>
            )}
          </div>
        </header>

        {loading && <p className={styles.status}>Loading songs…</p>}
        {error && (
          <p className={styles.status}>
            Couldn't reach the API — is the Express server running? ({error})
          </p>
        )}
        {!loading && !error && songs.length === 0 && (
          <p className={styles.status}>
            No songs yet — an admin can add some from the admin dashboard.
          </p>
        )}

        <section className={styles.grid}>
          {songs.map((song) => (
            <Link key={song._id} href={`/songs/${song._id}`} className={styles.card}>
              <div className={styles.cardImgWrap}>
                <img
                  src={song.coverUrl || "https://placehold.co/300/1a1a1a/999?text=%E2%99%AA"}
                  alt={song.title}
                  className={styles.cardImg}
                />
                <span className={styles.playOverlay}>▶</span>
              </div>
              <div className={styles.cardTitle}>{song.title}</div>
              <div className={styles.cardArtist}>{song.artist}</div>
              <div className={styles.cardMeta}>
                {song.album && <span>{song.album}</span>}
                {song.album && song.year && <span> · </span>}
                {song.year && <span>{song.year}</span>}
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
