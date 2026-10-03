import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WorkspaceLayout } from "@/components/officeflow/WorkspaceLayout";
import { GlobalCopilot } from "@/components/officeflow/GlobalCopilot";
import { GlobalShareDialog } from "@/components/officeflow/GlobalShareDialog";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import { DashboardPage, ProfilePage, SettingsPage, TemplatesPage } from "@/pages/WorkspacePages";
import { FileBrowser } from "@/components/officeflow/FileBrowser";
import { DocumentStudioRoute, PdfStudioRoute, PresentationStudioRoute, SpreadsheetStudioRoute } from "@/components/editors/StudioRoute";
import { Redirect, Route, Switch } from "wouter";
import type { ComponentType, ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) { const { user, ready } = useAuth(); if (!ready) return <div className="of-route-loading">Opening OfficeFlow…</div>; return user ? <>{children}</> : <Redirect to="/login" />; }
function PublicOnly({ children }: { children: ReactNode }) { const { user, ready } = useAuth(); if (!ready) return <div className="of-route-loading">Opening OfficeFlow…</div>; return user ? <Redirect to="/dashboard" /> : <>{children}</>; }
const inWorkspace = (Page: ComponentType) => function WorkspaceRoute() { return <ProtectedRoute><WorkspaceLayout><Page /></WorkspaceLayout></ProtectedRoute>; };
const DashboardRoute = inWorkspace(DashboardPage); const FilesRoute = inWorkspace(() => <FileBrowser />); const RecentRoute = inWorkspace(() => <FileBrowser scope="recent" heading="Recent" description="The work you have touched most recently, arranged to continue without friction." />); const StarredRoute = inWorkspace(() => <FileBrowser scope="starred" heading="Starred" description="A small, deliberate collection of work that deserves to stay within reach." />); const SharedRoute = inWorkspace(() => <FileBrowser scope="shared" heading="Shared with me" description="Files other collaborators have placed in your flow." />); const TrashRoute = inWorkspace(() => <FileBrowser scope="trash" heading="Trash" description="Recently removed browser files. Restore what still belongs in your workspace." />); const TemplatesRoute = inWorkspace(TemplatesPage); const SettingsRoute = inWorkspace(SettingsPage); const ProfileRoute = inWorkspace(ProfilePage);
const protect = (Page: ComponentType) => function ProtectedStudio() { return <ProtectedRoute><Page /></ProtectedRoute>; };
const DocumentRoute = protect(DocumentStudioRoute); const SpreadsheetRoute = protect(SpreadsheetStudioRoute); const PresentationRoute = protect(PresentationStudioRoute); const PdfRoute = protect(PdfStudioRoute);
function Router() { return <Switch><Route path="/" component={LandingPage} /><Route path="/login"><PublicOnly><AuthPage mode="login" /></PublicOnly></Route><Route path="/signup"><PublicOnly><AuthPage mode="signup" /></PublicOnly></Route><Route path="/dashboard" component={DashboardRoute} /><Route path="/files" component={FilesRoute} /><Route path="/recent" component={RecentRoute} /><Route path="/starred" component={StarredRoute} /><Route path="/shared" component={SharedRoute} /><Route path="/trash" component={TrashRoute} /><Route path="/templates" component={TemplatesRoute} /><Route path="/settings" component={SettingsRoute} /><Route path="/profile" component={ProfileRoute} /><Route path="/document/new" component={DocumentRoute} /><Route path="/spreadsheet/new" component={SpreadsheetRoute} /><Route path="/presentation/new" component={PresentationRoute} /><Route path="/pdf/new" component={PdfRoute} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><AuthProvider><WorkspaceProvider><TooltipProvider><Toaster richColors closeButton position="bottom-right" /><Router /><GlobalCopilot /><GlobalShareDialog /></TooltipProvider></WorkspaceProvider></AuthProvider></ThemeProvider></ErrorBoundary>; }
