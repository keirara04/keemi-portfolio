import Link from "next/link";
import { Folder, Mail, GraduationCap, StickyNote, ExternalLink } from "lucide-react";
import { fetchAdminApi } from "@/lib/admin-api";

type Project = { id: string; name: string; tagline: string };
type ContactSubmission = {
  id: string;
  from_name: string;
  subject: string;
  email_status: "pending" | "sent" | "failed";
  created_at: string;
};
type Profile = {
  name: string;
  title: string;
  email: string;
  github_url: string;
  linkedin_url: string;
};

async function getJson<T>(path: string, fallback: T): Promise<T> {
  const response = await fetchAdminApi(path);
  if (!response.ok) return fallback;
  return response.json();
}

const STATUS_STYLES: Record<ContactSubmission["email_status"], string> = {
  sent: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300",
};

export default async function AdminDashboardPage() {
  const [projects, submissions, schoolReports, notes, profiles] = await Promise.all([
    getJson<Project[]>("/admin/projects", []),
    getJson<ContactSubmission[]>("/admin/contact-submissions", []),
    getJson<unknown[]>("/admin/school-reports", []),
    getJson<unknown[]>("/admin/notes", []),
    getJson<Profile[]>("/admin/profile", []),
  ]);

  const profile = profiles[0];

  const stats = [
    { label: "Total Projects", value: projects.length, icon: Folder },
    { label: "Contact Submissions", value: submissions.length, icon: Mail },
    { label: "School Reports", value: schoolReports.length, icon: GraduationCap },
    { label: "Notes", value: notes.length, icon: StickyNote },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Overview of your portfolio content.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Projects</h2>
            <Link
              href="/admin/content/projects"
              className="text-xs text-sky-600 hover:underline dark:text-sky-400"
            >
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No projects yet.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {projects.slice(0, 5).map((p) => (
                <li key={p.id} className="text-sm">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">{p.name}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{p.tagline}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Submissions
            </h2>
            <Link href="/admin/contact" className="text-xs text-sky-600 hover:underline dark:text-sky-400">
              View all
            </Link>
          </div>
          {submissions.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No submissions yet.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {submissions.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                      {s.from_name} — {s.subject}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[s.email_status]}`}
                  >
                    {s.email_status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-sky-600 p-4 text-white lg:col-span-1">
          {profile ? (
            <>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="mb-4 text-xs text-sky-100">{profile.title}</p>
              <div className="flex flex-col gap-2 text-xs">
                <span className="truncate">{profile.email}</span>
                <div className="flex gap-3 pt-1">
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-100 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> GitHub
                  </a>
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-100 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                </div>
              </div>
              <Link
                href="/admin/content/profile"
                className="mt-4 inline-block rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
              >
                Edit Profile
              </Link>
            </>
          ) : (
            <p className="text-sm text-sky-100">Profile not set up yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
