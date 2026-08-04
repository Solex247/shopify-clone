"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

// Wrap any page's content with this to require an admin session.
// Client-side guards are fine for a teaching project; a production app
// would also verify the role server-side on every request (which this
// backend already does — see requireAdmin in middleware/auth.js).
export default function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/login");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return <div style={{ color: "#fff", padding: 40 }}>Checking session…</div>;
  }

  if (!isAdmin) {
    return null; // redirect is in flight
  }

  return children;
}
