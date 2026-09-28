import * as React from "react"
import {
  DollarSignIcon,
  EyeIcon,
  EyeOffIcon,
  HistoryIcon,
  LandmarkIcon,
  PencilIcon,
  PlusIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react"

import { FormField } from "@/components/shared/form-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { employeeProfileService } from "@/lib/services/employee-profile-service"
import type {
  AllowanceItem,
  Compensation,
  CompensationHistory,
  PaymentInformation,
} from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabCompensationProps {
  employee: EmployeeWithRelations
  compensation: Compensation | null
  compensationHistory: CompensationHistory[]
  paymentInfo: PaymentInformation | null
  onProfileUpdated: () => void
}

export function TabCompensation({
  employee,
  compensation,
  compensationHistory,
  paymentInfo,
  onProfileUpdated,
}: TabCompensationProps) {
  // State for masking account number
  const [showAccountNumber, setShowAccountNumber] = React.useState(false)

  // Dialog states
  const [isCompDialogOpen, setIsCompDialogOpen] = React.useState(false)
  const [isBankDialogOpen, setIsBankDialogOpen] = React.useState(false)

  // Compensation Form State
  const [salaryType, setSalaryType] = React.useState<"monthly" | "hourly" | "annual">(
    compensation?.salaryType || "monthly"
  )
  const [basicSalary, setBasicSalary] = React.useState<string>(
    compensation?.basicSalary ? String(compensation.basicSalary) : "0"
  )
  const [currency, setCurrency] = React.useState(
    compensation?.paymentCurrency || "USD ($)"
  )
  const [effectiveDate, setEffectiveDate] = React.useState(
    compensation?.effectiveDate || new Date().toISOString().split("T")[0]
  )
  const [changeReason, setChangeReason] = React.useState(
    "Periodic Performance & Market Review"
  )
  const [notes, setNotes] = React.useState(compensation?.notes || "")
  const [allowances, setAllowances] = React.useState<AllowanceItem[]>(
    compensation?.allowances ? [...compensation.allowances] : []
  )

  // New allowance item inputs inside dialog
  const [newAllowanceName, setNewAllowanceName] = React.useState("")
  const [newAllowanceAmount, setNewAllowanceAmount] = React.useState("")

  // Banking Form State
  const [paymentMethod, setPaymentMethod] = React.useState<
    "bank_transfer" | "cash" | "other"
  >(paymentInfo?.paymentMethod || "bank_transfer")
  const [bankName, setBankName] = React.useState(paymentInfo?.bankName || "")
  const [accountName, setAccountName] = React.useState(paymentInfo?.accountName || "")
  const [accountNumber, setAccountNumber] = React.useState(
    paymentInfo?.accountNumber || ""
  )
  const [branch, setBranch] = React.useState(paymentInfo?.branch || "")
  const [routingNumber, setRoutingNumber] = React.useState(
    paymentInfo?.routingNumber || ""
  )
  const [swiftCode, setSwiftCode] = React.useState(paymentInfo?.swiftCode || "")

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Open Comp Dialog Handlers
  const handleOpenCompDialog = () => {
    setSalaryType(compensation?.salaryType || "monthly")
    setBasicSalary(compensation?.basicSalary ? String(compensation.basicSalary) : "0")
    setCurrency(compensation?.paymentCurrency || "USD ($)")
    setEffectiveDate(
      compensation?.effectiveDate || new Date().toISOString().split("T")[0]
    )
    setChangeReason("Annual Merit & Adjustment")
    setNotes(compensation?.notes || "")
    setAllowances(
      compensation?.allowances
        ? compensation.allowances.map((a) => ({ ...a }))
        : []
    )
    setIsCompDialogOpen(true)
  }

  // Open Bank Dialog Handlers
  const handleOpenBankDialog = () => {
    setPaymentMethod(paymentInfo?.paymentMethod || "bank_transfer")
    setBankName(paymentInfo?.bankName || "")
    setAccountName(paymentInfo?.accountName || "")
    setAccountNumber(paymentInfo?.accountNumber || "")
    setBranch(paymentInfo?.branch || "")
    setRoutingNumber(paymentInfo?.routingNumber || "")
    setSwiftCode(paymentInfo?.swiftCode || "")
    setIsBankDialogOpen(true)
  }

  const handleAddAllowance = () => {
    if (!newAllowanceName.trim() || !newAllowanceAmount) return
    const amt = parseFloat(newAllowanceAmount)
    if (isNaN(amt) || amt <= 0) return

    setAllowances([
      ...allowances,
      {
        id: `alw_${Date.now()}`,
        name: newAllowanceName.trim(),
        amount: amt,
      },
    ])
    setNewAllowanceName("")
    setNewAllowanceAmount("")
  }

  const handleRemoveAllowance = (id: string) => {
    setAllowances(allowances.filter((a) => a.id !== id))
  }

  const handleSaveCompensation = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const basicNum = parseFloat(basicSalary) || 0
      const newComp: Compensation = {
        salaryType,
        basicSalary: basicNum,
        allowances,
        effectiveDate,
        paymentCurrency: currency,
        notes: notes.trim() || undefined,
      }

      employeeProfileService.updateCompensation(
        employee.id,
        newComp,
        changeReason,
        "System Administrator"
      )

      setIsCompDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveBanking = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      employeeProfileService.updatePaymentInformation(employee.id, {
        paymentMethod,
        bankName: bankName.trim() || undefined,
        accountName: accountName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        branch: branch.trim() || undefined,
        routingNumber: routingNumber.trim() || undefined,
        swiftCode: swiftCode.trim() || undefined,
      })

      setIsBankDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate totals
  const totalAllowances =
    compensation?.allowances?.reduce((sum, item) => sum + item.amount, 0) || 0
  const totalGross = (compensation?.basicSalary || 0) + totalAllowances

  // Mask account number helper
  const renderMaskedAccount = (num?: string) => {
    if (!num) return "—"
    if (showAccountNumber) return num
    const clean = num.replace(/\s+/g, "")
    if (clean.length <= 4) return clean
    const last4 = clean.slice(-4)
    return `•••• •••• ${last4}`
  }

  return (
    <div className="space-y-6">
      {/* 1. Confidentiality Warning Banner */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-start gap-3">
        <ShieldAlertIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold text-sm">
            Confidential Human Resources & Payroll Information
          </p>
          <p className="mt-0.5 text-amber-700 dark:text-amber-400/90 leading-relaxed">
            All remuneration, banking coordinates, and monetary structures are strictly
            confidential. Only authorized HR administrators possess clearance to view or
            revise these records.
          </p>
        </div>
      </div>

      {/* 2. Current Compensation & Banking Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Compensation Breakdown */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <WalletIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Remuneration Breakdown
              </h2>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handleOpenCompDialog}
              className="gap-1.5 text-xs h-7"
            >
              <PencilIcon className="size-3" />
              <span>Update Compensation</span>
            </Button>
          </div>

          {compensation ? (
            <div className="space-y-6">
              {/* Primary Stat Figures */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <span className="text-[11px] text-muted-foreground">
                    Basic Remuneration ({compensation.salaryType})
                  </span>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {compensation.paymentCurrency.split(" ")[0]}{" "}
                    {compensation.basicSalary.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">
                    Per {compensation.salaryType.replace("ly", "")}
                  </p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <span className="text-[11px] text-muted-foreground">
                    Total Allowances
                  </span>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {compensation.paymentCurrency.split(" ")[0]}{" "}
                    {totalAllowances.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {compensation.allowances?.length || 0} active allowances
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-300/80 bg-emerald-50/40 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                  <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                    Total Gross Package
                  </span>
                  <p className="mt-1 text-xl font-bold text-emerald-900 dark:text-emerald-100">
                    {compensation.paymentCurrency.split(" ")[0]}{" "}
                    {totalGross.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400 capitalize">
                    Effective from {compensation.effectiveDate}
                  </p>
                </div>
              </div>

              {/* Itemized Allowances Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Itemized Allowances & Benefits
                </h3>
                {compensation.allowances && compensation.allowances.length > 0 ? (
                  <div className="rounded-lg border border-border/60 divide-y divide-border/60 overflow-hidden text-xs">
                    {compensation.allowances.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-card hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-primary/70" />
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {compensation.paymentCurrency.split(" ")[0]}{" "}
                          {item.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No specific allowances assigned to this compensation package.
                  </p>
                )}
              </div>

              {/* Notes */}
              {compensation.notes && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Remuneration Notes:
                  </span>
                  <p className="mt-1 text-foreground">{compensation.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
              <DollarSignIcon className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-medium text-foreground">
                No compensation structure configured
              </p>
              <p className="mt-1">
                Click &quot;Update Compensation&quot; above to set up the basic salary
                and allowances.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Banking & Disbursement Details */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <LandmarkIcon className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Disbursement & Banking
                </h3>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={handleOpenBankDialog}
                className="gap-1.5 text-xs h-7"
              >
                <PencilIcon className="size-3" />
                <span>Edit Banking</span>
              </Button>
            </div>

            {paymentInfo ? (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Payment Method</span>
                  <p className="font-semibold text-foreground capitalize">
                    {paymentInfo.paymentMethod.replace("_", " ")}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Bank Institution</span>
                  <p className="font-semibold text-foreground">
                    {paymentInfo.bankName || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Account Holder Name</span>
                  <p className="font-semibold text-foreground">
                    {paymentInfo.accountName || "—"}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Account / IBAN Number
                    </span>
                    {paymentInfo.accountNumber && (
                      <button
                        type="button"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                        className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {showAccountNumber ? (
                          <>
                            <EyeOffIcon className="size-3" />
                            <span>Mask</span>
                          </>
                        ) : (
                          <>
                            <EyeIcon className="size-3" />
                            <span>Reveal</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="font-mono font-semibold text-foreground">
                    {renderMaskedAccount(paymentInfo.accountNumber)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Routing Number</span>
                    <p className="font-mono font-medium text-foreground">
                      {paymentInfo.routingNumber || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">SWIFT / BIC</span>
                    <p className="font-mono font-medium text-foreground">
                      {paymentInfo.swiftCode || "—"}
                    </p>
                  </div>
                </div>

                {paymentInfo.branch && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Bank Branch</span>
                    <p className="text-foreground">{paymentInfo.branch}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                <LandmarkIcon className="size-6 mx-auto text-muted-foreground/40 mb-1.5" />
                <p className="font-medium text-foreground">No bank account linked</p>
                <p className="mt-1">Add employee banking details for payroll direct deposit.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/60">
            <Badge variant="outline" className="w-full justify-center text-[10px] py-1 gap-1 text-muted-foreground">
              <ShieldCheckIcon className="size-3 text-emerald-600" />
              <span>PCI-DSS & SOC2 Encrypted Record</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* 3. Compensation History Timeline */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <HistoryIcon className="size-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Remuneration Audit & Adjustment History ({compensationHistory.length})
          </h3>
        </div>

        {compensationHistory.length > 0 ? (
          <div className="space-y-4">
            {compensationHistory.map((item, index) => {
              const histAllowancesTotal =
                item.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0
              const histGross = item.basicSalary + histAllowancesTotal

              return (
                <div
                  key={item.id}
                  className="relative pl-6 pb-4 border-l-2 border-border/80 last:pb-0 last:border-l-transparent"
                >
                  {/* Dot */}
                  <span
                    className={`absolute -left-[7px] top-1 size-3 rounded-full border-2 border-background ${
                      index === 0 ? "bg-primary" : "bg-muted-foreground/60"
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {item.currency.split(" ")[0]}{" "}
                          {item.basicSalary.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {item.salaryType}
                        </Badge>
                        <span className="text-muted-foreground">
                          (Gross: {item.currency.split(" ")[0]}{" "}
                          {histGross.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                          )
                        </span>
                      </div>
                      <p className="font-medium text-foreground mt-1">{item.reason}</p>
                    </div>

                    <div className="text-left sm:text-right text-[11px] text-muted-foreground shrink-0">
                      <p className="font-medium text-foreground">
                        Effective: {item.effectiveDate}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                        Recorded by {item.changedBy}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No historical salary revisions recorded.
          </p>
        )}
      </div>

      {/* DIALOG: Update Compensation */}
      <Dialog open={isCompDialogOpen} onOpenChange={setIsCompDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveCompensation}>
            <DialogHeader>
              <DialogTitle>Update Compensation Structure</DialogTitle>
              <DialogDescription>
                Revise salary parameters for {employee.firstName}. This adjustment will
                automatically be logged in the audit history.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Salary Frequency" required>
                  <Select
                    value={salaryType}
                    onValueChange={(val) =>
                      setSalaryType(val as "monthly" | "hourly" | "annual")
                    }
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Salary</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="annual">Annual Package</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Disbursement Currency" required>
                  <Select value={currency} onValueChange={(val) => { if (val) setCurrency(val) }}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD ($)">USD ($)</SelectItem>
                      <SelectItem value="BDT (৳)">BDT (৳)</SelectItem>
                      <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                      <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Basic Remuneration" required>
                  <Input
                    type="number"
                    step="0.01"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Effective Date" required>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              {/* Allowances Editor */}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Allowances & Subsidies
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    {allowances.length} added
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Housing, Transport, Medical"
                    value={newAllowanceName}
                    onChange={(e) => setNewAllowanceName(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={newAllowanceAmount}
                    onChange={(e) => setNewAllowanceAmount(e.target.value)}
                    className="w-28 text-xs h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddAllowance}
                    className="h-8 shrink-0 gap-1"
                  >
                    <PlusIcon className="size-3" />
                    <span>Add</span>
                  </Button>
                </div>

                {allowances.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 mt-2">
                    {allowances.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-1.5"
                      >
                        <span className="font-medium text-foreground">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {currency.split(" ")[0]} {item.amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllowance(item.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                label="Adjustment Reason (Audit Log)"
                description="Required for tracking why this compensation revision took place."
                required
              >
                <Input
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g. Annual Merit Promotion, Role Level Reassignment"
                  required
                />
              </FormField>

              <FormField label="Internal Remuneration Notes">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional contractual notes or benefit eligibility details..."
                  rows={2}
                />
              </FormField>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCompDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Compensation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Edit Banking Details */}
      <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveBanking}>
            <DialogHeader>
              <DialogTitle>Edit Banking & Disbursement Coordinates</DialogTitle>
              <DialogDescription>
                Provide direct deposit account details for {employee.firstName}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4 text-xs">
              <FormField label="Disbursement Method" required>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) =>
                    setPaymentMethod(val as "bank_transfer" | "cash" | "other")
                  }
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Direct Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash Disbursement</SelectItem>
                    <SelectItem value="other">Other / Check</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Financial Institution / Bank Name">
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase, Standard Chartered"
                />
              </FormField>

              <FormField label="Beneficiary Account Name">
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name as printed on bank passbook"
                />
              </FormField>

              <FormField
                label="Account / IBAN Number"
                description="Will be masked by default when viewed on the profile."
              >
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1029384756 or US98CHAS12345678"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Routing Number">
                  <Input
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="9-digit routing"
                  />
                </FormField>

                <FormField label="SWIFT / BIC Code">
                  <Input
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="8 or 11 chars"
                  />
                </FormField>
              </div>

              <FormField label="Branch Name / Address">
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Wall Street Main Branch"
                />
              </FormField>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBankDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Banking Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
