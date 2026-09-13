"use client";

import React, { useActionState, useState, useRef } from "react";
import Link from "next/link";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  ShieldAlertIcon,
  KeyIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Building2Icon,
  IdCardIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  GlobeIcon,
  HeartIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  CopyIcon,
  RefreshCwIcon,
  CameraIcon,
  UploadCloudIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { EmployeeFormState } from "@/server/actions/employees.actions";

type Option = { id: string; name: string };

type EmployeeDefaults = {
  employeeCode?: string;
  fullName?: string;
  profilePhotoUrl?: string | null;
  personalEmail?: string | null;
  workEmail?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  bloodGroup?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  joiningDate?: string;
  employmentType?: string | null;
  employmentStatus?: string;
  departmentId?: string | null;
  designationId?: string | null;
  shiftId?: string | null;
  reportingManagerId?: string | null;
};

export function EmployeeForm({
  mode,
  action,
  defaults,
  departments,
  designations,
  shifts,
  managers,
  roles,
  currentEmployeeId,
}: {
  mode: "create" | "edit";
  action: (prevState: EmployeeFormState, formData: FormData) => Promise<EmployeeFormState>;
  defaults?: EmployeeDefaults;
  departments: Option[];
  designations: Option[];
  shifts: Option[];
  managers: Option[];
  roles: Option[];
  currentEmployeeId?: string;
}) {
  const [state, formAction, isPending] = useActionState<EmployeeFormState, FormData>(
    action,
    undefined
  );

  const [createLogin, setCreateLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaults?.profilePhotoUrl || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fullNamePreview, setFullNamePreview] = useState(defaults?.fullName || "");
  const [codePreview, setCodePreview] = useState(defaults?.employeeCode || "");
  const [statusPreview, setStatusPreview] = useState(defaults?.employmentStatus || "ACTIVE");

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoUploadError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError("Photo must be less than 5 MB.");
      return;
    }

    setPhotoUploadError(null);
    setIsUploadingPhoto(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload/employee-photo", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload photo to Cloudinary");
      }

      setPhotoUrl(json.url);
    } catch (err) {
      setPhotoUploadError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemovePhoto() {
    setPhotoUrl(null);
    setPhotoUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleGeneratePassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused I, O
    const lower = "abcdefghijkmnopqrstuvwxyz"; // exclude l
    const numbers = "23456789"; // exclude 0, 1
    const symbols = "!@#$%^&*_-+=";
    const all = upper + lower + numbers + symbols;

    let pwd = "";
    pwd += upper[Math.floor(Math.random() * upper.length)];
    pwd += lower[Math.floor(Math.random() * lower.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 14; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    const shuffled = pwd
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setGeneratedPassword(shuffled);
    setShowPassword(true);
    setIsCopied(false);
  }

  function handleCopyPassword() {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  function getInitials(name: string) {
    if (!name.trim()) return "EM";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <form action={formAction} className="flex flex-col gap-8 max-w-[1340px] mx-auto w-full">

      {/* ================= PAGE HEADER & BREADCRUMBS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/70">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/employees"
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeftIcon className="size-3.5" />
              Employees
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-semibold text-neutral-700">
              {mode === "create" ? "Add Personnel" : "Edit Profile"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              {mode === "create" ? "Onboard New Employee" : `Edit ${defaults?.fullName || "Employee"}`}
            </h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#162E51]/10 text-[#162E51] border border-[#162E51]/20">
              <SparklesIcon className="size-3" />
              {mode === "create" ? "New Record" : "Editing"}
            </span>
          </div>
          <p className="text-sm text-neutral-500 max-w-2xl">
            {mode === "create"
              ? "Configure official identity, department allocation, emergency contacts, and portal credentials."
              : "Update personnel details, department allocation, and contact records."}
          </p>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <Link
            href="/employees"
            className="px-5 py-2.5 rounded-full border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-full bg-[#162E51] text-white hover:bg-[#0D1C33] transition-all text-sm font-bold shadow-md shadow-[#162E51]/20 flex items-center gap-2.5 group cursor-pointer disabled:opacity-50"
          >
            <span>{isPending ? "Saving Record…" : mode === "create" ? "Create Employee" : "Save Changes"}</span>
            <div className="size-6 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRightIcon className="size-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-3 shadow-2xs">
          <AlertCircleIcon className="size-5 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      )}

      {/* ================= 2-COLUMN ASYMMETRICAL GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr] gap-7 items-start">

        {/* ================= LEFT COLUMN: PRIMARY PERSONAL & CONTACT DATA ================= */}
        <div className="flex flex-col gap-7">

          {/* Section 1: Personal & Identity Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-100">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-2xl bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/20 flex items-center justify-center shadow-2xs">
                  <UserIcon className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Identity & Personal Information
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Official personal identity and documentation details
                  </p>
                </div>
              </div>

              {/* Dynamic Live Avatar Badge */}
              <div className="hidden sm:flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                <span className="text-xs font-bold text-neutral-800 truncate max-w-[120px]">
                  {fullNamePreview || "New Personnel"}
                </span>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    className="size-9 rounded-xl object-cover shadow-sm border border-neutral-200"
                  />
                ) : (
                  <div className="size-9 rounded-xl bg-gradient-to-tr from-[#162E51] to-[#244474] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {getInitials(fullNamePreview)}
                  </div>
                )}
              </div>
            </div>

            {/* Cloudinary Profile Photo Uploader */}
            <div className="mb-7 p-4 sm:p-5 rounded-2xl border border-dashed border-neutral-300/90 bg-neutral-50/70 hover:bg-neutral-50/90 transition-colors">
              <input
                type="hidden"
                name="profilePhotoUrl"
                value={photoUrl || ""}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoSelected}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Photo Display / Initials Preview */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group/avatar shrink-0 cursor-pointer"
                    title="Click to upload/change photo"
                  >
                    {photoUrl ? (
                      <div className="relative size-18 sm:size-20 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-2 ring-neutral-200/80">
                        <img
                          src={photoUrl}
                          alt="Employee Headshot"
                          className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <CameraIcon className="size-5" />
                        </div>
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                            <Loader2Icon className="size-5 animate-spin" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative size-18 sm:size-20 rounded-2xl bg-gradient-to-tr from-[#162E51] to-[#244474] text-white font-bold text-xl flex items-center justify-center shadow-md ring-2 ring-neutral-200/70">
                        {isUploadingPhoto ? (
                          <Loader2Icon className="size-6 animate-spin text-white" />
                        ) : (
                          getInitials(fullNamePreview)
                        )}
                        <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                          <CameraIcon className="size-3.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Info */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">
                        Employee Profile Photo
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Upload employee headshot (PNG, JPG, WEBP up to 5 MB). Automatically face-cropped.
                    </p>
                    {photoUploadError && (
                      <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircleIcon className="size-3.5" />
                        {photoUploadError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload & Remove Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-semibold shadow-2xs inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2Icon className="size-3.5 animate-spin text-neutral-500" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloudIcon className="size-3.5 text-[#162E51]" />
                        <span>{photoUrl ? "Change Photo" : "Upload Photo"}</span>
                      </>
                    )}
                  </button>

                  {photoUrl && !isUploadingPhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      title="Remove profile photo"
                      className="size-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Employee Code */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="employeeCode" className="text-xs font-bold text-neutral-700">
                  Employee Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <IdCardIcon className="size-4" />
                  </div>
                  <input
                    id="employeeCode"
                    name="employeeCode"
                    type="text"
                    required
                    defaultValue={defaults?.employeeCode}
                    onChange={(e) => setCodePreview(e.target.value)}
                    placeholder="e.g. EMP-1042"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-xs font-bold text-neutral-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <UserIcon className="size-4" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    defaultValue={defaults?.fullName}
                    onChange={(e) => setFullNamePreview(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dateOfBirth" className="text-xs font-bold text-neutral-700">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={defaults?.dateOfBirth ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gender" className="text-xs font-bold text-neutral-700">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={defaults?.gender ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other / Prefer not to specify</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Marital Status */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="maritalStatus" className="text-xs font-bold text-neutral-700">
                  Marital Status
                </label>
                <div className="relative">
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    defaultValue={defaults?.maritalStatus ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Nationality */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nationality" className="text-xs font-bold text-neutral-700">
                  Nationality
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <GlobeIcon className="size-4" />
                  </div>
                  <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    defaultValue={defaults?.nationality ?? ""}
                    placeholder="e.g. British, Canadian"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="bloodGroup" className="text-xs font-bold text-neutral-700">
                  Blood Group
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <HeartIcon className="size-4" />
                  </div>
                  <input
                    id="bloodGroup"
                    name="bloodGroup"
                    type="text"
                    defaultValue={defaults?.bloodGroup ?? ""}
                    placeholder="e.g. O+, A+, B+, AB+"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Residential Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-neutral-100">
              <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
                <MailIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Contact & Communication
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Email addresses, telephone numbers, and physical residential location
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Work Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="workEmail" className="text-xs font-bold text-neutral-700">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <MailIcon className="size-4" />
                  </div>
                  <input
                    id="workEmail"
                    name="workEmail"
                    type="email"
                    defaultValue={defaults?.workEmail ?? ""}
                    placeholder="sarah@company.com"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Personal Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="personalEmail" className="text-xs font-bold text-neutral-700">
                  Personal Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <MailIcon className="size-4" />
                  </div>
                  <input
                    id="personalEmail"
                    name="personalEmail"
                    type="email"
                    defaultValue={defaults?.personalEmail ?? ""}
                    placeholder="sarah.personal@gmail.com"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="phone" className="text-xs font-bold text-neutral-700">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <PhoneIcon className="size-4" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={defaults?.phone ?? ""}
                    placeholder="+1 (555) 234-5678"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Present Address */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="presentAddress" className="text-xs font-bold text-neutral-700">
                  Present Residential Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-neutral-400 pointer-events-none">
                    <MapPinIcon className="size-4" />
                  </div>
                  <input
                    id="presentAddress"
                    name="presentAddress"
                    type="text"
                    defaultValue={defaults?.presentAddress ?? ""}
                    placeholder="124 Elm Street, Suite 4B, New York, NY"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="permanentAddress" className="text-xs font-bold text-neutral-700">
                  Permanent Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 text-neutral-400 pointer-events-none">
                    <Building2Icon className="size-4" />
                  </div>
                  <input
                    id="permanentAddress"
                    name="permanentAddress"
                    type="text"
                    defaultValue={defaults?.permanentAddress ?? ""}
                    placeholder="Leave blank if identical to present address"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-3.5 pb-6 mb-6 border-b border-neutral-100">
              <div className="size-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs">
                <ShieldAlertIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Emergency Contact
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Point of contact for urgent workplace notifications or medical situations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Contact Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="emergencyContactName" className="text-xs font-bold text-neutral-700">
                  Contact Person
                </label>
                <input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  type="text"
                  defaultValue={defaults?.emergencyContactName ?? ""}
                  placeholder="e.g. Robert Jenkins"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              {/* Relationship */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="emergencyContactRelationship" className="text-xs font-bold text-neutral-700">
                  Relationship
                </label>
                <input
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  type="text"
                  defaultValue={defaults?.emergencyContactRelationship ?? ""}
                  placeholder="e.g. Spouse / Parent"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              {/* Emergency Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="emergencyContactPhone" className="text-xs font-bold text-neutral-700">
                  Emergency Phone
                </label>
                <input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  type="tel"
                  defaultValue={defaults?.emergencyContactPhone ?? ""}
                  placeholder="+1 (555) 987-6543"
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: EMPLOYMENT, ROLES & SUBMIT ================= */}
        <div className="flex flex-col gap-7 lg:sticky lg:top-24">

          {/* Section 4: Employment & Role Assignment */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-neutral-100">
              <div className="size-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-2xs">
                <BriefcaseIcon className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Employment Assignment
                </h2>
                <p className="text-xs text-neutral-400">
                  Department, shift & position setup
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Joining Date */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="joiningDate" className="text-xs font-bold text-neutral-700">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  required
                  defaultValue={defaults?.joiningDate ?? todayStr}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                />
              </div>

              {/* Employment Status */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="employmentStatus" className="text-xs font-bold text-neutral-700">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusPreview === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-neutral-100 text-neutral-700"
                    }`}>
                    {statusPreview}
                  </span>
                </div>
                <div className="relative">
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    required
                    defaultValue={defaults?.employmentStatus ?? "ACTIVE"}
                    onChange={(e) => setStatusPreview(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none pr-9 font-medium"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On leave</option>
                    <option value="RESIGNED">Resigned</option>
                    <option value="TERMINATED">Terminated</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Employment Type */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="employmentType" className="text-xs font-bold text-neutral-700">
                  Employment Type
                </label>
                <div className="relative">
                  <select
                    id="employmentType"
                    name="employmentType"
                    defaultValue={defaults?.employmentType ?? "FULL_TIME"}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="FULL_TIME">Full-time Regular</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contractor / Freelance</option>
                    <option value="INTERN">Internship</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="departmentId" className="text-xs font-bold text-neutral-700">
                  Department
                </label>
                <div className="relative">
                  <select
                    id="departmentId"
                    name="departmentId"
                    defaultValue={defaults?.departmentId ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="">— Unassigned —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="designationId" className="text-xs font-bold text-neutral-700">
                  Designation / Role Title
                </label>
                <div className="relative">
                  <select
                    id="designationId"
                    name="designationId"
                    defaultValue={defaults?.designationId ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="">— Select designation —</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Shift */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="shiftId" className="text-xs font-bold text-neutral-700">
                  Working Shift Policy
                </label>
                <div className="relative">
                  <select
                    id="shiftId"
                    name="shiftId"
                    defaultValue={defaults?.shiftId ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="">— Default Shift —</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>

              {/* Reporting Manager */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reportingManagerId" className="text-xs font-bold text-neutral-700">
                  Reporting Manager
                </label>
                <div className="relative">
                  <select
                    id="reportingManagerId"
                    name="reportingManagerId"
                    defaultValue={defaults?.reportingManagerId ?? ""}
                    className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer appearance-none pr-9"
                  >
                    <option value="">— No direct manager —</option>
                    {managers
                      .filter((m) => m.id !== currentEmployeeId)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                    <ChevronDownIcon className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Portal Account & Credentials */}
          {mode === "create" && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/80 shadow-2xs">
              <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-neutral-100">
                <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs">
                  <KeyIcon className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Portal Credentials
                  </h2>
                  <p className="text-xs text-neutral-400">
                    System login access configuration
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Checkbox Trigger Card */}
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${createLogin
                  ? "bg-amber-50/50 border-amber-200/90 ring-2 ring-amber-500/10"
                  : "bg-neutral-50/70 border-neutral-200/80 hover:bg-neutral-100/50"
                  }`}>
                  <div className="pt-0.5">
                    <Checkbox
                      checked={createLogin}
                      onCheckedChange={(checked) => setCreateLogin(checked === true)}
                    />
                  </div>
                  {createLogin && <input type="hidden" name="createLogin" value="on" />}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-900 leading-tight">
                      Create a system login for this employee
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      Enables portal access to log attendance, review payslips, and request leaves.
                    </span>
                  </div>
                </label>

                {/* Sub-inputs revealed when enabled */}
                {createLogin && (
                  <div className="flex flex-col gap-3.5 pt-2 animate-in fade-in-0 slide-in-from-top-2">
                    {/* Login Email */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="loginEmail" className="text-xs font-bold text-neutral-700">
                        Login Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="loginEmail"
                        name="loginEmail"
                        type="email"
                        required={createLogin}
                        placeholder="e.g. employee@company.com"
                        className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      />
                    </div>

                    {/* Temporary Password */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="loginPassword" className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                          <span>Temporary Password</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/70 hover:bg-amber-200/80 active:scale-95 rounded-lg border border-amber-300/60 transition-all cursor-pointer shadow-2xs"
                        >
                          <SparklesIcon className="size-3 text-amber-600 dark:text-amber-400" />
                          <span>Generate password</span>
                        </button>
                      </div>

                      <div className="relative flex items-center">
                        <input
                          id="loginPassword"
                          name="loginPassword"
                          type={showPassword ? "text" : "password"}
                          required={createLogin}
                          value={generatedPassword}
                          onChange={(e) => {
                            setGeneratedPassword(e.target.value);
                            setIsCopied(false);
                          }}
                          placeholder="Click Generate or enter password"
                          className="w-full h-11 pl-3.5 pr-24 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono tracking-wide"
                        />

                        {/* Action buttons inside the input */}
                        <div className="absolute right-2 flex items-center gap-1">
                          {generatedPassword && (
                            <button
                              type="button"
                              onClick={handleCopyPassword}
                              title={isCopied ? "Copied to clipboard!" : "Copy password"}
                              className={`h-7 px-2 flex items-center gap-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${isCopied
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                                }`}
                            >
                              {isCopied ? (
                                <>
                                  <CheckIcon className="size-3.5" />
                                  <span className="text-[10px] font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <CopyIcon className="size-3.5" />
                                  <span className="text-[10px]">Copy</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                            className="size-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Password Info & Regenerate shortcut */}
                      {generatedPassword ? (
                        <div className="flex items-center justify-between px-1 text-[11px] text-neutral-500">
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <span className="size-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
                            14-char High-Entropy Token
                          </span>
                          <button
                            type="button"
                            onClick={handleGeneratePassword}
                            className="inline-flex items-center gap-1 text-neutral-500 hover:text-amber-700 transition-colors cursor-pointer font-medium"
                          >
                            <RefreshCwIcon className="size-3" />
                            Regenerate
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-neutral-400 px-1">
                          Click <strong>Generate password</strong> to auto-create a secure temporary credential.
                        </p>
                      )}
                    </div>

                    {/* Role Selection */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="roleId" className="text-xs font-bold text-neutral-700">
                        System Role Permission <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="roleId"
                          name="roleId"
                          required={createLogin}
                          defaultValue=""
                          className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/90 bg-[#fcfdfe] hover:bg-white focus:bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer appearance-none pr-9 font-medium"
                        >
                          <option value="" disabled>Select access role</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                          <ChevronDownIcon className="size-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: Action & Final Submission Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-all shadow-md shadow-neutral-900/10 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              <span>{isPending ? "Submitting…" : mode === "create" ? "Create Employee Record" : "Save Changes"}</span>
              <div className="size-7 rounded-xl bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRightIcon className="size-3.5" />
              </div>
            </button>

            <Link
              href="/employees"
              className="w-full py-2.5 text-center text-xs font-bold text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              Discard & Return to roster
            </Link>
          </div>

        </div>

      </div>
    </form>
  );
}
