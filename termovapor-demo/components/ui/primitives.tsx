"use client";
// Componentes base reutilizados do padrão de interface ACRS.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Inbox, Search, X } from "lucide-react";
import { num } from "@/lib/format";

export type Tone = "green" | "red" | "amber" | "blue" | "accent" | "neutral";

export function Button({ children, secondary = false, small = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean; small?: boolean }) {
  return (
    <button type="button" {...props} className={`button ${secondary ? "secondary" : ""} ${small ? "small" : ""} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  );
}

export function Metric({ label, value, hint, icon, accent, onClick }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; accent?: "accent" | "danger" | "positive" | "amber"; onClick?: () => void }) {
  return (
    <div
      className={`metric ${accent ?? ""} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-label">
        {label}
        {icon}
      </div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = "Pesquisar…" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [local, setLocal] = useState(value);
  const composing = useRef(false);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className="search">
      <Search size={16} />
      <input
        aria-label={placeholder}
        value={local}
        placeholder={placeholder}
        onCompositionStart={() => (composing.current = true)}
        onCompositionEnd={(e) => {
          composing.current = false;
          onChange((e.target as HTMLInputElement).value);
        }}
        onChange={(e) => {
          setLocal(e.target.value);
          if (!composing.current) onChange(e.target.value);
        }}
      />
      {local && (
        <button
          type="button"
          aria-label="Limpar pesquisa"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export function Select({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; placeholder?: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ),
      )}
    </select>
  );
}

export function Tabs({ items, value, onChange }: { items: { id: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <button type="button" role="tab" aria-selected={t.id === value} key={t.id} className={t.id === value ? "active" : ""} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count !== undefined && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, label, tone }: { value: number; label?: string; tone?: "green" | "accent" | "amber" | "red" }) {
  const cls = tone ?? (value >= 1 ? "green" : "accent");
  return (
    <div className="progress-wrap">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <b>{num(value * 100, 0)}%</b>
        </div>
      )}
      <div className="progress">
        <span className={cls} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty">
      <Inbox size={26} />
      <p>{children}</p>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Note({ children, tone = "neutral", icon }: { children: ReactNode; tone?: "neutral" | "amber" | "red" | "blue" | "green"; icon?: ReactNode }) {
  return (
    <div className={`note ${tone}`}>
      {icon}
      <div>{children}</div>
    </div>
  );
}

export function DetailList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="detail-list">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v === "" || v === undefined || v === null ? "Não indicado" : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Panel({ title, subtitle, actions, children, className }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className ?? ""}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
