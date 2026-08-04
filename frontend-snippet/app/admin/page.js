"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import RequireAdmin from "../../lib/RequireAdmin";
import styles from "./admin.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal state: null = closed, "create" = add form, song object = editing
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/songs`);
      const data = await res.json();
      setSongs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const isEdit = modal && modal !== "create";

    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/songs${isEdit ? `/${modal._id}` : ""}`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Save failed");
      }
      await fetchSongs();
      setModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(song) {
    if (!confirm(`Delete "${song.title}"? This can't be undone.`)) return;

    try {
      const res = await fetch(`${API_URL}/api/songs/${song._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSongs((prev) => prev.filter((s) => s._id !== song._id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin dashboard</h1>
          <p className={styles.subtitle}>Signed in as {user?.username}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={() => setModal("create")}>
            + Add song
          </button>
          <button className={styles.logoutBtn} onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {loading && <p className={styles.status}>Loading songs…</p>}
      {error && <p className={styles.status}>Error: {error}</p>}

      {!loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Year</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song._id}>
                <td>
                  <img
                    src={song.coverUrl || "https://placehold.co/40/1a1a1a/999?text=%E2%99%AA"}
                    alt=""
                    className={styles.thumb}
                  />
                </td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td className={styles.dim}>{song.album || "—"}</td>
                <td className={styles.dim}>{song.year || "—"}</td>
                <td className={styles.dim}>
                  {new Date(song.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.rowActions}>
                  <button className={styles.editBtn} onClick={() => setModal(song)}>
                    Edit
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(song)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className={styles.modalBackdrop} onClick={() => setModal(null)}>
          <form
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <h2 className={styles.modalTitle}>
              {modal === "create" ? "Add a song" : "Edit song"}
            </h2>

            <label className={styles.label}>
              Title
              <input
                name="title"
                defaultValue={modal !== "create" ? modal.title : ""}
                required
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Artist
              <input
                name="artist"
                defaultValue={modal !== "create" ? modal.artist : ""}
                required
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Album
              <input
                name="album"
                defaultValue={modal !== "create" ? modal.album : ""}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Year
              <input
                type="number"
                name="year"
                defaultValue={modal !== "create" ? modal.year : ""}
                min="1900"
                max="2100"
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Audio file {modal !== "create" && "(leave blank to keep current)"}
              <input
                type="file"
                name="audio"
                accept="audio/*"
                required={modal === "create"}
                className={styles.input}
              />
            </label>

            <label className={styles.label}>
              Cover image {modal !== "create" && "(leave blank to keep current)"}
              <input type="file" name="cover" accept="image/*" className={styles.input} />
            </label>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminDashboard />
    </RequireAdmin>
  );
}
