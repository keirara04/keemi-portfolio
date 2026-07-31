import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "keemi_admin_session";

// Server-to-server calls (Server Components) go straight to the api
// container over the internal Docker network, bypassing Caddy.
const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://api:8000";

export async function fetchAdminApi(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  return fetch(`${INTERNAL_API_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      ...(session ? { Cookie: `${SESSION_COOKIE_NAME}=${session.value}` } : {}),
    },
    cache: "no-store",
  });
}

export async function isAdminSessionPresent(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE_NAME);
}
