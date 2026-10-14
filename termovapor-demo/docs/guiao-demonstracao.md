# Guião de demonstração (cerca de 15 minutos)

Antes de começar: **Configuração → Repor dados de demonstração**.

## 1. Painel (2 min)

1. Indicadores: OE ativas, NF em fabrico, OIF em curso, faltas reais e artigos abaixo do mínimo.
2. **Fluxo OE → OIF → OE**: mostra em que etapa está cada OIF.
3. **Requer atenção**: falta do variador de 1,5 kW na OIF-2026-030 e prazos próximos.

## 2. Ordem de Execução (4 min)

1. **Ordens de Execução → Nova OE**. No cliente, escrever `beira lagar`: a pesquisa aceita palavras em qualquer ordem e sem acentos. O n.º SAGE e a morada são preenchidos automaticamente.
2. Criar a OE com descrição e data de entrega. A aplicação abre a OE 878.
3. **Equipamentos / Intervenções → Adicionar**: Caldeira, que recebe o NF 1125.
4. **Adicionar** outra vez: Quadro elétrico como sub-NF do 1125 (fica 1125/1, sem consumir a sequência global).
5. Abrir a **OE 870** para mostrar uma OE completa: sub-NF, definição técnica da caldeira, parte elétrica e dossier.

## 3. Pedido elétrico → OIF (3 min)

1. Na OE 878: **Elétrica / Automação → Novo pedido**, depois **Enviar ao OIF**.
2. A OIF é criada automaticamente. Abrir **Pedidos OE → OIF** e mostrar que só seguem o NF e a informação elétrica.

## 4. OIF de ponta a ponta (5 min)

Usar a **OIF-2026-032** (OE 870):

1. **Extrair materiais do PDF**: 16 linhas, 2 não cadastradas.
2. **Resolver materiais não cadastrados**: criar o analisador de energia com **Criar artigo** e associar o relé de fases a um artigo existente.
3. Voltar à OIF: **Validar projeto SEE** (os custos ficam congelados).
4. **Reservar stock disponível**: a OIF passa a *Aguarda material*, com faltas reais (PLC, HMI, armário…).
5. **Encomendar faltas**, depois em **Encomendas** abrir o rascunho: **Marcar como enviada → Confirmar → Registar receção**.
6. De volta à OIF: **Reservar materiais → Iniciar montagem → Concluir montagem → Registar testes aprovados → Concluir e devolver à OE**.
7. Na OE 870, o pedido aparece como *Devolvido à OE* e o esquema final fica no dossier.

## 5. Custos e perfis (1 min)

1. No separador **Custos internos** da OIF: materiais, mão de obra e total.
2. Mudar o perfil (canto superior direito) para **Produção / OE**: os custos ficam ocultos.
