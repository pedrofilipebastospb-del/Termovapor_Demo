import { ExternalLink } from "lucide-react";
export function PdfLink({ href, label = "Abrir PDF" }: { href?: string | null; label?: string }) {
  return href ? <a className="button secondary small" href={href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>{label}<ExternalLink size={13} aria-hidden /></a> : <span className="muted" style={{ fontSize: 11 }}>Ficheiro não disponível</span>;
}
