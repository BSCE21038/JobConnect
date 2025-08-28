import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import api, { loadAuth } from "../../../lib/api";

export default function EditJob(){
  const { query, push } = useRouter();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (!query.id || !loadAuth()) return;
    api.get(`/jobs/${query.id}`).then(({data}) => {
      const j = data.job; if (!j) return;
      ["title","description","location","salary_min","salary_max","job_type","expires_at","is_active"]
        .forEach(k => setValue(k, j[k] ?? ""));
    });
  }, [query.id, setValue]);

  async function onSubmit(values){
    values.salary_min = values.salary_min ? Number(values.salary_min) : null;
    values.salary_max = values.salary_max ? Number(values.salary_max) : null;
    await api.patch(`/jobs/${query.id}`, values);
    push(`/employer/${query.id}`);
  }

  async function uploadJD(e){
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("jd", file);
    await api.post(`/jobs/${query.id}/jd`, fd, { headers: { "Content-Type":"multipart/form-data" }});
    alert("JD uploaded");
  }

  return (
    <div className="card">
      <h2>Edit Job</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="Title" {...register("title",{required:true})}/>
        <select {...register("job_type")}>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="REMOTE">Remote</option>
        </select>
        <input placeholder="Location" {...register("location")}/>
        <input placeholder="Min Salary" type="number" {...register("salary_min")}/>
        <input placeholder="Max Salary" type="number" {...register("salary_max")}/>
        <textarea rows={6} placeholder="Description" {...register("description",{required:true})}/>
        <div className="row">
          <input type="date" {...register("expires_at")}/>
          <label className="row">Upload JD (PDF) <input type="file" accept="application/pdf" onChange={uploadJD}/></label>
          <button>Save</button>
        </div>
      </form>
    </div>
  );
}
