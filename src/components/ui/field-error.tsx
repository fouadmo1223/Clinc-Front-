export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-xs text-destructive">{children}</p>;
}
