"use client";

import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import styles from "./StickyBasket.module.css";

interface StickyBasketProps {
  onBuy: () => void;
  hasPurchased: boolean;
  visibleThreshold?: number;
}

export default function StickyBasket({
  onBuy,
  hasPurchased,
  visibleThreshold = 400,
}: StickyBasketProps) {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Determine if current viewport is mobile (<768px)
  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Listen to scroll events to toggle visibility
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.pageYOffset > visibleThreshold);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleThreshold]);

  if (!isMobile || hasPurchased) return null;

  return (
    <button
      className={`${styles.stickyBasket} ${visible ? styles.visible : ""}`}
      onClick={onBuy}
      aria-label="Comprar curso"
    >
      <FaShoppingCart className={styles.cartIcon} />
    </button>
  );
}
