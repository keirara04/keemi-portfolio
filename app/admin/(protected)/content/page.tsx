import Link from "next/link";
import { ENTITY_CONFIGS, ENTITY_ORDER } from "./entity-configs";

export default function ContentIndexPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Content</h1>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            href="/admin/content/profile"
            className="block rounded-lg border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-800 transition hover:border-sky-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            Profile
          </Link>
        </li>
        {ENTITY_ORDER.map((key) => (
          <li key={key}>
            <Link
              href={`/admin/content/${key}`}
              className="block rounded-lg border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-800 transition hover:border-sky-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {ENTITY_CONFIGS[key].label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
