# Termovapor · Plataforma operacional (demo)

Demonstração **exclusivamente frontend** que junta numa só interface web as duas aplicações de secretária da Termovapor:

- **OE · Ordens de Execução** (Ordens de Execução, Números de Fabrico, definição técnica, pedidos elétricos e dossier);
- **OIF Elétrico** (receção dos pedidos da OE, OIF automáticas, quadros/SEE PDF, artigos, stock, encomendas e custos internos).

A linguagem visual e os componentes base seguem a plataforma ACRS (Next.js + React + TypeScript + Tailwind CSS 4 + CSS próprio + `lucide-react`).

> Os dados iniciais são importados, em leitura, das bases OE e OIF fornecidas: 2.693 clientes, 999 artigos, 3 OE, 15 registos NF/equipamentos e 8 OIF. Os snapshots ficam em `.local-data/`, fora do Git. Não há sincronização de alterações com as bases originais.

## Requisitos

- Node.js 20 ou superior (testado com Node 24)
- npm

## Executar

```bash
npm ci
npm run dev        # desenvolvimento: http://127.0.0.1:3200
```

Produção local (para verificar sem interferir com um servidor em curso, use `NEXT_DIST_DIR=.next-verify`):

```bash
npm run build
npm run start      # http://127.0.0.1:3200
```

Outros comandos: `npm run typecheck`.

## Entrada e perfis

Abrir `/entrar` e escolher um dos três acessos (contas locais, sem servidor):

| Perfil | Utilizador | Áreas |
| --- | --- | --- |
| Administração | `admin` | Todas, incluindo custos internos e configuração |
| Engenharia / OE | `oe` | Ordens de execução, equipamentos, pedidos elétricos, clientes |
| Eletricidade / OIF | `oif` | Pedidos recebidos, OIF, quadros, materiais e compras (sem dados comerciais da OE) |

As palavras-passe aparecem no próprio ecrã de entrada.

## Áreas e páginas

| Área | Páginas |
| --- | --- |
| Visão geral (`/`) | Indicadores por perfil, fila "Trabalhos que precisam de atenção", próximos prazos, trabalhos por estado |
| Ordens de execução | `/oe` (lista e Nova OE), `/oe/[numero]` (Resumo, Equipamentos/NF, Eletricidade, Documentos, Informação da ordem, Histórico), `/equipamentos`, `/documentacao` |
| Eletricidade e fabrico | `/pedidos` (estado na OE e no OIF), `/oif`, `/oif/[numero]`, `/quadros`, `/origem/oe/[numero]` (ficha elétrica para o OIF) |
| Materiais e compras | `/artigos`, `/encomendas` (receção parcial por linha), `/rececoes`, `/fornecedores`, `/movimentos` |
| Clientes | `/clientes` |
| Utilitários | `/documentos` (pesquisa documental), `/historico`, `/configuracao` (só Administração), pesquisa global com Ctrl+K |

## Estrutura

```
app/            Rotas (App Router) e estilos globais
components/     Ecrãs da aplicação, shell e estado global
components/ui/  Componentes genéricos reutilizados do padrão ACRS
data/           Modelos de definição técnica e estado inicial vazio
lib/            Formatação pt-PT, regras derivadas (engine) e ações
types/          Tipos do domínio
public/         Logótipos e favicon
docs/           Documentação funcional e guião de demonstração
```

## Persistência

As alterações feitas durante a apresentação ficam guardadas apenas no `localStorage` do navegador. Em **Configuração → Repor dados iniciais** volta-se ao estado inicial.

## Documentação

- [docs/arquitetura.md](docs/arquitetura.md): arquitetura técnica e decisões
- [docs/mapeamento.md](docs/mapeamento.md): correspondência com as aplicações OE e OIF originais
- [docs/guiao-demonstracao.md](docs/guiao-demonstracao.md): guião passo a passo para a apresentação

## Atualizar os dados reais

`npm run dev` importa as bases antes de arrancar. A localização por defeito é o repositório irmão `Termovapor--demo`. Se necessário, defina `TERMOVAPOR_SOURCE_ROOT` para a pasta com as aplicações OE e OIF. Execute `npm run import:real` para atualizar o snapshot e recarregue o navegador. A versão do snapshot invalida alterações locais de uma importação anterior. `Repor dados iniciais` regressa sempre ao snapshot real.

A leitura usa SQLite em modo read-only. Os 84 artigos sem linha na tabela de stock aparecem como sem registo, sem faltas de stock inventadas. Referências de OE antigas nas OIF são preservadas, sem criar OE adicionais. Prazos sem data válida mantêm-se por definir.

## PDFs originais

A importação resolve as referências documentais dentro das pastas fornecidas, incluindo `source_pdf` das folhas recebidas pelo OIF. Atualmente existem 4 esquemas SEE e 5 folhas elétricas acessíveis. Os links usam `/api/documentos/[id]`, abrem em novo separador e leem os ficheiros originais sem os copiar para `public/` ou para o Git. O servidor só aceita identificadores do registo local e ficheiros PDF dentro das pastas autorizadas. Documentos referenciados que não foram fornecidos aparecem como indisponíveis.
