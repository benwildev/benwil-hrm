import * as React from "react"
import {
  HeartHandshakeIcon,
  HomeIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
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
import { employeeProfileService } from "@/lib/services/employee-profile-service"
import type { EmergencyContact, EmployeePersonalInfo } from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabPersonalProps {
  employee: EmployeeWithRelations
  personalInfo: EmployeePersonalInfo
  emergencyContacts: EmergencyContact[]
  onProfileUpdated: () => void
}

export function TabPersonal({
  employee,
  personalInfo,
  emergencyContacts,
  onProfileUpdated,
}: TabPersonalProps) {
  // Personal Info Edit State
  const [isEditPersonalOpen, setIsEditPersonalOpen] = React.useState(false)
  const [preferredName, setPreferredName] = React.useState("")
  const [dateOfBirth, setDateOfBirth] = React.useState("")
  const [gender, setGender] = React.useState<"male" | "female" | "other" | "prefer_not_to_say">("prefer_not_to_say")
  const [personalEmail, setPersonalEmail] = React.useState("")
  const [alternatePhone, setAlternatePhone] = React.useState("")
  const [addressLine, setAddressLine] = React.useState("")
  const [city, setCity] = React.useState("")
  const [stateProvince, setStateProvince] = React.useState("")
  const [postalCode, setPostalCode] = React.useState("")
  const [country, setCountry] = React.useState("")
  const [personalError, setPersonalError] = React.useState<string | null>(null)

  // Emergency Contact Add/Edit State
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false)
  const [editingContactId, setEditingContactId] = React.useState<string | null>(null)
  const [contactName, setContactName] = React.useState("")
  const [contactRelationship, setContactRelationship] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")
  const [contactAltPhone, setContactAltPhone] = React.useState("")
  const [contactEmail, setContactEmail] = React.useState("")
  const [contactAddress, setContactAddress] = React.useState("")
  const [contactIsPrimary, setContactIsPrimary] = React.useState(false)
  const [contactError, setContactError] = React.useState<string | null>(null)

  // Delete Emergency Contact State
  const [deleteContactId, setDeleteContactId] = React.useState<string | null>(null)

  const handleOpenEditPersonal = () => {
    setPreferredName(personalInfo.preferredName || "")
    setDateOfBirth(personalInfo.dateOfBirth || "")
    setGender(personalInfo.gender || "prefer_not_to_say")
    setPersonalEmail(personalInfo.personalEmail || "")
    setAlternatePhone(personalInfo.alternatePhone || "")
    setAddressLine(personalInfo.addressLine || "")
    setCity(personalInfo.city || "")
    setStateProvince(personalInfo.stateProvince || "")
    setPostalCode(personalInfo.postalCode || "")
    setCountry(personalInfo.country || "")
    setPersonalError(null)
    setIsEditPersonalOpen(true)
  }

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault()
    setPersonalError(null)

    if (personalEmail && !personalEmail.includes("@")) {
      setPersonalError("Please enter a valid personal email address.")
      return
    }

    employeeProfileService.updatePersonalInfo(employee.id, {
      preferredName: preferredName.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender,
      personalEmail: personalEmail.trim().toLowerCase() || undefined,
      alternatePhone: alternatePhone.trim() || undefined,
      addressLine: addressLine.trim() || undefined,
      city: city.trim() || undefined,
      stateProvince: stateProvince.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country.trim() || undefined,
    })

    setIsEditPersonalOpen(false)
    onProfileUpdated()
  }

  const handleOpenAddContact = () => {
    setEditingContactId(null)
    setContactName("")
    setContactRelationship("")
    setContactPhone("")
    setContactAltPhone("")
    setContactEmail("")
    setContactAddress("")
    setContactIsPrimary(emergencyContacts.length === 0)
    setContactError(null)
    setIsContactDialogOpen(true)
  }

  const handleOpenEditContact = (c: EmergencyContact) => {
    setEditingContactId(c.id)
    setContactName(c.name)
    setContactRelationship(c.relationship)
    setContactPhone(c.phone)
    setContactAltPhone(c.alternatePhone || "")
    setContactEmail(c.email || "")
    setContactAddress(c.address || "")
    setContactIsPrimary(Boolean(c.isPrimary))
    setContactError(null)
    setIsContactDialogOpen(true)
  }

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault()
    setContactError(null)

    if (!contactName.trim() || !contactRelationship.trim() || !contactPhone.trim()) {
      setContactError("Name, relationship, and primary phone number are required.")
      return
    }

    if (editingContactId) {
      employeeProfileService.updateEmergencyContact(employee.id, editingContactId, {
        name: contactName.trim(),
        relationship: contactRelationship.trim(),
        phone: contactPhone.trim(),
        alternatePhone: contactAltPhone.trim() || undefined,
        email: contactEmail.trim().toLowerCase() || undefined,
        address: contactAddress.trim() || undefined,
        isPrimary: contactIsPrimary,
      })
    } else {
      employeeProfileService.addEmergencyContact(employee.id, {
        name: contactName.trim(),
        relationship: contactRelationship.trim(),
        phone: contactPhone.trim(),
        alternatePhone: contactAltPhone.trim() || undefined,
        email: contactEmail.trim().toLowerCase() || undefined,
        address: contactAddress.trim() || undefined,
        isPrimary: contactIsPrimary,
      })
    }

    setIsContactDialogOpen(false)
    onProfileUpdated()
  }

  const handleDeleteContactConfirm = () => {
    if (deleteContactId) {
      employeeProfileService.deleteEmergencyContact(employee.id, deleteContactId)
      setDeleteContactId(null)
      onProfileUpdated()
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Personal Profile & Contact Information</h2>
          <p className="text-xs text-muted-foreground">
            Complete biographical, residence, and urgent emergency contact records.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenEditPersonal}
          className="text-xs shadow-xs"
        >
          <PencilIcon className="size-3.5 mr-1.5" />
          Edit Personal Details
        </Button>
      </div>

      {/* Grid of 3 Cards: Basic Info, Contact Details, Residential Address */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Basic Biographical Info */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <UserIcon className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Biographical Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Legal Full Name</span>
              <p className="font-semibold text-foreground">{employee.fullName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Preferred / Display Name</span>
              <p className="font-medium text-foreground">{personalInfo.preferredName || "—"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Date of Birth</span>
              <p className="font-medium text-foreground">
                {personalInfo.dateOfBirth
                  ? new Date(personalInfo.dateOfBirth).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not recorded"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Gender Identity</span>
              <p className="font-medium text-foreground capitalize">
                {personalInfo.gender ? personalInfo.gender.replace(/_/g, " ") : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Contact Numbers & Email */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <PhoneIcon className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Channels
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Official Work Email</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Personal Email</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{personalInfo.personalEmail || "—"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Primary Mobile</span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <PhoneIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span>{employee.phone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Secondary / Alternate Phone</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <PhoneIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span>{personalInfo.alternatePhone || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Residential Address */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <HomeIcon className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Residential Address
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Street Address</span>
              <p className="font-medium text-foreground">{personalInfo.addressLine || "—"}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">City</span>
                <p className="font-medium text-foreground">{personalInfo.city || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">State / Province</span>
                <p className="font-medium text-foreground">{personalInfo.stateProvince || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Postal Code</span>
                <p className="font-medium text-foreground">{personalInfo.postalCode || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Country</span>
                <p className="font-medium text-foreground">{personalInfo.country || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <HeartHandshakeIcon className="size-4 text-muted-foreground" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Emergency Contacts
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Primary and secondary points of contact in case of urgent incidents
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleOpenAddContact}
            className="text-xs bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
          >
            <PlusIcon className="size-3.5 mr-1" />
            Add Emergency Contact
          </Button>
        </div>

        {emergencyContacts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-lg border border-border/70 bg-background/50 p-4 space-y-3 relative hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{contact.name}</span>
                      {contact.isPrimary && (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-semibold">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{contact.relationship}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleOpenEditContact(contact)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Edit Contact"
                    >
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteContactId(contact.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete Contact"
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PhoneIcon className="size-3.5 shrink-0" />
                    <span className="font-semibold text-foreground">{contact.phone}</span>
                    {contact.alternatePhone && (
                      <span className="text-[11px]">/ {contact.alternatePhone}</span>
                    )}
                  </div>

                  {contact.email && (
                    <div className="flex items-center gap-2 text-muted-foreground truncate">
                      <MailIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}

                  {contact.address && (
                    <div className="flex items-start gap-2 text-muted-foreground text-[11px] pt-1">
                      <HomeIcon className="size-3.5 shrink-0 mt-0.5" />
                      <span>{contact.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HeartHandshakeIcon}
            title="No emergency contacts registered"
            description="Emergency contacts are not mandatory during employee onboarding, but are strongly recommended for safety."
            action={
              <Button size="sm" variant="outline" onClick={handleOpenAddContact} className="text-xs">
                <PlusIcon className="size-3.5 mr-1" />
                Add First Contact
              </Button>
            }
          />
        )}
      </div>

      {/* DIALOG 1: Edit Personal Details */}
      <Dialog open={isEditPersonalOpen} onOpenChange={setIsEditPersonalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSavePersonal}>
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
              <DialogDescription>
                Update biographical details, secondary contact channels, and residential address.
              </DialogDescription>
            </DialogHeader>

            {personalError && (
              <div className="my-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {personalError}
              </div>
            )}

            <div className="grid gap-4 py-4 sm:grid-cols-2 text-xs">
              <FormField label="Preferred Name">
                <Input
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="e.g. Liam"
                />
              </FormField>

              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </FormField>

              <FormField label="Gender Identity">
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(
                      e.target.value as "male" | "female" | "other" | "prefer_not_to_say"
                    )
                  }
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </FormField>

              <FormField label="Personal Email" description="Non-corporate personal email">
                <Input
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="name@personal.com"
                />
              </FormField>

              <FormField label="Alternate Phone">
                <Input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </FormField>

              <FormField label="Country">
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Street Address Line">
                  <Input
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  />
                </FormField>
              </div>

              <FormField label="City">
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2">
                <FormField label="State/Province">
                  <Input
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="e.g. NY"
                  />
                </FormField>

                <FormField label="Postal Code">
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 10001"
                  />
                </FormField>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditPersonalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                Save Personal Info
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Add/Edit Emergency Contact */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveContact}>
            <DialogHeader>
              <DialogTitle>
                {editingContactId ? "Edit Emergency Contact" : "Add Emergency Contact"}
              </DialogTitle>
              <DialogDescription>
                Provide contact details for urgent workplace or medical notifications.
              </DialogDescription>
            </DialogHeader>

            {contactError && (
              <div className="my-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {contactError}
              </div>
            )}

            <div className="space-y-3.5 py-3 text-xs">
              <FormField label="Contact Full Name" required>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </FormField>

              <FormField label="Relationship to Employee" required description="e.g. Spouse, Parent, Sibling, Friend">
                <Input
                  value={contactRelationship}
                  onChange={(e) => setContactRelationship(e.target.value)}
                  placeholder="e.g. Spouse"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-2">
                <FormField label="Primary Phone" required>
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </FormField>

                <FormField label="Alternate Phone">
                  <Input
                    type="tel"
                    value={contactAltPhone}
                    onChange={(e) => setContactAltPhone(e.target.value)}
                    placeholder="+1 (555) 987-6543"
                  />
                </FormField>
              </div>

              <FormField label="Contact Email (Optional)">
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </FormField>

              <FormField label="Residential Address (Optional)">
                <Input
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, City, State"
                />
              </FormField>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryContactCheckbox"
                  checked={contactIsPrimary}
                  onChange={(e) => setContactIsPrimary(e.target.checked)}
                  className="size-4 rounded border-border text-zinc-900 focus:ring-zinc-900"
                />
                <label htmlFor="primaryContactCheckbox" className="text-xs font-medium text-foreground cursor-pointer">
                  Set as primary emergency contact
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
                {editingContactId ? "Update Contact" : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Contact */}
      <ConfirmDialog
        open={Boolean(deleteContactId)}
        onOpenChange={(open) => !open && setDeleteContactId(null)}
        title="Delete Emergency Contact?"
        description="Are you sure you want to remove this emergency contact? This action cannot be undone."
        confirmLabel="Delete Contact"
        variant="destructive"
        onConfirm={handleDeleteContactConfirm}
      />
    </div>
  )
}
