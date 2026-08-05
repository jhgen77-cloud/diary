"use client";

import { useSyncExternalStore } from "react";

function noopSubscribe() {
  return () => {};
}

/**
 * true only once the component has actually mounted on the client.
 * Safe for SSR (server snapshot is false, avoiding hydration mismatches),
 * and avoids the "setState inside an effect" pattern that the stricter
 * react-hooks rules flag.
 */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
