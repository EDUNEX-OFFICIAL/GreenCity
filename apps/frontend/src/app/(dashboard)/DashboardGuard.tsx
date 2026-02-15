"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function DashboardGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const companyId = searchParams.get("companyId"); // Not actually used in the logic, but searchParams is called

  useEffect(() => {
    async function checkOnboarding() {
      // 0. Session Guard
      
      if (pathname === '/companies') {
          return;
      }

      try {
        // CALL WITHOUT HEADER -> Uses Session Cookie
        const res = await fetch("/api/onboarding/me", {
          credentials: "include", // Ensure cookie is sent
        });

        if (!res.ok) {
           // 401/400/404 -> No Active Session -> Redirect to Companies
           router.replace("/companies");
           return;
        }

        const data: {
          onboardingStatus: "pending" | "completed";
          status?: string; 
        } = await res.json();

        // UI invariant: Dashboard must never render for suspended or deleted companies.
        if (data.status && data.status !== 'active') {
             router.replace("/companies");
             return;
        }

        // 🔒 Redirect Rules
        if (data.onboardingStatus !== "completed") {
             if(!pathname.startsWith("/setup")) {
                router.replace(`/setup/general-info`); 
             }
             return;
        }

        if (pathname.startsWith("/setup")) {
            router.replace(`/dashboard`);
            return;
        }

      } catch (error) {
        console.error("Onboarding guard error:", error);
        // Fail safe
        router.replace("/companies"); 
      }
    }

    checkOnboarding();
  }, [pathname, router, searchParams]);

  return null;
}
