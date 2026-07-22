"use client";

import { useEffect, useRef } from "react";
import { SECRET_FOUND_KEY, matchesKonami } from "@/lib/easter-eggs";
import { showToast } from "./toast-host";

export function KonamiListener() {
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      bufferRef.current = [...bufferRef.current, e.key].slice(-10);
      if (matchesKonami(bufferRef.current)) {
        bufferRef.current = [];
        localStorage.setItem(SECRET_FOUND_KEY, "1");
        window.dispatchEvent(new CustomEvent(SECRET_FOUND_KEY));
        showToast("🎮 Konami code unlocked — check the Notes app for a surprise.");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
