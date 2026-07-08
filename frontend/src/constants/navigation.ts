import {
  Inbox,
  Search,
  Folder,
  LayoutGrid,
  Settings,
  User,
  LayoutDashboard,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  { name: "Search", href: "/search", icon: Search, disabled: true },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inbox", href: "/notifications", icon: Inbox },
  { name: "My Work", href: "/my-work", icon: User },
];

export const OTHER_NAV_ITEMS: NavigationItem[] = [
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Boards", href: "/boards", icon: LayoutGrid },
  { name: "Settings", href: "/settings", icon: Settings },
];
