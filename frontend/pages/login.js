import { useEffect } from "react";
import api, { setAuth } from "../lib/api";
import { saveUser } from "../lib/auth";
import { useToast } from "../components/ToastProvider";

export default function LoginPage(){
  const { push } = useToast();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  async function onSubmit(e){
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email"); const password = form.get("password");
    const { data } = await api.post("/auth/login", { email, password });
    setAuth(data.tokens.access);
    localStorage.setItem("jc_refresh", data.tokens.refresh);
    saveUser(data.user);
    window.dispatchEvent(new Event("auth-changed"));
    push("Welcome!", "success");
    window.location.href = data.user.role === "EMPLOYER" ? "/employer" : "/seeker";
  }

  return (
    <div className="center-screen">
      <div className="card form-card">
        <h2>Login</h2>
        <form className="form-stack" onSubmit={onSubmit}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="btn-block">Login</button>
        </form>
      </div>
    </div>
  );
}
