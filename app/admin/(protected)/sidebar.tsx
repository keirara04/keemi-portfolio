"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  User,
  Gauge,
  Sparkles,
  Heart,
  Folder,
  GraduationCap,
  StickyNote,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ENTITY_CONFIGS, ENTITY_ORDER } from "./content/entity-configs";
import { LogoutButton } from "./logout-button";

const ENTITY_ICONS: Record<string, LucideIcon> = {
  specs: Gauge,
  "skill-groups": Sparkles,
  interests: Heart,
  projects: Folder,
  "school-reports": GraduationCap,
  notes: StickyNote,
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition ${
        active
          ? "bg-sky-100 font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r border-zinc-200 bg-white px-3 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="mb-4 flex items-center gap-2.5 px-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin</p>
            <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">keemi-portfolio</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <NavLink
            href="/admin"
            label="Dashboard"
            icon={LayoutDashboard}
            active={pathname === "/admin"}
          />
          <NavLink
            href="/admin/contact"
            label="Contact Submissions"
            icon={Mail}
            active={pathname === "/admin/contact"}
          />

          <p className="mt-3 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Content
          </p>
          <NavLink
            href="/admin/content/profile"
            label="Profile"
            icon={User}
            active={pathname === "/admin/content/profile"}
          />
          {ENTITY_ORDER.map((key) => {
            const href = `/admin/content/${key}`;
            return (
              <NavLink
                key={key}
                href={href}
                label={ENTITY_CONFIGS[key].label}
                icon={ENTITY_ICONS[key] ?? Folder}
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
