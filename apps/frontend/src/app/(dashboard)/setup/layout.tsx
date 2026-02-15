"use client";

import SetupStepIndicator from "@/components/onboarding/SetupStepIndicator";
import { SetupProvider } from "@/context/SetupContext";

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SetupProvider>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 border-r border-border bg-card/50 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <SetupStepIndicator />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-background/50 flex flex-col w-full min-w-0">
          {/* Mobile Indicator - Sticky Top */}
          <div className="lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border shadow-sm">
            <div className="w-full overflow-x-auto no-scrollbar">
              <SetupStepIndicator className="flex-row p-2 border-0 h-auto bg-transparent" />
            </div>
          </div>

          <div className="flex-1 w-full max-w-full">{children}</div>
        </div>
      </div>
    </SetupProvider>
  );
}
