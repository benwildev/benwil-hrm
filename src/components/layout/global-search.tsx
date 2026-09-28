"use client"

import {
  FolderTreeIcon,
  LayersIcon,
  NetworkIcon,
  SearchIcon,
  TagIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { mainNav } from "@/lib/nav-config"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const runCommand = (callback: () => void) => {
    setOpen(false)
    callback()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-9 justify-start gap-2 px-0 text-muted-foreground sm:w-64 sm:px-3 rounded-lg border-border/80 bg-zinc-50/80 hover:bg-zinc-100 hover:text-foreground text-xs dark:bg-zinc-900/50 transition-colors"
      >
        <SearchIcon className="size-3.5 text-zinc-500" />
        <span className="hidden sm:inline text-xs">Search employees, leave, tasks...</span>
        <kbd className="ml-auto hidden sm:flex items-center gap-0.5 rounded border border-border/80 bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-2xs dark:bg-zinc-800">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Global search"
        description="Search employees, tasks, leave, messages, and reports"
      >
        <Command>
          <CommandInput placeholder="Search employees, tasks, leave, messages, reports..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigate">
              {mainNav.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <item.icon />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Organization">
              <CommandItem onSelect={() => runCommand(() => router.push("/departments"))}>
                <FolderTreeIcon />
                Departments
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/teams"))}>
                <LayersIcon />
                Teams
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/designations"))}>
                <TagIcon />
                Designations
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/employees/organization"))}>
                <NetworkIcon />
                Organization Structure
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
