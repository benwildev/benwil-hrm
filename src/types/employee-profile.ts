export interface EmployeePersonalInfo {
  preferredName?: string
  dateOfBirth?: string // YYYY-MM-DD
  gender?: "male" | "female" | "other" | "prefer_not_to_say"
  personalEmail?: string
  alternatePhone?: string
  addressLine?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  alternatePhone?: string
  email?: string
  address?: string
  isPrimary?: boolean
}

export interface EmploymentDetails {
  probationEndDate?: string // YYYY-MM-DD
  confirmationDate?: string // YYYY-MM-DD
  noticePeriod?: string // e.g. "30 Days", "60 Days"
  workLocation?: string // e.g. "HQ - New York", "Remote", "Dhaka Center"
  employmentEndDate?: string // YYYY-MM-DD (only populated if terminated/inactive)
  contractType?: "permanent" | "probationary" | "fixed_term" | "internship"
  workSchedule?: string // e.g. "Standard Operating Shift (09:00 AM - 05:00 PM, Mon-Fri)"
}

export interface AllowanceItem {
  id: string
  name: string
  amount: number
}

export interface Compensation {
  salaryType: "monthly" | "hourly" | "annual"
  basicSalary: number
  allowances: AllowanceItem[]
  effectiveDate: string // YYYY-MM-DD
  paymentCurrency: string // e.g. "USD ($)", "BDT (৳)", "EUR (€)"
  notes?: string
}

export interface CompensationHistory {
  id: string
  effectiveDate: string
  salaryType: "monthly" | "hourly" | "annual"
  basicSalary: number
  allowances: AllowanceItem[]
  currency: string
  reason: string // e.g. "Annual Performance Review", "Starting Salary", "Promotion to Lead"
  changedBy: string
  createdAt: string
}

export interface PaymentInformation {
  paymentMethod: "bank_transfer" | "cash" | "other"
  bankName?: string
  accountName?: string
  accountNumber?: string // Stored, masked for display e.g. "•••• •••• 4589"
  branch?: string
  routingNumber?: string
  swiftCode?: string
}

export type DocumentCategory =
  | "contract"
  | "offer_letter"
  | "id_proof"
  | "passport"
  | "certificate"
  | "company_policy"
  | "other"

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  contract: "Employment Contract",
  offer_letter: "Offer Letter",
  id_proof: "Identification (NID/SSN)",
  passport: "Passport",
  certificate: "Educational Certificate",
  company_policy: "Company Policy Agreement",
  other: "Other Document",
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  name: string
  category: DocumentCategory
  fileName: string
  fileSize: string
  fileType: string
  uploadedBy: string
  uploadedDate: string // ISO string or YYYY-MM-DD
  status: "verified" | "pending" | "archived"
  url?: string
}

export interface EmployeeNote {
  id: string
  employeeId: string
  authorName: string
  authorRole: string
  content: string
  createdAt: string
  updatedAt: string
}

export type ActivityType =
  | "profile_updated"
  | "account_created"
  | "password_changed"
  | "compensation_updated"
  | "document_uploaded"
  | "team_changed"
  | "status_changed"
  | "note_added"

export interface EmployeeActivity {
  id: string
  employeeId: string
  type: ActivityType
  title: string
  description: string
  timestamp: string // ISO string
  actorName: string
  actorRole: string
}
