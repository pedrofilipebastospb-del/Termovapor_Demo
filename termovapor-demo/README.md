# Termovapor — Plataforma operacional (demo)

Demonstração **exclusivamente frontend** que junta numa só interface web as duas aplicações de secretária da Termovapor:

- **OE — Ordens de Execução** (Ordens de Execução, Números de Fabrico, definição técnica, pedidos elétricos e dossier);
- **OIF Elétrico** (receção dos pedidos da OE, OIF automáticas, quadros/SEE PDF, artigos, stock, encomendas e custos internos).

A linguagem visual e os componentes base seguem a plataforma ACRS (Next.js + React + TypeScript + Tailwind CSS 4 + CSS próprio + `lucide-react`).

> Todos os dados são **sintéticos**. A demo não se liga a bases de dados, ao SAGE, a pastas de rede nem às aplicações originais.

## Requisitos

- Node.js 20 ou superior (testado com Node 24)
- npm

## Executar

```bash
npm install
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
data/           Dados sintéticos e modelos de definição técnica
lib/            Formatação pt-PT, regras derivadas (engine) e ações
types/          Tipos do domínio
public/         Logótipos e favicon
docs/           Documentação funcional e guião de demonstração
```

## Persistência

As alterações feitas durante a apresentação ficam guardadas apenas no `localStorage` do navegador. Em **Configuração → Repor dados de demonstração** volta-se ao estado inicial.

## Documentação

- [docs/arquitetura.md](docs/arquitetura.md): arquitetura técnica e decisões
- [docs/mapeamento.md](docs/mapeamento.md): correspondência com as aplicações OE e OIF originais
- [docs/guiao-demonstracao.md](docs/guiao-demonstracao.md): guião passo a passo para a apresentação
