-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "workingDays" JSONB,
    "workingHours" JSONB,
    "stockEnabled" BOOLEAN NOT NULL DEFAULT false,
    "approvalFlow" JSONB,
    "isHeadOffice" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceDetails" (
    "id" TEXT NOT NULL,
    "pan" TEXT,
    "gstin" TEXT,
    "gstType" TEXT,
    "gstState" TEXT,
    "cin" TEXT,
    "tan" TEXT,
    "msme" TEXT,
    "sezUnit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialPeriod" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "financialYearFrom" TIMESTAMP(3) NOT NULL,
    "financialYearTo" TIMESTAMP(3) NOT NULL,
    "accountingMethod" TEXT NOT NULL,
    "decimalPrecision" INTEGER NOT NULL,
    "invoicePrefix" TEXT,
    "invoiceStartNo" INTEGER,
    "timezone" TEXT NOT NULL,
    "roundOff" BOOLEAN NOT NULL DEFAULT false,
    "openingBalanceDate" TIMESTAMP(3),
    "openingBalance" DECIMAL(65,30),
    "creditNotePrefix" TEXT,
    "debitNotePrefix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialPeriod_pkey" PRIMARY KEY ("id")
);
