import { useForm } from "react-hook-form";
import api, { loadAuth } from "../../lib/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function NewJob(){
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter();

  useEffect(()=>{ if (!loadAuth()) alert("Login as EMPLOYER first"); },[]);

async function onSubmit(values){
  try {
    values.salary_min = values.salary_min ? Number(values.salary_min) : null;
    values.salary_max = values.salary_max ? Number(values.salary_max) : null;
    values.expires_at = values.expires_at || null;

    // prefer employer-scoped route
    let res;
    try {
      res = await api.post("/employer/jobs", values);
    } catch (e) {
      // fallback if your server still uses /jobs for create
      if (e?.response?.status === 404) {
        res = await api.post("/jobs", values);
      } else {
        throw e;
      }
    }

    const job = res.data.job || res.data.item || res.data; // be tolerant
    reset();
    router.push(`/employer/${job.id}`);
  } catch (err) {
    const msg = err?.response?.data?.error || err?.message || "Failed to create job";
    alert(msg);
  }
}


  return (
   <div className="card">
    <h2>Post a Job</h2>
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <div className="row">
        <input placeholder="Title" {...register("title",{required:true})}/>
        <select {...register("job_type")}>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="REMOTE">Remote</option>
        </select>
      </div>

      <div className="row">
        <input placeholder="Location" {...register("location")}/>
      </div>

      <div className="row">
        <input placeholder="Min Salary" type="number" {...register("salary_min")}/>
        <input placeholder="Max Salary" type="number" {...register("salary_max")}/>
      </div>

      <div className="row">
        <textarea placeholder="Description" rows={6} {...register("description",{required:true})}/>
      </div>

      <div className="row">
        <input type="date" {...register("expires_at")}/>
      </div>

      <div className="row">
        <button className="primary-btn">Create</button>
      </div>
    </form>
  </div>
  );
}
