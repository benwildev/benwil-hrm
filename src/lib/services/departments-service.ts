import type { Department } from "@/types/organization"
import { INITIAL_DEPARTMENTS } from "./seed-data"

const STORAGE_KEY = "benwil_hrm_departments"

class DepartmentsService {
  private getStorage(): Department[] {
    if (typeof window === "undefined") return INITIAL_DEPARTMENTS
    try {
      const item = localStorage.getItem(STORAGE_KEY)
      if (!item) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEPARTMENTS))
        return INITIAL_DEPARTMENTS
      }
      return JSON.parse(item)
    } catch {
      return INITIAL_DEPARTMENTS
    }
  }

  private setStorage(departments: Department[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments))
    } catch {
      // Storage error
    }
  }

  getDepartments(): Department[] {
    return this.getStorage()
  }

  getDepartment(id: string): Department | null {
    return this.getStorage().find((d) => d.id === id) || null
  }

  createDepartment(payload: {
    name: string
    description?: string
    managerId?: string | null
    status?: "active" | "inactive"
  }): { success: true; data: Department } | { success: false; error: string } {
    const trimmedName = payload.name.trim()
    if (!trimmedName) {
      return { success: false, error: "Department name is required." }
    }

    const departments = this.getStorage()
    const duplicate = departments.some(
      (d) => d.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        error: `A department named "${trimmedName}" already exists.`,
      }
    }

    const newDepartment: Department = {
      id: `dept_${Date.now()}`,
      name: trimmedName,
      description: payload.description?.trim() || "",
      managerId: payload.managerId || null,
      status: payload.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newDepartment, ...departments]
    this.setStorage(updated)
    return { success: true, data: newDepartment }
  }

  updateDepartment(
    id: string,
    payload: {
      name?: string
      description?: string
      managerId?: string | null
      status?: "active" | "inactive"
    }
  ): { success: true; data: Department } | { success: false; error: string } {
    const departments = this.getStorage()
    const index = departments.findIndex((d) => d.id === id)
    if (index === -1) {
      return { success: false, error: "Department not found." }
    }

    const current = departments[index]
    const updatedName = payload.name !== undefined ? payload.name.trim() : current.name

    if (!updatedName) {
      return { success: false, error: "Department name cannot be empty." }
    }

    const duplicate = departments.some(
      (d) => d.id !== id && d.name.toLowerCase() === updatedName.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        error: `A department named "${updatedName}" already exists.`,
      }
    }

    const updatedDepartment: Department = {
      ...current,
      name: updatedName,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : current.description,
      managerId:
        payload.managerId !== undefined ? payload.managerId : current.managerId,
      status: payload.status !== undefined ? payload.status : current.status,
      updatedAt: new Date().toISOString(),
    }

    departments[index] = updatedDepartment
    this.setStorage(departments)
    return { success: true, data: updatedDepartment }
  }

  deleteDepartment(id: string): { success: true } | { success: false; error: string } {
    const departments = this.getStorage()
    const exists = departments.some((d) => d.id === id)
    if (!exists) {
      return { success: false, error: "Department not found." }
    }

    const filtered = departments.filter((d) => d.id !== id)
    this.setStorage(filtered)
    return { success: true }
  }
}

export const departmentsService = new DepartmentsService()
