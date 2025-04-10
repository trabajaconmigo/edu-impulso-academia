"use client";

import React, { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./UserLoginRegistrationForm.module.css";

interface UserLoginRegistrationFormProps {
  onLoginSuccess: () => void;
  courseId: string;    // we might pass it if we want to show final price
  amount: number;      // e.g. 200.00 => display only
}

export default function UserLoginRegistrationForm({
  onLoginSuccess,
  courseId,
  amount,
}: UserLoginRegistrationFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (isRegister && password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isRegister) {
        // Create new account
        result = await supabase.auth.signUp({ email, password });
      } else {
        // Sign in with email & password
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        setErrorMsg(result.error.message || "Error en la autenticación");
        setLoading(false);
        return;
      }

      // After success, check if the user truly has a session
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setErrorMsg("No se encontró sesión tras login/registro.");
        setLoading(false);
        return;
      }

      // user is now logged in
      onLoginSuccess();
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("Error en la autenticación.");
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setErrorMsg("");
    // We want to come right back to the same checkout page
    // so let's parse current location
    const currentUrl = window.location.href; // e.g. /checkout?courseId=xxx&amount=xxx
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: currentUrl },
    });
    if (error) {
      setErrorMsg(error.message);
    }
  }

  return (
    <div className={styles.loginBox}>
      <h2 className={styles.formTitle}>
        {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
      </h2>
      {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}

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

        {isRegister && (
          <label>
            Confirmar Contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className={styles.formButton}
        >
          {loading
            ? "Procesando..."
            : isRegister
            ? "Crear Cuenta"
            : "Iniciar Sesión"}
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
          {isRegister ? "Registrarse con Google" : "Iniciar sesión con Google"}
        </button>
      </div>

      <div className={styles.toggleRegister}>
        {isRegister ? (
          <p>
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => {
                setIsRegister(false);
                setErrorMsg("");
              }}
            >
              Inicia Sesión
            </button>
          </p>
        ) : (
          <p>
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => {
                setIsRegister(true);
                setErrorMsg("");
              }}
            >
              Crear una aquí
            </button>
          </p>
        )}
      </div>

      <p className={styles.infoText}>
        Después de iniciar sesión o registrarte,
        podrás completar tu compra de <strong>MX${amount.toFixed(2)}</strong>.
      </p>
    </div>
  );
}
