import { AuthProvider } from "../lib/auth-context";

export const metadata = {
  title: "musify-mini",
  description: "A Spotify-style teaching project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
