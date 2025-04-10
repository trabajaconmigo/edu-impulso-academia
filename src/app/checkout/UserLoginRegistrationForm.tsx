"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./UserLoginRegistrationForm.module.css";

interface UserLoginRegistrationFormProps {
  onLoginSuccess: () => void;
  courseId: string;
  amount: number;
}

export default function UserLoginRegistrationForm({
  onLoginSuccess,
  courseId,
  amount,
}: UserLoginRegistrationFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let result;
      if (isRegister) {
        // Create new account
        result = await supabase.auth.signUp({ email, password });
      } else {
        // Sign in
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        setErrorMsg(result.error.message || "Error en la autenticación");
        setLoading(false);
        return;
      }

      // Check if user has session
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setErrorMsg("No se encontró sesión después de login/registro.");
        setLoading(false);
        return;
      }

      // Login success
      onLoginSuccess();
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("Error en la autenticación");
    }
    setLoading(false);
  }

  return (
    <div className={styles.loginBox}>
      <h2 className={styles.formTitle}>
        {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
      </h2>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <label>
          Correo Electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        <button type="submit" disabled={loading} className={styles.formButton}>
          {loading
            ? "Procesando..."
            : isRegister
            ? "Crear Cuenta y Continuar"
            : "Iniciar Sesión y Continuar"}
        </button>
      </form>

      <div className={styles.toggleRegister}>
        {isRegister ? (
          <p>
            ¿Ya tienes cuenta?{" "}
            <button onClick={() => setIsRegister(false)}>Inicia Sesión</button>
          </p>
        ) : (
          <p>
            ¿No tienes cuenta?{" "}
            <button onClick={() => setIsRegister(true)}>Crea una aquí</button>
          </p>
        )}
      </div>

      <p className={styles.infoText}>
        Después de iniciar sesión o registrarte,
        podrás completar tu compra de <strong>${amount.toFixed(2)}</strong>.
      </p>
    </div>
  );
}
