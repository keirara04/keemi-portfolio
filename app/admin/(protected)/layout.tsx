import { redirect } from "next/navigation";
import { isAdminSessionPresent } from "@/lib/admin-api";
import { Sidebar } from "./sidebar";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminSessionPresent())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
