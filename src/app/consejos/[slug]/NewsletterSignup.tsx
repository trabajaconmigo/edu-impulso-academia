'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './NewsletterSignup.module.css';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    const { error } = await supabase.from('newsletter').insert({ email });
    setSending(false);

    if (error) alert('Error guardando tu email 😔');
    else {
      setSent(true);
      setEmail('');
    }
  };

  return (
    <section className={styles.block}>
      {sent ? (
        <p>¡Gracias por suscribirte! 🎉</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            <span>¿Quieres más consejos en tu correo?</span>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={sending}
            />
          </label>
          <button disabled={sending}>Suscribirme</button>
        </form>
      )}
    </section>
  );
}
