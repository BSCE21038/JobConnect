import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { registerToast } from "../lib/toast-bridge";

const ToastCtx = createContext({ push: () => {} });

export function useToast(){ return useContext(ToastCtx); }

export default function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type="info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  const value = useMemo(()=>({ push }),[push]);
useEffect(()=>{ registerToast((msg, type)=>push(msg, type)); }, [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
