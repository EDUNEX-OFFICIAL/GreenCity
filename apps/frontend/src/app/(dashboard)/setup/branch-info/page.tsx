import { Suspense } from "react";
export const dynamic = "force-dynamic";
import BranchInfoClient from "./client";

export default function BranchInfoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <BranchInfoClient />
    </Suspense>
  );
}
