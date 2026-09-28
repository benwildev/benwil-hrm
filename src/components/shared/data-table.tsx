"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  selectable?: boolean
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  selectable = false,
  selectedIds = [],
  onSelectedIdsChange,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds.length === data.length

  const toggleAll = () => {
    onSelectedIdsChange?.(allSelected ? [] : data.map(getRowId))
  }

  const toggleRow = (id: string) => {
    onSelectedIdsChange?.(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    )
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn("w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const id = getRowId(row)
            const isSelected = selectedIds.includes(id)
            return (
              <TableRow
                key={id}
                data-state={isSelected ? "selected" : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

interface DataTablePaginationProps {
  page: number
  pageCount: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
}: DataTablePaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}-{end}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          Page {page} of {Math.max(pageCount, 1)}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
