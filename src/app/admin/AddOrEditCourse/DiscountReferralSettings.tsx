/* --------------------------------------------------------------------
   src/app/admin/DiscountReferralSettings.tsx
   ------------------------------------------------------------------ */
"use client";

import React, { ChangeEvent } from "react";
import styles from "./styles/AddOrEditCourse.module.css";

interface Props {
  course: any;
  onChange: (name: string, value: any) => void;
}

export default function DiscountReferralSettings({ course, onChange }: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Descuento & Referral</h2>
      <div className={styles.fieldRow}>
        <div className={styles.fieldCol}>
          <label>% Descuento</label>
          <input
            type="number"
            name="discount_percentage"
            min={0}
            max={100}
            value={course.discount_percentage}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange("discount_percentage", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className={styles.fieldCol}>
          <label>Descuento activo</label>
          <input
            type="checkbox"
            name="discount_active"
            checked={course.discount_active}
            onChange={e => onChange("discount_active", e.target.checked)}
          />
        </div>
        <div className={styles.fieldCol}>
          <label>Vence (fecha y hora)</label>
          <input
            type="datetime-local"
            name="expires_at"
            value={course.expires_at || ""}
            onChange={e => onChange("expires_at", e.target.value)}
          />
          <small style={{ color: "#666" }}>
            Dejar vacío si no quieres un temporizador.
          </small>
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.fieldCol}>
          <label>Referral habilitado</label>
          <input
            type="checkbox"
            name="referral_enabled"
            checked={course.referral_enabled}
            onChange={e => onChange("referral_enabled", e.target.checked)}
          />
        </div>
        <div className={styles.fieldCol}>
          <label>50% precio con referral</label>
          <input
            type="checkbox"
            name="referral_half_price"
            checked={course.referral_half_price}
            onChange={e => onChange("referral_half_price", e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}
