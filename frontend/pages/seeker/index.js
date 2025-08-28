import { useEffect, useState } from "react";
import api, { loadAuth } from "../../lib/api";
import Link from "next/link";
import RequireRole from "../../components/RequireRole";

export default function SeekerHome(){
  const [apps, setApps] = useState([]);
  const [favs, setFavs] = useState([]);

  // tolerant fetch: never throw, fill with []
  async function fetchAll(){
    const [appsRes, favsRes] = await Promise.allSettled([
      api.get("/seeker/applications"),
      api.get("/seeker/favorites"),
    ]);
    const a = appsRes.status === "fulfilled" ? (appsRes.value.data.applications || []) : [];
    const f = favsRes.status === "fulfilled" ? (favsRes.value.data.favorites || []) : [];
    setApps(a);
    setFavs(f);
  }

  useEffect(() => {
    if (loadAuth()) fetchAll();
  }, []);

  return (
    <RequireRole role="SEEKER">
      <h2>Job Seeker Dashboard</h2>
      <div className="row">
        <Link href="/seeker/profile" >Edit Profile</Link>
        <button onClick={fetchAll}>Refresh</button>
      </div>

      <h3>My Applications</h3>
      {apps.map(a => (
        <div className="card" key={a.id}>
          <b>{a.Job?.title}</b> — {a.status}
        </div>
      ))}

      <h3>Saved Jobs</h3>
      {favs.map(f => (
        <div className="card" key={f.id}>
          <b>{f.Job?.title}</b> • <Link href={`/jobs/${f.Job?.id}`}>Open</Link>
          <div className="row" style={{ marginTop: 8 }}>
            <button
              onClick={async () => {
                await api.delete(`/jobs/${f.Job?.id}/favorite`);
                const { data } = await api.get("/seeker/favorites");
                setFavs(data.favorites || []);
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </RequireRole>
  );
}
