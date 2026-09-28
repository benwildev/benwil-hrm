"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  MailIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserPlusIcon,
  UserXIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
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
import { ChangeRoleDialog } from "@/features/roles/change-role-dialog"
import { authService, generateTemporaryPassword } from "@/lib/auth/auth-service"
import { rolesService } from "@/lib/services/roles-service"
import { DATA_SCOPE_LABELS } from "@/types/roles"
import type { AccountStatus, EmployeeAccount } from "@/types/auth"
import type { Employee } from "@/types/organization"

interface AccountAccessCardProps {
  employee: Employee
  onAccountChange?: () => void
}

export function AccountAccessCard({ employee, onAccountChange }: AccountAccessCardProps) {
  const [account, setAccount] = React.useState<EmployeeAccount | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Dialog States
  const [isDisableDialogOpen, setIsDisableDialogOpen] = React.useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = React.useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = React.useState(false)
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = React.useState(false)

  // One-time Temporary Password Reveal Modal
  const [revealPassword, setRevealPassword] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Form State for Creating Account
  const [createEmail, setCreateEmail] = React.useState(employee.email)
  const [createRoleId, setCreateRoleId] = React.useState("role_employee")
  const [availableRoles, setAvailableRoles] = React.useState(() => rolesService.getRoles())
  const [passwordOption, setPasswordOption] = React.useState<"generate" | "manual">("generate")
  const [manualPassword, setManualPassword] = React.useState("")
  const [generatedPassword, setGeneratedPassword] = React.useState(() => generateTemporaryPassword())
  const [showCreatedPassword, setShowCreatedPassword] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)

  // Form State for Changing Login Email
  const [newLoginEmail, setNewLoginEmail] = React.useState("")
  const [changeEmailError, setChangeEmailError] = React.useState<string | null>(null)

  const loadAccount = React.useCallback(() => {
    const acc = authService.getAccountByEmployeeId(employee.id)
    setAccount(acc)
  }, [employee.id])

  React.useEffect(() => {
    loadAccount()
  }, [loadAccount])

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // --- ACTIONS ---

  const handleDisableConfirm = () => {
    setErrorMessage(null)
    const res = authService.disableEmployeeAccount(employee.id)
    setIsDisableDialogOpen(false)
    if (res.success) {
      loadAccount()
      onAccountChange?.()
    } else {
      setErrorMessage(res.error)
    }
  }

  const handleEnableAccount = () => {
    setErrorMessage(null)
    const res = authService.enableEmployeeAccount(employee.id)
    if (res.success) {
      loadAccount()
      onAccountChange?.()
    } else {
      setErrorMessage(res.error)
    }
  }

  const handleResetPasswordConfirm = () => {
    setErrorMessage(null)
    const res = authService.resetEmployeePassword(employee.id)
    setIsResetPasswordDialogOpen(false)
    if (res.success) {
      loadAccount()
      onAccountChange?.()
      setRevealPassword(res.temporaryPassword)
      setShowPassword(false)
      setCopied(false)
    } else {
      setErrorMessage(res.error)
    }
  }

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)

    const finalPassword = passwordOption === "generate" ? generatedPassword : manualPassword

    if (passwordOption === "manual" && finalPassword.length < 8) {
      setCreateError("Password must be at least 8 characters long.")
      return
    }

    const res = authService.createEmployeeAccount({
      employeeId: employee.id,
      name: employee.fullName,
      email: createEmail.trim().toLowerCase(),
      passwordOption,
      manualPassword: passwordOption === "manual" ? manualPassword : undefined,
      roleId: createRoleId,
    })

    if (!res.success) {
      setCreateError(res.error)
      return
    }

    setIsCreateDialogOpen(false)
    loadAccount()
    onAccountChange?.()

    // Show temporary password reveal modal
    setRevealPassword(res.temporaryPassword)
    setShowPassword(false)
    setCopied(false)
  }

  const handleChangeEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setChangeEmailError(null)

    const res = authService.updateLoginEmail(employee.id, newLoginEmail)
    if (!res.success) {
      setChangeEmailError(res.error)
      return
    }

    setIsChangeEmailDialogOpen(false)
    loadAccount()
    onAccountChange?.()
  }

  const renderStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1.5 font-semibold text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </Badge>
        )
      case "disabled":
        return (
          <Badge
            variant="outline"
            className="border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 gap-1.5 font-semibold text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-zinc-500" />
            Disabled
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400 gap-1.5 font-semibold text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending First Login
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1.5 capitalize text-[11px]">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            {status}
          </Badge>
        )
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <KeyRoundIcon className="size-4 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Access
            </h2>
          </div>
          {account && renderStatusBadge(account.status)}
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            <ShieldAlertIcon className="size-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {account ? (
          /* STATE: Account Exists */
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Login Credential Email</span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-foreground truncate">
                  <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{account.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewLoginEmail(account.email)
                    setChangeEmailError(null)
                    setIsChangeEmailDialogOpen(true)
                  }}
                  className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0 ml-2"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Assigned Role */}
            {(() => {
              const assignedRole = rolesService.getRoleForAccount(account)
              const scopeLabel = DATA_SCOPE_LABELS[assignedRole.dataScope]?.label || assignedRole.dataScope
              return (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Assigned Role</span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[9.5px] font-medium ${
                          assignedRole.isSystem
                            ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}
                      >
                        {assignedRole.isSystem ? "System" : "Custom"}
                      </Badge>
                      <Badge variant="outline" className="text-[9.5px] font-mono">
                        {scopeLabel}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-foreground text-xs flex items-center gap-1.5 truncate">
                        <ShieldCheckIcon className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{assignedRole.name}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {assignedRole.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangeRoleDialogOpen(true)}
                      className="text-xs h-7 px-2.5 shrink-0"
                    >
                      Change Role
                    </Button>
                  </div>
                </div>
              )
            })()}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
                <span className="text-[11px] text-muted-foreground">Last Login</span>
                <p className="font-semibold text-foreground">
                  {account.lastLoginAt
                    ? new Date(account.lastLoginAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never logged in"}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1">
                <span className="text-[11px] text-muted-foreground">First Login Status</span>
                <p className="font-semibold text-foreground">
                  {account.mustChangePassword ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      Pending password change
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
                  )}
                </p>
              </div>
            </div>

            {/* Account Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              {account.status === "disabled" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableAccount}
                  className="text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                >
                  <UserCheckIcon className="size-3.5" />
                  Enable Account
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDisableDialogOpen(true)}
                  className="text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <UserXIcon className="size-3.5" />
                  Disable Account
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetPasswordDialogOpen(true)}
                className="text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
              >
                <KeyRoundIcon className="size-3.5" />
                Reset Password
              </Button>
            </div>
          </div>
        ) : (
          /* STATE: No Account */
          <div className="space-y-3.5 text-xs">
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-3.5 space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground">No Login Account</p>
              <p className="text-[11px] leading-relaxed">
                This employee currently exists as an HR record but cannot sign in to Benwil HRM.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateEmail(employee.email)
                setCreateRoleId(employee.designationId === "des_em" ? "role_manager" : "role_employee")
                setAvailableRoles(rolesService.getRoles())
                setManualPassword("")
                setGeneratedPassword(generateTemporaryPassword())
                setPasswordOption("generate")
                setCreateError(null)
                setIsCreateDialogOpen(true)
              }}
              className="w-full text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <UserPlusIcon className="size-3.5 mr-1.5" />
              Create Login Account
            </Button>
          </div>
        )}
      </div>

      {/* DIALOG 1: Disable Account Confirmation */}
      <ConfirmDialog
        open={isDisableDialogOpen}
        onOpenChange={setIsDisableDialogOpen}
        title="Disable Login Access?"
        description="The employee will no longer be able to sign in to Benwil HRM. Their employee records and work history will remain completely intact."
        confirmLabel="Disable Account"
        variant="destructive"
        onConfirm={handleDisableConfirm}
      />

      {/* DIALOG 2: Reset Password Confirmation */}
      <ConfirmDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        title="Reset this employee's password?"
        description="After resetting, a new temporary password will be generated. The employee will be required to create their own new password upon next login."
        confirmLabel="Reset Password"
        variant="default"
        onConfirm={handleResetPasswordConfirm}
      />

      {/* DIALOG 3: One-Time Temporary Password Reveal Modal */}
      <Dialog
        open={Boolean(revealPassword)}
        onOpenChange={(open) => {
          if (!open) {
            setRevealPassword(null)
            setShowPassword(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
              <ShieldCheckIcon className="size-5" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Temporary Password Generated
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Save this password securely. For security, it will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Account Login Email</span>
                <span className="font-semibold text-foreground">
                  {account?.email || createEmail}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Temporary Password</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm tracking-wide text-foreground">
                    {showPassword ? revealPassword : "••••••••••••••••"}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-9 px-2.5"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(revealPassword || "")}
                    className="h-9 px-2.5 font-medium"
                  >
                    {copied ? (
                      <CheckCircle2Icon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircleIcon className="size-3.5" />
                First-Login Security Policy
              </p>
              <p className="leading-relaxed">
                The employee will be forced to change this temporary password before they can access the Benwil HRM workspace.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              onClick={() => {
                setRevealPassword(null)
                setShowPassword(false)
              }}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold px-6"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: Create Login Account Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateAccountSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Provision Login Account
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enable workspace access for {employee.fullName}.
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {createError}
              </div>
            )}

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Login Credential Email
                </label>
                <Input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used by the employee to authenticate into Benwil HRM.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Assigned Application Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={createRoleId}
                  onChange={(e) => setCreateRoleId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.isSystem ? "System" : "Custom"} - {DATA_SCOPE_LABELS[r.dataScope]?.label || r.dataScope})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Determines application permissions and data scope for this account.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Initial Password Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordOption("generate")}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      passwordOption === "generate"
                        ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 font-semibold text-foreground"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <p className="text-xs">Generate Temporary</p>
                    <p className="text-[10px] text-muted-foreground">Recommended</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPasswordOption("manual")}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      passwordOption === "manual"
                        ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 font-semibold text-foreground"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <p className="text-xs">Set Manually</p>
                    <p className="text-[10px] text-muted-foreground">Custom password</p>
                  </button>
                </div>
              </div>

              {passwordOption === "generate" ? (
                <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Generated Temporary Password</span>
                    <button
                      type="button"
                      onClick={() => setGeneratedPassword(generateTemporaryPassword())}
                      className="flex items-center gap-1 text-[10px] text-foreground hover:underline"
                    >
                      <RefreshCwIcon className="size-3" />
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs">
                      {showCreatedPassword ? generatedPassword : "••••••••••••••••"}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreatedPassword(!showCreatedPassword)}
                      className="h-8 px-2"
                    >
                      {showCreatedPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Custom Temporary Password
                  </label>
                  <Input
                    type="text"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Enter min 8 characters"
                    className="text-xs"
                    required
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold"
              >
                Provision Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 5: Change Login Email Modal */}
      <Dialog open={isChangeEmailDialogOpen} onOpenChange={setIsChangeEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleChangeEmailSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Update Login Email
              </DialogTitle>
              <DialogDescription className="text-xs">
                Change the credential email used to authenticate into Benwil HRM.
              </DialogDescription>
            </DialogHeader>

            {changeEmailError && (
              <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {changeEmailError}
              </div>
            )}

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  New Login Email Address
                </label>
                <Input
                  type="email"
                  value={newLoginEmail}
                  onChange={(e) => setNewLoginEmail(e.target.value)}
                  placeholder="new.email@company.com"
                  required
                  className="text-xs"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  Must be unique across all system login accounts.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangeEmailDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold"
              >
                Save Login Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 6: Change Role Dialog */}
      {account && (
        <ChangeRoleDialog
          open={isChangeRoleDialogOpen}
          onOpenChange={setIsChangeRoleDialogOpen}
          employee={employee}
          account={account}
          onRoleChanged={() => {
            loadAccount()
            onAccountChange?.()
          }}
        />
      )}
    </>
  )
}
