import type { Designation } from "@/types/organization"
import { INITIAL_DESIGNATIONS } from "./seed-data"

const STORAGE_KEY = "benwil_hrm_designations"

class DesignationsService {
  private getStorage(): Designation[] {
    if (typeof window === "undefined") return INITIAL_DESIGNATIONS
    try {
      const item = localStorage.getItem(STORAGE_KEY)
      if (!item) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DESIGNATIONS))
        return INITIAL_DESIGNATIONS
      }
      return JSON.parse(item)
    } catch {
      return INITIAL_DESIGNATIONS
    }
  }

  private setStorage(designations: Designation[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designations))
    } catch {
      // Storage error
    }
  }

  getDesignations(): Designation[] {
    return this.getStorage()
  }

  getDesignation(id: string): Designation | null {
    return this.getStorage().find((d) => d.id === id) || null
  }

  createDesignation(payload: {
    name: string
    description?: string
    departmentId?: string | null
  }): { success: true; data: Designation } | { success: false; error: string } {
    const trimmedName = payload.name.trim()
    if (!trimmedName) {
      return { success: false, error: "Designation title is required." }
    }

    const designations = this.getStorage()
    const duplicate = designations.some(
      (d) => d.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        error: `A designation named "${trimmedName}" already exists.`,
      }
    }

    const newDesignation: Designation = {
      id: `des_${Date.now()}`,
      name: trimmedName,
      description: payload.description?.trim() || "",
      departmentId: payload.departmentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newDesignation, ...designations]
    this.setStorage(updated)
    return { success: true, data: newDesignation }
  }

  updateDesignation(
    id: string,
    payload: {
      name?: string
      description?: string
      departmentId?: string | null
    }
  ): { success: true; data: Designation } | { success: false; error: string } {
    const designations = this.getStorage()
    const index = designations.findIndex((d) => d.id === id)
    if (index === -1) {
      return { success: false, error: "Designation not found." }
    }

    const current = designations[index]
    const updatedName = payload.name !== undefined ? payload.name.trim() : current.name

    if (!updatedName) {
      return { success: false, error: "Designation title cannot be empty." }
    }

    const duplicate = designations.some(
      (d) => d.id !== id && d.name.toLowerCase() === updatedName.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        error: `A designation named "${updatedName}" already exists.`,
      }
    }

    const updatedDesignation: Designation = {
      ...current,
      name: updatedName,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : current.description,
      departmentId:
        payload.departmentId !== undefined
          ? payload.departmentId
          : current.departmentId,
      updatedAt: new Date().toISOString(),
    }

    designations[index] = updatedDesignation
    this.setStorage(designations)
    return { success: true, data: updatedDesignation }
  }

  deleteDesignation(id: string): { success: true } | { success: false; error: string } {
    const designations = this.getStorage()
    const exists = designations.some((d) => d.id === id)
    if (!exists) {
      return { success: false, error: "Designation not found." }
    }

    const filtered = designations.filter((d) => d.id !== id)
    this.setStorage(filtered)
    return { success: true }
  }
}

export const designationsService = new DesignationsService()
