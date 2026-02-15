"use client";

import React, { useState } from "react";
import { useSetup } from "@/context/SetupContext";
import { verificationService } from "@/services/verificationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VerifyButtonProps {
  fieldId: string; // e.g., 'email', 'mobile'
  value: string;
  label: string; // "Email" or "Mobile Number"
}

export default function VerifyButton({
  fieldId,
  value,
  label,
}: VerifyButtonProps) {
  const { verification, setVerificationState } = useSetup();
  const currentState = verification[fieldId] || { status: "unverified" };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartVerification = async () => {
    if (!value) return; // Can't verify empty
    setIsLoading(true);
    setVerificationState(fieldId, { status: "pending" });

    try {
      await verificationService.requestVerification(fieldId, value);
      setIsDialogOpen(true);
      setError(null);
    } catch (err) {
      setVerificationState(fieldId, {
        status: "failed",
        error: "Failed to send OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await verificationService.confirmVerification(fieldId, otp);
      setVerificationState(fieldId, {
        status: "verified",
        lastVerifiedAt: new Date(),
      });
      setIsDialogOpen(false);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentState.status === "verified") {
    return (
      <Badge
        variant="secondary"
        className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 pl-1 pr-2 py-1"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Verified
      </Badge>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStartVerification}
        disabled={!value || isLoading || currentState.status === "pending"}
        className={`h-8 text-xs gap-2 ${currentState.status === "failed" ? "border-destructive text-destructive" : ""}`}
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify {label}</DialogTitle>
            <DialogDescription>
              We sent a verification code to <strong>{value}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength={4}
                className="text-center text-lg tracking-widest"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length < 4}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
