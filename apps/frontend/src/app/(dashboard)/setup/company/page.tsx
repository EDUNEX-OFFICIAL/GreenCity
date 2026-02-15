import { Suspense } from "react";
export const dynamic = "force-dynamic";
import CompanyClient from "./client";

export default function SetupCompanyPage() {
  return (
    <Suspense fallback={null}>
      <CompanyClient />
    </Suspense>
  );
}
