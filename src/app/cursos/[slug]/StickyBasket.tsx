"use client";

import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import styles from "./StickyBasket.module.css";

interface StickyBasketProps {
  onBuy: () => void;
  hasPurchased: boolean;
  visibleThreshold?: number;
  courseId: string;
  coursePrice: number;
}

export default function StickyBasket({
  onBuy,
  hasPurchased,
  visibleThreshold = 400,
}: StickyBasketProps) {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check viewport width on mount and on window resize
  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Toggle visibility based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.pageYOffset > visibleThreshold);
    };
    window.addEventListener("scroll", handleScroll);
    // Initial check
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
