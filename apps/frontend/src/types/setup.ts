// Setup Wizard UI Types

export type UploadStatus = 'local' | 'uploading' | 'uploaded' | 'failed';

export interface SetupFileAsset {
  tempId: string;
  file: File;
  previewUrl: string;
  fileName: string;
  size: number;
  mimeType: string;
  status: UploadStatus;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';

export interface VerificationState {
  status: VerificationStatus;
  lastVerifiedAt?: Date;
  error?: string;
}

export interface SetupContextType {
  // Logo Asset
  logo: SetupFileAsset | null;
  setLogo: (asset: SetupFileAsset | null) => void;

  // Verification States (keyed by field ID, e.g. "email", "mobile")
  verification: Record<string, VerificationState>;
  setVerificationState: (fieldId: string, state: VerificationState) => void;
  
  // Helper to get status
  getVerificationStatus: (fieldId: string) => VerificationStatus;
}
