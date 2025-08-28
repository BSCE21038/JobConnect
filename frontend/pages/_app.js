import { useEffect, useState } from "react";
import Link from "next/link";
import { loadAuth } from "../lib/api";
import { getUser, logout as doLogout } from "../lib/auth";
import ToastProvider from "../components/ToastProvider";
import "../styles.css";

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // hydrate auth on first client render
    loadAuth();
    setUser(getUser());
    setMounted(true);

    // update when we manually broadcast changes (see login/register/logout)
    const onAuthChanged = () => setUser(getUser());
    window.addEventListener("auth-changed", onAuthChanged);

    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  function logout() {
    doLogout();
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
  }

  return (
    <ToastProvider>
             <header className="nav-bar">
  <div className="nav-inner">
    {/* Left side: brand or home */}
    <div className="nav-left">
      <Link href="/">JobConnect</Link>
    </div>

    {/* Center / right: role-aware links */}
    <nav className="nav-links">
      {(!user || user?.role === "SEEKER") && (
        <>
          <Link href="/">Home</Link>
          <Link href="/jobs">Jobs</Link>
        </>
      )}

      {mounted && !user && (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}

      {mounted && user?.role === "EMPLOYER" && (
        <>
          <Link href="/employer">Dashboard</Link>
          <Link href="/employer/profile">Profile</Link>
          <Link href="/employer/new-job">Post Job</Link>
        </>
      )}

      {mounted && user?.role === "SEEKER" && (
        <>
          <Link href="/seeker">Dashboard</Link>
          <Link href="/seeker/profile">Profile</Link>
        </>
      )}

      {mounted && user && (
        <button className="btn-outline" onClick={logout}>Logout</button>
      )}
    </nav>
  </div>
</header>
    <div className="container">
      <Component {...pageProps} />
    </div>
    </ToastProvider>
  );
}
