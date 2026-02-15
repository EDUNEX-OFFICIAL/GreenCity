"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSetup } from "@/context/SetupContext";
import { uploadService } from "@/services/uploadService";
import { SetupFileAsset } from "@/types/setup";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoUpload() {
  const { logo, setLogo } = useSetup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up object URLs on unmount or replace
  useEffect(() => {
    return () => {
      if (logo?.previewUrl && logo.status === "local") {
        URL.revokeObjectURL(logo.previewUrl);
      }
    };
  }, [logo]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validation
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      setError("File size must be less than 2MB.");
      return;
    }

    // Create Asset
    const previewUrl = URL.createObjectURL(file);
    const newAsset: SetupFileAsset = {
      tempId: crypto.randomUUID(),
      file,
      previewUrl,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      status: "uploading",
    };

    setLogo(newAsset);

    // Simulate Upload (Stubbed)
    try {
      const session = await uploadService.createUploadSession(file);
      await uploadService.uploadBinary(file, session.tempId);
      const result = await uploadService.finalizeUpload(session.tempId);

      setLogo({
        ...newAsset,
        status: "uploaded",
        // In real app, update previewUrl to remote URL if needed
      });
    } catch (err) {
      setLogo({ ...newAsset, status: "failed" });
      setError("Upload failed. Please try again.");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
        className={`
          relative border-2 border-dashed rounded-lg p-6 min-h-[160px]
          flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}
          ${error ? "border-destructive/50 bg-destructive/5" : ""}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />

        {logo ? (
          <div className="relative group w-full h-full flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border bg-background">
              {/* Use standard img tag for blob implementation */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.previewUrl}
                alt="Logo Preview"
                className="w-full h-full object-contain"
              />

              {logo.status === "uploading" && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>

            <p className="mt-2 text-sm font-medium text-foreground truncate max-w-[200px]">
              {logo.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {(logo.size / 1024).toFixed(0)} KB •{" "}
              {logo.status === "uploaded" ? "Uploaded" : "Uploading..."}
            </p>

            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-full bg-muted mb-4">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
              SVG, PNG, JPG or WebP (max. 2MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-destructive flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
