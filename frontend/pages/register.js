import { useForm } from "react-hook-form";
import api from "../lib/api";

export default function Register(){
  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset } =
    useForm({ defaultValues:{ role: "SEEKER" } });

  async function onSubmit(values){
    try {
      await api.post("/auth/register", values);
      // simple popup (use your Toast if you have one)
      alert("✅ Account created successfully!");
      reset();  // clear fields
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed";
      alert(`❌ ${msg}`);
    }
  }

  return (
    <div className="center-screen">
      <div className="card form-card">
        <h2>Register</h2>

        <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
          <input
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            aria-invalid={!!errors.name}
          />
          {errors.name && <small className="err">{errors.name.message}</small>}

          <select {...register("role", { required: true })}>
            <option value="SEEKER">Job Seeker</option>
            <option value="EMPLOYER">Employer</option>
          </select>

          <input
            placeholder="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" }
            })}
            aria-invalid={!!errors.email}
          />
          {errors.email && <small className="err">{errors.email.message}</small>}

          <input
            placeholder="Password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" }
            })}
            aria-invalid={!!errors.password}
          />
          {errors.password && <small className="err">{errors.password.message}</small>}

          <button className="btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
