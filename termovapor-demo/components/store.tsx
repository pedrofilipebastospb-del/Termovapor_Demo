"use client";
// Estado global. Os dados de arranque vêm de /data; as alterações feitas
// ficam guardadas neste navegador (localStorage) e podem ser repostas em
// Configuração. A sessão identifica o perfil (Administração, OE ou OIF).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { Perfil, State } from "@/types";
import { buildSeed } from "@/data/seed";
import { ADMIN, CONTAS, contaDe, veComercial, veCustos } from "@/lib/access";

const STORAGE_KEY = "termovapor:dados:v2";
const SESSION_KEY = "termovapor:sessao";

type Store = {
  state: State;
  apply: (fn: (s: State) => State, message?: string) => void;
  /** Perfil da sessão atual (Administração quando ainda não há sessão). */
  perfil: Perfil;
  sessao: Perfil | null;
  entrar: (utilizador: string, senha: string) => boolean;
  sair: () => void;
  user: string;
  funcao: string;
  verCustos: boolean;
  verComercial: boolean;
  notify: (message: string) => void;
  reset: () => void;
  alterado: boolean;
  ready: boolean;
};

const Context = createContext<Store | null>(null);

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Armazenamento indisponível (modo privado): continua em memória.
  }
}

export function Provider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildSeed(), []);
  const [state, setState] = useState<State>(seed);
  const [sessao, setSessao] = useState<Perfil | null>(null);
  const [alterado, setAlterado] = useState(false);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = readStorage<{ state: State }>(STORAGE_KEY);
    if (saved?.state?.oes && saved.state.rececoes) {
      setState(saved.state);
      setAlterado(true);
    }
    const s = readStorage<{ perfil: Perfil }>(SESSION_KEY);
    if (s?.perfil && CONTAS.some((c) => c.perfil === s.perfil)) setSessao(s.perfil);
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (loaded.current && alterado) writeStorage(STORAGE_KEY, { state });
  }, [state, alterado]);

  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4200);
  }, []);

  const apply = useCallback(
    (fn: (s: State) => State, message?: string) => {
      setState((s) => fn(s));
      setAlterado(true);
      if (message) notify(message);
    },
    [notify],
  );

  const entrar = useCallback((utilizador: string, senha: string) => {
    const conta = CONTAS.find((c) => c.utilizador === utilizador.trim().toLowerCase() && c.senha === senha);
    if (!conta) return false;
    setSessao(conta.perfil);
    writeStorage(SESSION_KEY, { perfil: conta.perfil });
    return true;
  }, []);

  const sair = useCallback(() => {
    setSessao(null);
    writeStorage(SESSION_KEY, null);
  }, []);

  const reset = useCallback(() => {
    writeStorage(STORAGE_KEY, null);
    setState(buildSeed());
    setAlterado(false);
    notify("Dados iniciais repostos.");
  }, [notify]);

  const perfil = sessao ?? ADMIN;
  const conta = contaDe(perfil);
  const value: Store = {
    state,
    apply,
    perfil,
    sessao,
    entrar,
    sair,
    user: conta.nome,
    funcao: conta.funcao,
    verCustos: veCustos(perfil),
    verComercial: veComercial(perfil),
    notify,
    reset,
    alterado,
    ready,
  };

  return (
    <Context.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          {toast}
          <button type="button" aria-label="Fechar notificação" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useStore tem de ser usado dentro de <Provider>.");
  return ctx;
}
