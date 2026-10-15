# Correspondência com as aplicações originais

Referências analisadas, apenas em leitura: `OE_V1_4_37_PESQUISA_SAGE_CORRIGIDA` (Python/Tkinter, SQLite `oe_v1.db`) e `OIF_ELETRICO_V3_3_RECECAO_OE_NF` (Python/Tkinter, SQLite `oif.db`). Nenhum dado real foi copiado: só a estrutura funcional, os campos e os fluxos.

## OE · Ordens de Execução

| Aplicação original | Demo |
| --- | --- |
| Janela principal (lista de OE, pesquisa, filtro por estado) | `/oe` |
| `NewOEWindow` + `SageClientAutocomplete` (pesquisa sem acentos, várias palavras, n.º SAGE) | Modal **Nova OE** |
| `OEDetailWindow`, separadores *Dados Gerais*, *Equipamentos / Intervenções*, *Elétrica / Automação · OIF*, *Documentação Final / Dossier*, *Histórico / Auditoria* | `/oe/[numero]`, com os mesmos cinco separadores |
| `AddNFWindow` (tipo de registo, equipamento, NF novo / existente) | Modal **Adicionar equipamento** |
| `NFEditor` (*Definição técnica*, *Parte elétrica / Automação*, *Documentos*) | Painel lateral do NF |
| `TEMPLATES` por tipo (Caldeira, Termoacumulador, Permutador…) | `data/templates.ts` (versão reduzida) |
| Registo de NF (`nf_number_registry`) e sub-NF `458/1` | Sequência global + `nfReservados`; sub-NF `1112/2` |
| `electrical_requests` (pedido, revisão, OIF) | `/pedidos` e separador elétrico da OE |
| Imprimir OE: *Só OE*, *OE + Certificados*, *OE + Todos os PDF* | Modal **Imprimir OE** (simulado) |
| Pastas do dossier (`02_Desenhos` … `10_Outros`) | Cartões do dossier |
| `audit_log` | Separador Histórico e atividade do painel |

## OIF Elétrico

| Aplicação original | Demo |
| --- | --- |
| Importação OE / NF (JSON em `OIF_ENTRADA`) | Botão **Enviar ao OIF**: cria quadro e OIF automaticamente |
| Fluxo *OE → Pedido recebido → OIF automática → Projeto SEE → Materiais / Stock → Montagem → Testes → Concluir e devolver à OE* | Linha de tempo da OIF (7 etapas) |
| Quadros / SEE PDF, extração da *Lista de Equipamentos* | `/quadros`, **Extrair materiais** (extração simulada) |
| Linhas amarelas *NÃO CADASTRADO*, criar e associar artigo | Linhas destacadas, **Criar artigo** / **Associar** |
| A OIF não avança com linhas sem artigo | Botão **Resolver materiais não cadastrados** |
| Estados `ABERTA … CANCELADA` | Estados equivalentes em português |
| *POR RESERVAR* / *FALTA REAL* | Colunas **Por reservar** e **Falta real** |
| Snapshot do custo na OIF e *Atualizar custos dos artigos* | Separador **Custos internos** |
| Relatório interno de custos ("documento interno") | Etiqueta *DOCUMENTO INTERNO*; restrito por perfil |
| Artigos / Stock, importação Excel do SAGE | `/artigos`, importação simulada |
| Encomendas a fornecedor | `/encomendas`, com receção e entrada em stock |
| *O que esta OIF já tem* / *O que falta* | Painéis laterais da OIF |

## Fora do âmbito da demo

- Leitura real de PDF do SEE Electrical, geração de PDF e impressão
- Ligação ao SAGE, às bases SQLite ou a pastas de rede
- Autenticação e permissões reais
- Cópias de segurança e migrações de base de dados
