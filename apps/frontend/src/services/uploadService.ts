import { SetupFileAsset } from "@/types/setup";

// Stub for future backend integration
export const uploadService = {
  createUploadSession: async (file: File) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
    return { tempId: crypto.randomUUID() };
  },

  uploadBinary: async (file: File, sessionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
    return true;
  },

  finalizeUpload: async (sessionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { fileId: sessionId, url: "https://via.placeholder.com/150" };
  }
};
