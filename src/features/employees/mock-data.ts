export interface Employee {
  id: string
  name: string
  email: string
  department: string
  role: string
  status: "Active" | "On Leave" | "Inactive"
}

export const mockEmployees: Employee[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@benwilhrm.com", department: "Engineering", role: "Senior Frontend Engineer", status: "Active" },
  { id: "2", name: "David Kim", email: "david.kim@benwilhrm.com", department: "Engineering", role: "Backend Engineer", status: "Active" },
  { id: "3", name: "Priya Patel", email: "priya.patel@benwilhrm.com", department: "Design", role: "Product Designer", status: "On Leave" },
  { id: "4", name: "Marcus Reid", email: "marcus.reid@benwilhrm.com", department: "Sales", role: "Account Executive", status: "Active" },
  { id: "5", name: "Elena Novak", email: "elena.novak@benwilhrm.com", department: "Marketing", role: "Marketing Manager", status: "Active" },
  { id: "6", name: "James O'Connor", email: "james.oconnor@benwilhrm.com", department: "Finance", role: "Financial Analyst", status: "Inactive" },
  { id: "7", name: "Aiko Tanaka", email: "aiko.tanaka@benwilhrm.com", department: "Engineering", role: "DevOps Engineer", status: "Active" },
  { id: "8", name: "Liam Walsh", email: "liam.walsh@benwilhrm.com", department: "Support", role: "Support Specialist", status: "Active" },
  { id: "9", name: "Fatima Al-Sayed", email: "fatima.alsayed@benwilhrm.com", department: "HR", role: "HR Business Partner", status: "Active" },
  { id: "10", name: "Noah Bergstrom", email: "noah.bergstrom@benwilhrm.com", department: "Sales", role: "Sales Development Rep", status: "On Leave" },
  { id: "11", name: "Grace Osei", email: "grace.osei@benwilhrm.com", department: "Design", role: "UX Researcher", status: "Active" },
  { id: "12", name: "Tomas Alves", email: "tomas.alves@benwilhrm.com", department: "Engineering", role: "Mobile Engineer", status: "Active" },
]

export const departments = Array.from(
  new Set(mockEmployees.map((employee) => employee.department))
)
