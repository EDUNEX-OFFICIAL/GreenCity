"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  RotateCcw,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { CreateCompanyInput } from "@/services/company.api";
import { INDIA_LOCATION } from "@shared/location/india";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCompanyInput) => void;
  loading?: boolean;
};

const initialFormState: CreateCompanyInput = {
  companyInfo: {
    companyName: "",
    email: "",
    mobileNumber: "",
    country: "India",
    state: "",
    district: "",
    city: "",
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
};

export default function CompanyCreateModel({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [formData, setFormData] =
    useState<CreateCompanyInput>(initialFormState);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNestedChange = (
    section: keyof CreateCompanyInput,
    field: string,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.companyInfo.companyName.trim())
        newErrors.companyName = "Company Name is required";
      if (!formData.companyInfo.email.trim())
        newErrors.companyEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyInfo.email))
        newErrors.companyEmail = "Invalid email format";
      if (!formData.companyInfo.mobileNumber.trim())
        newErrors.companyMobile = "Mobile Number is required";
      else if (!/^\d{10,15}$/.test(formData.companyInfo.mobileNumber))
        newErrors.companyMobile = "Invalid mobile number";

      if (!formData.companyInfo.country.trim())
        newErrors.country = "Country is required";
      if (!formData.companyInfo.state.trim())
        newErrors.state = "State is required";
      if (!formData.companyInfo.district.trim())
        newErrors.district = "District is required";
      if (!formData.companyInfo.city.trim())
        newErrors.city = "City is required";
      if (!formData.companyInfo.postalCode.trim())
        newErrors.postalCode = "Postal Code is required";
    }

    if (currentStep === 2) {
      if (!formData.rootAdmin.fullName.trim())
        newErrors.adminName = "Full Name is required";
      if (!formData.rootAdmin.email.trim())
        newErrors.adminEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.rootAdmin.email))
        newErrors.adminEmail = "Invalid email format";
      if (!formData.rootAdmin.mobileNumber.trim())
        newErrors.adminMobile = "Mobile Number is required";
      if (!formData.rootAdmin.username.trim())
        newErrors.username = "Username is required";
      if (!formData.rootAdmin.password)
        newErrors.password = "Password is required";
      else if (formData.rootAdmin.password.length < 6)
        newErrors.password = "Min 6 chars";

      if (formData.rootAdmin.password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (currentStep === 3) {
      if (!formData.subscription.conversionId.trim())
        newErrors.conversionId = "Conversion ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) onSubmit(formData);
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setStep(1);
      setErrors({});
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Derived Options
  const stateOptions = Object.keys(INDIA_LOCATION);
  const districtOptions = formData.companyInfo.state
    ? Object.keys(INDIA_LOCATION[formData.companyInfo.state]?.districts || {})
    : [];
  const cityOptions =
    formData.companyInfo.state && formData.companyInfo.district
      ? INDIA_LOCATION[formData.companyInfo.state]?.districts[
          formData.companyInfo.district
        ] || []
      : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-background rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-background z-10">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Create New Company
                </h2>
                <p className="text-muted-foreground mt-1">
                  Add a new operational unit to the ERP.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* STEP 1: Company Info */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        COMPANY INFO
                      </h3>

                      <div className="space-y-4">
                        {/* Row 1: Name */}
                        <InputField
                          label="Company Name"
                          value={formData.companyInfo.companyName}
                          onChange={(v) =>
                            handleNestedChange("companyInfo", "companyName", v)
                          }
                          error={errors.companyName}
                          placeholder="Enter new company name here..."
                          required
                        />

                        {/* Row 2: Email & Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Email ID"
                            value={formData.companyInfo.email}
                            onChange={(v) =>
                              handleNestedChange("companyInfo", "email", v)
                            }
                            error={errors.companyEmail}
                            placeholder="Enter email-id here..."
                            required
                          />
                          <InputField
                            label="Mobile No."
                            value={formData.companyInfo.mobileNumber}
                            onChange={(v) =>
                              handleNestedChange(
                                "companyInfo",
                                "mobileNumber",
                                v,
                              )
                            }
                            error={errors.companyMobile}
                            placeholder="Enter mobile no. here..."
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-4">
                        Address
                      </h3>
                      <div className="space-y-4">
                        <InputField
                          value={formData.companyInfo.addressLine1 || ""}
                          onChange={(v) =>
                            handleNestedChange("companyInfo", "addressLine1", v)
                          }
                          placeholder="Address line 1"
                        />
                        <InputField
                          value={formData.companyInfo.addressLine2 || ""}
                          onChange={(v) =>
                            handleNestedChange("companyInfo", "addressLine2", v)
                          }
                          placeholder="address line 2"
                        />

                        {/* Country & State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label label="Country" required />
                            <div className="relative">
                              <input
                                value="India"
                                readOnly
                                className="w-full h-12 px-4 rounded-lg border bg-secondary/50 text-muted-foreground cursor-not-allowed focus:outline-none"
                              />
                            </div>
                          </div>

                          <SelectField
                            label="State"
                            value={formData.companyInfo.state}
                            onChange={(v) => {
                              handleNestedChange("companyInfo", "state", v);
                              handleNestedChange("companyInfo", "district", "");
                              handleNestedChange("companyInfo", "city", "");
                            }}
                            options={stateOptions}
                            placeholder="Select your State"
                            error={errors.state}
                            required
                          />
                        </div>

                        {/* District & City (Combined Row for balance) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <SelectField
                            label="District"
                            value={formData.companyInfo.district}
                            onChange={(v) => {
                              handleNestedChange("companyInfo", "district", v);
                              handleNestedChange("companyInfo", "city", "");
                            }}
                            options={districtOptions}
                            disabled={!formData.companyInfo.state}
                            placeholder="Select your District"
                            error={errors.district}
                            required
                          />
                          <SelectField
                            label="City"
                            value={formData.companyInfo.city}
                            onChange={(v) =>
                              handleNestedChange("companyInfo", "city", v)
                            }
                            options={cityOptions}
                            disabled={!formData.companyInfo.district}
                            placeholder="Select your City"
                            error={errors.city}
                            required
                          />
                        </div>

                        {/* Zip Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Zip Code / Postal Code"
                            value={formData.companyInfo.postalCode}
                            onChange={(v) =>
                              handleNestedChange("companyInfo", "postalCode", v)
                            }
                            error={errors.postalCode}
                            placeholder="Enter zipcode here..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Root Admin */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        ROOT ADMIN INFO
                      </h3>

                      <div className="space-y-4">
                        <InputField
                          label="Admin Name"
                          value={formData.rootAdmin.fullName}
                          onChange={(v) =>
                            handleNestedChange("rootAdmin", "fullName", v)
                          }
                          error={errors.adminName}
                          placeholder="Enter admin name here..."
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Email ID"
                            value={formData.rootAdmin.email}
                            onChange={(v) =>
                              handleNestedChange("rootAdmin", "email", v)
                            }
                            error={errors.adminEmail}
                            placeholder="Enter email-id here..."
                            required
                          />
                          <InputField
                            label="Mobile No."
                            value={formData.rootAdmin.mobileNumber}
                            onChange={(v) =>
                              handleNestedChange("rootAdmin", "mobileNumber", v)
                            }
                            error={errors.adminMobile}
                            placeholder="Enter mobile no. here..."
                            required
                          />
                        </div>

                        {/* Username & Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Username"
                            value={formData.rootAdmin.username}
                            onChange={(v) =>
                              handleNestedChange("rootAdmin", "username", v)
                            }
                            error={errors.username}
                            placeholder="Enter username here..."
                            required
                          />
                          <div className="relative">
                            <InputField
                              label="Password"
                              type={showPassword ? "text" : "password"}
                              value={formData.rootAdmin.password}
                              onChange={(v) =>
                                handleNestedChange("rootAdmin", "password", v)
                              }
                              error={errors.password}
                              placeholder="Enter new password..."
                              required
                              suffix={
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="focus:outline-none"
                                >
                                  {showPassword ? (
                                    <EyeOff className="size-4" />
                                  ) : (
                                    <Eye className="size-4" />
                                  )}
                                </button>
                              }
                            />
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div /> {/* Spacer */}
                          <InputField
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(v) => {
                              setConfirmPassword(v);
                              if (errors.confirmPassword) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.confirmPassword;
                                  return newErrors;
                                });
                              }
                            }}
                            error={errors.confirmPassword}
                            placeholder="Confirm password..."
                            required
                            suffix={
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="focus:outline-none"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Subscription */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                        SUBSCRIPTION
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <Label label="Plan" required />
                          <select
                            className="w-full h-12 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            value={formData.subscription.plan}
                            onChange={(e) =>
                              handleNestedChange(
                                "subscription",
                                "plan",
                                e.target.value,
                              )
                            }
                          >
                            <option value="free">Free Tier</option>
                            <option value="pro">Pro Plan</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Conversion ID"
                            value={formData.subscription.conversionId}
                            onChange={(v) =>
                              handleNestedChange(
                                "subscription",
                                "conversionId",
                                v,
                              )
                            }
                            error={errors.conversionId}
                            placeholder="Enter conversion-id here..."
                            required
                          />
                          <InputField
                            label="DSA Name (Auto Fetch)"
                            value="Robert Holland"
                            onChange={() => {}}
                            placeholder="Robert Holland"
                            disabled
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">
                            Upcoming Beta Mode
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleNestedChange(
                                "subscription",
                                "betaMode",
                                !formData.subscription.betaMode,
                              )
                            }
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.subscription.betaMode ? "bg-blue-500" : "bg-gray-300"}`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.subscription.betaMode ? "translate-x-6" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-border bg-background z-10 flex items-center justify-between">
              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === s
                        ? "bg-blue-500 text-white"
                        : "bg-blue-100/50 text-blue-500"
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormState);
                    setStep(1);
                    setConfirmPassword("");
                  }}
                  className="h-10 px-4 rounded-md border border-input hover:bg-accent hover:text-accent-foreground text-sm font-medium flex items-center gap-2 text-blue-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => step > 1 && setStep(step - 1)}
                  disabled={step === 1}
                  className="h-10 px-4 rounded-md border border-input hover:bg-accent hover:text-accent-foreground text-sm font-medium flex items-center gap-2 text-gray-600 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 rotate-180" />{" "}
                  {/* Using rotate for Prev icon similarity */}
                  Prev
                </button>

                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="h-10 px-6 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium flex items-center gap-2 shadow-sm"
                  >
                    Next
                    <Download className="w-4 h-4 rotate-270" />{" "}
                    {/* Arrow Right-ish */}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-10 px-6 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Helpers
function Label({ label, required }: { label: string; required?: boolean }) {
  if (!label) return null;
  return (
    <label className="block text-sm font-bold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required,
  error,
  placeholder,
  disabled,
  suffix,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <Label label={label || ""} required={required} />
      <div className="relative">
        <input
          type={type}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-12 px-4 rounded-lg border bg-background outline-none transition-all placeholder:text-muted-foreground/40 text-sm ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-input mb-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          } ${disabled ? "bg-secondary/50 cursor-not-allowed" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center h-full">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  error,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <Label label={label} required={required} />
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full h-12 px-4 rounded-lg border bg-background appearance-none outline-none transition-all text-sm ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-input focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          } ${disabled ? "bg-secondary/50 cursor-not-allowed" : ""}`}
        >
          <option value="" disabled>
            {placeholder || "Select..."}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
    </div>
  );
}
