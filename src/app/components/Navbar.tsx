"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  // If you want to store the user’s full name from the 'profiles' table:
  full_name?: string;
  email?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // On mount, check the session
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session) {
        // Example: get the user’s email from session
        const userEmail = session.user.email;
        
        // Option 1: Show email from session
        // setUser({ email: userEmail });

        // Option 2: Query the 'profiles' table for full_name
        // (only if you have a profiles table with user_id=auth.users.id)
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .single();
        if (!error && profile) {
          setUser({ full_name: profile.full_name, email: userEmail || "" });
        } else {
          // fallback
          setUser({ email: userEmail });
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link href="/" className={styles.logo}>
          EDU IMPULSO
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/cursos">Cursos</Link>
          <Link href="/concejos">Concejos</Link>
        </nav>
      </div>

      <div className={styles.navRight}>
        {user ? (
          <>
            {/* Show user’s name (or email) */}
            <span>
              {user.full_name ? user.full_name : user.email}
            </span>
            {/* Logout Button */}
            <button onClick={handleLogout} className={styles.loginButton}>
              Cerrar Sesión
            </button>
          </>
        ) : (
          /* If no user is logged in, show the login link */
          <Link href="/auth/login" className={styles.loginButton}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
}
