"use client"

import { Company } from "@/services/company.api"
import CompanyActions from "./CompanyActions"

export default function CompanyTable({ companies, onUpdate }: { companies: Company[], onUpdate: () => void }) {
  return (

    <div className="border border-border rounded-lg bg-card  shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary/40 text-muted-foreground font-medium border-b border-border">
          <tr>
            <th className="px-6 py-4 rounded-tl-lg font-semibold text-xs uppercase tracking-wider">Company Name</th>
            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Plan</th>
            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Created At</th>
            <th className="px-6 py-4 text-right rounded-tr-lg font-semibold text-xs uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.map((company) => (
            <tr key={company.id} className={`hover:bg-muted/30 transition-colors group ${
              company.status === 'deleted' ? 'opacity-50 grayscale bg-muted/30' : ''
            }`}>
              <td className="px-6 py-4">
                <div className="font-semibold text-foreground text-sm">{company.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{company.slug}</div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 text-xs font-medium capitalize">
                  {company.plan}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  company.status === 'active' 
                    ? "bg-success/15 text-success" 
                    : company.status === 'suspended'
                    ? "bg-warning/15 text-warning"
                    : "bg-destructive/15 text-destructive"
                }`}>
                  {company.status}
                </span>
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-muted-foreground text-sm">
                {new Date(company.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}
              </td>
              <td className="px-6 py-4 text-right">
                <CompanyActions company={company} onUpdate={onUpdate} />
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
             <tr>
               <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                 No companies found. Create one to get started.
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
