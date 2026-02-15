import { Suspense } from "react";
export const dynamic = "force-dynamic";
import AdditionalInfoClient from "./client";

export default function AdditionalInfoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AdditionalInfoClient />
    </Suspense>
  );
}
