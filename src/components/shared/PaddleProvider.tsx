"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

const PaddleContext = createContext<Paddle | null>(null);

export function usePaddle() {
  return useContext(PaddleContext);
}

export function PaddleProvider({ children }: { children: React.ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) return;

    const env = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox";
    console.log("[paddle] init", { env, token: token.slice(0, 8) + "..." });

    initializePaddle({
      token,
      environment: env,
      eventCallback: (event) => {
        console.log("[paddle] event", event.name, event);
      },
    }).then((instance) => {
      if (instance) {
        console.log("[paddle] SDK ready");
        setPaddle(instance);
      } else {
        console.error("[paddle] init returned null");
      }
    }).catch((err) => {
      console.error("[paddle] init error", err);
    });
  }, []);

  return (
    <PaddleContext.Provider value={paddle}>{children}</PaddleContext.Provider>
  );
}

/**
 * Hook to open Paddle checkout for a given price ID.
 * Accepts user email + user ID to pass as custom_data.
 */
export function usePaddleCheckout() {
  const paddle = usePaddle();

  const openCheckout = useCallback(
    ({
      priceId,
      email,
      userId,
      plan,
    }: {
      priceId: string;
      email: string;
      userId: string;
      plan: string;
    }) => {
      if (!paddle) {
        console.warn("[paddle] SDK not loaded yet");
        return;
      }

      const opts = {
        items: [{ priceId, quantity: 1 }],
        customer: { email },
        customData: { user_id: userId, plan },
      };
      console.log("[paddle] checkout.open", opts);
      paddle.Checkout.open(opts);
    },
    [paddle],
  );

  return { paddle, openCheckout };
}
