/** Quiet Ledger application shell: an ink navigation spine anchors every productivity route across desktop and mobile. */
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, CircleHelp, Command, FolderHeart, House, LayoutTemplate, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, Search, Settings, Sparkles, Star, Trash2, UsersRound, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { OfficeFlowBrand, OfficeMark } from "./OfficeMark";
import { CommandPalette } from "./CommandPalette";
import { CreationMenu } from "./CreationMenu";
import { AICommandPanel } from "./AICommandPanel";
import { openCopilot } from "@/lib/aiProvider";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Home", icon: House }, { href: "/files", label: "My files", icon: FolderHeart },
  { href: "/recent", label: "Recent", icon: Command }, { href: "/starred", label: "Starred", icon: Star },
  { href: "/shared", label: "Shared with me", icon: UsersRound }, { href: "/templates", label: "Templates", icon: LayoutTemplate }, { href: "/trash", label: "Trash", icon: Trash2 },
];
const labels: Record<string, string> = { "/dashboard": "Home", "/files": "My files", "/recent": "Recent", "/starred": "Starred", "/shared": "Shared with me", "/templates": "Templates", "/trash": "Trash", "/settings": "Settings", "/profile": "Profile" };

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation(); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false); const [newOpen, setNewOpen] = useState(false); const [commandOpen, setCommandOpen] = useState(false); const { user } = useWorkspace(); const { signOut } = useAuth(); const { resolvedTheme, toggleTheme } = useTheme();
  const title = useMemo(() => labels[location.split("?")[0]] || "Workspace", [location]);
  useEffect(() => { const listener = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); } }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, []);
  const navigate = (href: string) => { setLocation(href); setMobileOpen(false); }; const logout = async () => { await signOut(); toast.success("Signed out of this browser workspace"); setLocation("/login"); };
  return <div className={collapsed ? "of-workspace is-collapsed" : "of-workspace"}>
    <aside className={mobileOpen ? "of-sidebar is-mobile-open" : "of-sidebar"} aria-label="Workspace navigation">
      <div className="of-sidebar-top"><OfficeFlowBrand compact={collapsed} /><button className="of-collapse" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><button className="of-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={19} /></button></div>
      <button className="of-new-trigger" onClick={() => setNewOpen(true)}><Plus size={18} /><span>New</span><kbd>⌘N</kbd></button>
      <nav className="of-nav">{navItems.map(item => { const Icon = item.icon; const active = location.startsWith(item.href); return <button key={item.href} className={active ? "is-active" : ""} onClick={() => navigate(item.href)} title={collapsed ? item.label : undefined}><Icon size={18} /><span>{item.label}</span></button>; })}</nav>
      <div className="of-sidebar-bottom"><button onClick={() => navigate("/settings")} className={location.startsWith("/settings") ? "is-active" : ""}><Settings size={18} /><span>Settings</span></button><button onClick={() => toast.info("OfficeFlow help is ready to connect to a support center.")}><CircleHelp size={18} /><span>Help</span></button><button onClick={logout}><LogOut size={18} /><span>Log out</span></button><button className="of-profile-nav" onClick={() => navigate("/profile")}><span className="of-avatar">{user.name.split(" ").map(part => part[0]).slice(0, 2).join("") || "O"}</span><span><strong>{user.name}</strong><small>{user.email}</small></span><ChevronRight size={15} /></button><p className="of-creator-credit">Made by ATHARV MOON • IIT TIRUPATI</p></div>
    </aside>
    {mobileOpen && <button className="of-mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <section className="of-main-shell"><header className="of-topbar"><div className="of-top-left"><button className="of-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="of-breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div></div><button className="of-search-trigger" onClick={() => setCommandOpen(true)}><Search size={18} /><span>Search files, documents, templates…</span><kbd>⌘ K</kbd></button><div className="of-top-actions"><button className="of-ai-trigger" onClick={() => openCopilot()}><Sparkles size={16} /><span>Ask AI</span></button><button onClick={() => toast.info("No new workspace notifications.")} aria-label="Notifications"><Bell size={19} /></button><button onClick={toggleTheme} aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}><Moon size={18} /></button><button className="of-top-avatar" onClick={() => navigate("/profile")} aria-label="Open profile">{user.name.split(" ").map(part => part[0]).slice(0, 2).join("") || "O"}</button></div></header><main className="of-main-content">{children}</main></section>
    <nav className="of-bottom-nav" aria-label="Mobile workspace navigation"><button onClick={() => navigate("/dashboard")} className={location.startsWith("/dashboard") ? "is-active" : ""}><House size={19} /><span>Home</span></button><button onClick={() => navigate("/files")} className={location.startsWith("/files") ? "is-active" : ""}><FolderHeart size={19} /><span>Files</span></button><button className="of-bottom-new" onClick={() => setNewOpen(true)} aria-label="Create new file"><Plus size={22} /></button><button onClick={() => navigate("/templates")} className={location.startsWith("/templates") ? "is-active" : ""}><LayoutTemplate size={19} /><span>Templates</span></button><button onClick={() => openCopilot()}><Sparkles size={19} /><span>Ask AI</span></button></nav>
    <CreationMenu open={newOpen} onClose={() => setNewOpen(false)} /><CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onAskAI={() => openCopilot()} />
  </div>;
}

export function PublicMark() { return <div className="flex items-center gap-2.5"><OfficeMark className="h-9 w-9" /><span className="of-wordmark"><b>Office</b><strong>Flow</strong></span></div>; }
