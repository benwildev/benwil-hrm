"use client"

import * as React from "react"
import {
  CheckCircle2Icon,
  LaptopIcon,
  Loader2Icon,
  LogOutIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"
import { getInitials } from "@/lib/utils"

export default function AccountSettingsPage() {
  const { user, sessions, updateAccount, revokeOtherSessions } = useAuth()

  // Profile Form
  const [name, setName] = React.useState(user?.name ?? "Amara Whitfield")
  const [email, setEmail] = React.useState(user?.email ?? "admin@benwilhrm.com")
  const [isSavingProfile, setIsSavingProfile] = React.useState(false)
  const [profileSuccess, setProfileSuccess] = React.useState(false)

  // Password Form
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isSavingPassword, setIsSavingPassword] = React.useState(false)
  const [passwordSuccess, setPasswordSuccess] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)

  // Sessions
  const [isRevoking, setIsRevoking] = React.useState(false)
  const [revokeSuccess, setRevokeSuccess] = React.useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileSuccess(false)

    try {
      await updateAccount({ name, email })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch {
      alert("Failed to save profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.")
      return
    }

    setIsSavingPassword(true)

    try {
      await new Promise((res) => setTimeout(res, 600))
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError("Failed to update password. Please verify current credentials.")
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleRevokeSessions = async () => {
    setIsRevoking(true)
    try {
      await revokeOtherSessions()
      setRevokeSuccess(true)
      setTimeout(() => setRevokeSuccess(false), 3000)
    } catch {
      alert("Failed to revoke sessions.")
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Section 1: User Profile */}
      <form onSubmit={handleSaveProfile}>
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Profile Information
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Personal identity details, avatar, and system role authorization.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {profileSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2Icon className="size-3.5 shrink-0" />
                <span>Profile updated successfully.</span>
              </div>
            )}

            <div className="flex items-center gap-4 pb-2">
              <Avatar size="lg" className="size-16 rounded-full border border-border/80">
                <AvatarFallback className="rounded-full font-semibold text-base bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{name}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    {user?.role ?? "Administrator"}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Avatar derived automatically from user initials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="userName" className="text-xs font-medium">
                  Full Name
                </Label>
                <Input
                  id="userName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="userEmail" className="text-xs font-medium">
                  Work Email Address
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={isSavingProfile}
                className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Section 2: Change Password */}
      <form onSubmit={handleUpdatePassword}>
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Change Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ensure your account is using a long, random password to remain secure.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2Icon className="size-3.5 shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}

            {passwordError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                {passwordError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-medium">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-medium">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmNewPassword" className="text-xs font-medium">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={isSavingPassword}
                className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Section 3: Active Sessions & Device Security */}
      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Active Devices & Sessions
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Devices currently authenticated into this workspace.
              </CardDescription>
            </div>
            <ShieldCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {revokeSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2Icon className="size-3.5 shrink-0" />
              <span>All other device sessions have been revoked.</span>
            </div>
          )}

          <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-background">
            {sessions.map((sess) => (
              <div key={sess.id} className="flex items-center justify-between p-3.5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                    {sess.device.includes("iPhone") || sess.device.includes("Mobile") ? (
                      <SmartphoneIcon className="size-4" />
                    ) : (
                      <LaptopIcon className="size-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.2 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {sess.browser} · {sess.location} ({sess.ipAddress})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {sess.lastActive}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-muted-foreground">
              Revoking other sessions will immediately sign out all mobile and external browsers.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isRevoking || sessions.filter((s) => !s.isCurrent).length === 0}
              onClick={handleRevokeSessions}
              className="text-xs text-rose-600 hover:text-rose-700 hover:border-rose-300 dark:text-rose-400"
            >
              {isRevoking ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin mr-1" />
                  <span>Revoking...</span>
                </>
              ) : (
                <>
                  <LogOutIcon className="size-3 mr-1" />
                  <span>Sign out other devices</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
