import type { Handle, RemixNode } from "remix/ui";
import { css } from "remix/ui";
import { routes } from "../routes.ts";

export interface AppLayoutProps {
  children?: RemixNode;
  activeRoute: "home" | "memo" | "timetable";
}

interface SidebarContentProps {
  activeRoute: "home" | "memo" | "timetable";
  onClose?: RemixNode;
}

function SidebarContent(handle: Handle<SidebarContentProps>) {
  return () => {
    const { activeRoute, onClose } = handle.props;

    return (
      <>
        {/* Sidebar Header (App Name & Logo) */}
        <div
          mix={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          })}
        >
          <div mix={css({ display: "flex", alignItems: "center", gap: "12px" })}>
            <LogoIcon size={28} />
            <span mix={css({ fontWeight: "bold", fontSize: "16px", letterSpacing: "0.05em", color: "var(--text-sidebar)" })}>
              Murder Mystery Memo
            </span>
          </div>
          {onClose}
        </div>

        {/* Navigation Links */}
        <nav
          mix={css({
            flex: 1,
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          })}
        >
          <SidebarLink
            href={routes.home.href()}
            icon={<HomeIcon />}
            label="ホーム"
            active={activeRoute === "home"}
          />
          <SidebarLink
            href={routes.memo.href()}
            icon={<MemoIcon />}
            label="タイムラインメモ"
            active={activeRoute === "memo"}
          />
          <SidebarLink
            href={routes.timetable.href()}
            icon={<CalendarIcon />}
            label="タイムテーブル"
            active={activeRoute === "timetable"}
          />
        </nav>

        {/* Sidebar Footer */}
        <div
          mix={css({
            padding: "20px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: "12px",
            color: "var(--text-sidebar-muted)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          })}
        >
          <div>Murder Mystery Memo v1.0</div>
          <div>議論を整理し、真実を暴け</div>
        </div>
      </>
    );
  };
}

export function AppLayout(handle: Handle<AppLayoutProps>) {
  return () => {
    const { children, activeRoute } = handle.props;

    const closeButton = (
      <button
        popovertarget="sidebar-drawer"
        popovertargetaction="hide"
        mix={css({
          display: "none",
          "@media (max-width: 767px)": {
            display: "flex",
            background: "transparent",
            border: "none",
            color: "var(--text-sidebar-muted)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
            "&:hover": {
              color: "var(--text-sidebar)",
              background: "rgba(255, 255, 255, 0.1)",
            },
          },
        })}
      >
        <CloseIcon />
      </button>
    );

    return (
      <div
        mix={css({
          // CSS Variables for styling themes
          "--bg-app": "#f8fafc",
          "--bg-sidebar": "#0f172a",
          "--bg-card": "#ffffff",
          "--border-color": "#e2e8f0",
          "--text-primary": "#0f172a",
          "--text-secondary": "#475569",
          "--text-sidebar": "#f8fafc",
          "--text-sidebar-muted": "#94a3b8",
          "--accent-color": "#2dacf9", // Brand Blue
          "--accent-hover": "#1b9be3",
          "--accent-light": "#e8f7ff",
          
          "@media (prefers-color-scheme: dark)": {
            "--bg-app": "#090d16",
            "--bg-sidebar": "#111827",
            "--bg-card": "#1f2937",
            "--border-color": "#374151",
            "--text-primary": "#f3f4f6",
            "--text-secondary": "#9ca3af",
            "--text-sidebar": "#f3f4f6",
            "--text-sidebar-muted": "#6b7280",
            "--accent-color": "#42b4f9",
            "--accent-hover": "#2dacf9",
            "--accent-light": "#0c2b45",
          },

          display: "flex",
          flexDirection: "row",
          minHeight: "100vh",
          background: "var(--bg-app)",
          color: "var(--text-primary)",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: "14px",
          lineHeight: 1.5,
          margin: 0,
          padding: 0,

          "@media (max-width: 767px)": {
            flexDirection: "column",
          },
        })}
      >
        {/* Mobile Header */}
        <header
          mix={css({
            display: "none",
            "@media (max-width: 767px)": {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "var(--bg-sidebar)",
              color: "var(--text-sidebar)",
              borderBottom: "1px solid var(--border-color)",
              position: "sticky",
              top: 0,
              zIndex: 50,
            },
          })}
        >
          <div mix={css({ display: "flex", alignItems: "center", gap: "10px" })}>
            <LogoIcon />
            <span mix={css({ fontWeight: "bold", fontSize: "16px", letterSpacing: "0.05em" })}>
              MM Memo
            </span>
          </div>
          <button
            popovertarget="sidebar-drawer"
            mix={css({
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background-color 150ms ease",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.1)",
              },
            })}
          >
            <MenuIcon />
          </button>
        </header>

        {/* PC Sidebar (Fixed, visible only on PC) */}
        <aside
          mix={css({
            position: "sticky",
            top: 0,
            left: 0,
            width: "260px",
            height: "100vh",
            background: "var(--bg-sidebar)",
            color: "var(--text-sidebar)",
            borderRight: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            margin: 0,
            padding: 0,
            zIndex: 100,

            "@media (max-width: 767px)": {
              display: "none",
            },
          })}
        >
          <SidebarContent activeRoute={activeRoute} />
        </aside>

        {/* Mobile Sidebar container (popover drawer, visible only on Mobile) */}
        <aside
          id="sidebar-drawer"
          popover="auto"
          mix={css({
            display: "none", // standard popover behavior hides it by default

            "@media (max-width: 767px)": {
              position: "fixed",
              height: "100vh",
              width: "280px",
              left: 0,
              top: 0,
              background: "var(--bg-sidebar)",
              color: "var(--text-sidebar)",
              border: "none",
              boxShadow: "10px 0 30px rgba(0, 0, 0, 0.4)",
              borderRight: "1px solid var(--border-color)",
              margin: 0,
              padding: 0,
              zIndex: 100,
              transition: "transform 0.3s ease",
              transform: "translateX(-100%)",

              "&:popover-open": {
                display: "flex",
                flexDirection: "column",
                transform: "translateX(0)",
              },
              // CSS pseudo-class for polyfill compatibility
              "&.\\:popover-open": {
                display: "flex",
                flexDirection: "column",
                transform: "translateX(0)",
              },
            },
          })}
        >
          {/* Backdrop blur (handled via native popover backdrop) */}
          <style mix={css({
            "&::backdrop": {
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
            }
          })} />

          <SidebarContent activeRoute={activeRoute} onClose={closeButton} />
        </aside>

        {/* Main Content Area */}
        <main
          mix={css({
            flex: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            overflowX: "hidden",
            boxSizing: "border-box",
          })}
        >
          {children}
        </main>
      </div>
    );
  };
}

interface SidebarLinkProps {
  href: string;
  icon: RemixNode;
  label: string;
  active: boolean;
}

function SidebarLink(handle: Handle<SidebarLinkProps>) {
  return () => {
    const { href, icon, label, active } = handle.props;

    return (
      <a
        href={href}
        rmx-document=""
        mix={css({
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          borderRadius: "8px",
          color: active ? "var(--text-sidebar)" : "var(--text-sidebar-muted)",
          textDecoration: "none",
          background: active ? "var(--accent-color)" : "transparent",
          fontWeight: active ? "bold" : "normal",
          transition: "all 150ms ease",
          "&:hover": {
            color: "var(--text-sidebar)",
            background: active ? "var(--accent-hover)" : "rgba(255, 255, 255, 0.05)",
          },
        })}
      >
        <span
          mix={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            "& svg": {
              width: "100%",
              height: "100%",
              fill: "none",
            },
          })}
        >
          {icon}
        </span>
        <span mix={css({ fontSize: "14px" })}>{label}</span>
      </a>
    );
  };
}

// Icons
function LogoIcon(handle: Handle<{ size?: number }>) {
  return () => {
    const size = handle.props.size ?? 24;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
        <circle cx="14" cy="15" r="3" />
        <path d="m17 18 3 3" />
      </svg>
    );
  };
}

function MenuIcon() {
  return () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function HomeIcon() {
  return () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MemoIcon() {
  return () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CalendarIcon() {
  return () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
