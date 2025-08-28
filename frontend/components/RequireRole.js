import { useEffect, useState } from "react";
import { getUser } from "../lib/auth";
import { loadAuth } from "../lib/api";
import { useRouter } from "next/router";
import { useToast } from "./ToastProvider";

export default function RequireRole({ role, children }){
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  useEffect(()=>{
    loadAuth();
    const u = getUser();
    if (!u){
      push("Please login", "info");
      router.replace("/login");
      return;
    }
    if (role && u.role !== role){
      push("Forbidden for your role", "error");
      router.replace("/");
      return;
    }
    setOk(true);
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  if (!ready) return <p>Loading…</p>;
  if (!ok) return null;
  return children;
}
