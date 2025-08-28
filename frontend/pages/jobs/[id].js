import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api, { loadAuth } from "../../lib/api";
import { getUser } from "../../lib/auth";
import { useToast } from "../../components/ToastProvider";

export default function JobDetail(){
  const { query } = useRouter();
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [meta, setMeta] = useState({ expired:false, can_apply:false, seekerApplied:false });
  const { push } = useToast();

  useEffect(() => {
    if (!query.id) return;
    api.get(`/jobs/${query.id}`).then(({data}) => {
      setJob(data.job);
      setMeta(data.meta || { expired:false, can_apply:false, seekerApplied:false });
    });
  }, [query.id]);

  async function ensureSeeker(){
    if (!loadAuth()) { push("Login first", "info"); return false; }
    const u = getUser();
    if (u?.role !== "SEEKER") { push("Login as seeker to perform this action", "error"); return false; }
    return true;
  }

  async function apply(){
    if (!(await ensureSeeker())) return;
    if (!meta.can_apply) { push("No longer accepting applications", "error"); return; }
    const { data } = await api.post(`/jobs/${query.id}/apply`);
    setMeta(m => ({ ...m, seekerApplied: true }));
    push(data.note || "Applied!", "success");
  }

  async function favorite(){
  if (!(await ensureSeeker())) return;
  const { data } = await api.post(`/jobs/${query.id}/favorite`);
  setSaved(true);
  push(data.note || "Saved!", "success");
}

  if (!job) return <p>Loading...</p>;

  return (
    <div className="card">
      <h2>{job.title}</h2>
      <p>{job.location} • {job.job_type}</p>

      {/* status badges */}
      <p>
        {meta.expired && <span className="badge" style={{background:'#ffe3e3'}}>Expired</span>}
        {!job.is_active && <span className="badge" style={{background:'#ffe3e3',marginLeft:8}}>Inactive</span>}
        {!meta.can_apply && <span className="badge" style={{background:'#ffdca8',marginLeft:8}}>No longer accepting applications</span>}
      </p>

      <p>{job.description}</p>

      <div className="row">
  <button 
    disabled={!meta.can_apply || meta.seekerApplied} 
    onClick={apply}
  >
    {meta.seekerApplied ? "Applied" : "Apply"}
  </button>

  <button 
    disabled={!meta.can_apply || saved} 
    onClick={favorite}
  >
    {saved ? "Saved" : "Save"}
  </button>
</div>

    </div>
  );
}
