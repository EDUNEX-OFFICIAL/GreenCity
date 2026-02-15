import { Suspense } from "react";
export const dynamic = "force-dynamic";
import AdminClient from "./client";

export default function SetupAdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminClient />
    </Suspense>
  );
}
