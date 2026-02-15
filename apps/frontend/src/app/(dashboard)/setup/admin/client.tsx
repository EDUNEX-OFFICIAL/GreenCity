"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupAdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/setup/general-info");
  }, [router]);
  return null;
}
