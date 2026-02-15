import { Suspense } from "react";
export const dynamic = "force-dynamic";
import CompaniesClient from "./client";

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CompaniesClient />
    </Suspense>
  );
}
