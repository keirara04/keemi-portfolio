import { fetchAdminApi } from "@/lib/admin-api";

type ContactSubmission = {
  id: string;
  from_name: string;
  subject: string;
  body: string;
  email_status: "pending" | "sent" | "failed";
  created_at: string;
};

async function getSubmissions(): Promise<ContactSubmission[]> {
  const response = await fetchAdminApi("/admin/contact-submissions");
  if (!response.ok) return [];
  return response.json();
}

const STATUS_STYLES: Record<ContactSubmission["email_status"], string> = {
  sent: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300",
};

export default async function AdminContactPage() {
  const submissions = await getSubmissions();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Contact submissions
      </h1>

      {submissions.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {s.from_name} — {s.subject}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[s.email_status]}`}>
                  {s.email_status}
                </span>
              </div>
              <p className="mb-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                {s.body}
              </p>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {new Date(s.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
