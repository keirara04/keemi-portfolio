import { matchProfile } from "@/lib/invoice";
import { getEzzyDefaults, getHakeemiDefaults } from "@/lib/invoice-defaults";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const password = request.headers.get("x-invoice-password");
  if (!password) {
    return Response.json({ error: "Missing password" }, { status: 401 });
  }

  let profile: ReturnType<typeof matchProfile>;
  try {
    profile = matchProfile(password);
  } catch (error) {
    console.error("Invoice password check failed:", error);
    return Response.json({ error: "Invoice tool is not configured" }, { status: 500 });
  }

  if (!profile) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  if (profile === "hakeemi") {
    return Response.json({ profile, defaults: getHakeemiDefaults() });
  }

  return Response.json({ profile, defaults: getEzzyDefaults() });
}
