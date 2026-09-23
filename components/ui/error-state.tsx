import { AlertTriangle } from "lucide-react";
import { EmptyState } from "./empty-state";

/**
 * The failure twin of `EmptyState`, same geometry, so a list, a rail or a detail sheet
 * never has to invent a second layout for "went wrong" versus "nothing here". Red is
 * not in the five-item chroma whitelist (§4.2), so the only signal here is the icon and
 * the copy — never a colored background or a red glyph.
 */
export function ErrorState({
  title,
  description,
  action,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <EmptyState
      icon={<AlertTriangle className="size-5" aria-hidden />}
      title={title}
      description={description}
      action={action}
      className={className}
      {...props}
    />
  );
}
