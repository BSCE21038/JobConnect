import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api, { loadAuth } from "../../lib/api";

export default function EmployerJobApplicants(){
  const { query, push } = useRouter();
  const [items, setItems] = useState([]);
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!query.id || !loadAuth()) return;
    api.get(`/jobs/${query.id}`).then(({data}) => setJob(data.job));
    api.get(`/employer/jobs/${query.id}/applicants`).then(({data}) => setItems(data.applicants||[]));
  }, [query.id]);

  async function setStatus(appId, status){
    await api.patch(`/applications/${appId}/status`, { status });
    setItems(prev => prev.map(a => a.application_id === appId ? { ...a, status } : a));
  }
  async function delJob(){
    if (!confirm("Delete this job?")) return;
    await api.delete(`/jobs/${query.id}`);
    push("/employer");
  }

  return (
    <>
      <h2>{job?.title || "Job"} — Applicants</h2>
      <div className="row">
    {/* status badge + quick toggle */}
    {job && (
      <>
        <span className="badge" style={{background: (!job.is_active || (job.expires_at && new Date(job.expires_at)<new Date())) ? '#ffe3e3' : '#e7f8ec'}}>
          {(!job.is_active || (job.expires_at && new Date(job.expires_at)<new Date())) ? 'Expired/Inactive' : 'Active'}
        </span>
        <button onClick={async ()=>{
          // Toggle active flag quickly
          await api.patch(`/jobs/${query.id}`, { is_active: !job.is_active });
          const { data } = await api.get(`/jobs/${query.id}`);
          setJob(data.job);
        }}>
          {job?.is_active ? 'Mark Inactive' : 'Activate'}
        </button>
      </>
    )}
  </div>
      {items.map(a=>(
        <div className="card" key={a.application_id}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div>
              <b>{a.seeker?.name}</b> — {a.seeker?.email} <br/>
              <small>Status: {a.status}</small>
            </div>
            <div className="row">
              <button onClick={()=>setStatus(a.application_id,'SHORTLISTED')}>Shortlist</button>
              <button onClick={()=>setStatus(a.application_id,'REJECTED')}>Reject</button>
              <button onClick={()=>setStatus(a.application_id,'HIRED')}>Hire</button>
            </div>
          </div>
          {a.resume_url && <p><a href={`http://localhost:3001${a.resume_url}`} target="_blank">Resume</a></p>}
        </div>
      ))}
    </>
  );
}
