"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api-base-url";

const FIELDS: { name: string; label: string; type: "text" | "textarea" }[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "short_name", label: "Short name", type: "text" },
  { name: "title", label: "Title", type: "text" },
  { name: "school", label: "School", type: "text" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "freelance_note", label: "Freelance note", type: "textarea" },
  { name: "email", label: "Email", type: "text" },
  { name: "whatsapp", label: "WhatsApp", type: "text" },
  { name: "github_url", label: "GitHub URL", type: "text" },
  { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
];

type ProfileRow = Record<string, string> & { id: string };

export default function ProfileEditorPage() {
  const [row, setRow] = useState<ProfileRow | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/profile`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((rows: ProfileRow[]) => {
        const first = rows[0] ?? null;
        setRow(first);
        if (first) {
          setValues(Object.fromEntries(FIELDS.map((f) => [f.name, first[f.name] ?? ""])));
        }
      })
      .catch(() => setLoadError(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return;
    setStatus("saving");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profile/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">Couldn&apos;t load profile.</p>;
  }

  if (!row) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                rows={4}
                className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            ) : (
              <input
                type="text"
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            )}
          </div>
        ))}

        {status === "error" && <p className="text-xs text-red-600 dark:text-red-400">Save failed.</p>}
        {status === "saved" && <p className="text-xs text-green-600 dark:text-green-400">Saved.</p>}

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-fit rounded-md bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
