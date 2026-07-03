"use client";

import { FormEvent, useState } from "react";

export default function StartPage() {
  const [pass, setPass] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass }),
    });

    if (res.ok) {
      setMessage("ok");
    } else {
      setMessage("error");
    }
  }

  return (
    <div className="mc-page">
      <form method="POST" onSubmit={submit}>
        <div>
          pass: <input name="pass" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        <button type="submit">ok</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}
