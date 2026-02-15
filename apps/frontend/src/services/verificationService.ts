// Stub for verification logic
export const verificationService = {
  requestVerification: async (field: string, value: string) => {
    console.log(`[Mock] Requesting verification for ${field}: ${value}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "OTP Sent" };
  },

  confirmVerification: async (field: string, otp: string) => {
     console.log(`[Mock] Confirming verification for ${field} with OTP ${otp}`);
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     if (otp === "1234") {
         return { success: true };
     }
     throw new Error("Invalid OTP");
  }
};
