import * as React from "react"
import {
  ArrowDownToLineIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileCheck2Icon,
  FileIcon,
  FileTextIcon,
  FilterIcon,
  FolderArchiveIcon,
  PlusIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { FormField } from "@/components/shared/form-field"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { employeeProfileService } from "@/lib/services/employee-profile-service"
import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
  type EmployeeDocument,
} from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabDocumentsProps {
  employee: EmployeeWithRelations
  documents: EmployeeDocument[]
  onProfileUpdated: () => void
}

export function TabDocuments({
  employee,
  documents,
  onProfileUpdated,
}: TabDocumentsProps) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    React.useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [docToDelete, setDocToDelete] = React.useState<EmployeeDocument | null>(
    null
  )

  // Upload Form State
  const [docName, setDocName] = React.useState("")
  const [category, setCategory] = React.useState<DocumentCategory>("contract")
  const [fileName, setFileName] = React.useState("")
  const [fileSize, setFileSize] = React.useState("1.2 MB")
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [downloadToast, setDownloadToast] = React.useState<string | null>(null)

  // Handle fake file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      setFileSize(`${sizeMb} MB`)
      if (!docName) {
        // Pre-fill friendly name
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setDocName(nameWithoutExt)
      }
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docName.trim()) return

    setIsUploading(true)
    setUploadProgress(20)

    const timer1 = setTimeout(() => setUploadProgress(65), 200)
    const timer2 = setTimeout(() => {
      setUploadProgress(100)
      employeeProfileService.addDocument(employee.id, {
        name: docName.trim(),
        category,
        fileName: fileName || `${docName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
        fileSize: fileSize || "1.4 MB",
        fileType: "application/pdf",
        uploadedBy: "System Administrator",
        status: "verified",
      })

      setIsUploading(false)
      setIsUploadDialogOpen(false)
      setUploadProgress(0)
      setDocName("")
      setFileName("")
      onProfileUpdated()
    }, 550)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }

  const handleDeleteConfirm = () => {
    if (!docToDelete) return
    employeeProfileService.deleteDocument(employee.id, docToDelete.id)
    setDocToDelete(null)
    onProfileUpdated()
  }

  const handleMockDownload = (doc: EmployeeDocument) => {
    setDownloadToast(`Downloading "${doc.fileName}"...`)
    setTimeout(() => {
      setDownloadToast(null)
    }, 3000)
  }

  // Filtered documents
  const filteredDocuments = React.useMemo(() => {
    if (selectedCategoryFilter === "all") return documents
    return documents.filter((d) => d.category === selectedCategoryFilter)
  }, [documents, selectedCategoryFilter])

  const renderStatusBadge = (status: EmployeeDocument["status"]) => {
    switch (status) {
      case "verified":
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1 text-[10px]"
          >
            <CheckCircle2Icon className="size-3" />
            <span>Verified</span>
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400 gap-1 text-[10px]"
          >
            <ClockIcon className="size-3" />
            <span>Pending Review</span>
          </Badge>
        )
      case "archived":
        return (
          <Badge
            variant="outline"
            className="border-muted bg-muted/30 text-muted-foreground gap-1 text-[10px]"
          >
            <FolderArchiveIcon className="size-3" />
            <span>Archived</span>
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-foreground text-background px-4 py-2.5 text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <ArrowDownToLineIcon className="size-4 text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileCheck2Icon className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Document Vault & Records
            </h2>
            <Badge variant="outline" className="text-[10px]">
              {documents.length} File{documents.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Official agreements, national identity verifications, certifications, and
            HR forms for {employee.firstName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Select
            value={selectedCategoryFilter}
            onValueChange={(val) => { if (val) setSelectedCategoryFilter(val) }}
          >
            <SelectTrigger className="w-40 text-xs h-8">
              <FilterIcon className="size-3 text-muted-foreground mr-1" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="xs"
            onClick={() => {
              setDocName("")
              setFileName("")
              setIsUploadDialogOpen(true)
            }}
            className="gap-1.5 text-xs h-8"
          >
            <UploadCloudIcon className="size-3.5" />
            <span>Upload Document</span>
          </Button>
        </div>
      </div>

      {/* Documents Grid / List */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-border transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileTextIcon className="size-5" />
                  </div>
                  {renderStatusBadge(doc.status)}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-foreground line-clamp-1">
                    {doc.name}
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                    {doc.fileName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-muted/30 font-medium capitalize"
                  >
                    {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {doc.fileSize}
                  </span>
                </div>

                <div className="border-t border-border/60 pt-2 text-[10px] text-muted-foreground space-y-0.5">
                  <p>Uploaded by {doc.uploadedBy}</p>
                  <p>Date: {doc.uploadedDate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleMockDownload(doc)}
                  className="w-full gap-1 text-xs h-7"
                >
                  <ArrowDownToLineIcon className="size-3" />
                  <span>Download</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDocToDelete(doc)}
                  className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/80 p-12 text-center text-xs text-muted-foreground">
          <FileIcon className="size-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-foreground">No documents found</p>
          <p className="mt-1">
            {selectedCategoryFilter !== "all"
              ? "No files found under the selected category filter."
              : "No compliance files or contracts have been uploaded for this employee yet."}
          </p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsUploadDialogOpen(true)}
            className="mt-4 gap-1.5"
          >
            <PlusIcon className="size-3" />
            <span>Upload First Document</span>
          </Button>
        </div>
      )}

      {/* DIALOG: Upload Document */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUploadSubmit}>
            <DialogHeader>
              <DialogTitle>Upload Employee Document</DialogTitle>
              <DialogDescription>
                Store an official document, certificate, or employment agreement for{" "}
                {employee.firstName}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4 text-xs">
              <FormField label="Document Title" required>
                <Input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Countersigned Employment Contract"
                  required
                />
              </FormField>

              <FormField label="Document Category" required>
                <Select
                  value={category}
                  onValueChange={(val) => { if (val) setCategory(val as DocumentCategory) }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  File Attachment
                </label>
                <div className="rounded-lg border-2 border-dashed border-border/80 p-4 text-center hover:border-primary/50 transition-colors">
                  <Input
                    type="file"
                    id="doc-file-input"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="doc-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <UploadCloudIcon className="size-6 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {fileName ? fileName : "Click to select file from disk"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {fileName ? `${fileSize} • Ready to upload` : "PDF, DOCX, PNG up to 10MB"}
                    </span>
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !docName.trim()}>
                {isUploading ? "Uploading..." : "Save Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DIALOG: Delete Document */}
      <ConfirmDialog
        open={Boolean(docToDelete)}
        onOpenChange={(open) => !open && setDocToDelete(null)}
        title="Delete Document"
        description={`Are you sure you want to permanently remove "${docToDelete?.name}" (${docToDelete?.fileName})? This file will be purged from employee records.`}
        confirmLabel="Delete File"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
