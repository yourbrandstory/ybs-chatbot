import { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: Props) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (pw === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem("ybs_admin", "true");
      onSuccess();
    } else {
      setErr("Incorrect password");
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-brand">
          TeamMap <em>by YBS</em>
        </h1>
        <p className="login-sub">Command centre — admin access</p>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        <button onClick={submit}>Enter</button>
        {err && <div className="login-err">{err}</div>}
        <Link to="/chat" className="login-back">
          ← Back to chatbot
        </Link>
      </div>
    </div>
  );
}
