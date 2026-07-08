import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── LAYOUT PRIMITIVES ───

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn("w-full max-w-[1440px] mx-auto px-6 md:px-8 py-6 flex flex-col min-w-0 h-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/40 shrink-0",
        className
      )}
      {...props}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

export interface ActionToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ActionToolbar({ children, className, ...props }: ActionToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-border/20 shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarPosition?: "left" | "right";
}

export function SplitLayout({
  children,
  sidebar,
  sidebarPosition = "right",
  className,
  ...props
}: SplitLayoutProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-4 gap-6 items-start flex-1 min-h-0 overflow-auto pt-6",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "lg:col-span-3 h-full flex flex-col min-w-0",
          sidebarPosition === "left" && "lg:order-2"
        )}
      >
        {children}
      </div>
      <aside
        className={cn(
          "lg:col-span-1 flex flex-col gap-4",
          sidebarPosition === "left" && "lg:order-1"
        )}
      >
        {sidebar}
      </aside>
    </div>
  );
}

export interface ContentGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ContentGrid({ children, className, ...props }: ContentGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageSidebar({ children, className, ...props }: PageSidebarProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border/40 rounded-xl p-4 shadow-sm space-y-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── SURFACE PRIMITIVES ───

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Surface({ children, className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border/40 rounded-xl p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ElevatedSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ElevatedSurface({ children, className, ...props }: ElevatedSurfaceProps) {
  return (
    <div
      className={cn(
        "bg-elevated border border-border rounded-xl shadow-md p-1.5 focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── WIDGET & DATA DISPLAY PRIMITIVES ───

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({ label, value, icon: Icon, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border/40 p-4 rounded-xl flex items-center justify-between shadow-sm",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-2xl font-bold tracking-tight text-foreground block">
          {value}
        </span>
      </div>
      {Icon && (
        <div className="p-2 bg-secondary/50 rounded-lg border border-border/20 text-muted-foreground shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

export interface EntityCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
}

export function EntityCard({
  title,
  description,
  icon,
  metadata,
  actions,
  className,
  ...props
}: EntityCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:bg-accent/10 transition-all duration-150 group cursor-pointer",
        className
      )}
      {...props}
    >
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            {icon}
            <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed min-h-[32px]">
            {description}
          </p>
        )}
      </div>
      {metadata && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground font-medium">
          {metadata}
        </div>
      )}
    </div>
  );
}

export interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function HeroSection({ title, subtitle, icon, className, ...props }: HeroSectionProps) {
  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm select-none",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-3 bg-secondary border border-border/60 rounded-xl text-primary shrink-0">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-card/10 select-none min-h-[360px]",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-12 h-12 rounded-xl bg-secondary border border-border/40 flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center justify-center gap-2.5 mt-5">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}

export interface CommandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

export function CommandButton({ label, icon: Icon, shortcut, className, ...props }: CommandButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-card-hover text-xs font-semibold transition-all duration-150 btn-interactive cursor-pointer",
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span>{label}</span>
      {shortcut && (
        <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[9px] font-medium text-muted-foreground/80 ml-1">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

export function SearchInput({ shortcut, className, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center w-full max-w-xs", className)}>
      <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground/60" />
      <input
        type="text"
        className="w-full text-xs pl-9 pr-14 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
        {...props}
      />
      {shortcut && (
        <kbd className="absolute right-2.5 pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[9px] font-medium text-muted-foreground/80">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  members: { name: string; avatarUrl?: string | null }[];
  max?: number;
}

export function AvatarGroup({ members, max = 4, className, ...props }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const remaining = members.length - max;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex -space-x-1.5 overflow-hidden", className)} {...props}>
      {visible.map((m, idx) => (
        <div
          key={idx}
          className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-secondary border border-border/80 text-[8px] font-bold text-foreground ring-1 ring-background"
          title={m.name}
        >
          {getInitials(m.name)}
        </div>
      ))}
      {remaining > 0 && (
        <div className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-muted border border-border/80 text-[8px] font-bold text-muted-foreground ring-1 ring-background">
          +{remaining}
        </div>
      )}
    </div>
  );
}

export interface ActivityItemProps extends React.HTMLAttributes<HTMLDivElement> {
  actor: string;
  action: string;
  timestamp: string;
  details?: string;
}

export function ActivityItem({ actor, action, timestamp, details, className, ...props }: ActivityItemProps) {
  return (
    <div className={cn("flex gap-3 text-xs", className)} {...props}>
      <div className="w-5 h-5 rounded-full bg-secondary border border-border/40 text-[9px] font-bold flex items-center justify-center uppercase shrink-0 text-foreground">
        {actor.slice(0, 2)}
      </div>
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-foreground leading-normal font-medium">
          <span className="font-semibold">{actor}</span> {action}
        </p>
        {details && (
          <p className="text-[11px] text-muted-foreground leading-relaxed italic">
            &ldquo;{details}&rdquo;
          </p>
        )}
        <span className="block text-[10px] text-muted-foreground/60 font-medium">
          {timestamp}
        </span>
      </div>
    </div>
  );
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Timeline({ children, className, ...props }: TimelineProps) {
  return (
    <div className={cn("space-y-4 relative pl-3.5 before:absolute before:left-1 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-border/30", className)} {...props}>
      {children}
    </div>
  );
}

export interface PropertyRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
}

export function PropertyRow({ label, value, className, ...props }: PropertyRowProps) {
  return (
    <div className={cn("flex items-center justify-between text-xs py-1.5 border-b border-border/10", className)} {...props}>
      <span className="text-muted-foreground font-medium">{label}</span>
      <div className="text-foreground font-semibold truncate max-w-[160px]">{value}</div>
    </div>
  );
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FilterBar({ children, className, ...props }: FilterBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
}

export function ProgressIndicator({ value, className, ...props }: ProgressIndicatorProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  const totalSegments = 10;
  const activeSegments = Math.round((percent / 100) * totalSegments);
  const segments = Array.from({ length: totalSegments }).map((_, i) => i < activeSegments);

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <div className="flex font-mono text-[9px] font-bold text-muted-foreground/50 tracking-tighter" aria-hidden="true">
        {segments.map((active, idx) => (
          <span key={idx} className={active ? "text-primary" : "text-muted-foreground/25"}>
            █
          </span>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground font-mono font-bold leading-none ml-1">
        {percent}%
      </span>
    </div>
  );
}

// ─── LIST & TABLE PRIMITIVES ───

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  startSlot?: React.ReactNode;
  title: string;
  subtitle?: string;
  endSlot?: React.ReactNode;
  interactive?: boolean;
}

export function ListItem({
  startSlot,
  title,
  subtitle,
  endSlot,
  interactive = true,
  className,
  ...props
}: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 h-[var(--height-sidebar-item)] min-h-[32px] rounded-lg text-xs transition-all",
        interactive && "hover:bg-accent/40 cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {startSlot && <div className="shrink-0 text-muted-foreground">{startSlot}</div>}
        <div className="truncate flex flex-col justify-center">
          <span className="font-semibold text-foreground truncate leading-none">{title}</span>
          {subtitle && (
            <span className="text-[9px] text-muted-foreground/80 mt-0.5 truncate leading-none">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {endSlot && <div className="shrink-0">{endSlot}</div>}
    </div>
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-2 px-3 border-b border-border/20 hover:bg-accent/15 transition-all text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PropertyListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PropertyList({ children, className, ...props }: PropertyListProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export interface SectionListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SectionList({ children, className, ...props }: SectionListProps) {
  return (
    <div className={cn("divide-y divide-border/20", className)} {...props}>
      {children}
    </div>
  );
}

// ─── PAGE LOADING SKELETON PRIMITIVES ───

export function DashboardSkeleton() {
  return (
    <PageContainer className="animate-pulse space-y-6">
      {/* PageHeader Skeleton */}
      <div className="border-b border-border/20 pb-5">
        <div className="h-6 w-48 bg-accent/30 rounded" />
        <div className="h-3 w-72 bg-accent/30 rounded mt-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border/40 rounded-surface p-surface-pad space-y-2">
            <div className="h-3 w-16 bg-accent/30 rounded" />
            <div className="h-6 w-12 bg-accent/30 rounded" />
          </div>
        ))}
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="h-4 w-32 bg-accent/30 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-card border border-border/40 rounded-surface" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-24 bg-accent/30 rounded" />
          <div className="h-48 bg-card border border-border/40 rounded-surface" />
        </div>
      </div>
    </PageContainer>
  );
}

export function ProjectsSkeleton() {
  return (
    <PageContainer className="animate-pulse space-y-6">
      {/* PageHeader Skeleton */}
      <div className="border-b border-border/20 pb-5">
        <div className="h-6 w-48 bg-accent/30 rounded" />
        <div className="h-3 w-72 bg-accent/30 rounded mt-2" />
      </div>

      {/* Filterbar / search */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-accent/30 rounded-button" />
        <div className="h-8 w-32 bg-accent/30 rounded-button" />
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 bg-card border border-border/40 rounded-surface p-surface-pad flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-accent/30 rounded" />
              <div className="h-3 w-48 bg-accent/30 rounded" />
            </div>
            <div className="h-3 w-16 bg-accent/30 rounded" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export function BoardsSkeleton() {
  return (
    <PageContainer className="animate-pulse space-y-6">
      {/* PageHeader Skeleton */}
      <div className="border-b border-border/20 pb-5">
        <div className="h-6 w-48 bg-accent/30 rounded" />
        <div className="h-3 w-72 bg-accent/30 rounded mt-2" />
      </div>

      {/* Toolbar */}
      <div className="h-[var(--height-toolbar)] bg-card border border-border/40 rounded-surface flex items-center px-4" />

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start flex-1 min-h-[400px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-secondary/20 border border-border/40 rounded-surface p-3 space-y-3 min-h-[300px]">
            <div className="h-4 w-20 bg-accent/30 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-20 bg-card border border-border/40 rounded-surface" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export function MyWorkSkeleton() {
  return (
    <PageContainer className="animate-pulse space-y-6">
      {/* PageHeader Skeleton */}
      <div className="border-b border-border/20 pb-5">
        <div className="h-6 w-48 bg-accent/30 rounded" />
        <div className="h-3 w-72 bg-accent/30 rounded mt-2" />
      </div>

      {/* Lists of tasks */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/40 rounded-surface p-surface-pad space-y-3">
            <div className="h-4 w-28 bg-accent/30 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-10 bg-secondary/20 border border-border/30 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
