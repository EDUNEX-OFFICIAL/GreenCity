"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { getOnboardingData, updateLegalInfo } from "@/services/onboarding.api";
import { INDIA_LOCATION } from "@shared/location/india";

// --- VALIDATION HELPERS ---
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

export default function LegalInfoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyLocation, setCompanyLocation] = useState({
    country: "India",
    state: "",
  });

  // Local state
  const [formData, setFormData] = useState({
    gstin: "",
    pan: "",
    tan: "",
    cin: "",
    msme: "",
    lut: "",
    gstRegistrationType: "",
    gstStateCode: "",
    sezUnit: false,
  });

  // Load Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getOnboardingData();
        if (!isMounted) return;

        const saved = data.settings?.settingsJson?.legalInfo || {};
        const company = data.companyProfile || {};

        setCompanyLocation({
          country: company.country || "India",
          state: company.state || "",
        });

        const derivedGstCode = INDIA_LOCATION[company.state || ""]?.code || "";

        setFormData((prev) => ({
          ...prev,
          gstin: saved.gstin || "",
          pan: saved.pan || "",
          tan: saved.tan || "",
          cin: saved.cin || "",
          msme: saved.msme || "",
          lut: saved.lut || "",
          gstRegistrationType: saved.gstRegistrationType || "",
          gstStateCode: derivedGstCode, // Always prioritize derived
          sezUnit: saved.sezUnit || false,
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      // 1. Validation
      if (!formData.pan) throw new Error("PAN Number is required");
      if (!PAN_REGEX.test(formData.pan))
        throw new Error("Invalid PAN format (e.g. ABCDE1234F)");

      if (!formData.gstin) throw new Error("GST Number is required");
      if (!GSTIN_REGEX.test(formData.gstin))
        throw new Error("Invalid GSTIN format");

      // Ensure GSTIN 2-digit matches State Code
      if (
        formData.gstStateCode &&
        !formData.gstin.startsWith(formData.gstStateCode)
      ) {
        throw new Error(
          `GSTIN mismatch. For ${companyLocation.state}, it must start with '${formData.gstStateCode}'.`,
        );
      }

      if (!formData.cin) throw new Error("CIN / LLPIN is required");

      if (!formData.tan) throw new Error("TAN is required");
      if (!TAN_REGEX.test(formData.tan)) throw new Error("Invalid TAN format");

      // 2. Save
      await updateLegalInfo({
        gstin: formData.gstin,
        pan: formData.pan,
        tan: formData.tan,
        cin: formData.cin,
        msme: formData.msme,
        lut: formData.lut,
        gstRegistrationType: formData.gstRegistrationType,
        gstStateCode: formData.gstStateCode,
        sezUnit: formData.sezUnit,
      });

      // 3. Navigate
      router.push(`/setup/accounting-configuration`);
    } catch (error: any) {
      console.error("Save failed", error);
      alert(error.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    router.push(`/setup/additional-info`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Legal Information
        </h1>
        <p className="text-muted-foreground mt-2">
          Provide statutory and compliance-related company details.
        </p>
      </div>

      <div className="space-y-8">
        {/* COMPANY INFO */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              ⚖️ Statutory Details
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          {/* PAN */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="PAN Number"
              name="pan"
              placeholder="ABCDE1234F"
              value={formData.pan}
              onChange={(e) =>
                handleChange("pan", e.target.value.toUpperCase())
              }
              required
            />
            <DisabledUploadSection label="PAN Document" />
          </div>

          {/* GST */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="GSTIN"
              name="gstin"
              placeholder="22AAAAA0000A1Z5"
              value={formData.gstin}
              onChange={(e) =>
                handleChange("gstin", e.target.value.toUpperCase())
              }
              required
            />
            <DisabledUploadSection label="GST Registration" />
          </div>

          {/* GST Type / State */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SelectField
              label="GST Registration Type"
              name="gstRegistrationType"
              value={formData.gstRegistrationType}
              onChange={(e) =>
                handleChange("gstRegistrationType", e.target.value)
              }
              options={["regular", "composition", "unregistered"]}
              required
              placeholder="Select Type"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-medium leading-none text-muted-foreground">
                GST State Code (Auto-derived)
              </label>
              <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground items-center gap-2">
                <span className="font-mono font-bold text-primary">
                  {formData.gstStateCode || "--"}
                </span>
                <span className="text-xs text-muted-foreground italic">
                  Based on {companyLocation.state || "Unset State"}
                </span>
              </div>
            </div>
          </div>

          {/* CIN */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="CIN / LLPIN"
              name="cin"
              placeholder="Enter your CIN / LLPIN"
              value={formData.cin}
              onChange={(e) =>
                handleChange("cin", e.target.value.toUpperCase())
              }
              required
            />
            <DisabledUploadSection label="CIN Document" />
          </div>

          {/* TAN / MSME */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="TAN"
              name="tan"
              placeholder="ABCD12345E"
              value={formData.tan}
              onChange={(e) =>
                handleChange("tan", e.target.value.toUpperCase())
              }
              required
            />
            <InputField
              label="MSME / Udyam No."
              name="msme"
              placeholder="Enter registration no."
              value={formData.msme}
              onChange={(e) =>
                handleChange("msme", e.target.value.toUpperCase())
              }
            />
          </div>

          {/* SEZ */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sezUnit"
              name="sezUnit"
              checked={formData.sezUnit}
              onChange={(e) => handleChange("sezUnit", e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            <label
              htmlFor="sezUnit"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              This is an SEZ Unit
            </label>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 pb-20">
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
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Next"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Local Components ---

function DisabledUploadSection({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium leading-none opacity-50">
        {label}
      </label>
      <div className="rounded-md border border-dashed border-input bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2 h-10">
        <Info className="size-3 mt-0.5 shrink-0" />
        <span>Enabled after setup completion.</span>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="" disabled>
          {placeholder || "Select an option"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
