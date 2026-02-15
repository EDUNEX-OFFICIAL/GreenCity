import { useRouter } from "next/navigation"
import { Eye, Ban, Trash2, PlayCircle, MoreHorizontal } from "lucide-react"
import { Company, selectCompany, suspendCompany, reactivateCompany, deleteCompany } from "@/services/company.api"
import { useState, useRef, useEffect } from "react"

// DEV MODE: lifecycle actions enabled until RBAC is implemented

type Props = {
  company: Company
  onUpdate?: () => void
}

export default function CompanyActions({ company, onUpdate }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleView = async () => {
      // UI safety: Suspended or deleted companies must never be navigable.
      if (company.status !== 'active') return;

      try {
          await selectCompany(company.id);
          // Navigate WITHOUT query param to force Session usage
          router.push('/dashboard'); 
      } catch (err) {
          console.error("Failed to select company", err);
          alert("Failed to select company. Please try again.");
      }
  };

  const handleSuspend = async () => {
    if (!confirm("⚠️ This will block ALL users from accessing this company.\n\nContinue suspending?")) return;
    
    try {
      setLoading(true);
      await suspendCompany(company.id);
      if (onUpdate) onUpdate();
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleReactivate = async () => {
    if (!confirm("Reactivate this company? Users will regain access.")) return;

    try {
      setLoading(true);
      await reactivateCompany(company.id);
      if (onUpdate) onUpdate();
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!confirm("⛔ DANGER: This cannot be undone (soft delete).\n\nAre you sure you want to delete this company?")) return;

    try {
      setLoading(true);
      await deleteCompany(company.id);
      if (onUpdate) onUpdate();
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (company.status === 'deleted') {
      return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
            <MoreHorizontal className="size-4" />
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50 py-1 bg-white dark:bg-zinc-950">
                {/* VIEW ACTION */}
                {company.status === 'active' && (
                    <button
                        onClick={handleView}
                        disabled={loading}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                        <Eye className="size-4 text-muted-foreground" /> View Dashboard
                    </button>
                )}

                {/* SUSPEND ACTION */}
                {company.status === 'active' && (
                   <button
                     onClick={handleSuspend}
                     disabled={loading}
                     className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-amber-50 text-amber-600 transition-colors text-left"
                   >
                     <Ban className="size-4" /> Suspend Company
                   </button>
                )}

                {/* REACTIVATE ACTION */}
                {company.status === 'suspended' && (
                   <button
                     onClick={handleReactivate}
                     disabled={loading}
                     className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-emerald-50 text-emerald-600 transition-colors text-left"
                   >
                     <PlayCircle className="size-4" /> Reactivate
                   </button>
                )}

                <div className="h-px bg-border my-1" />

                {/* DELETE ACTION */}
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors text-left"
                >
                  <Trash2 className="size-4" /> Delete Company
                </button>
            </div>
        )}
    </div>
  )
}
