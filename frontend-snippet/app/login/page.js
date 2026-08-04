"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import styles from "./login.module.css";

// This page is admin-only by design — there is no sign-up, and no
// regular "user" account exists. Anyone can browse and play songs
// without logging in; this form exists purely so the site owner can
// reach the admin dashboard.
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>musify</div>
        <h1 className={styles.title}>Admin login</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Username
            <input
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className={styles.hint}>
          This login is for the site admin only — visitors don't need an
          account to browse or play songs.
        </p>
      </div>
    </div>
  );
}

