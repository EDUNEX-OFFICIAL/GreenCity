"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Building2 } from "lucide-react";
import { getOnboardingData, updateSettings } from "@/services/onboarding.api";
import LogoUpload from "@/components/onboarding/LogoUpload";

// --- VALIDATION HELPERS ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export default function AdditionalInfoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state
  const [formData, setFormData] = useState({
    legalName: "",
    displayName: "",
    websiteUrl: "",
    companyType: "",
    incorporationDate: "",
    supportEmail: "",
    supportPhone: "",
    description: "",
    logoFile: null as File | null,
    logoPreview: null as string | null,
    logoError: null as string | null,
  });

  // Load Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getOnboardingData();
        if (!isMounted) return;

        const saved = data.settings?.settingsJson?.additionalInfo || {};

        setFormData((prev) => ({
          ...prev,
          legalName: saved.legalName || "",
          displayName: saved.displayName || "",
          websiteUrl: saved.websiteUrl || "",
          companyType: saved.companyType || "",
          incorporationDate: saved.incorporationDate || "",
          supportEmail: saved.supportEmail || "",
          supportPhone: saved.supportPhone || "",
          description: saved.description || "",
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      // 1. Validate
      if (!formData.legalName) throw new Error("Legal Name is required");
      if (!formData.companyType) throw new Error("Company Type is required");

      if (!formData.incorporationDate)
        throw new Error("Incorporation Date is required");
      const incDate = new Date(formData.incorporationDate);
      if (incDate > new Date())
        throw new Error("Incorporation Date cannot be in the future");

      if (formData.websiteUrl && !URL_REGEX.test(formData.websiteUrl)) {
        throw new Error("Invalid Website URL format");
      }

      if (formData.supportEmail && !EMAIL_REGEX.test(formData.supportEmail)) {
        throw new Error("Invalid Support Email format");
      }

      // 2. Save
      await updateSettings({
        stepKey: "additionalInfo",
        data: {
          legalName: formData.legalName,
          displayName: formData.displayName,
          websiteUrl: formData.websiteUrl,
          companyType: formData.companyType,
          incorporationDate: formData.incorporationDate,
          supportEmail: formData.supportEmail,
          supportPhone: formData.supportPhone,
          description: formData.description,
        },
      });

      // 3. Navigate
      router.push(`/setup/legal-info`);
    } catch (error: any) {
      console.error("Save failed", error);
      alert(error.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    router.push(`/setup/general-info`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Additional Information
        </h1>
        <p className="text-muted-foreground mt-2">
          Provide brand identity and operational details for your company.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-8">
        {/* COMPANY INFO SECTION */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🏢 Company Info
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          {/* ... (rest of form fields essentially unchanged, they matched structural classes) ... */}
          {/* Row 1: Legal Name */}
          <div>
            <InputField
              label="Legal Name"
              value={formData.legalName}
              onChange={(v) => handleChange("legalName", v)}
              required
              placeholder="e.g. GreenCity Pvt. Ltd."
            />
          </div>

          {/* Row 2: Display Name & Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Display Name / Alias"
              value={formData.displayName}
              onChange={(v) => handleChange("displayName", v)}
              placeholder="e.g. GreenCity"
            />
            <InputField
              label="Website URL"
              value={formData.websiteUrl}
              onChange={(v) => handleChange("websiteUrl", v)}
              placeholder="Paste your website url here..."
            />
          </div>

          {/* Row 3: Company Type & Incorporation Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Company Type"
              value={formData.companyType}
              onChange={(v) => handleChange("companyType", v)}
              required
              options={[
                "Private Limited",
                "Public Limited",
                "LLP",
                "Sole Proprietorship",
                "Partnership",
                "NGO/Trust",
              ]}
              placeholder="Select your company type"
            />

            <InputField
              label="Incorporation Date"
              value={formData.incorporationDate}
              onChange={(v) => handleChange("incorporationDate", v)}
              type="date"
              required
              icon={<Calendar className="size-4 text-muted-foreground" />}
            />
          </div>

          {/* Row 4: Support Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Support Email"
              value={formData.supportEmail}
              onChange={(v) => handleChange("supportEmail", v)}
              type="email"
              placeholder="Enter support email-id"
            />
            <InputField
              label="Support Phone"
              value={formData.supportPhone}
              onChange={(v) => handleChange("supportPhone", v)}
              type="tel"
              placeholder="Enter support phone no."
            />
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Company Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-1.5 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell us about your company"
            />
          </div>

          {/* Row 6: Upload Logo */}
          <label className="text-sm font-medium leading-none mb-2 block">
            Company Logo
          </label>

          <LogoUpload />
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
            {saving ? "Saving..." : "Next"}
            <ArrowRight className="size-4" />
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
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {icon && (
          <div className="absolute right-3 top-2.5 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
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
