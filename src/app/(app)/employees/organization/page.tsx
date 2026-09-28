"use client"

import * as React from "react"
import {
  Building2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderTreeIcon,
  LayersIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrgNav } from "@/features/organization/org-nav"
import { employeesService } from "@/lib/services/employees-service"

export default function OrganizationStructurePage() {
  const [treeData, setTreeData] = React.useState<ReturnType<typeof employeesService.getOrganizationTree>>([])
  const [collapsedDepts, setCollapsedDepts] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    setTreeData(employeesService.getOrganizationTree())
  }, [])

  const toggleDept = (deptId: string) => {
    setCollapsedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }))
  }

  const totalHeadcount = treeData.reduce((acc, curr) => acc + curr.totalEmployees, 0)

  return (
    <PageContainer className="gap-5">
      <PageHeader
        title="Organization Structure"
        description="Hierarchical visualization of company departments, operational teams, and workforce distribution."
      />

      <OrgNav />

      {/* Root Company Node */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs">
              <Building2Icon className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Benwil Technologies HQ
              </h2>
              <p className="text-xs text-muted-foreground">
                Single-Tenant Corporate Organization · {treeData.length} Departments · {totalHeadcount} Total Personnel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Unified Hierarchy
            </span>
          </div>
        </div>

        {/* Tree Departments */}
        <div className="space-y-4">
          {treeData.map((node) => {
            const isCollapsed = collapsedDepts[node.department.id]

            return (
              <div
                key={node.department.id}
                className="rounded-xl border border-border/80 bg-background/50 transition-all shadow-2xs overflow-hidden"
              >
                {/* Department Header Row */}
                <div
                  onClick={() => toggleDept(node.department.id)}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="size-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
                    >
                      {isCollapsed ? (
                        <ChevronRightIcon className="size-4" />
                      ) : (
                        <ChevronDownIcon className="size-4" />
                      )}
                    </button>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs">
                      <FolderTreeIcon className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {node.department.name}
                        </span>
                        <StatusBadge status={node.department.status} />
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {node.department.description || "Active department"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pl-9 sm:pl-0 text-xs">
                    {/* Head of Department */}
                    {node.manager ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Head:</span>
                        <Link
                          href={`/employees/${node.manager.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-foreground hover:underline flex items-center gap-1.5"
                        >
                          <Avatar className="size-5">
                            <AvatarImage src={node.manager.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {node.manager.firstName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{node.manager.fullName}</span>
                        </Link>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        No Dept Head
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
                      <UsersIcon className="size-3.5" />
                      <span>{node.totalEmployees}</span>
                    </div>
                  </div>
                </div>

                {/* Teams & Members (Collapsible Body) */}
                {!isCollapsed && (
                  <div className="p-4 space-y-4 border-t border-border/50 bg-card/60">
                    {/* Teams list */}
                    {node.teams.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {node.teams.map((t) => (
                          <div
                            key={t.team.id}
                            className="rounded-xl border border-border/70 bg-card p-4 space-y-3 shadow-2xs"
                          >
                            <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <div className="flex items-center gap-2">
                                <LayersIcon className="size-4 text-muted-foreground" />
                                <Link
                                  href={`/teams/${t.team.id}`}
                                  className="font-bold text-xs text-foreground hover:underline"
                                >
                                  {t.team.name}
                                </Link>
                              </div>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {t.members.length} members
                              </span>
                            </div>

                            {/* Team Lead */}
                            {t.lead && (
                              <div className="flex items-center gap-2 text-xs bg-muted/20 p-2 rounded-lg">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Lead:
                                </span>
                                <Link
                                  href={`/employees/${t.lead.id}`}
                                  className="flex items-center gap-1.5 text-foreground hover:underline font-medium"
                                >
                                  <Avatar className="size-5">
                                    <AvatarImage src={t.lead.avatar} />
                                    <AvatarFallback className="text-[9px]">
                                      {t.lead.firstName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{t.lead.fullName}</span>
                                </Link>
                              </div>
                            )}

                            {/* Team Member Avatars List */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {t.members.map((member) => (
                                <Link
                                  key={member.id}
                                  href={`/employees/${member.id}`}
                                  title={`${member.fullName} (${member.employeeCode})`}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
                                >
                                  <Avatar className="size-4">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-[8px]">
                                      {member.firstName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate max-w-[120px]">{member.fullName}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No operational teams currently registered in this department.
                      </p>
                    )}

                    {/* Unassigned employees in department */}
                    {node.unassignedEmployees.length > 0 && (
                      <div className="pt-2 border-t border-border/40">
                        <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                          Direct Department Personnel (Not Assigned to Teams)
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {node.unassignedEmployees.map((emp) => (
                            <Link
                              key={emp.id}
                              href={`/employees/${emp.id}`}
                              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
                            >
                              <Avatar className="size-4">
                                <AvatarImage src={emp.avatar} />
                                <AvatarFallback className="text-[8px]">{emp.firstName[0]}</AvatarFallback>
                              </Avatar>
                              <span>{emp.fullName}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </PageContainer>
  )
}
