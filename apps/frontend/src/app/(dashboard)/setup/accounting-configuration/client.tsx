"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Calendar } from "lucide-react";
import {
  getOnboardingData,
  updateSettings,
  updateAccountingInfo,
} from "@/services/onboarding.api";

import { Suspense } from "react";

function AccountingConfigurationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyCountry, setCompanyCountry] = useState("India");

  // Local state for UI-only fields
  const [formData, setFormData] = useState({
    baseCurrency: "",
    financialYearStart: "",
    financialYearEnd: "",
    accountingMethod: "",
    decimalPrecision: "2",
    invoiceStartNumber: "1",
    invoicePrefix: "",
    openingBalanceDate: "",
    openingBalance: "",
    creditNotePrefix: "",
    debitNotePrefix: "",
    timezone: "(UTC+05:30) IST - India Standard Time",
    roundOff: true,
  });

  // Load Data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getOnboardingData();
        if (!isMounted) return;

        const country = data.companyProfile?.country || "India";
        setCompanyCountry(country);

        const saved = data.settings?.settingsJson?.accounting || {};

        // Defaults if India
        const defaultStart =
          country === "India" && !saved.financialYearStart
            ? `${new Date().getFullYear()}-04-01`
            : saved.financialYearStart || "";

        const defaultEnd =
          country === "India" && !saved.financialYearEnd && defaultStart
            ? `${new Date(defaultStart).getFullYear() + 1}-03-31`
            : saved.financialYearEnd || "";

        setFormData((prev) => ({
          ...prev,
          baseCurrency:
            saved.baseCurrency ||
            (country === "India" ? "INR - Indian Rupee" : ""),
          financialYearStart: defaultStart,
          financialYearEnd: defaultEnd,
          accountingMethod: saved.accountingMethod || "Accrual",
          decimalPrecision: saved.decimalPrecision || "2",
          invoiceStartNumber: saved.invoiceStartNumber || "1",
          invoicePrefix: saved.invoicePrefix || "",
          openingBalanceDate: saved.openingBalanceDate || "",
          openingBalance: saved.openingBalance || "",
          creditNotePrefix: saved.creditNotePrefix || "",
          debitNotePrefix: saved.debitNotePrefix || "",
          timezone:
            saved.timezone ||
            (country === "India"
              ? "(UTC+05:30) IST - India Standard Time"
              : ""),
          roundOff: saved.roundOff ?? true,
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate FY End if Start changes (simple +1 year logic)
      if (field === "financialYearStart" && value) {
        const startDate = new Date(value);
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate);
          endDate.setFullYear(startDate.getFullYear() + 1);
          endDate.setDate(startDate.getDate() - 1);
          newData.financialYearEnd = endDate.toISOString().split("T")[0];
        }
      }

      return newData;
    });
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {
      if (!formData.baseCurrency) throw new Error("Base Currency is required");
      if (!formData.financialYearStart)
        throw new Error("Financial Year Start is required");
      if (!formData.financialYearEnd)
        throw new Error("Financial Year End is required");
      if (!formData.timezone) throw new Error("Timezone is required");

      // 2. Save
      await updateAccountingInfo({
        baseCurrency: formData.baseCurrency,
        financialYearStart: formData.financialYearStart,
        financialYearEnd: formData.financialYearEnd,
        accountingMethod: formData.accountingMethod,
        decimalPrecision: formData.decimalPrecision,
        invoiceStartNumber: formData.invoiceStartNumber,
        invoicePrefix: formData.invoicePrefix,
        openingBalanceDate: formData.openingBalanceDate,
        openingBalance: formData.openingBalance,
        creditNotePrefix: formData.creditNotePrefix,
        debitNotePrefix: formData.debitNotePrefix,
        timezone: formData.timezone,
        roundOff: formData.roundOff,
      });

      // 3. Navigate
      router.push(`/setup/branch-info`);
    } catch (error: any) {
      console.error("Save failed", error);
      alert(error.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    router.push(`/setup/legal-info`);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Accounting Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure financial settings for your organization.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-8">
        {/* FINANCIAL INFO SECTION */}
        <section className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              💰 Financial Settings
            </h2>
            <div className="h-px bg-border mt-2" />
          </div>

          {/* ... (rest of form fields essentially unchanged) ... */}
          {/* Row 1: Base Currency & Financial Year Start */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Base Currency"
              value={formData.baseCurrency}
              onChange={(v) => handleChange("baseCurrency", v)}
              required
              options={[
                "USD - US Dollar",
                "INR - Indian Rupee",
                "EUR - Euro",
                "GBP - British Pound",
              ]}
              placeholder="Select your Base Currency"
            />
            <InputField
              label="Financial Year Start"
              value={formData.financialYearStart}
              onChange={(v) => handleChange("financialYearStart", v)}
              type="date"
              required
              icon={<Calendar className="size-4 text-muted-foreground" />}
            />
          </div>

          {/* Row 2: Financial Year End & Accounting Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Financial Year End"
              value={formData.financialYearEnd}
              onChange={() => {}} // Read-only
              disabled
              placeholder="Autofilled"
              icon={<Calendar className="size-4 text-muted-foreground" />}
            />
            <SelectField
              label="Accounting Method"
              value={formData.accountingMethod}
              onChange={(v) => handleChange("accountingMethod", v)}
              options={["Accrual", "Cash"]} // Common methods
              placeholder="Select your method"
            />
          </div>

          {/* Row 3: Decimal Precision & Invoice Start Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Decimal Precision"
              value={formData.decimalPrecision}
              onChange={(v) => handleChange("decimalPrecision", v)}
              type="number"
              placeholder="Enter decimal here..."
            />
            <InputField
              label="Invoice Start Number"
              value={formData.invoiceStartNumber}
              onChange={(v) => handleChange("invoiceStartNumber", v)}
              type="number"
              placeholder="Enter invoice start number here..."
            />
          </div>

          {/* Row 4: Invoice Prefix & Opening Balance Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Invoice Prefix"
              value={formData.invoicePrefix}
              onChange={(v) => handleChange("invoicePrefix", v)}
              placeholder="Enter invoice prefix here..."
            />
            <InputField
              label="Opening Balance Date"
              value={formData.openingBalanceDate}
              onChange={(v) => handleChange("openingBalanceDate", v)}
              type="date"
              placeholder="Select date"
              icon={<Calendar className="size-4 text-muted-foreground" />}
            />
          </div>

          {/* Row 5: Opening Balance & Credit Note Prefix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Opening Balance"
              value={formData.openingBalance}
              onChange={(v) => handleChange("openingBalance", v)}
              type="number"
              placeholder="Enter company opening balance"
            />
            <InputField
              label="Credit Note Prefix"
              value={formData.creditNotePrefix}
              onChange={(v) => handleChange("creditNotePrefix", v)}
              placeholder="Enter credit note prefix here..."
            />
          </div>

          {/* Row 6: Debit Note Prefix & Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Debit Note Prefix"
              value={formData.debitNotePrefix}
              onChange={(v) => handleChange("debitNotePrefix", v)}
              placeholder="Enter debit note prefix here..."
            />
            <SelectField
              label="Timezone"
              value={formData.timezone}
              onChange={(v) => handleChange("timezone", v)}
              required
              options={[
                "(UTC-08:00) Pacific Time",
                "(UTC-05:00) Eastern Time",
                "(UTC+00:00) UTC",
                "(UTC+05:30) IST - India Standard Time",
              ]}
              placeholder="Select your timezone"
            />
          </div>

          {/* Row 7: Round off Toggle */}
          <div>
            <label className="text-sm font-medium leading-none mb-2 block">
              Round off
            </label>
            <div className="flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={formData.roundOff}
                onClick={() => handleChange("roundOff", !formData.roundOff)}
                className={`
                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        ${formData.roundOff ? "bg-primary" : "bg-input"}
                    `}
              >
                <span
                  className={`
                            pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform
                             ${formData.roundOff ? "translate-x-5" : "translate-x-0"}
                        `}
                />
              </button>
            </div>
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
            {saving ? "Saving..." : "Next"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountingConfigurationContent;

// --- Reusable Local Components (Copied from AdditionalInfoPage for consistency) ---

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  icon,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
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
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted"
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
