import type { ComponentType } from "react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

