import { useForm } from "react-hook-form";
import api, { loadAuth } from "../../lib/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function NewJob(){
  const { register, handleSubmit, reset } = useForm();
  const router = useRouter();

  useEffect(()=>{ if (!loadAuth()) alert("Login as EMPLOYER first"); },[]);

  async function onSubmit(values){
    // API expects title, description, location, salary_min, salary_max, job_type, expires_at
    values.salary_min = values.salary_min ? Number(values.salary_min) : null;
    values.salary_max = values.salary_max ? Number(values.salary_max) : null;
    const { data } = await api.post("/jobs", values);
    reset();
    router.push(`/employer/${data.job.id}`); // go to applicants for this job
  }

  return (
    <div className="card">
      <h2>Post a Job</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
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
          <input placeholder="Min Salary" type="number" {...register("salary_min")}/>
          <input placeholder="Max Salary" type="number" {...register("salary_max")}/>
        </div>
        <textarea placeholder="Description" rows={6} {...register("description",{required:true})}/>
        <div className="row">
          <input type="date" {...register("expires_at")}/>
          <button>Create</button>
        </div>
      </form>
    </div>
  );
}
