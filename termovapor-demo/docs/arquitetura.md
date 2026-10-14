# Arquitetura

## Tecnologia

Mesma base da plataforma ACRS:

- Next.js 15 (App Router) e React 19
- TypeScript em modo `strict`
- Tailwind CSS 4 (via `@tailwindcss/postcss`) e folha de estilos própria em `app/globals.css`
- Ícones `lucide-react`

Ao contrário da ACRS, não há Supabase, autenticação, rotas de API nem serviços externos.

## Organização

- **Rotas** (`app/**/page.tsx`): componentes de servidor finos, que só leem `params` e `searchParams` e entregam a página ao componente cliente correspondente.
- **Shell** (`components/shell.tsx`): barra lateral agrupada (Ordens de Execução · OIF Elétrico · Gestão), migalhas e seletor de perfil, com o mesmo desenho da ACRS.
- **Estado** (`components/store.tsx`): contexto React com o estado completo da demo. Arranca com `buildSeed()`, guarda as alterações no `localStorage` e expõe `apply(fn, mensagem)`.
- **Ações** (`lib/actions.ts`): funções puras `State → State` para cada operação (criar OE, atribuir NF, enviar pedido, extrair PDF, reservar, devolver à OE, receber encomenda…). Cada ação regista uma linha de auditoria.
- **Regras derivadas** (`lib/engine.ts`): necessidades de material, cobertura de stock (reservado / livre / por reservar / falta real), custos internos, pendências e numeração de NF.
- **Dados** (`data/`): clientes, OE, NF, documentos, pedidos, artigos, quadros, OIF, encomendas e modelos de definição técnica. O `seed.ts` calcula as reservas iniciais com as mesmas regras da interface, para que os números batam certo.
- **UI** (`components/ui/`): `Button`, `Badge`, `PageHeader`, `Metric`, `Table`, `Modal` (nativo `<dialog>`), `Tabs`, `Field`, `Note`, `DetailList`, `Panel`, adaptados da ACRS.

## Data de referência

Para os prazos e indicadores serem sempre coerentes com os dados sintéticos, a demo usa a data fixa **14/10/2026** (`HOJE` em `lib/format.ts`).

## Perfis

| Perfil | Utilizador | Custos internos |
| --- | --- | --- |
| Direção técnica | Nuno Barros | Sim |
| Produção / OE | Marta Lopes | Não |
| Eletricidade / Automação | Rui Ferreira | Sim |

Os perfis só simulam permissões na interface. Não existe autenticação.

## Visual

O sistema visual mantém tipografia, densidade, painéis, tabelas, métricas, separadores e diálogos da ACRS. O acento laranja da ACRS foi substituído pelo azul Termovapor (`--accent: #23408e`), com o vermelho da marca em pequenos apontamentos. As cores dos estados seguem a lógica da aplicação OE: amarelo para preparação, azul para execução, laranja para aguarda material, verde para concluído e vermelho para anulado.
