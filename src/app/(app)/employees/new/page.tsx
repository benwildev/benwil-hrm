"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  BuildingIcon,
  CheckCircle2Icon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { FormField } from "@/components/shared/form-field"
import { PageContainer } from "@/components/shared/page-container"
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
import { authService, generateTemporaryPassword } from "@/lib/auth/auth-service"
import { departmentsService } from "@/lib/services/departments-service"
import { designationsService } from "@/lib/services/designations-service"
import { employeesService } from "@/lib/services/employees-service"
import { rolesService } from "@/lib/services/roles-service"
import { teamsService } from "@/lib/services/teams-service"
import { DATA_SCOPE_LABELS, type Role } from "@/types/roles"
import {
  EMPLOYMENT_TYPES,
  type Department,
  type Designation,
  type Employee,
  type EmployeeStatus,
  type EmploymentType,
  type Team,
} from "@/types/organization"

export default function NewEmployeePage() {
  const router = useRouter()

  // Master Data
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [teams, setTeams] = React.useState<Team[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [managers, setManagers] = React.useState<Employee[]>([])

  // Section 1: Personal Information
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [avatar, setAvatar] = React.useState("")

  // Section 2: Employment Details
  const [employeeCode, setEmployeeCode] = React.useState("")
  const [joiningDate, setJoiningDate] = React.useState(
    () => new Date().toISOString().split("T")[0]
  )
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>("full_time")
  const [status, setStatus] = React.useState<EmployeeStatus>("active")

  // Section 3: Organizational Placement
  const [departmentId, setDepartmentId] = React.useState("")
  const [teamId, setTeamId] = React.useState("")
  const [designationId, setDesignationId] = React.useState("")
  const [managerId, setManagerId] = React.useState("")

  // Section 4: Login Account Provisioning
  const [createAccount, setCreateAccount] = React.useState(false)
  const [loginEmail, setLoginEmail] = React.useState("")
  const [loginEmailManuallyEdited, setLoginEmailManuallyEdited] = React.useState(false)
  const [roles, setRoles] = React.useState<Role[]>([])
  const [selectedRoleId, setSelectedRoleId] = React.useState("role_employee")
  const [passwordOption, setPasswordOption] = React.useState<"generate" | "manual">("generate")
  const [manualPassword, setManualPassword] = React.useState("")
  const [generatedPassword, setGeneratedPassword] = React.useState(() => generateTemporaryPassword())
  const [showPassword, setShowPassword] = React.useState(false)

  // Success Modal State
  const [createdResult, setCreatedResult] = React.useState<{
    employee: Employee
    accountCreated: boolean
    loginEmail?: string
    temporaryPassword?: string
  } | null>(null)
  const [showResultPassword, setShowResultPassword] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    const allDepts = departmentsService.getDepartments()
    const allTeams = teamsService.getTeams()
    const allDes = designationsService.getDesignations()
    const allManagers = employeesService.getPossibleManagers()
    const allRoles = rolesService.getRoles()

    setDepartments(allDepts)
    setTeams(allTeams)
    setDesignations(allDes)
    setManagers(allManagers)
    setRoles(allRoles)

    if (allDepts.length > 0) {
      setDepartmentId(allDepts[0].id)
    }
    if (allDes.length > 0) {
      setDesignationId(allDes[0].id)
    }

    // Suggest next code
    const existingEmployees = employeesService.getEmployees()
    const nextNum = existingEmployees.length + 1001
    setEmployeeCode(`EMP-${nextNum}`)
  }, [])

  // Auto-sync login email with work email if user hasn't typed a custom login email
  const handleWorkEmailChange = (val: string) => {
    setEmail(val)
    if (!loginEmailManuallyEdited) {
      setLoginEmail(val)
    }
  }

  // Filtered teams based on department
  const departmentTeams = React.useMemo(() => {
    if (!departmentId) return []
    return teams.filter((t) => t.departmentId === departmentId)
  }, [teams, departmentId])

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const finalLoginEmail = loginEmail.trim().toLowerCase()
    const finalPassword = passwordOption === "generate" ? generatedPassword : manualPassword

    // Validation for Account Provisioning
    if (createAccount) {
      if (!finalLoginEmail || !finalLoginEmail.includes("@")) {
        setError("A valid login email address is required to provision an account.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      if (!authService.isLoginEmailAvailable(finalLoginEmail)) {
        setError("An account with this email already exists.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      if (passwordOption === "manual" && finalPassword.length < 8) {
        setError("Temporary password must be at least 8 characters long.")
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
    }

    // 1. Create Employee HR Record
    const empRes = employeesService.createEmployee({
      firstName,
      lastName,
      email,
      phone,
      employeeCode,
      departmentId,
      teamId: teamId || null,
      designationId,
      managerId: managerId || null,
      joiningDate,
      employmentType,
      status,
      avatar: avatar || undefined,
    })

    if (!empRes.success) {
      setError(empRes.error)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const createdEmp = empRes.data

    // 2. If login account requested, provision authentication account
    if (createAccount) {
      const isManagerDesignation = designationId === "des_em" || designationId === "des_hop" || designationId === "des_hos"
      const accRes = authService.createEmployeeAccount({
        employeeId: createdEmp.id,
        name: createdEmp.fullName,
        email: finalLoginEmail,
        passwordOption,
        manualPassword: passwordOption === "manual" ? manualPassword : undefined,
        roleId: selectedRoleId,
      })

      if (!accRes.success) {
        setError(accRes.error)
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      setCreatedResult({
        employee: createdEmp,
        accountCreated: true,
        loginEmail: finalLoginEmail,
        temporaryPassword: accRes.temporaryPassword,
      })
    } else {
      setIsSubmitting(false)
      setCreatedResult({
        employee: createdEmp,
        accountCreated: false,
      })
    }
  }

  return (
    <PageContainer className="gap-6 max-w-4xl mx-auto py-2">
      {/* Back button */}
      <div>
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Workforce Roster
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-border/80 pb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Add New Employee
        </h1>
        <p className="text-xs text-muted-foreground">
          Register a new team member, set organizational reporting lines, and establish job designations.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Personal Information */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <UserIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">1. Personal Information</h2>
              <p className="text-[11px] text-muted-foreground">Legal identification and direct contact details</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" required>
              <Input
                placeholder="e.g. Liam"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Last Name" required>
              <Input
                placeholder="e.g. Vance"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Work Email Address" required description="Must be unique within the organization.">
              <Input
                type="email"
                placeholder="liam.vance@benwilhrm.com"
                value={email}
                onChange={(e) => handleWorkEmailChange(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Contact Phone">
              <Input
                type="tel"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                label="Profile Avatar URL (Optional)"
                description="Direct URL to a professional portrait image. If left blank, a default portrait will be assigned."
              >
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* SECTION 2: Employment Details */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <UserCheckIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">2. Employment Information</h2>
              <p className="text-[11px] text-muted-foreground">Contract parameters, identifier, and joining records</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Employee ID / Badge Code" required description="Unique workforce identifier.">
              <Input
                placeholder="e.g. EMP-1015"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Joining Date" required>
              <Input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Employment Type" required>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              >
                {Object.values(EMPLOYMENT_TYPES).map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} — {type.description}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Initial Status" required>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
              >
                <option value="active">Active (Full Access)</option>
                <option value="onboarding">Onboarding (Induction)</option>
                <option value="probation">Probation (Evaluation)</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* SECTION 3: Organizational Hierarchy */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <BuildingIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">3. Organizational Placement</h2>
              <p className="text-[11px] text-muted-foreground">Department, team allocation, job designation, and manager</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Department" required>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value)
                  setTeamId("")
                }}
                required
              >
                <option value="" disabled>
                  -- Select Department --
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Team Assignment"
              description={
                departmentTeams.length === 0
                  ? "No teams registered under selected department"
                  : "Assigned within selected department"
              }
            >
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={departmentTeams.length === 0}
              >
                <option value="">-- No Specific Team (General) --</option>
                {departmentTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Job Designation" required>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={designationId}
                onChange={(e) => setDesignationId(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Select Job Title --
                </option>
                {designations.map((des) => (
                  <option key={des.id} value={des.id}>
                    {des.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Direct Manager"
              description="Direct reporting line between employees (cannot report to oneself)."
            >
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              >
                <option value="">-- None (Reports directly to Executive / CEO) --</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.employeeCode})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* SECTION 4: Login Account Provisioning */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <KeyRoundIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">4. Login Account</h2>
              <p className="text-[11px] text-muted-foreground">Authentication credentials and system login access</p>
            </div>
          </div>

          {/* Toggle checkbox */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="createLoginAccountToggle"
                checked={createAccount}
                onChange={(e) => {
                  setCreateAccount(e.target.checked)
                  if (e.target.checked && !loginEmail) {
                    setLoginEmail(email)
                  }
                }}
                className="size-4 mt-0.5 rounded border-input text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">
                  Create login account for this employee
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Allow this employee to access Benwil HRM. When disabled, the employee exists in HRM but has no system access.
                </p>
              </div>
            </label>
          </div>

          {/* Account Configuration Sub-form */}
          {createAccount && (
            <div className="pt-2 space-y-4 text-xs">
              <FormField
                label="Login Email Address"
                required
                description="Credential used to log in. Defaults to employee work email, but can be customized."
              >
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value)
                    setLoginEmailManuallyEdited(true)
                  }}
                  placeholder="name@benwilhrm.com"
                  required={createAccount}
                />
              </FormField>

              <FormField
                label="Assigned Application Role"
                required
                description="Determines system permissions and data scope for this account."
              >
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.isSystem ? "System" : "Custom"} — {DATA_SCOPE_LABELS[r.dataScope]?.label || r.dataScope})
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Initial Password Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPasswordOption("generate")}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      passwordOption === "generate"
                        ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 font-semibold text-foreground"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <p className="text-xs font-bold text-foreground">Generate temporary password</p>
                    <p className="text-[11px] text-muted-foreground">
                      Auto-generates a secure, high-entropy password (Recommended)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPasswordOption("manual")}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      passwordOption === "manual"
                        ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 font-semibold text-foreground"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <p className="text-xs font-bold text-foreground">Set temporary password manually</p>
                    <p className="text-[11px] text-muted-foreground">
                      Specify an initial custom password for the user
                    </p>
                  </button>
                </div>
              </div>

              {passwordOption === "generate" ? (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Generated Initial Password</span>
                    <button
                      type="button"
                      onClick={() => setGeneratedPassword(generateTemporaryPassword())}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground hover:underline"
                    >
                      <RefreshCwIcon className="size-3" />
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs">
                      {showPassword ? generatedPassword : "••••••••••••••••"}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-9 px-2.5"
                    >
                      {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <FormField
                  label="Custom Initial Password"
                  required={passwordOption === "manual"}
                  description="Minimum 8 characters. The employee must change this password upon first login."
                >
                  <Input
                    type="text"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Enter min 8 characters"
                    required={passwordOption === "manual"}
                  />
                </FormField>
              )}

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircleIcon className="size-3.5" />
                  First-Login Security Requirement
                </p>
                <p>
                  Initial passwords are automatically treated as temporary passwords. The employee will be forced to create a new password upon first sign-in.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/employees")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 px-6 font-semibold"
          >
            {isSubmitting ? "Creating Employee Record..." : "Create Employee"}
          </Button>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      <Dialog
        open={Boolean(createdResult)}
        onOpenChange={(open) => {
          if (!open && createdResult) {
            router.push(`/employees/${createdResult.employee.id}`)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {createdResult?.accountCreated ? (
            /* ACCOUNT CREATED SUCCESS */
            <>
              <DialogHeader>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
                  <ShieldCheckIcon className="size-6" />
                </div>
                <DialogTitle className="text-center text-lg font-bold">
                  Employee & Login Account Created
                </DialogTitle>
                <DialogDescription className="text-center text-xs">
                  {createdResult.employee.fullName} has been added successfully.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/60">
                    <span>Login Account</span>
                    <span className="font-semibold text-foreground">
                      {createdResult.loginEmail}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">Temporary Password</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm tracking-wide text-foreground">
                        {showResultPassword ? createdResult.temporaryPassword : "••••••••••••••••"}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResultPassword(!showResultPassword)}
                        className="h-9 px-2.5"
                      >
                        {showResultPassword ? (
                          <EyeOffIcon className="size-4" />
                        ) : (
                          <EyeIcon className="size-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(createdResult.temporaryPassword || "")}
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

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircleIcon className="size-3.5" />
                    Important Security Notice
                  </p>
                  <p className="leading-relaxed">
                    This temporary password will only be shown now. Save this password securely. The employee will be forced to change it on their first login.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => router.push(`/employees/${createdResult.employee.id}`)}
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs h-10 shadow-xs"
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* NO ACCOUNT SUCCESS */
            <>
              <DialogHeader>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-2">
                  <CheckCircle2Icon className="size-6" />
                </div>
                <DialogTitle className="text-center text-lg font-bold">
                  Employee Created Successfully
                </DialogTitle>
                <DialogDescription className="text-center text-xs">
                  {createdResult?.employee.fullName} has been registered in the workforce roster.
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 text-center text-xs text-muted-foreground">
                <p>Login access was not created for this employee.</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  You can provision a login account anytime from the employee&apos;s profile.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => router.push(`/employees/${createdResult?.employee.id}`)}
                  className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs h-10 shadow-xs"
                >
                  View Employee
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
