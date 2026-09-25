import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/nav/app-sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TopBar } from "@/components/nav/top-bar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Never trust getSession() for authorization: getUser() re-validates the
  // token against the Auth server. This is a deliberate second check on top
  // of the proxy, so every protected page is safe even if reached directly.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const fullName = profile?.full_name ?? user.email ?? "";

  return (
    <div className="flex min-h-screen">
      <div className="app-chrome print:hidden">
        <AppSidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="app-chrome print:hidden">
          <TopBar fullName={fullName} />
        </div>
        <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-8 md:pb-6 print:px-0 print:pb-0 print:pt-0">
          {children}
        </main>
      </div>
      <div className="app-chrome print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
