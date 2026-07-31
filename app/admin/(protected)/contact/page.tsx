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
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Contact Submissions
      </h1>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        View all messages sent through the portfolio contact form.
      </p>

      {submissions.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No submissions yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">From</th>
                <th className="px-4 py-2.5 font-medium">Subject</th>
                <th className="px-4 py-2.5 font-medium">Message</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {submissions.map((s) => (
                <tr key={s.id} className="bg-white dark:bg-zinc-900">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {s.from_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{s.subject}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {s.body}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[s.email_status]}`}
                    >
                      {s.email_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
