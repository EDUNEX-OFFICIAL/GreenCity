import { Suspense } from "react";
export const dynamic = "force-dynamic";
import GeneralInfoClient from "./client";

export default function GeneralInfoPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <GeneralInfoClient />
    </Suspense>
  );
}
