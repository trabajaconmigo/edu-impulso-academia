"use client";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // If you don't use 'data', just destructure error only
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/perfil");
    }
  }

  async function handleGoogleLogin() {
    setErrorMsg("");
    // If you don’t use data, rename it to _data or remove it
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/perfil",
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "2rem" }}>
      <h1>Iniciar Sesión</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={handleGoogleLogin}
          style={{ backgroundColor: "#4285F4", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 4 }}
        >
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}
