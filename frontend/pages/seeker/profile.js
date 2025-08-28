import { useEffect } from "react";
import { useForm } from "react-hook-form";
import api, { loadAuth } from "../../lib/api";
import RequireRole from "../../components/RequireRole";

export default function SeekerProfile(){
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (!loadAuth()) return;
    api.get("/seeker/me").then(({data}) => {
      if (data.seeker) Object.entries(data.seeker).forEach(([k,v]) => setValue(k, v ?? ""));
    });
  }, [setValue]);

  async function onSubmit(values){
    const { data } = await api.post("/seeker", values);
    alert("Saved profile");
  }

  async function uploadResume(e){
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("resume", file);
    await api.post("/seeker/resume", fd, { headers:{ "Content-Type":"multipart/form-data" }});
    alert("Resume uploaded");
  }

  return (
            <RequireRole role="SEEKER">
    
    <div className="card">
      <h2>Seeker Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="Headline" {...register("headline")}/>
        <textarea rows={6} placeholder="About" {...register("about")}/>
        {/* skills/experience/education UIs can be added later; you already have backend tables for those */}
        <div className="row">
          <button>Save</button>
          <label className="row">Upload Resume (PDF ≤5MB) <input type="file" accept="application/pdf" onChange={uploadResume}/></label>
        </div>
      </form>
    </div>
    </RequireRole>
  );
}
