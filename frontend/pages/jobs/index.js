import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/api";
import Link from "next/link";
import { getUser } from "../../lib/auth";

export default function JobsPage(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
  // ---- main loader
  async function load(p=page){
    const u = getUser();
    const params = {
      page: p,
      ...(q ? { q } : {}),
      ...(location ? { location } : {}),
      ...(type ? { type } : {})
    };
    if (!u || u?.role === "SEEKER") params.include_inactive = 1;

    const { data } = await api.get("/jobs", { params });
    setItems(data.items || []);
    setTotalPages(data.totalPages || 1);
  }

  // ---- Debounce typing (q, location, type)
  const debounceTimer = useRef(null);
  useEffect(() => {
    // whenever filters change, reset to page 1
    setPage(1);

    // debounce API call
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      load(1);
    }, 350); // 300–400ms feels good

    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location, type]);

  // ---- run when page changes (from Next/Prev)
  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="filters">
      <h2>Jobs</h2>

      <input
        placeholder="Search keywords..."
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />
      <input
        placeholder="Location"
        value={location}
        onChange={(e)=>setLocation(e.target.value)}
      />
      <select value={type} onChange={e=>setType(e.target.value)}>
        <option value="">Any type</option>
        <option value="FULL_TIME">Full-time</option>
        <option value="PART_TIME">Part-time</option>
        <option value="REMOTE">Remote</option>
      </select>

      {/* Optional: keep Search button as a manual refresh */}
      <button onClick={()=>{ setPage(1); load(1); }}>Search</button>

      <div className="grid">

        {items.map(j => {
          const expired = j.meta?.expired;
          const can = j.meta?.can_apply;
          return (
            <div className="card" key={j.id}>
              <h3>{j.title}</h3>
              <p>{j.location || "—"}</p>
              <p>
                {can && <span className="badge" style={{background:'#e7f8ec',color:'#1a7f37'}}>Active</span>}
                {!can && (
                  <>
                    {expired && <span className="badge" style={{background:'#ffe3e3'}}>Expired</span>}
                    {!j.is_active && <span className="badge" style={{background:'#ffe3e3',marginLeft:8}}>Inactive</span>}
                    <span className="badge" style={{background:'#ffdca8',marginLeft:8}}>No longer accepting</span>
                  </>
                )}
              </p>
              <p><Link href="/jobs" className="link-btn">View</Link></p>
            </div>
          );
        })}
      </div>

      <div className="row">
  <button
    disabled={page <= 1}
    onClick={()=> setPage(p=>Math.max(1,p-1))}
  >
    Prev
  </button>

  <span>Page {page}</span>

  <button
    disabled={items.length < 6}  // 👈 lock Next if less than a full page
    onClick={()=> setPage(p=>p+1)}
  >
    Next
  </button>
</div>

    </div>
  );
}
