"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check } from "lucide-react";
import {
  getOnboardingData,
  updateSettings,
  completeOnboarding,
  updateBranchInfo,
} from "@/services/onboarding.api";
import { INDIA_LOCATION } from "@shared/location/india";
import VerifyButton from "@/components/onboarding/VerifyButton";

// --- VALIDATION HELPERS ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

export default function BranchInfoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state
  const [formData, setFormData] = useState({
    branchName: "",
    branchCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    branchHead: "",
    contactNumber: "",
    branchEmail: "",
    branchMobile: "",
    country: "India",
    district: "",
    zipCode: "",
    workingDays: "",
    workingHours: "",
    stockAllowed: false,
    negativeStockAllowed: false,
    transactionLockDate: false,
    approvalFlow: false,
  });

  // Load Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getOnboardingData();
        if (!isMounted) return;

        const branchData =
          data.branches?.[0] || data.settings?.settingsJson?.branchInfo || {};

        setFormData((prev) => ({
          ...prev,
          branchName: branchData.name || branchData.branchName || "",
          branchCode: branchData.code || branchData.branchCode || "",
          addressLine1: branchData.addressLine1 || "",
          addressLine2: branchData.addressLine2 || "",
          city: branchData.city || "",
          state: branchData.state || "",
          pincode: branchData.postalCode || branchData.pincode || "",
          branchHead: branchData.branchHead || "",
          contactNumber: branchData.contactNumber || "",
          branchEmail: branchData.email || branchData.branchEmail || "",
          branchMobile: branchData.mobile || branchData.branchMobile || "",
          country: branchData.country || "India",
          district: branchData.district || "",
          zipCode: branchData.postalCode || branchData.zipCode || "",
          workingDays: branchData.workingDays || "",
          workingHours: branchData.workingHours || "",
          stockAllowed:
            branchData.stockEnabled ?? branchData.stockAllowed ?? false,
          negativeStockAllowed: branchData.negativeStockAllowed ?? false,
          transactionLockDate: branchData.transactionLockDate ?? false,
          approvalFlow: branchData.approvalFlow ?? false,
        }));
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset children on parent change
      if (field === "country") {
        newData.state = "";
        newData.district = "";
        newData.city = "";
      } else if (field === "state") {
        newData.district = "";
        newData.city = "";
      } else if (field === "district") {
        newData.city = "";
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      // 1. Validate
      if (!formData.branchName) throw new Error("Branch Name is required");
      if (!formData.branchEmail) throw new Error("Branch Email is required");
      if (!EMAIL_REGEX.test(formData.branchEmail))
        throw new Error("Invalid Branch Email format");

      if (!formData.branchMobile) throw new Error("Branch Mobile is required");
      if (!MOBILE_REGEX.test(formData.branchMobile))
        throw new Error("Invalid Branch Mobile format (10 digits)");

      if (!formData.country) throw new Error("Country is required");
      if (!formData.state) throw new Error("State is required");
      if (!formData.district) throw new Error("District is required");
      if (!formData.city) throw new Error("City is required");
      if (!formData.zipCode) throw new Error("Zip Code is required");

      // 2. Save Branch Info
      await updateBranchInfo({
        branchName: formData.branchName,
        branchCode: formData.branchCode,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        branchHead: formData.branchHead,
        contactNumber: formData.contactNumber,
        branchEmail: formData.branchEmail,
        branchMobile: formData.branchMobile,
        country: formData.country,
        district: formData.district,
        zipCode: formData.zipCode,
        workingDays: formData.workingDays,
        workingHours: formData.workingHours,
        stockAllowed: formData.stockAllowed,
        negativeStockAllowed: formData.negativeStockAllowed,
        transactionLockDate: formData.transactionLockDate,
        approvalFlow: formData.approvalFlow,
      });

      // 3. Mark Complete!
      await completeOnboarding();

      // 4. Navigate to Dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Save failed", error);
      alert(error.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    router.push(`/setup/accounting-configuration`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // const states = getStatesByCountry(formData.country);
  // const districts = getDistrictsByState(formData.country, formData.state);

  const stateOptions = Object.keys(INDIA_LOCATION);
  const districtOptions = formData.state
    ? Object.keys(INDIA_LOCATION[formData.state]?.districts || {})
    : [];
  const cityOptions =
    formData.state && formData.district
      ? INDIA_LOCATION[formData.state]?.districts[formData.district] || []
      : [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Branch Information
        </h1>
        <p className="text-muted-foreground mt-2">
          Setup your primary operating unit (Head Office).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: HEAD BRANCH INFO */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🏢 Head Branch Details
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          {/* Row 1: Branch Name */}
          <div>
            <InputField
              label="Branch Name"
              value={formData.branchName}
              onChange={(v) => handleChange("branchName", v)}
              required
              placeholder="e.g. GreenCity Pvt. Ltd."
            />
          </div>

          {/* Row 2: Email & Mobile with Verify Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Branch Email ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={formData.branchEmail}
                    onChange={(e) =>
                      handleChange("branchEmail", e.target.value)
                    }
                    placeholder="Enter support email-id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <VerifyButton
                  fieldId="branch_email"
                  value={formData.branchEmail}
                  label="Branch Email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Branch Mobile No. <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={formData.branchMobile}
                    onChange={(e) =>
                      handleChange("branchMobile", e.target.value)
                    }
                    placeholder="10-digit mobile number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <VerifyButton
                  fieldId="branch_mobile"
                  value={formData.branchMobile}
                  label="Branch Mobile"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Address Lines */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                placeholder="Street name, Building No."
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium leading-none mb-1.5 block">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
                placeholder="Area, Landmark"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Row 4: Country & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Country"
              value={formData.country}
              onChange={(v) => handleChange("country", v)}
              options={["India"]} // Only India supported
              required
            />
            <SelectField
              label="State / Province"
              value={formData.state}
              onChange={(v) => handleChange("state", v)}
              options={stateOptions}
              required
              disabled={!formData.country}
              placeholder="Select State"
            />
          </div>

          {/* Row 5: District & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="District"
              value={formData.district}
              onChange={(v) => handleChange("district", v)}
              options={districtOptions}
              required
              disabled={!formData.state}
              placeholder="Select District"
            />
            <SelectField
              label="City"
              value={formData.city}
              onChange={(v) => handleChange("city", v)}
              options={cityOptions}
              required
              disabled={!formData.district}
              placeholder="Select City"
            />
          </div>

          {/* Row 6: Zip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Zip Code / Postal Code"
              value={formData.zipCode}
              onChange={(v) => handleChange("zipCode", v)}
              required
              placeholder="6-digit PIN code"
            />
          </div>
        </section>

        {/* SECTION 2: OPERATIONAL CONFIGURATION */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ⚙️ Operational Settings
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          {/* Row 1: Working Days & Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Working Days"
              value={formData.workingDays}
              onChange={(v) => handleChange("workingDays", v)}
              placeholder="Enter working days in week"
            />
            <InputField
              label="Working Hours"
              value={formData.workingHours}
              onChange={(v) => handleChange("workingHours", v)}
              placeholder="Enter working hours in a day"
            />
          </div>

          {/* Row 2: Toggles - Stock & Negative Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleField
              label="Stock Allowed"
              checked={formData.stockAllowed}
              onChange={(v) => handleChange("stockAllowed", v)}
            />
            <ToggleField
              label="Negative Stock Allowed"
              checked={formData.negativeStockAllowed}
              onChange={(v) => handleChange("negativeStockAllowed", v)}
            />
          </div>

          {/* Row 3: Toggles - Lock Date & Approval Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleField
              label="Transaction Lock Date"
              checked={formData.transactionLockDate}
              onChange={(v) => handleChange("transactionLockDate", v)}
            />
            <ToggleField
              label="Approval Flow"
              checked={formData.approvalFlow}
              onChange={(v) => handleChange("approvalFlow", v)}
            />
          </div>
        </section>

        {/* ACTIONS / FOOTER */}
        <div className="flex items-center justify-end gap-4 pt-4 pb-20">
          <button
            type="button"
            onClick={handlePrev}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="size-4" />
            Prev
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {saving ? "Completing..." : "Submit"}
            <Check className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Reusable Local Components ---

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
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

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? "bg-primary" : "bg-input"
        }`}
      >
        <span
          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
