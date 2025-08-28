import { useForm } from "react-hook-form";
import api, { setAuth } from "../lib/api";
import { saveUser } from "../lib/auth";
import { useRouter } from "next/router";

export default function Register(){
  const { register, handleSubmit } = useForm({ defaultValues:{ role: "SEEKER" }});
  const router = useRouter();

  async function onSubmit(values){
    const { data } = await api.post("/auth/register", values);
    setAuth(data.tokens.access);
    saveUser(data.user);
    window.dispatchEvent(new Event("auth-changed"));
    router.push(data.user.role === "EMPLOYER" ? "/employer" : "/seeker");
  }

  return (
    <div className="center-screen">
      <div className="card form-card">
        <h2>Register</h2>
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)}>
          <input placeholder="Name" {...register("name",{required:true})}/>
          <select {...register("role")}>
            <option value="SEEKER">Job Seeker</option>
            <option value="EMPLOYER">Employer</option>
          </select>
          <input placeholder="Email" type="email" {...register("email",{required:true})}/>
          <input placeholder="Password" type="password" {...register("password",{required:true})}/>
          <button className="btn-block">Sign up</button>
        </form>
      </div>
    </div>
  );
}
