import { Request, Response } from 'express';
import * as onBoardingService from '../services/onboarding.service';


export async function getMe(req: Request, res: Response) {
  try {
    // Middleware guarantees req.companyId is present
    const data = await onBoardingService.getMe(req.companyId!);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to get company",
    });
  }
}

export async function getOnboardingData(req: Request, res: Response) {
  try {
    const data = await onBoardingService.getOnboardingData(req.companyId!);
    res.json(data);
  } catch (error) {
    console.error("Failed to get onboarding data:", error);
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to get onboarding data",
    });
  }

}
export async function updateCompanyInfo(req: Request, res: Response) {
  try {
    await onBoardingService.updateCompanyInfo(req.companyId!, req.body);
    res.json({ message: "Company info updated successfully" });
  } catch (error) {
    console.error("Failed to update company info:", error);
    res.status(400).json({
      error: "INVALID_PAYLOAD",
      message: "Failed to update company info",
    });
  }
}
export async function updateAdminInfo(req: Request, res: Response) {
  try {
    await onBoardingService.updateAdminInfo(req.companyId!, req.body);
    res.json({ message: "Admin info updated successfully" });
  } catch (error) {
    console.error("Failed to update admin info:", error);
    res.status(400).json({
      error: "INVALID_PAYLOAD",
      message: "Failed to update admin info",
    });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    await onBoardingService.updateSettings(req.companyId!, req.body);
    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    res.status(400).json({ message: msg });
  }
}


export async function updateBranchInfo(req: Request, res: Response) {
  try {
    await onBoardingService.updateBranchInfo(req.companyId!, req.body);
    res.json({ message: "Branch info updated successfully" });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Failed to update branch info";
    res.status(400).json({ message: msg });
  }
}

export async function updateLegalInfo(req: Request, res: Response) {
  try {
    await onBoardingService.updateLegalInfo(req.companyId!, req.body);
    res.json({ message: "Legal info updated successfully" });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Failed to update legal info";
    res.status(400).json({ message: msg });
  }
}

export async function updateAccountingInfo(req: Request, res: Response) {
  try {
    await onBoardingService.updateAccountingInfo(req.companyId!, req.body);
    res.json({ message: "Accounting info updated successfully" });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Failed to update accounting info";
    res.status(400).json({ message: msg });
  }
}

export async function getSetupStatus(req: Request, res: Response) {
  try {
    const status = await onBoardingService.getSetupStatus(req.companyId!);
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get setup status" });
  }
}

export async function completeOnboarding(req: Request, res: Response) {
  try {
    await onBoardingService.completeOnboarding(req.companyId!);
    res.json({ message: "Onboarding completed successfully" });
  } catch (error) {
    console.error(error);
    const msg = error instanceof Error ? error.message : "Failed to complete onboarding";
    res.status(400).json({ message: msg });
  }
}
