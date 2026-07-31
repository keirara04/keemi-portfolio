"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENTITY_CONFIGS, ENTITY_ORDER } from "./content/entity-configs";
import { LogoutButton } from "./logout-button";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-md px-3 py-1.5 text-sm transition ${
        active
          ? "bg-sky-100 font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col justify-between border-r border-zinc-200 bg-white px-3 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <p className="mb-3 px-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin</p>

        <nav className="flex flex-col gap-0.5">
          <NavLink href="/admin/contact" label="Contact" active={pathname === "/admin/contact"} />

          <p className="mt-3 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Content
          </p>
          <NavLink
            href="/admin/content/profile"
            label="Profile"
            active={pathname === "/admin/content/profile"}
          />
          {ENTITY_ORDER.map((key) => {
            const href = `/admin/content/${key}`;
            return (
              <NavLink
                key={key}
                href={href}
                label={ENTITY_CONFIGS[key].label}
                active={pathname.startsWith(href)}
              />
            );
          })}
        </nav>
      </div>

      <LogoutButton />
    </aside>
  );
}
