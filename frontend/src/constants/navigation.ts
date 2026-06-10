import {
  Inbox,
  Search,
  Folder,
  LayoutGrid,
  Bell,
  Settings,
  User,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  { name: "Search", href: "/search", icon: Search, disabled: true },
  { name: "Inbox", href: "/notifications", icon: Inbox },
  { name: "My Work", href: "/my-work", icon: User },
];

export const OTHER_NAV_ITEMS: NavigationItem[] = [
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Boards", href: "/boards", icon: LayoutGrid },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];
