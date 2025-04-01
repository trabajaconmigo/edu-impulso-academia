"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [discountPoints, setDiscountPoints] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      // 1. Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // not logged in, redirect to login
        router.push("/auth/login");
        return;
      }

      // 2. Get user profile from 'profiles' table
      const { user } = session;
      setUserEmail(user.email || null);

      // fetch the profiles row
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, discount_points")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name);
        setDiscountPoints(data.discount_points);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1>Perfil de Usuario</h1>
      {userEmail ? (
        <div>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Nombre Completo:</strong> {fullName ?? "N/A"}</p>
          <p><strong>Puntos de Descuento:</strong> {discountPoints}</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      ) : (
        <p>Cargando información...</p>
      )}
    </div>
  );
}
