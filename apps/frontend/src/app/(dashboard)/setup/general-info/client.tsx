"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Added useSearchParams
import { Loader2, ArrowRight } from "lucide-react";
import {
  getOnboardingData,
  updateCompanyInfo,
  updateAdminInfo,
  updateSettings,
  CompanyProfileUpdate,
  OnboardingData,
} from "@/services/onboarding.api";
import VerifyButton from "@/components/onboarding/VerifyButton";
import { COUNTRIES, getStatesByCountry, getDistrictsByState } from "location";

// Define Admin State locally since it's not exported from the previous file
type AdminFormState = {
  id: string; // Needed for update
  fullName: string;
  email: string;
  mobile: string;
  username: string;
};

// --- VALIDATION HELPERS ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\+?[\d\s-]{10,}$/;

export default function GeneralInfoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Form States ---
  const [companyForm, setCompanyForm] = useState<CompanyProfileUpdate>({
    id: "",
    companyName: "",
    email: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India", // Default
    postalCode: "",
  });

  const [adminForm, setAdminForm] = useState<AdminFormState>({
    id: "",
    fullName: "",
    email: "",
    mobile: "",
    username: "",
  });

  // --- Load Data ---
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const data: OnboardingData = await getOnboardingData();

        if (!isMounted) return;

        if (data.companyProfile) {
          setCompanyForm({
            id: data.companyProfile.id,
            companyName: data.companyProfile.companyName || "",
            email: data.companyProfile.email || "",
            mobile: data.companyProfile.mobile || "",
            addressLine1: data.companyProfile.addressLine1 || "",
            addressLine2: data.companyProfile.addressLine2 || "",
            city: data.companyProfile.city || "",
            state: data.companyProfile.state || "",
            country: data.companyProfile.country || "India",
            postalCode: data.companyProfile.postalCode || "",
          });
        }

        if (data.admin) {
          setAdminForm({
            id: data.admin.id,
            fullName: data.admin.fullName || "",
            email: data.admin.email || "",
            mobile: data.admin.mobile || "",
            username: data.admin.username || "",
          });
        }
      } catch (err: any) {
        console.error("Failed to load onboarding data", err);
        if (isMounted)
          setError("Failed to load data. Please refresh the page.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Handlers ---
  const handleCompanyChange = (
    field: keyof CompanyProfileUpdate,
    value: string,
  ) => {
    setCompanyForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Hierarchy Reset Logic
      if (field === "country") {
        updated.state = "";
        updated.city = ""; // City is used as District in this structure
      } else if (field === "state") {
        updated.city = "";
      }

      return updated;
    });
  };

  const handleAdminChange = (field: keyof AdminFormState, value: string) => {
    setAdminForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      // 1. Validation
      if (!companyForm.companyName) throw new Error("Company Name is required");
      if (!EMAIL_REGEX.test(companyForm.email))
        throw new Error("Invalid Company Email format");
      if (!MOBILE_REGEX.test(companyForm.mobile))
        throw new Error("Invalid Company Mobile format");

      if (!companyForm.country) throw new Error("Country is required");
      if (!companyForm.state) throw new Error("State is required");
      if (!companyForm.city) throw new Error("District is required");
      if (!companyForm.postalCode) throw new Error("Postal Code is required");

      if (!adminForm.fullName) throw new Error("Admin Full Name is required");
      if (!EMAIL_REGEX.test(adminForm.email))
        throw new Error("Invalid Admin Email format");
      if (!MOBILE_REGEX.test(adminForm.mobile))
        throw new Error("Invalid Admin Mobile format");
      if (!adminForm.username) throw new Error("Username is required");

      // 2. Save Company
      await updateCompanyInfo(companyForm);

      // 3. Save Admin
      await updateAdminInfo(adminForm);

      // 4. Mark Step Complete
      await updateSettings({
        stepKey: "general",
        data: { completed: true },
      });

      // 5. Navigate
      router.push(`/setup/additional-info`);
    } catch (err: any) {
      console.error("Save failed", err);
      setError(err.message || "Failed to save information. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- Geographics ---
  const currentStates = getStatesByCountry(companyForm.country || "");
  const currentDistricts = getDistrictsByState(
    companyForm.country || "",
    companyForm.state || "",
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          General Information
        </h1>
        <p className="text-muted-foreground mt-2">
          Setup your organization profile and primary administrator details.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- SECTION 1: COMPANY --- */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🏢 Company Details
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Company Name"
              value={companyForm.companyName}
              onChange={(v) => handleCompanyChange("companyName", v)}
              required
              placeholder="e.g. Acme Corp"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Company Email <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) =>
                      handleCompanyChange("email", e.target.value)
                    }
                    placeholder="contact@company.com"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <VerifyButton
                  fieldId="company_email"
                  value={companyForm.email}
                  label="Company Email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Company Mobile <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={companyForm.mobile}
                    onChange={(e) =>
                      handleCompanyChange("mobile", e.target.value)
                    }
                    placeholder="+91 9876543210"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <VerifyButton
                  fieldId="company_mobile"
                  value={companyForm.mobile}
                  label="Company Mobile"
                />
              </div>
            </div>
          </div>

          {/* Address Subsection */}
          <div className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Address Line 1"
                  value={companyForm.addressLine1 || ""}
                  onChange={(v) => handleCompanyChange("addressLine1", v)}
                  placeholder="Flat, Building, Street"
                />
              </div>
              <div className="md:col-span-2">
                <InputField
                  label="Address Line 2"
                  value={companyForm.addressLine2 || ""}
                  onChange={(v) => handleCompanyChange("addressLine2", v)}
                  placeholder="Area, Landmark"
                />
              </div>

              <SelectField
                label="Country"
                value={companyForm.country || ""}
                onChange={(v) => handleCompanyChange("country", v)}
                options={COUNTRIES.map((c) => c.name)}
                required
              />

              <SelectField
                label="State"
                value={companyForm.state || ""}
                onChange={(v) => handleCompanyChange("state", v)}
                options={currentStates.map((s) => s.name)}
                disabled={!companyForm.country}
                required
                placeholder={
                  !companyForm.country ? "Select Country first" : "Select State"
                }
              />

              <SelectField
                label="District"
                value={companyForm.city || ""} // We map 'city' to 'district' in UI for now
                onChange={(v) => handleCompanyChange("city", v)}
                options={currentDistricts}
                disabled={!companyForm.state}
                required
                placeholder={
                  !companyForm.state ? "Select State first" : "Select District"
                }
              />

              <InputField
                label="Postal Code"
                value={companyForm.postalCode || ""}
                onChange={(v) => handleCompanyChange("postalCode", v)}
                required
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 2: ADMINISTRATOR --- */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              👤 Administrator Details
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              value={adminForm.fullName}
              onChange={(v) => handleAdminChange("fullName", v)}
              required
              placeholder="John Doe"
            />

            <InputField
              label="Admin Email"
              value={adminForm.email}
              onChange={(v) => handleAdminChange("email", v)}
              type="email"
              required
              placeholder="admin@company.com"
            />

            <InputField
              label="Admin Mobile"
              value={adminForm.mobile}
              onChange={(v) => handleAdminChange("mobile", v)}
              required
              placeholder="+91 9000000000"
            />

            <InputField
              label="Username"
              value={adminForm.username}
              onChange={(v) => handleAdminChange("username", v)}
              required
              placeholder="johndoe"
            />
          </div>
        </section>

        {/* --- ACTIONS --- */}
        <div className="flex items-center justify-end gap-4 pt-4 pb-20">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save & Continue
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable Input Component
function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

// Reusable Select Component
function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>
          {placeholder || "Select an option"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
