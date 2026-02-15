"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  SetupContextType,
  SetupFileAsset,
  VerificationState,
  VerificationStatus,
} from "@/types/setup";

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [logo, setLogo] = useState<SetupFileAsset | null>(null);
  const [verification, setVerification] = useState<
    Record<string, VerificationState>
  >({});

  const setVerificationState = (fieldId: string, state: VerificationState) => {
    setVerification((prev) => ({
      ...prev,
      [fieldId]: state,
    }));
  };

  const getVerificationStatus = (fieldId: string): VerificationStatus => {
    return verification[fieldId]?.status || "unverified";
  };

  return (
    <SetupContext.Provider
      value={{
        logo,
        setLogo,
        verification,
        setVerificationState,
        getVerificationStatus,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
}
