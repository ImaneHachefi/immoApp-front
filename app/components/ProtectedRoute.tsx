"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getRole } from "../lib/auth";
import Sidebar from "./Sidebar";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    if (allowedRoles) {
      const role = getRole();
      if (!role || !allowedRoles.includes(role)) {
        router.push("/login");
        return;
      }
    }
    setOk(true);
  }, [router, allowedRoles]);

  if (!ok) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="ml-0 md:ml-[260px] flex-1 pt-[72px] md:pt-8 px-4 pb-6 md:px-8 min-h-screen transition-all">
        {children}
      </main>
    </div>
  );
}