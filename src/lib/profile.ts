import { useEffect, useState } from "react";

const KEY = "prodlog.displayName";

export function getDisplayName(): string {
  if (typeof window === "undefined") return "there";
  return localStorage.getItem(KEY) || "there";
}

export function setDisplayName(name: string) {
  const trimmed = name.trim();
  if (trimmed) localStorage.setItem(KEY, trimmed);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("prodlog:displayName"));
}

export function useDisplayName(): string {
  const [name, setName] = useState(getDisplayName);
  useEffect(() => {
    const update = () => setName(getDisplayName());
    window.addEventListener("prodlog:displayName", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("prodlog:displayName", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return name;
}
