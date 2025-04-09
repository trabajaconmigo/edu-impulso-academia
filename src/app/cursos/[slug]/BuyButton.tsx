// app/components/BuyButton.tsx
"use client";

import { useRouter } from "next/navigation";
import styles from "./BuyButton.module.css";
interface BuyButtonProps {
  course: {
    id: string;
    // Ensure you have a price property or calculate the amount some other way
    price: number; // price in dollars (or adjust accordingly)
  };
}

export default function BuyButton({ course }: BuyButtonProps) {
  const router = useRouter();

  const handleBuy = () => {
    // Convert price to cents if needed by your Stripe integration
    const amount = course.price * 100;
    // Redirect to the checkout page and pass courseId and amount as query parameters
    router.push(`/checkout?courseId=${course.id}&amount=${amount}`);
  };

  return <button className={styles.buyButton} onClick={handleBuy}>Comprar Curso</button>;
 
}
