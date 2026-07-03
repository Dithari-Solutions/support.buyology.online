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
            <span
              className={
                isActive(nav) ? "menu-item-icon-active" : "menu-item-icon-inactive"
              }
            >
              {nav.icon}
            </span>
            {showText && <span className="menu-item-text">{nav.name}</span>}
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
        className={`py-8 flex items-center gap-3 ${
          !showText ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/aztu-logo-light.png"
            alt="AzTU"
            width={40}
            height={40}
            className="h-10 w-auto object-contain dark:hidden"
          />
          <Image
            src="/images/logo/aztu-logo-dark.png"
            alt="AzTU"
            width={40}
            height={40}
            className="hidden h-10 w-auto object-contain dark:block"
          />
          {showText && (
            <span className="text-lg font-bold leading-none">
              <span className="text-brand-800 dark:text-white">AzTU</span>
              <span className="text-accent-400"> Support</span>
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !showText ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderItems(mainItems)}
            </div>

            {showAdmin && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !showText ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {showText ? "Administration" : <HorizontaLDots />}
                </h2>
                {renderItems(adminItems)}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
