"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "../AuthForms.module.css"; // Update path if needed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // Sign in using email & password
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      // Force full page reload so the Navbar immediately shows the logged in state.
      window.location.href = "/perfil";
    }
  }

  async function handleGoogleLogin() {
    setErrorMsg("");
    const redirectURL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/perfil"
        : "https://edu-impulso-academia.vercel.app/perfil";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectURL },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>
        <h1>Iniciar Sesión</h1>
        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

        <form onSubmit={handleLogin} className={styles.formContainer}>
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

          <button type="submit" className={styles.loginButton}>
            Ingresar
          </button>
        </form>

        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={handleGoogleLogin}
            style={{
              backgroundColor: "#4285F4",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </div>
  );
}
