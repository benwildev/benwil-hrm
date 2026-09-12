"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  FileTextIcon,
  UsersIcon,
  Building2Icon,
  ShieldIcon,
  BriefcaseIcon,
  CheckCheckIcon,
  ArrowRightIcon,
  KeyIcon,
} from "lucide-react";
import { ChangeOwnPasswordDialog } from "@/components/auth/change-own-password-dialog";
import { mainNav, settingsNav } from "@/config/nav";
import { logoutAction } from "@/server/actions/logout.actions";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

interface TopNavProps {
  companyName: string;
  companyLogoUrl?: string | null;
  userName: string;
  userEmail: string;
  userRole: string;
  permissions: string[];
  notifications?: NotificationItem[];
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
  type: "leave" | "attendance" | "payroll" | "system";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TopNav({
  companyName,
  companyLogoUrl,
  userName,
  userEmail,
  userRole,
  permissions,
  notifications: initialNotifications,
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Live database-backed notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications && initialNotifications.length > 0
      ? initialNotifications
      : [
          {
            id: "sys-all-clear",
            title: "All Clear",
            description: "No pending approvals or attendance flags.",
            time: "Now",
            href: "/dashboard",
            unread: false,
            type: "system",
          },
        ],
  );

  const settingsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Keyboard shortcut Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsSettingsOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Filter items by user permission
  const visibleMainNav = mainNav.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  const visibleSettingsNav = settingsNav.filter(
    (item) => !item.permission || permissions.includes(item.permission)
  );

  const isSettingsActive = pathname.startsWith("/settings");

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setIsNotificationOpen(false);
    router.push(item.href);
  };

  const handleCommandSelect = (url: string) => {
    setIsSearchOpen(false);
    router.push(url);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-neutral-200/70 transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* ================= LEFT: BRAND & LOGO ================= */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="size-10 rounded-xl overflow-hidden border border-neutral-200/80 bg-white shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src={companyLogoUrl || "/logo.png"}
                  alt={companyName || "Benwil"}
                  width={36}
                  height={36}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-[#162E51] leading-none">
                  {companyName || "Benwil"}
                </span>
                <span className="text-[10px] font-bold text-[#C52227] tracking-widest uppercase mt-1">
                  HRM System
                </span>
              </div>
            </Link>
          </div>

          {/* ================= CENTER: PILL NAVIGATION BAR ================= */}
          <nav className="hidden md:flex items-center gap-1.5 bg-neutral-100/80 p-1.5 rounded-full border border-neutral-200/70 shadow-2xs">
            {/* Main Workspace Routes */}
            {visibleMainNav.map((item) => {
              const isActive =
                pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#162E51] text-white shadow-md shadow-[#162E51]/25"
                      : "text-neutral-600 hover:text-[#162E51] hover:bg-white/90"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}

            {/* Settings Route with Dropdown */}
            {visibleSettingsNav.length > 0 && (
              <div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSettingsActive
                      ? "bg-[#162E51] text-white shadow-md shadow-[#162E51]/25"
                      : "text-neutral-600 hover:text-[#162E51] hover:bg-white/90"
                  }`}
                >
                  <span>Settings</span>
                  <ChevronDownIcon
                    className={`size-3.5 transition-transform duration-200 ${
                      isSettingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Settings Dropdown Popover */}
                {isSettingsOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-neutral-400 uppercase">
                      System Configuration
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {visibleSettingsNav.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = pathname === item.url;
                        return (
                          <Link
                            key={item.url}
                            href={item.url}
                            onClick={() => setIsSettingsOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                              isItemActive
                                ? "bg-[#F0F4F9] text-[#162E51] font-bold"
                                : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                          >
                            <div
                              className={`size-7 rounded-lg flex items-center justify-center ${
                                isItemActive ? "bg-[#162E51]/10 text-[#162E51]" : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              <Icon className="size-3.5" />
                            </div>
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* ================= RIGHT: ACTIONS & USER PROFILE ================= */}
          <div className="flex items-center gap-3">
            {/* Search Circular Button (Triggers Command Palette) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="size-10 rounded-full border border-neutral-200/90 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer group"
              title="Search navigation & actions (Ctrl+K)"
            >
              <SearchIcon className="size-4.5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Notification Bell Button with interactive popover */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="size-10 rounded-full border border-neutral-200/90 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs relative cursor-pointer group"
                title="Notifications"
              >
                <BellIcon className="size-4.5 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 size-2 bg-[#C52227] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover Box */}
              {isNotificationOpen && (
                <div className="absolute top-full right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-neutral-200/90 p-4 z-50 animate-in fade-in-0 zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C52227]/10 text-[#C52227]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCheckIcon className="size-3.5" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="divide-y divide-neutral-100 py-1 max-h-[320px] overflow-y-auto">
                    {notifications.map((item) => {
                      const iconMap = {
                        leave: <CalendarIcon className="size-4 text-amber-600" />,
                        attendance: <ClockIcon className="size-4 text-emerald-600" />,
                        payroll: <FileTextIcon className="size-4 text-purple-600" />,
                        system: <UsersIcon className="size-4 text-blue-600" />,
                      };
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 rounded-2xl transition-colors cursor-pointer flex items-start gap-3 my-1 ${
                            item.unread ? "bg-[#F0F4F9] hover:bg-[#E2EAF4]" : "hover:bg-neutral-50"
                          }`}
                        >
                          <div className="size-8 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                            {iconMap[item.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-neutral-900 truncate">
                                {item.title}
                              </h4>
                              <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          {item.unread && (
                            <span className="size-2 rounded-full bg-[#C52227] shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Notification Footer Link */}
                  <div className="pt-2 border-t border-neutral-100 text-center">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-bold text-[#162E51] hover:text-[#C52227] inline-flex items-center gap-1 transition-colors"
                    >
                      Go to Dashboard
                      <ArrowRightIcon className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="size-10 rounded-full border border-[#162E51]/30 bg-[#162E51] text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer hover:ring-2 hover:ring-[#C52227]/50 transition-all"
                title={`${userName} (${userRole})`}
              >
                <span className="select-none">{initials(userName)}</span>
              </button>

              {/* User Dropdown Content */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-2 z-50 animate-in fade-in-0 zoom-in-95">
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <p className="text-sm font-bold text-neutral-900 truncate">{userName}</p>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{userEmail}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#162E51]/10 text-[#162E51]">
                      {userRole}
                    </span>
                  </div>

                  <div className="pt-1.5 pb-1 flex flex-col gap-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#F0F4F9] hover:text-[#162E51] rounded-xl transition-colors"
                    >
                      <UserIcon className="size-4 text-neutral-500" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#F0F4F9] hover:text-[#162E51] rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <KeyIcon className="size-4 text-neutral-500" />
                      <span>Change Password</span>
                    </button>

                    <form action={logoutAction} className="w-full">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOutIcon className="size-4 text-rose-500" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden size-10 rounded-full border border-neutral-200/90 bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer ml-1"
            >
              {isMobileMenuOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>

        {/* ================= MOBILE EXPANDABLE MENU ================= */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200/80 bg-white px-5 py-4 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Workspace
            </div>
            <div className="flex flex-col gap-1">
              {visibleMainNav.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      isActive ? "bg-[#162E51] text-white" : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>

            {visibleSettingsNav.length > 0 && (
              <>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider pt-2">
                  Settings
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {visibleSettingsNav.map((item) => {
                    const isItemActive = pathname === item.url;
                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${
                          isItemActive ? "bg-[#F0F4F9] text-[#162E51] font-bold" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <item.icon className="size-3.5 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* ================= COMMAND PALETTE SEARCH DIALOG ================= */}
      {isSearchOpen && (
        <CommandDialog
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          title="Search HRM System"
          description="Quickly navigate across pages, settings, and workflows"
        >
          <CommandInput placeholder="Type a command or search..." />
          <CommandList className="max-h-[350px]">
            <CommandEmpty>No results found.</CommandEmpty>
            
            <CommandGroup heading="Workspace Pages">
              {visibleMainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.url}
                    onSelect={() => handleCommandSelect(item.url)}
                    className="cursor-pointer"
                  >
                    <Icon className="size-4 mr-2" />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <CommandSeparator />

            {visibleSettingsNav.length > 0 && (
              <CommandGroup heading="Settings & Configuration">
                {visibleSettingsNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.url}
                      onSelect={() => handleCommandSelect(item.url)}
                      className="cursor-pointer"
                    >
                      <Icon className="size-4 mr-2" />
                      <span>{item.title}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => handleCommandSelect("/leave/approvals")}
                className="cursor-pointer"
              >
                <CalendarIcon className="size-4 mr-2 text-amber-600" />
                <span>Review Pending Leave Approvals</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleCommandSelect("/attendance")}
                className="cursor-pointer"
              >
                <ClockIcon className="size-4 mr-2 text-emerald-600" />
                <span>Check In / View Daily Attendance</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleCommandSelect("/employees")}
                className="cursor-pointer"
              >
                <UsersIcon className="size-4 mr-2 text-blue-600" />
                <span>View Employee Directory</span>
              </CommandItem>
              <CommandItem
                onSelect={() => handleCommandSelect("/payroll")}
                className="cursor-pointer"
              >
                <FileTextIcon className="size-4 mr-2 text-purple-600" />
                <span>Open Current Payroll Cycle</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      )}

      {/* Change Own Password Dialog */}
      <ChangeOwnPasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        userEmail={userEmail}
      />
    </>
  );
}
