// pages/seeker/profile.js
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
    await api.post("/seeker", values);
    alert("Saved profile");
  }

 async function uploadResume(e){
  const file = e.target.files?.[0];
  if (!file) return;

  // client-side validation (matches backend constraints)
  if (file.type !== "application/pdf") {
    alert("Please upload a PDF file.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("Max file size is 5MB.");
    return;
  }

  const fd = new FormData();
  fd.append("resume", file, file.name); // field name must match multer .single('resume')

  try {
    // DO NOT set Content-Type — let Axios add the boundary
    await api.post("/seeker/resume", fd);
    alert("Resume uploaded");
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Upload failed";
    alert(msg);
  }
}

  return (
    <RequireRole role="SEEKER">
      <div className="card">
        <h2>Seeker Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="row">
            <input placeholder="Headline" {...register("headline")} />
          </div>

          <div className="row">
            <textarea rows={6} placeholder="About" {...register("about")} />
          </div>

         

          <div className="row">
            <label className="file-label">
              Upload Resume (PDF ≤5MB)
              <input type="file" accept="application/pdf" onChange={uploadResume} />
            </label>
          </div>
           <div className="row">
            <button className="primary-btn">Save</button>
          </div>
        </form>
      </div>
    </RequireRole>
  );
}
