import { Suspense } from "react";
export const dynamic = "force-dynamic";
import LegalInfoClient from "./client";

export default function LegalInfoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <LegalInfoClient />
    </Suspense>
  );
}
