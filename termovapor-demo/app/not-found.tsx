import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">Erro 404</div>
        <h1>Página não encontrada</h1>
        <p>
          Utilize o menu lateral ou regresse ao <Link className="accent" href="/">painel de operação</Link>.
        </p>
      </div>
    </div>
  );
}
