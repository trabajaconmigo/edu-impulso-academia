"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import styles from "./Navbar.module.css";

interface ProfileData {
  full_name?: string;
  profile_img?: string | null; // from "profiles" table
}

interface EduNavbarUser {
  email?: string | null;
  name?: string; // e.g. from full_name or fallback to email
  photo?: string; // final photo url
}

export default function EduNavbar() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<EduNavbarUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // toggles the sidebar

  // On mount => check session + fetch profile
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session) {
        const userEmail = session.user.email || "";
        const userId = session.user.id;

        // check "profiles" table
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, profile_img")
          .eq("user_id", userId)
          .single();

        let displayName = userEmail;
        let photoUrl = "/favicon.ico"; // fallback if no image

        if (!error && profile) {
          if (profile.full_name) {
            displayName = profile.full_name;
          }
          if (profile.profile_img) {
            photoUrl = profile.profile_img;
          }
        }

        // if user logged in with Google, user_metadata might contain an avatar
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

  // close sidebar if user clicks outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

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

      {/* Center: "Cursos" & "Concejos" (hidden on mobile) */}
      <div className={styles.navCenter}>
        <Link href="/cursos" className={styles.centerLink}>
          Cursos
        </Link>
        <Link href="/concejos" className={styles.centerLink}>
          Concejos
        </Link>
      </div>

      {/* Right side */}
      <div className={styles.navRight}>
        {/* If user is not logged => "Iniciar Sesión" AND show hamburger */}
        {!user && (
          <>
            <Link href="/auth/login" className={styles.loginButton}>
              Iniciar Sesión
            </Link>
            {/* Only show hamburger on mobile if user not logged */}
            <button
              className={styles.mobileMenuIcon}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </>
        )}

        {/* If user is logged => show user image (toggles sidebar), no hamburger */}
        {user && (
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
        )}
      </div>

      {/* Right drawer overlay */}
      {menuOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setMenuOpen(false)}
        >
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
              {/* "Cursos" & "Concejos" in the drawer */}
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
                  {/* Link to /perfil */}
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
