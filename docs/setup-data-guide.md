# Setup Data & Validation Guide

## Overview
This document outlines the data formats and validation rules for the GreenCity onboarding setup flow. It serves as a reference for generating dummy data and understanding the system's strict validation requirements.

## 1. Company Creation (Step 1)
*   **Company Name**: Required string.
*   **Email**: Valid email format.
*   **Mobile**: 10-15 digits.
*   **Location**:
    *   **Country**: Fixed to "India".
    *   **State**: Must match a valid state from `shared/location/india.ts`.
    *   **District**: Must be a valid district for the selected state.
    *   **City**: Manual entry or dropdown (implementation varies, generally strictly validated against state).

## 2. Root Admin (Step 2)
*   **Username**: Unique string.
*   **Password**: Min 6 characters. Must match "Confirm Password" field in UI.

## 3. Subscription (Step 3)
*   **Plan**: `free`, `pro`, or `enterprise`.
*   **Conversion ID**: Required string.

## 4. Legal Information (Post-Creation Setup)
This section enforces strict regex patterns for Indian statutory documents.

| Field | Format / Regex | Example | Notes |
| :--- | :--- | :--- | :--- |
| **PAN** | `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` | `ABCDE1234F` | 5 letters, 4 digits, 1 letter. |
| **GSTIN** | `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` | `36ABCDE1234F1Z5` | Must start with **2-digit State GST Code**. |
| **TAN** | `^[A-Z]{4}[0-9]{5}[A-Z]{1}$` | `HYDB12345A` | 4 letters, 5 digits, 1 letter. |
| **CIN** | (Alphanumeric) | `U72900TG2020PTC123456` | Corporate Identity Number. |

### State GST Codes
*   **Maharashtra**: `27`
*   **Telangana**: `36`
*   **Karnataka**: `29`
*   **Delhi**: `07`
*   **Gujarat**: `24`
*   (See `shared/location/india.ts` for full list)

## 5. Branch Information
*   **Pincode**: 6 digits.
*   **Head Office**: The setup flow mandates exactly one Head Office branch, usually created automatically or explicitly in the Branch Setup step.

## 6. Dummy Data Source
A comprehensive dummy data file is available at `setup_dummy_data.json` in the project root. It contains valid, regex-compliant data for testing the entire flow.

```json
/* Example Snippet */
"step4_legal_info": {
  "pan": "ABCDE1234F",
  "gstin": "36ABCDE1234F1Z5", // Starts with 36 (Telangana)
  "gstStateCode": "36"
}
```
