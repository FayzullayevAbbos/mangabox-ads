"use client";

import * as React from "react";

import { getPaymentMethods, type PaymentMethods } from "@/lib/api/ads";

let cached: Promise<PaymentMethods> | null = null;

function loadPaymentMethods(): Promise<PaymentMethods> {
  cached ??= getPaymentMethods().catch((err: unknown) => {
    cached = null;
    throw err;
  });
  return cached;
}

export type PaymentMethodsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; methods: PaymentMethods };

export function usePaymentMethods(enabled: boolean): PaymentMethodsState {
  const [state, setState] = React.useState<PaymentMethodsState>({
    status: "loading",
  });

  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadPaymentMethods()
      .then((methods) => alive && setState({ status: "ready", methods }))
      .catch(
        (err: unknown) =>
          alive &&
          setState({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          }),
      );
    return () => {
      alive = false;
    };
  }, [enabled]);

  return state;
}
