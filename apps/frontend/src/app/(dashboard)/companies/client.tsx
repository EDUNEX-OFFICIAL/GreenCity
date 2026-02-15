"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { Company, listCompanies, createCompany, CreateCompanyInput } from "@/services/company.api"
import CompanyCreateModel from "@/components/models/CompanyCreateModel"
import CompanyTable from "@/components/CompanyTable"
import CompanyCard from "@/components/CompanyCard"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  // Fetch Companies
  const refreshData = async () => {
    try {
      setLoading(true)
      const data = await listCompanies()
      setCompanies(data)
    } catch (error) {
      console.error("Failed to load companies", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  // Handle Create Submit
  const handleCreate = async (payload: CreateCompanyInput) => {
    try {
      setCreateLoading(true)
      await createCompany(payload)
      
      // Success
      setIsModalOpen(false)
      refreshData() // Reload list
      alert("Company created successfully!") // TODO: Replace with Toast if available
    } catch (error: any) {
      alert(error.message || "Failed to create company")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground text-sm">Manage your tenant organizations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          Add Company
        </button>
      </div>

      {/* Filters / Search Bar (Placeholder) */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            placeholder="Search companies..." 
            className="w-full h-10 pl-9 pr-3 rounded-md bg-card border border-border focus:border-primary outline-none"
          />
        </div>
        <button className="h-10 w-10 flex items-center justify-center rounded-md border border-border bg-card hover:bg-secondary">
          <Filter className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm">Loading companies...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile/Tablet View (Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
             {companies.map(c => <CompanyCard key={c.id} company={c} onUpdate={refreshData} />)}
             {companies.length === 0 && <div className="col-span-full text-center py-10 text-muted-foreground">No companies found</div>}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden lg:block">
            <CompanyTable companies={companies} onUpdate={refreshData} />
          </div>
        </>
      )}

      {/* Create Modal */}
      <CompanyCreateModel 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        loading={createLoading}
      />
    </div>
  )
}
