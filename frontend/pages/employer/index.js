import { useEffect, useState } from "react";
import api, { loadAuth } from "../../lib/api";
import Link from "next/link";

export default function EmployerHome(){
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);

  async function load(){
    const [sum, per] = await Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/jobs")
    ]);
    setSummary(sum.data);
    setJobs(per.data.items || []);
  }

  useEffect(() => { if (loadAuth()) load(); }, []);

  return (
    <>
      <h2>Employer Dashboard</h2>
      <p><Link href="/employer/new-job">Post a job →</Link></p>

      {/* Totals */}
      <div className="grid">
        <div className="card"><h3>Total Jobs</h3><p style={{fontSize:28,fontWeight:700}}>{summary?.totalJobs ?? "—"}</p></div>
        <div className="card"><h3>Active Jobs</h3><p style={{fontSize:28,fontWeight:700}}>{summary?.activeJobs ?? "—"}</p></div>
        <div className="card"><h3>Expired Jobs</h3><p style={{fontSize:28,fontWeight:700}}>{summary?.expiredJobs ?? "—"}</p></div>
        <div className="card"><h3>Total Applicants</h3><p style={{fontSize:28,fontWeight:700}}>{summary?.totalApplicants ?? "—"}</p></div>
      </div>

      {/* Per-job cards */}
     <div className="grid" style={{marginTop:12}}>
  {jobs.map(j=> {
    const expired = j.expires_at && new Date(j.expires_at) < new Date();
    const statusLabel = (!j.is_active || expired) ? 'Expired/Inactive' : 'Active';
    return (
      <div className="card" key={j.id}>
        <h3>{j.title}</h3>
        <p className="badge" style={{background: statusLabel==='Active' ? '#e7f8ec' : '#ffe3e3'}}>
          {statusLabel}
        </p>
        <p>Applicants: <b>{j.applicants}</b></p>
        {/* <p>Views: <b>{j.views}</b></p> */}
        <div className="row">
          <a className="link-like" href={`/employer/jobs/${j.id}/edit`}>Edit</a>
          <span style={{flex:1}}/>
          <a className="link-like" href={`/employer/${j.id}`}>View applicants</a>
          <span style={{flex:1}}/>
          <button onClick={async ()=>{
            if (!confirm('Delete this job?')) return;
            await api.delete(`/jobs/${j.id}`);
            // reload list
            load();
          }}>Delete</button>
        </div>
      </div>
    );
  })}
</div>

    </>
  );
}
