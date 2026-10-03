/** Quiet Ledger brand element: a compact CSS-built folded-flow glyph keeps the OfficeFlow mark crisp at any scale. */
import { cn } from "@/lib/utils";

export function OfficeMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("of-mark", className)}><i /><i /><i /></span>;
}

export function OfficeFlowBrand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5"><OfficeMark className="h-8 w-8" />{!compact && <span className="of-wordmark of-wordmark-dark"><b>Office</b><strong>Flow</strong></span>}</div>;
}
