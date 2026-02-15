import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-xl font-bold">GC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">GreenCity Enterprise</h1>
          <p className="text-sm text-muted-foreground">
            Secure Unified Management Platform
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-xl backdrop-blur-sm ring-1 ring-border">
          <div className="space-y-6">
            <div className="rounded-lg bg-secondary/50 p-4 border border-input text-center">
              <div className="flex justify-center mb-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Restricted Access</p>
              <p className="text-xs text-muted-foreground mt-1">
                Authorized personnel only. Please proceed to the dashboard to authenticate.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">System Status</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-md bg-yellow-500/10 px-3 py-2 text-xs font-medium text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              Under Development
            </div>
          </div>
        </div>

        <p className="px-8 text-center text-xs text-muted-foreground">
          &copy; 2026 GreenCity Inc. <br/> Protected by enterprise-grade security.
        </p>
      </div>
    </div>
  );
}
