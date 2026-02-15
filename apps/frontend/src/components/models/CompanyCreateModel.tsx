"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { CreateCompanyInput } from "@/services/company.api"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCompanyInput) => void
  loading?: boolean
}

// Initial State helper
const initialFormState: CreateCompanyInput = {
  companyInfo: {
    companyName: "",
    email: "",
    mobileNumber: "",
    country: "India",
    state: "",
    district: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
  },
  rootAdmin: {
    fullName: "",
    email: "",
    mobileNumber: "",
    username: "",
    password: "",
  },
  subscription: {
    plan: "free",
    conversionId: "",
    betaMode: false,
  },
}

export default function CompanyCreateModel({ isOpen, onClose, onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<CreateCompanyInput>(initialFormState)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle Input Changes
  const handleNestedChange = (
    section: keyof CreateCompanyInput,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
    // Clear error for this field on change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (currentStep === 1) {
      if (!formData.companyInfo.companyName.trim()) newErrors.companyName = "Company Name is required"
      if (!formData.companyInfo.email.trim()) {
        newErrors.companyEmail = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyInfo.email)) {
        newErrors.companyEmail = "Invalid email format"
      }
      if (!formData.companyInfo.mobileNumber.trim()) {
        newErrors.companyMobile = "Mobile Number is required"
      } else if (!/^\d{10,15}$/.test(formData.companyInfo.mobileNumber)) {
        newErrors.companyMobile = "Invalid mobile number (10-15 digits)"
      }
      if (!formData.companyInfo.country.trim()) newErrors.country = "Country is required"
      if (!formData.companyInfo.state.trim()) newErrors.state = "State is required"
      if (!formData.companyInfo.district.trim()) newErrors.district = "District is required"
      if (!formData.companyInfo.postalCode.trim()) newErrors.postalCode = "Postal Code is required"
    }

    if (currentStep === 2) {
      if (!formData.rootAdmin.fullName.trim()) newErrors.adminName = "Full Name is required"
      if (!formData.rootAdmin.email.trim()) {
        newErrors.adminEmail = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.rootAdmin.email)) {
        newErrors.adminEmail = "Invalid email format"
      }
      if (!formData.rootAdmin.mobileNumber.trim()) newErrors.adminMobile = "Mobile Number is required"
      if (!formData.rootAdmin.username.trim()) newErrors.username = "Username is required"
      if (!formData.rootAdmin.password) {
        newErrors.password = "Password is required"
      } else if (formData.rootAdmin.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }
    }

    if (currentStep === 3) {
      if (!formData.subscription.conversionId.trim()) newErrors.conversionId = "Conversion ID is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      isValid = false
    }

    return isValid
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(3)) {
      onSubmit(formData)
    }
  }

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState)
      setStep(1)
      setErrors({})
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-background rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold">Add New Company</h2>
                <p className="text-sm text-muted-foreground">
                  Step {step} of 3: {step === 1 ? "Company Details" : step === 2 ? "Root Admin" : "Subscription"}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-secondary rounded-full transition-colors disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* STEP 1: Company Info */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Company Name" 
                    value={formData.companyInfo.companyName} 
                    onChange={(v) => handleNestedChange("companyInfo", "companyName", v)} 
                    error={errors.companyName}
                    placeholder="e.g. Acme Corp"
                    required 
                  />
                  <InputField 
                    label="Email" 
                    type="email" 
                    value={formData.companyInfo.email} 
                    onChange={(v) => handleNestedChange("companyInfo", "email", v)} 
                    error={errors.companyEmail}
                    placeholder="company@example.com"
                    required 
                  />
                  <InputField 
                    label="Mobile Number" 
                    value={formData.companyInfo.mobileNumber} 
                    onChange={(v) => handleNestedChange("companyInfo", "mobileNumber", v)} 
                    error={errors.companyMobile}
                    placeholder="+91 9876543210"
                    required 
                  />
                  <InputField 
                    label="Country" 
                    value={formData.companyInfo.country} 
                    onChange={(v) => handleNestedChange("companyInfo", "country", v)} 
                    error={errors.country}
                    placeholder="e.g. India"
                    required 
                  />
                  <InputField 
                    label="State" 
                    value={formData.companyInfo.state} 
                    onChange={(v) => handleNestedChange("companyInfo", "state", v)} 
                    error={errors.state}
                    placeholder="e.g. Maharashtra"
                    required 
                  />
                  <InputField 
                    label="District" 
                    value={formData.companyInfo.district} 
                    onChange={(v) => handleNestedChange("companyInfo", "district", v)} 
                    error={errors.district}
                    placeholder="e.g. Mumbai"
                    required 
                  />
                  <InputField 
                    label="Postal Code" 
                    value={formData.companyInfo.postalCode} 
                    onChange={(v) => handleNestedChange("companyInfo", "postalCode", v)} 
                    error={errors.postalCode}
                    placeholder="e.g. 400001"
                    required 
                  />
                  <div className="md:col-span-2">
                    <InputField 
                      label="Address Line 1" 
                      value={formData.companyInfo.addressLine1 || ""} 
                      onChange={(v) => handleNestedChange("companyInfo", "addressLine1", v)} 
                      placeholder="Flat, House no., Building, Apartment, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <InputField 
                      label="Address Line 2" 
                      value={formData.companyInfo.addressLine2 || ""} 
                      onChange={(v) => handleNestedChange("companyInfo", "addressLine2", v)} 
                      placeholder="Area, Colony, Street, Sector, Village"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Root Admin */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Full Name" 
                    value={formData.rootAdmin.fullName} 
                    onChange={(v) => handleNestedChange("rootAdmin", "fullName", v)} 
                    error={errors.adminName}
                    placeholder="e.g. John Doe"
                    required 
                  />
                  <InputField 
                    label="Admin Email" 
                    type="email" 
                    value={formData.rootAdmin.email} 
                    onChange={(v) => handleNestedChange("rootAdmin", "email", v)} 
                    error={errors.adminEmail}
                    placeholder="admin@company.com"
                    required 
                  />
                  <InputField 
                    label="Admin Mobile" 
                    value={formData.rootAdmin.mobileNumber} 
                    onChange={(v) => handleNestedChange("rootAdmin", "mobileNumber", v)} 
                    error={errors.adminMobile}
                    placeholder="+91 9876543210"
                    required 
                  />
                  <InputField 
                    label="Username" 
                    value={formData.rootAdmin.username} 
                    onChange={(v) => handleNestedChange("rootAdmin", "username", v)} 
                    error={errors.username}
                    placeholder="johndoe"
                    required 
                  />
                  <InputField 
                    label="Password" 
                    type="password" 
                    value={formData.rootAdmin.password} 
                    onChange={(v) => handleNestedChange("rootAdmin", "password", v)} 
                    error={errors.password}
                    placeholder="••••••••"
                    required 
                  />
                </div>
              )}

              {/* STEP 3: Subscription */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Plan *</label>
                    <select
                      className="w-full h-10 px-3 rounded-md bg-secondary border border-transparent focus:border-primary outline-none transition-all"
                      value={formData.subscription.plan}
                      onChange={(e) => handleNestedChange("subscription", "plan", e.target.value)}
                    >
                      <option value="free">Free Tier</option>
                      <option value="pro">Pro Plan</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <InputField 
                    label="Conversion ID" 
                    value={formData.subscription.conversionId} 
                    onChange={(v) => handleNestedChange("subscription", "conversionId", v)} 
                    error={errors.conversionId}
                    placeholder="e.g. CONV-12345"
                    required 
                  />
                  <div className="flex items-center gap-2 pt-2">
                     <input 
                      type="checkbox" 
                      id="betaMode"
                      checked={formData.subscription.betaMode || false}
                      onChange={(e) => handleNestedChange("subscription", "betaMode", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                     />
                     <label htmlFor="betaMode" className="text-sm">Enable Beta Features</label>
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-between bg-muted/20 rounded-b-xl">
              {step > 1 ? (
                 <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm font-medium hover:text-primary" disabled={loading}>
                   Back
                 </button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <button 
                  onClick={handleNext} 
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Create Company
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function InputField({ label, value, onChange, type = "text", required, error, placeholder }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean, error?: string, placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase font-semibold text-muted-foreground mb-1.5 notification-dot">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 px-3 rounded-md bg-secondary/50 border focus:bg-background outline-none transition-all placeholder:text-muted-foreground/50 text-sm ${
          error ? "border-red-500 focus:border-red-500" : "border-transparent focus:border-primary"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
