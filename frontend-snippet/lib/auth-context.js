"use client";

import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check localStorage for a saved token and verify it's
  // still valid by calling /api/auth/me. This is what keeps you logged
  // in across page refreshes.
  useEffect(() => {
    const saved = localStorage.getItem("musify_token");
    if (!saved) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${saved}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Session expired");
        return res.json();
      })
      .then((data) => {
        setToken(saved);
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("musify_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("musify_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("musify_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAdmin: user?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
