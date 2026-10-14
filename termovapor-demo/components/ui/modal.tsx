"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// Diálogo nativo <dialog> (modal centrado ou painel lateral), como na ACRS.
export function Modal({ title, subtitle, children, onClose, drawer = false, wide = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; drawer?: boolean; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`${drawer ? "drawer" : "modal"} ${wide ? "wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-inner">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
