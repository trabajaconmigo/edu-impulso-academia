// app/auth/register/page.tsx
"use client";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styles from "../AuthForms.module.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    // 1. Create the user in Supabase auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (!data.user) {
      setErrorMsg("No se pudo crear el usuario.");
      return;
    }

    // 2. Create a profile row if needed
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: data.user.id,
      full_name: fullName,
    });

    if (profileError) {
      setErrorMsg(profileError.message);
      return;
    }

    // 3. Redirect
    router.push("/perfil");
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>
        <h1>Crear Cuenta</h1>

        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

        <form onSubmit={handleRegister} className={styles.formContainer}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
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
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
