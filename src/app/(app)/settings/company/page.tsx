"use client"

import * as React from "react"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/features/auth/auth-context"
import { getInitials } from "@/lib/utils"

export default function CompanySettingsPage() {
  const { company, updateCompany } = useAuth()

  const [name, setName] = React.useState(company?.name ?? "Benwil Technologies HQ")
  const [industry, setIndustry] = React.useState(company?.industry ?? "Information Technology & Software")
  const [country, setCountry] = React.useState(company?.country ?? "United States")
  const [timezone, setTimezone] = React.useState(company?.timezone ?? "America/New_York (EST, UTC-5)")
  const [currency, setCurrency] = React.useState(company?.currency ?? "USD ($)")
  const [contactEmail, setContactEmail] = React.useState(company?.contactEmail ?? "admin@benwilhrm.com")
  const [phone, setPhone] = React.useState(company?.phone ?? "+1 (555) 234-5678")
  const [address, setAddress] = React.useState(
    company?.address ?? "100 Innovation Way, Suite 400, New York, NY 10001"
  )

  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateCompany({
        name,
        industry,
        country,
        timezone,
        currency,
        contactEmail,
        phone,
        address,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      alert("Failed to save changes. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {/* Save Success Alert */}
      {saveSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in duration-200"
        >
          <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Company profile changes saved successfully.</span>
        </div>
      )}

      {/* Section 1: Identity & Branding */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Entity & Branding
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Core legal profile and visual brand representation for your workforce.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center gap-4 pb-2">
            <Avatar size="lg" className="size-16 rounded-xl border border-border/80">
              <AvatarFallback className="rounded-xl font-mono text-base font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <span className="text-xs font-medium text-foreground block">Company Logo</span>
              <p className="text-[11px] text-muted-foreground">
                Monogram mark derived automatically. Image upload available in enterprise tier.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-medium">
                Legal Company Name
              </Label>
              <Input
                id="companyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-medium">
                Industry Classification
              </Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Regional & Fiscal Localization */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Localization & Currency
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Timezone configuration used for attendance clock-ins and payroll accounting currency.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="country" className="text-xs font-medium">
              Operating Country
            </Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone" className="text-xs font-medium">
              Timezone
            </Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs font-medium">
              Default Currency
            </Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Headquarters & Contact */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Contact & Headquarters
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Primary administrative email, emergency phone, and physical headquarters address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-xs font-medium">
                Administrative Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium">
                Official Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-medium">
              Headquarters Street Address
            </Label>
            <Textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 h-9 px-4 transition-all"
        >
          {isSaving ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
