"use client";

import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-base-url";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/admin/logout`, { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
    >
      Log out
    </button>
  );
}
