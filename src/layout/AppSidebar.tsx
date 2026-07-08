"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { RoleName } from "@/lib/types";
import {
  GridIcon,
  ListIcon,
  PlusIcon,
  BellIcon,
  CheckCircleIcon,
  BoxCubeIcon,
  GroupIcon,
  TaskIcon,
  HorizontaLDots,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  /** Minimum role required to see the item. */
  atLeast?: RoleName;
  /** Also match sub-routes (e.g. /tickets/123). */
  matchPrefix?: boolean;
};

const ROLE_RANK: Record<RoleName, number> = {
  USER: 1,
  SUPPORT_TEAM: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

const mainItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/" },
  { name: "Tickets", icon: <ListIcon />, path: "/tickets", matchPrefix: true },
  { name: "Open Ticket", icon: <PlusIcon />, path: "/tickets/new" },
  { name: "Boards", icon: <TaskIcon />, path: "/boards", matchPrefix: true, atLeast: "SUPPORT_TEAM" },
  { name: "Notifications", icon: <BellIcon />, path: "/notifications" },
];

const adminItems: NavItem[] = [
  { name: "Approvals", icon: <CheckCircleIcon />, path: "/admin/approvals", atLeast: "ADMIN" },
  { name: "Platforms", icon: <BoxCubeIcon />, path: "/admin/platforms", atLeast: "ADMIN" },
  { name: "Users & Roles", icon: <GroupIcon />, path: "/admin/users", atLeast: "SUPER_ADMIN" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const showText = isExpanded || isHovered || isMobileOpen;

  const canSee = (item: NavItem) =>
    !item.atLeast || (user ? ROLE_RANK[user.role] >= ROLE_RANK[item.atLeast] : false);

  const isActive = (item: NavItem) => {
    if (item.path === "/tickets/new") return pathname === "/tickets/new";
    if (item.matchPrefix) {
      return (
        (pathname === item.path || pathname.startsWith(item.path + "/")) &&
        pathname !== "/tickets/new"
      );
    }
    return pathname === item.path;
  };

  const renderItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.filter(canSee).map((nav) => (
        <li key={nav.path}>
          <Link
            href={nav.path}
            className={`menu-item group ${
              isActive(nav) ? "menu-item-active" : "menu-item-inactive"
            } ${!showText ? "lg:justify-center" : "lg:justify-start"}`}
          >
            {isActive(nav) && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-500 shadow-[0_0_12px_2px] shadow-accent-500/40" />
            )}
            <span
              className={
                isActive(nav) ? "menu-item-icon-active" : "menu-item-icon-inactive"
              }
            >
              {nav.icon}
            </span>
            {showText && <span className="menu-item-text lowercase">{nav.name}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );

  const showAdmin = adminItems.some(canSee);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex items-center ${
          !showText ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/buyology-mark.png"
            alt="Buyology"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain ring-1 ring-black/5 dark:ring-white/10"
            priority
          />
          {showText && (
            <div className="leading-tight">
              <p className="font-mono text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
                buyology<span className="text-accent-500">_</span>
              </p>
              <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                ~/support{" "}
                <span className="text-accent-500">›</span>
                <span className="term-caret text-accent-400">▍</span>
              </p>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-3 px-3 font-mono text-[11px] uppercase tracking-[0.2em] flex leading-5 text-gray-400 dark:text-gray-600 ${
                  !showText ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? (
                  <>
                    <span className="text-accent-500/70">~/</span>menu
                  </>
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderItems(mainItems)}
            </div>

            {showAdmin && (
              <div>
                <h2
                  className={`mb-3 px-3 font-mono text-[11px] uppercase tracking-[0.2em] flex leading-5 text-gray-400 dark:text-gray-600 ${
                    !showText ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {showText ? (
                    <>
                      <span className="text-accent-500/70">~/</span>admin
                    </>
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderItems(adminItems)}
              </div>
            )}
          </div>
        </nav>
      </div>

      {showText && (
        <div className="mt-auto mb-6 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="flex items-center gap-2 font-mono text-[11px] text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
            </span>
            systems operational
          </p>
          <p className="mt-1 pl-4 font-mono text-[10px] text-gray-400 dark:text-gray-600">
            buyology-support · v1.0
          </p>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
