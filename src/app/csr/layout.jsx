import { PortalShell } from "@/components/portal-shell";

export default function CsrLayout({ children }) {
  // The CSR layout keeps route content focused while sharing one navigation shell.
  return <PortalShell>{children}</PortalShell>;
}
