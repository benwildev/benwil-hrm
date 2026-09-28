import * as React from "react"
import {
  ActivityIcon,
  DollarSignIcon,
  FileTextIcon,
  KeyRoundIcon,
  LockIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UserCheckIcon,
  UsersIcon,
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
  ActivityType,
  EmployeeActivity,
  EmployeeNote,
} from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabActivityProps {
  employee: EmployeeWithRelations
  activities: EmployeeActivity[]
  notes: EmployeeNote[]
  onProfileUpdated: () => void
}

export function TabActivity({
  employee,
  activities,
  notes,
  onProfileUpdated,
}: TabActivityProps) {
  // Activity Filtering
  const [filterType, setFilterType] = React.useState<string>("all")

  // Note management states
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false)
  const [noteContent, setNoteContent] = React.useState("")
  const [editingNote, setEditingNote] = React.useState<EmployeeNote | null>(null)
  const [noteToDelete, setNoteToDelete] = React.useState<EmployeeNote | null>(null)
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false)

  // Filtered activities
  const filteredActivities = React.useMemo(() => {
    if (filterType === "all") return activities
    return activities.filter((act) => act.type === filterType)
  }, [activities, filterType])

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return

    setIsSubmittingNote(true)
    try {
      if (editingNote) {
        employeeProfileService.updateNote(employee.id, editingNote.id, noteContent)
      } else {
        employeeProfileService.addNote(
          employee.id,
          noteContent,
          "Amara Whitfield",
          "System Administrator"
        )
      }
      setIsAddNoteOpen(false)
      setEditingNote(null)
      setNoteContent("")
      onProfileUpdated()
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const handleDeleteNoteConfirm = () => {
    if (!noteToDelete) return
    employeeProfileService.deleteNote(employee.id, noteToDelete.id)
    setNoteToDelete(null)
    onProfileUpdated()
  }

  const handleOpenEditNote = (note: EmployeeNote) => {
    setEditingNote(note)
    setNoteContent(note.content)
    setIsAddNoteOpen(true)
  }

  const renderActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "profile_updated":
        return <UserCheckIcon className="size-3.5 text-blue-500" />
      case "account_created":
      case "password_changed":
        return <KeyRoundIcon className="size-3.5 text-amber-500" />
      case "compensation_updated":
        return <DollarSignIcon className="size-3.5 text-emerald-500" />
      case "document_uploaded":
        return <FileTextIcon className="size-3.5 text-indigo-500" />
      case "team_changed":
        return <UsersIcon className="size-3.5 text-purple-500" />
      case "note_added":
        return <MessageSquareIcon className="size-3.5 text-cyan-500" />
      default:
        return <ActivityIcon className="size-3.5 text-muted-foreground" />
    }
  }

  const formatActivityTimestamp = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    } catch {
      return ts
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Internal HR Management Notes (Admin Only) */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LockIcon className="size-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-semibold text-foreground">
                Internal HR & Management Notes
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400"
              >
                Confidential Admin Access
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Internal memos, probationary feedback, and appraisal notes for{" "}
              {employee.firstName}. These notes are never visible to the employee.
            </p>
          </div>

          <Button
            size="xs"
            onClick={() => {
              setEditingNote(null)
              setNoteContent("")
              setIsAddNoteOpen(true)
            }}
            className="gap-1.5 text-xs h-8 shrink-0"
          >
            <PlusIcon className="size-3.5" />
            <span>Add Internal Note</span>
          </Button>
        </div>

        {notes.length > 0 ? (
          <div className="space-y-3.5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground">
                      {note.authorName}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {note.authorRole} • {formatActivityTimestamp(note.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditNote(note)}
                      className="size-7 text-muted-foreground hover:text-foreground"
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNoteToDelete(note)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            <MessageSquareIcon className="size-6 mx-auto text-muted-foreground/40 mb-1.5" />
            <p className="font-medium text-foreground">No internal notes recorded</p>
            <p className="mt-1">
              Add manager appraisals, performance checkpoints, or compliance notes.
            </p>
          </div>
        )}
      </div>

      {/* 2. Audit Trail & Activity Timeline */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Audit Trail & Activity Log
              </h2>
              <Badge variant="outline" className="text-[10px]">
                {filteredActivities.length} Events
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Comprehensive tamper-evident history of profile updates, credential changes,
              and HR actions.
            </p>
          </div>

          <Select value={filterType} onValueChange={(val) => { if (val) setFilterType(val) }}>
            <SelectTrigger className="w-44 text-xs h-8">
              <SelectValue placeholder="Filter event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Event Types</SelectItem>
              <SelectItem value="profile_updated">Profile Modifications</SelectItem>
              <SelectItem value="account_created">Account & Security</SelectItem>
              <SelectItem value="compensation_updated">Compensation Changes</SelectItem>
              <SelectItem value="document_uploaded">Document Vault</SelectItem>
              <SelectItem value="team_changed">Org & Team Adjustments</SelectItem>
              <SelectItem value="note_added">Internal Notes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="relative pl-7 pb-4 border-l-2 border-border/80 last:pb-0 last:border-l-transparent"
              >
                {/* Dot with icon */}
                <div className="absolute -left-3 top-0.5 flex size-6 items-center justify-center rounded-full border border-border/70 bg-background shadow-2xs">
                  {renderActivityIcon(act.type)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{act.title}</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-muted-foreground shrink-0 pt-0.5">
                    <p>{formatActivityTimestamp(act.timestamp)}</p>
                    <p className="text-[10px] text-muted-foreground/80">
                      by {act.actorName} ({act.actorRole})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            <ActivityIcon className="size-6 mx-auto text-muted-foreground/40 mb-1.5" />
            <p className="font-medium text-foreground">No activities recorded</p>
            <p className="mt-1">
              Events will appear as actions are performed on this employee profile.
            </p>
          </div>
        )}
      </div>

      {/* DIALOG: Add / Edit Note */}
      <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveNote}>
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Edit Internal HR Note" : "Add Internal HR Note"}
              </DialogTitle>
              <DialogDescription>
                Confidential notes are visible exclusively to administrators. Provide clear
                and factual observations.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 text-xs">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter evaluation remarks, probationary checkpoints, or disciplinary notes..."
                rows={5}
                required
                className="text-xs resize-none"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddNoteOpen(false)}
                disabled={isSubmittingNote}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingNote || !noteContent.trim()}>
                {isSubmittingNote
                  ? "Saving..."
                  : editingNote
                  ? "Update Note"
                  : "Save Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DIALOG: Delete Note */}
      <ConfirmDialog
        open={Boolean(noteToDelete)}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        title="Delete Internal Note"
        description="Are you sure you want to permanently delete this internal HR note? This action cannot be undone."
        confirmLabel="Delete Note"
        variant="destructive"
        onConfirm={handleDeleteNoteConfirm}
      />
    </div>
  )
}
