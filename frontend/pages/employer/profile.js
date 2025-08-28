import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api, { loadAuth } from "../../lib/api";
import { useToast } from "../../components/ToastProvider";

export default function EmployerProfile(){
  const { register, handleSubmit, setValue, watch } = useForm();
  const [logo, setLogo] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    if (!loadAuth()) return;
    api.get("/companies/me").then(({data}) => {
      const c = data.company;
      if (!c) return;
      // prefill inputs
      ["name","website","contact_email","contact_phone","logo_url"].forEach(k => setValue(k, c[k] ?? ""));
      setLogo(c.logo_url || null);
    });
  }, [setValue]);

  async function onSubmit(values){
    const { data } = await api.post("/companies", values);
    push("Profile saved", "success");
    if (data.company?.logo_url) setLogo(data.company.logo_url);
  }

  async function uploadLogo(e){
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { push("Only images allowed", "error"); return; }
    if (file.size > 10 * 1024 * 1024) { push("Max 10MB", "error"); return; }
    const fd = new FormData();
    fd.append("logo", file);
    await api.post("/companies/logo", fd, { headers: { "Content-Type":"multipart/form-data" }});
    push("Logo uploaded", "success");
    // re-fetch to get new URL
    const { data } = await api.get("/companies/me");
    setLogo(data.company?.logo_url || null);
  }

  const name = watch("name");

  return (
    <div className="card">
      <h2>Employer Profile</h2>

      <div className="row" style={{alignItems:"flex-start"}}>
        <div style={{width:120}}>
          <div style={{width:120,height:120,border:"1px solid #eee",borderRadius:12,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",background:"#fafafa"}}>
            {logo
              ? <img src={`http://localhost:3001${logo}`} alt="logo" style={{maxWidth:"100%",maxHeight:"100%"}}/>
              : <span style={{color:"#999"}}>No logo</span>}
          </div>
          <label className="link-like" style={{display:"block",marginTop:8}}>
            Upload logo
            <input type="file" accept="image/*" onChange={uploadLogo} style={{display:"none"}} />
          </label>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{flex:1}}>
          <input placeholder="Company name" {...register("name", {required:true})}/>
          <input placeholder="Website (https://…)" {...register("website")} />
          <input placeholder="Contact email" type="email" {...register("contact_email")} />
          <input placeholder="Contact phone" {...register("contact_phone")} />
          <div className="row" style={{marginTop:8}}>
            <button>Save</button>
            <span className="badge">{name ? name : "Company"}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
