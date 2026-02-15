import { Suspense } from "react";
export const dynamic = "force-dynamic";
import AccountingConfigurationClient from "./client";

export default function AccountingConfigurationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AccountingConfigurationClient />
    </Suspense>
  );
}
