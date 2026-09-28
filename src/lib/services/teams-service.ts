import type { Team } from "@/types/organization"
import { INITIAL_TEAMS } from "./seed-data"

const STORAGE_KEY = "benwil_hrm_teams"

class TeamsService {
  private getStorage(): Team[] {
    if (typeof window === "undefined") return INITIAL_TEAMS
    try {
      const item = localStorage.getItem(STORAGE_KEY)
      if (!item) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEAMS))
        return INITIAL_TEAMS
      }
      return JSON.parse(item)
    } catch {
      return INITIAL_TEAMS
    }
  }

  private setStorage(teams: Team[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
    } catch {
      // Storage error
    }
  }

  getTeams(departmentId?: string): Team[] {
    const teams = this.getStorage()
    if (departmentId && departmentId !== "all") {
      return teams.filter((t) => t.departmentId === departmentId)
    }
    return teams
  }

  getTeam(id: string): Team | null {
    return this.getStorage().find((t) => t.id === id) || null
  }

  createTeam(payload: {
    name: string
    departmentId: string
    leadId?: string | null
    description?: string
  }): { success: true; data: Team } | { success: false; error: string } {
    const trimmedName = payload.name.trim()
    if (!trimmedName) {
      return { success: false, error: "Team name is required." }
    }
    if (!payload.departmentId) {
      return { success: false, error: "Department is required." }
    }

    const teams = this.getStorage()
    const duplicate = teams.some(
      (t) =>
        t.departmentId === payload.departmentId &&
        t.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        error: `A team named "${trimmedName}" already exists in this department.`,
      }
    }

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: trimmedName,
      departmentId: payload.departmentId,
      leadId: payload.leadId || null,
      description: payload.description?.trim() || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newTeam, ...teams]
    this.setStorage(updated)
    return { success: true, data: newTeam }
  }

  updateTeam(
    id: string,
    payload: {
      name?: string
      departmentId?: string
      leadId?: string | null
      description?: string
    }
  ): { success: true; data: Team } | { success: false; error: string } {
    const teams = this.getStorage()
    const index = teams.findIndex((t) => t.id === id)
    if (index === -1) {
      return { success: false, error: "Team not found." }
    }

    const current = teams[index]
    const updatedName = payload.name !== undefined ? payload.name.trim() : current.name
    const updatedDept = payload.departmentId || current.departmentId

    if (!updatedName) {
      return { success: false, error: "Team name cannot be empty." }
    }

    const duplicate = teams.some(
      (t) =>
        t.id !== id &&
        t.departmentId === updatedDept &&
        t.name.toLowerCase() === updatedName.toLowerCase()
    )
    if (duplicate) {
      return {
        success: false,
        error: `A team named "${updatedName}" already exists in this department.`,
      }
    }

    const updatedTeam: Team = {
      ...current,
      name: updatedName,
      departmentId: updatedDept,
      leadId: payload.leadId !== undefined ? payload.leadId : current.leadId,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : current.description,
      updatedAt: new Date().toISOString(),
    }

    teams[index] = updatedTeam
    this.setStorage(teams)
    return { success: true, data: updatedTeam }
  }

  deleteTeam(id: string): { success: true } | { success: false; error: string } {
    const teams = this.getStorage()
    const exists = teams.some((t) => t.id === id)
    if (!exists) {
      return { success: false, error: "Team not found." }
    }

    const filtered = teams.filter((t) => t.id !== id)
    this.setStorage(filtered)
    return { success: true }
  }
}

export const teamsService = new TeamsService()
