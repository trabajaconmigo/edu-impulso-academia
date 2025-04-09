"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import styles from "./Navbar.module.css";

interface ProfileData {
  full_name?: string;
  profile_img?: string | null;  // stored in "profiles" table
}

interface EduNavbarUser {
  email?: string | null;
  name?: string;   // e.g. from full_name or fallback
  photo?: string;  // final photo url
  // Additional fields if desired
}

export default function EduNavbar() {
  const router = useRouter();

  const [user, setUser] = useState<EduNavbarUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the drawer if clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // On mount, check the session + fetch profile
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session) {
        const userEmail = session.user.email || "";
        const userId = session.user.id;
        // Check the 'profiles' table
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, profile_img")
          .eq("user_id", userId)
          .single();

        // Decide final name
        let displayName = userEmail;
        let photoUrl = "/favicon.ico"; // fallback
        if (!error && profile) {
          if (profile.full_name) {
            displayName = profile.full_name;
          }
          if (profile.profile_img) {
            photoUrl = profile.profile_img;
          }
        }

        // If user logged in via Google, session.user.user_metadata may hold a picture:
        const googlePic =
          session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
        if (googlePic) {
          photoUrl = googlePic;
        }

        setUser({
          email: userEmail,
          name: displayName,
          photo: photoUrl,
        });
      } else {
        setUser(null);
      }
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className={styles.eduNavbar}>
      {/* Left side: logo */}
      <div className={styles.navLeft}>
        <Link href="/" className={styles.logo}>
          EDU IMPULSO
        </Link>
      </div>

      {/* Center links */}
      <div className={styles.navCenter}>
        <Link href="/cursos" className={styles.centerLink}>
          Cursos
        </Link>
        <Link href="/concejos" className={styles.centerLink}>
          Concejos
        </Link>
      </div>

      {/* Right side: user stuff or login */}
      <div className={styles.navRight}>
        {user ? (
          // Logged in => show profile image & hamburger for mobile
          <>
            {/* Desktop user image (clickable) */}
            <button
              className={styles.profileBtn}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Abrir menú de usuario"
            >
              <img
                src={user.photo || "/favicon.ico"}
                alt="Foto de perfil"
                className={styles.profileImage}
              />
            </button>
            {/* Mobile hamburger (if you want them separate, or unify in one icon) */}
            <button
              className={styles.mobileMenuIcon}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </>
        ) : (
          // Not logged => show Iniciar Sesion link
          <>
            <Link href="/auth/login" className={styles.loginButton}>
              Iniciar Sesión
            </Link>
            {/* Mobile hamburger if needed */}
            <button
              className={styles.mobileMenuIcon}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </>
        )}
      </div>

      {/* Right drawer overlay */}
      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)}>
          <div
            className={styles.drawer}
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              {user ? (
                <>
                  <img
                    src={user.photo || "/favicon.ico"}
                    alt="Avatar"
                    className={styles.drawerProfilePic}
                  />
                  <span className={styles.drawerUsername}>
                    {user.name || user.email}
                  </span>
                </>
              ) : (
                <span className={styles.drawerUsername}>Menú</span>
              )}
              <button
                className={styles.drawerCloseBtn}
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.drawerMenu}>
              {/* Middle links in the drawer */}
              <Link
                href="/cursos"
                className={styles.drawerItem}
                onClick={() => setMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link
                href="/concejos"
                className={styles.drawerItem}
                onClick={() => setMenuOpen(false)}
              >
                Concejos
              </Link>
              <hr className={styles.drawerDivider} />
              {user ? (
                <>
                  {/* Link to user profile => /perfil */}
                  <Link
                    href="/perfil"
                    className={styles.drawerItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUser className={styles.drawerIcon} />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={styles.drawerItem}
                  >
                    <FaSignOutAlt className={styles.drawerIcon} />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={styles.drawerItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaSignInAlt className={styles.drawerIcon} />
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    className={styles.drawerItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaUserPlus className={styles.drawerIcon} />
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
