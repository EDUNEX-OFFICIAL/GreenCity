"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  FileText,
  Scale,
  Wallet,
  Briefcase,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOnboardingData } from "@/services/onboarding.api";

// Corrected Routes & IDs
const STEPS = [
  {
    id: "general",
    label: "General Info",
    route: "/setup/general-info",
    icon: LayoutGrid,
  },
  {
    id: "additionalInfo",
    label: "Additional Info",
    route: "/setup/additional-info",
    icon: FileText,
  },
  {
    id: "legalInfo",
    label: "Legal Info",
    route: "/setup/legal-info",
    icon: Scale,
  },
  {
    id: "accounting",
    label: "Accounting Configuration",
    route: "/setup/accounting-configuration",
    icon: Wallet,
  },
  {
    id: "branchDraft",
    label: "Branch Info",
    route: "/setup/branch-info",
    icon: Briefcase,
  },
];

export default function SetupStepIndicator({
  className,
}: {
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const data = await getOnboardingData();
        const steps = data.settings?.settingsJson?.completedSteps || {};
        setCompletedSteps(steps);

        // --- NAVIGATION GUARD ---
        const currentIndex = STEPS.findIndex((s) =>
          pathname.startsWith(s.route),
        );
        if (currentIndex > 0) {
          // Check if any previous step is NOT completed
          for (let i = 0; i < currentIndex; i++) {
            if (!steps[STEPS[i].id]) {
              // Lock found! Redirect to the first incomplete step or current
              // But we only redirect if we are NOT on that step.
              // Actually, if we are at index 3 and index 1 is incomplete, go back to 1.
              router.replace(STEPS[i].route);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch step status", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [pathname, router]);

  const getStepStatus = (step: (typeof STEPS)[0], index: number) => {
    const isCurrent = pathname.startsWith(step.route);
    const isCompleted = completedSteps[step.id];

    if (index === 0) {
      if (isCurrent) return "current";
      return isCompleted ? "completed" : "pending";
    }

    const prevStep = STEPS[index - 1];
    const prevCompleted = completedSteps[prevStep.id];

    if (isCurrent) return "current";
    if (isCompleted) return "completed";
    if (prevCompleted) return "pending";

    return "locked";
  };

  const handleStepClick = (step: (typeof STEPS)[0], status: string) => {
    if (status === "locked") {
      alert("Please complete previous steps first!");
      return;
    }
    router.push(step.route);
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full bg-white border-r border-gray-200",
        className,
      )}
    >
      {/* Header */}
      <div className="p-6">
        <p className="text-sm text-gray-500 mt-1">Setup Wizard</p>
        {loading && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Syncing...
          </p>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step, index);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => handleStepClick(step, status)}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors cursor-pointer",
                // Styles based on status
                status === "current" && "bg-blue-50 text-blue-600",
                status === "completed" && "text-green-600 hover:bg-green-50",
                status === "pending" && "text-gray-700 hover:bg-gray-50",
                status === "locked" &&
                  "text-gray-400 cursor-not-allowed opacity-70",
              )}
            >
              {status === "completed" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Icon
                  className={cn(
                    "size-5",
                    status === "current" ? "text-blue-600" : "text-gray-400",
                  )}
                />
              )}

              <span className="flex-1">{step.label}</span>

              {status === "locked" && <Lock className="size-3 text-gray-300" />}
            </div>
          );
        })}
      </nav>

      {/* Footer / User Profile (Desktop) */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {/* Placeholder Avatar */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=JAnderson"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-gray-900 truncate">
              J. Anderson
            </span>
            <span className="text-xs text-blue-600 truncate">Root Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
