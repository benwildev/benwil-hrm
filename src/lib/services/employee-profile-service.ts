import type {
  Compensation,
  CompensationHistory,
  EmergencyContact,
  EmployeeActivity,
  EmployeeDocument,
  EmployeeNote,
  EmployeePersonalInfo,
  EmploymentDetails,
  PaymentInformation,
} from "@/types/employee-profile"
import {
  INITIAL_ACTIVITIES,
  INITIAL_COMPENSATION_HISTORIES,
  INITIAL_COMPENSATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_EMPLOYMENT_DETAILS,
  INITIAL_NOTES,
  INITIAL_PAYMENT_INFOS,
  INITIAL_PERSONAL_INFOS,
} from "./employee-profile-seed"

const STORAGE_KEYS = {
  PERSONAL: "benwil_hrm_personal_infos",
  EMERGENCY: "benwil_hrm_emergency_contacts",
  EMPLOYMENT: "benwil_hrm_employment_details",
  COMPENSATION: "benwil_hrm_compensations",
  COMPENSATION_HISTORY: "benwil_hrm_compensation_histories",
  PAYMENT: "benwil_hrm_payment_infos",
  DOCUMENTS: "benwil_hrm_employee_documents",
  NOTES: "benwil_hrm_employee_notes",
  ACTIVITIES: "benwil_hrm_employee_activities",
}

class EmployeeProfileService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(key)
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultValue))
        return defaultValue
      }
      return JSON.parse(item)
    } catch {
      return defaultValue
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage error
    }
  }

  // --- PERSONAL INFORMATION ---

  getPersonalInfo(employeeId: string): EmployeePersonalInfo {
    const map = this.getStorageItem<Record<string, EmployeePersonalInfo>>(
      STORAGE_KEYS.PERSONAL,
      INITIAL_PERSONAL_INFOS
    )
    return map[employeeId] || {}
  }

  updatePersonalInfo(
    employeeId: string,
    data: Partial<EmployeePersonalInfo>
  ): EmployeePersonalInfo {
    const map = this.getStorageItem<Record<string, EmployeePersonalInfo>>(
      STORAGE_KEYS.PERSONAL,
      INITIAL_PERSONAL_INFOS
    )
    const updated = { ...(map[employeeId] || {}), ...data }
    map[employeeId] = updated
    this.setStorageItem(STORAGE_KEYS.PERSONAL, map)

    this.logActivity(employeeId, {
      type: "profile_updated",
      title: "Personal Information Updated",
      description: "Employee personal contact and residential details were modified.",
      actorName: "System Administrator",
      actorRole: "Admin",
    })

    return updated
  }

  // --- EMERGENCY CONTACTS ---

  getEmergencyContacts(employeeId: string): EmergencyContact[] {
    const map = this.getStorageItem<Record<string, EmergencyContact[]>>(
      STORAGE_KEYS.EMERGENCY,
      INITIAL_EMERGENCY_CONTACTS
    )
    return map[employeeId] || []
  }

  addEmergencyContact(
    employeeId: string,
    contact: Omit<EmergencyContact, "id">
  ): EmergencyContact {
    const map = this.getStorageItem<Record<string, EmergencyContact[]>>(
      STORAGE_KEYS.EMERGENCY,
      INITIAL_EMERGENCY_CONTACTS
    )
    const existing = map[employeeId] || []
    const newContact: EmergencyContact = {
      ...contact,
      id: `emg_${Date.now()}`,
      isPrimary: existing.length === 0 ? true : Boolean(contact.isPrimary),
    }

    if (newContact.isPrimary) {
      existing.forEach((c) => (c.isPrimary = false))
    }

    map[employeeId] = [...existing, newContact]
    this.setStorageItem(STORAGE_KEYS.EMERGENCY, map)

    this.logActivity(employeeId, {
      type: "profile_updated",
      title: "Emergency Contact Added",
      description: `Emergency contact ${newContact.name} (${newContact.relationship}) was registered.`,
      actorName: "System Administrator",
      actorRole: "Admin",
    })

    return newContact
  }

  updateEmergencyContact(
    employeeId: string,
    contactId: string,
    data: Partial<EmergencyContact>
  ): EmergencyContact | null {
    const map = this.getStorageItem<Record<string, EmergencyContact[]>>(
      STORAGE_KEYS.EMERGENCY,
      INITIAL_EMERGENCY_CONTACTS
    )
    const list = map[employeeId] || []
    const index = list.findIndex((c) => c.id === contactId)
    if (index === -1) return null

    if (data.isPrimary) {
      list.forEach((c) => (c.isPrimary = false))
    }

    const updated = { ...list[index], ...data }
    list[index] = updated
    map[employeeId] = list
    this.setStorageItem(STORAGE_KEYS.EMERGENCY, map)
    return updated
  }

  deleteEmergencyContact(employeeId: string, contactId: string): boolean {
    const map = this.getStorageItem<Record<string, EmergencyContact[]>>(
      STORAGE_KEYS.EMERGENCY,
      INITIAL_EMERGENCY_CONTACTS
    )
    const list = map[employeeId] || []
    const filtered = list.filter((c) => c.id !== contactId)
    if (filtered.length === list.length) return false

    if (filtered.length > 0 && !filtered.some((c) => c.isPrimary)) {
      filtered[0].isPrimary = true
    }

    map[employeeId] = filtered
    this.setStorageItem(STORAGE_KEYS.EMERGENCY, map)
    return true
  }

  // --- EMPLOYMENT DETAILS ---

  getEmploymentDetails(employeeId: string): EmploymentDetails {
    const map = this.getStorageItem<Record<string, EmploymentDetails>>(
      STORAGE_KEYS.EMPLOYMENT,
      INITIAL_EMPLOYMENT_DETAILS
    )
    return (
      map[employeeId] || {
        noticePeriod: "30 Days",
        workLocation: "HQ - New York Office",
        contractType: "permanent",
      }
    )
  }

  updateEmploymentDetails(
    employeeId: string,
    data: Partial<EmploymentDetails>
  ): EmploymentDetails {
    const map = this.getStorageItem<Record<string, EmploymentDetails>>(
      STORAGE_KEYS.EMPLOYMENT,
      INITIAL_EMPLOYMENT_DETAILS
    )
    const updated = { ...(map[employeeId] || {}), ...data }
    map[employeeId] = updated
    this.setStorageItem(STORAGE_KEYS.EMPLOYMENT, map)

    this.logActivity(employeeId, {
      type: "profile_updated",
      title: "Employment Parameters Updated",
      description: "Work location, notice period, or probation timeline details were revised.",
      actorName: "System Administrator",
      actorRole: "Admin",
    })

    return updated
  }

  // --- COMPENSATION & HISTORY ---

  getCompensation(employeeId: string): Compensation | null {
    const map = this.getStorageItem<Record<string, Compensation>>(
      STORAGE_KEYS.COMPENSATION,
      INITIAL_COMPENSATIONS
    )
    return map[employeeId] || null
  }

  getCompensationHistory(employeeId: string): CompensationHistory[] {
    const map = this.getStorageItem<Record<string, CompensationHistory[]>>(
      STORAGE_KEYS.COMPENSATION_HISTORY,
      INITIAL_COMPENSATION_HISTORIES
    )
    return map[employeeId] || []
  }

  updateCompensation(
    employeeId: string,
    newComp: Compensation,
    reason = "Compensation Adjustment",
    changedBy = "System Administrator"
  ): { compensation: Compensation; history: CompensationHistory } {
    const compMap = this.getStorageItem<Record<string, Compensation>>(
      STORAGE_KEYS.COMPENSATION,
      INITIAL_COMPENSATIONS
    )
    compMap[employeeId] = newComp
    this.setStorageItem(STORAGE_KEYS.COMPENSATION, compMap)

    const histMap = this.getStorageItem<Record<string, CompensationHistory[]>>(
      STORAGE_KEYS.COMPENSATION_HISTORY,
      INITIAL_COMPENSATION_HISTORIES
    )
    const existingHist = histMap[employeeId] || []

    const newHistoryEntry: CompensationHistory = {
      id: `ch_${Date.now()}`,
      effectiveDate: newComp.effectiveDate,
      salaryType: newComp.salaryType,
      basicSalary: newComp.basicSalary,
      allowances: newComp.allowances,
      currency: newComp.paymentCurrency,
      reason,
      changedBy,
      createdAt: new Date().toISOString(),
    }

    histMap[employeeId] = [newHistoryEntry, ...existingHist]
    this.setStorageItem(STORAGE_KEYS.COMPENSATION_HISTORY, histMap)

    this.logActivity(employeeId, {
      type: "compensation_updated",
      title: "Compensation Structure Revised",
      description: `${newComp.paymentCurrency} ${newComp.basicSalary.toLocaleString()} (${newComp.salaryType}) - ${reason}`,
      actorName: changedBy,
      actorRole: "Admin",
    })

    return { compensation: newComp, history: newHistoryEntry }
  }

  // --- PAYMENT INFORMATION ---

  getPaymentInformation(employeeId: string): PaymentInformation | null {
    const map = this.getStorageItem<Record<string, PaymentInformation>>(
      STORAGE_KEYS.PAYMENT,
      INITIAL_PAYMENT_INFOS
    )
    return map[employeeId] || null
  }

  updatePaymentInformation(
    employeeId: string,
    data: Partial<PaymentInformation>
  ): PaymentInformation {
    const map = this.getStorageItem<Record<string, PaymentInformation>>(
      STORAGE_KEYS.PAYMENT,
      INITIAL_PAYMENT_INFOS
    )
    const updated = {
      ...(map[employeeId] || { paymentMethod: "bank_transfer" as const }),
      ...data,
    }
    map[employeeId] = updated
    this.setStorageItem(STORAGE_KEYS.PAYMENT, map)

    this.logActivity(employeeId, {
      type: "profile_updated",
      title: "Payment Information Modified",
      description: "Employee banking and disbursement parameters were updated securely.",
      actorName: "System Administrator",
      actorRole: "Admin",
    })

    return updated
  }

  // --- DOCUMENTS ---

  getDocuments(employeeId: string): EmployeeDocument[] {
    const map = this.getStorageItem<Record<string, EmployeeDocument[]>>(
      STORAGE_KEYS.DOCUMENTS,
      INITIAL_DOCUMENTS
    )
    return map[employeeId] || []
  }

  addDocument(
    employeeId: string,
    doc: Omit<EmployeeDocument, "id" | "employeeId" | "uploadedDate">
  ): EmployeeDocument {
    const map = this.getStorageItem<Record<string, EmployeeDocument[]>>(
      STORAGE_KEYS.DOCUMENTS,
      INITIAL_DOCUMENTS
    )
    const existing = map[employeeId] || []
    const newDoc: EmployeeDocument = {
      ...doc,
      id: `doc_${Date.now()}`,
      employeeId,
      uploadedDate: new Date().toISOString().split("T")[0],
    }

    map[employeeId] = [newDoc, ...existing]
    this.setStorageItem(STORAGE_KEYS.DOCUMENTS, map)

    this.logActivity(employeeId, {
      type: "document_uploaded",
      title: "Document Uploaded",
      description: `Uploaded "${newDoc.name}" (${newDoc.fileName}) into ${newDoc.category} category.`,
      actorName: newDoc.uploadedBy || "System Administrator",
      actorRole: "Admin",
    })

    return newDoc
  }

  deleteDocument(employeeId: string, docId: string): boolean {
    const map = this.getStorageItem<Record<string, EmployeeDocument[]>>(
      STORAGE_KEYS.DOCUMENTS,
      INITIAL_DOCUMENTS
    )
    const list = map[employeeId] || []
    const doc = list.find((d) => d.id === docId)
    const filtered = list.filter((d) => d.id !== docId)
    if (filtered.length === list.length) return false

    map[employeeId] = filtered
    this.setStorageItem(STORAGE_KEYS.DOCUMENTS, map)

    if (doc) {
      this.logActivity(employeeId, {
        type: "profile_updated",
        title: "Document Removed",
        description: `Deleted document "${doc.name}" from employee records.`,
        actorName: "System Administrator",
        actorRole: "Admin",
      })
    }

    return true
  }

  // --- INTERNAL HR NOTES ---

  getNotes(employeeId: string): EmployeeNote[] {
    const map = this.getStorageItem<Record<string, EmployeeNote[]>>(
      STORAGE_KEYS.NOTES,
      INITIAL_NOTES
    )
    return map[employeeId] || []
  }

  addNote(
    employeeId: string,
    content: string,
    authorName = "Amara Whitfield",
    authorRole = "System Administrator"
  ): EmployeeNote {
    const map = this.getStorageItem<Record<string, EmployeeNote[]>>(
      STORAGE_KEYS.NOTES,
      INITIAL_NOTES
    )
    const existing = map[employeeId] || []
    const newNote: EmployeeNote = {
      id: `note_${Date.now()}`,
      employeeId,
      authorName,
      authorRole,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    map[employeeId] = [newNote, ...existing]
    this.setStorageItem(STORAGE_KEYS.NOTES, map)

    this.logActivity(employeeId, {
      type: "note_added",
      title: "Internal Note Added",
      description: "A new internal HR management note was recorded.",
      actorName: authorName,
      actorRole: authorRole,
    })

    return newNote
  }

  updateNote(
    employeeId: string,
    noteId: string,
    content: string
  ): EmployeeNote | null {
    const map = this.getStorageItem<Record<string, EmployeeNote[]>>(
      STORAGE_KEYS.NOTES,
      INITIAL_NOTES
    )
    const list = map[employeeId] || []
    const index = list.findIndex((n) => n.id === noteId)
    if (index === -1) return null

    const updated: EmployeeNote = {
      ...list[index],
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    }
    list[index] = updated
    map[employeeId] = list
    this.setStorageItem(STORAGE_KEYS.NOTES, map)
    return updated
  }

  deleteNote(employeeId: string, noteId: string): boolean {
    const map = this.getStorageItem<Record<string, EmployeeNote[]>>(
      STORAGE_KEYS.NOTES,
      INITIAL_NOTES
    )
    const list = map[employeeId] || []
    const filtered = list.filter((n) => n.id !== noteId)
    if (filtered.length === list.length) return false

    map[employeeId] = filtered
    this.setStorageItem(STORAGE_KEYS.NOTES, map)
    return true
  }

  // --- ACTIVITY TIMELINE ---

  getActivities(employeeId: string): EmployeeActivity[] {
    const map = this.getStorageItem<Record<string, EmployeeActivity[]>>(
      STORAGE_KEYS.ACTIVITIES,
      INITIAL_ACTIVITIES
    )
    return map[employeeId] || []
  }

  logActivity(
    employeeId: string,
    activity: Omit<EmployeeActivity, "id" | "employeeId" | "timestamp">
  ): EmployeeActivity {
    const map = this.getStorageItem<Record<string, EmployeeActivity[]>>(
      STORAGE_KEYS.ACTIVITIES,
      INITIAL_ACTIVITIES
    )
    const existing = map[employeeId] || []
    const newAct: EmployeeActivity = {
      ...activity,
      id: `act_${Date.now()}`,
      employeeId,
      timestamp: new Date().toISOString(),
    }

    map[employeeId] = [newAct, ...existing]
    this.setStorageItem(STORAGE_KEYS.ACTIVITIES, map)
    return newAct
  }
}

export const employeeProfileService = new EmployeeProfileService()
