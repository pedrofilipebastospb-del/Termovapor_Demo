"use client";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { CONTAS } from "@/lib/access";
import { Brand } from "./shell";
import { useStore } from "./store";

const DESCRICAO: Record<string, string> = {
  admin: "Todas as áreas, custos internos e configuração",
  oe: "Ordens de execução, equipamentos, pedidos e dossier",
  oif: "Pedidos recebidos, OIF, quadros, materiais e compras",
};

export function Login() {
  const { entrar } = useStore();
  const [utilizador, setUtilizador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utilizador.trim() || !senha) {
      setErro("Indique o utilizador e a palavra-passe.");
      return;
    }
    // Navegação completa: garante que a moldura arranca já com o perfil da sessão.
    if (entrar(utilizador, senha)) window.location.replace("/");
    else setErro("Utilizador ou palavra-passe incorretos.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Brand />
        </div>
        <h1>Entrar na plataforma</h1>
        <p className="muted">O perfil define as áreas e a informação disponíveis.</p>
        <form onSubmit={submeter} noValidate>
          <label className="field">
            <span>Utilizador</span>
            <input
              value={utilizador}
              autoComplete="username"
              placeholder="admin, oe ou oif"
              onChange={(e) => {
                setUtilizador(e.target.value);
                setErro("");
              }}
            />
          </label>
          <label className="field">
            <span>Palavra-passe</span>
            <input
              type="password"
              value={senha}
              autoComplete="current-password"
              onChange={(e) => {
                setSenha(e.target.value);
                setErro("");
              }}
            />
          </label>
          {erro && (
            <p className="login-error" role="alert">
              {erro}
            </p>
          )}
          <button type="submit" className="button login-submit">
            <Lock size={14} /> Entrar
          </button>
        </form>
        <div className="login-accounts">
          <b>Acessos</b>
          {CONTAS.map((c) => (
            <button
              type="button"
              key={c.utilizador}
              onClick={() => {
                setUtilizador(c.utilizador);
                setSenha(c.senha);
                setErro("");
              }}
            >
              <span>
                <b>{c.perfil}</b>
                <small>{DESCRICAO[c.utilizador]}</small>
              </span>
              <code>
                {c.utilizador} / {c.senha}
              </code>
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
