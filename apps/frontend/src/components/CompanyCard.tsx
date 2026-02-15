"use client"

import { Company } from "@/services/company.api"
import CompanyActions from "./CompanyActions"
import { Calendar } from "lucide-react"

export default function CompanyCard({ company, onUpdate }: { company: Company, onUpdate: () => void }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/20 transition-colors space-y-3">
      <div className="flex items-start justify-between">
        <div>
           <div className="font-medium text-foreground text-base">{company.name}</div>
           <div className="text-xs text-muted-foreground">{company.slug}</div>
        </div>
        <CompanyActions company={company} onUpdate={onUpdate} />
      </div>
      
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium capitalize">
          {company.plan}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
            company.status === 'active' 
              ? "bg-success/15 text-success" 
              : company.status === 'suspended'
              ? "bg-warning/15 text-warning"
              : "bg-destructive/15 text-destructive"
          }`}>
          {company.status}
        </span>
      </div>

      <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="size-3" />
        <span>Created {new Date(company.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
