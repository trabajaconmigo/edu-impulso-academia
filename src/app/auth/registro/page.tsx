"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (!data.user) {
      setErrorMsg("No se pudo crear el usuario.");
      return;
    }

    // 2. Optionally create a profile row
    //    If your `profiles` table references auth.users.id
    //    Then set user_id = data.user.id
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: data.user.id,
        full_name: fullName,
      });

    if (profileError) {
      setErrorMsg(profileError.message);
      return;
    }

    // 3. Redirect to profile page or wherever
    router.push("/perfil");
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "2rem" }}>
      <h1>Crear Cuenta</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}
