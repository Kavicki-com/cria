# Telas de design → rotas

As telas são HTML exportados do canvas de design, em 390×844 (telefone) e A4 a 96 dpi
(PDF: 794×1123 em retrato, 1123×794 em paisagem). Elas dependem de um `support.js` do
editor, que não acompanha este pacote, então não abrem sozinhas. Leia a marcação: os
estilos são inline, e os textos e as cores são finais.

Os trechos `{{…}}`, `<sc-for>` e `<sc-if>`, junto com o `<script type="text/x-dc">`,
são a lógica do protótipo. Use-os para entender o comportamento, mas não copie o código.
Os textos dentro dos scripts (perguntas, exemplos) **são** o conteúdo final e vão para
`pt.json`.

| Arquivo                          | Rota / componente                                         | Notas                                                                                                           |
| -------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Splash                           | splash nativa                                             | expo-splash-screen                                                                                              |
| Main, Onboarding-2, Onboarding-3 | `onboarding.tsx`                                          | 3 passos, "Pular"                                                                                               |
| Estado-vazio                     | `index.tsx` (0 negócios)                                  |                                                                                                                 |
| Meus-negocios                    | `index.tsx`                                               | FAB "Novo negócio" sticky                                                                                       |
| Novo-negocio                     | `negocio/novo.tsx`                                        | segmento + estágio                                                                                              |
| Estado-negocio-0                 | `negocio/[id]` com 0%                                     | "Por onde começar"                                                                                              |
| Hub-gratis                       | `negocio/[id]` sem desbloqueio                            | prévia: 1 insight visível                                                                                       |
| Hub                              | `negocio/[id]` liberado                                   | header separado do card de análise                                                                              |
| Revisao                          | `negocio/[id]/lean-revisao.tsx`                           | mostra os 9 campos                                                                                              |
| Formulario                       | `lean.tsx` / `bmc.tsx` / `persona.tsx` (FormularioGuiado) | o exemplo mostra BMC                                                                                            |
| Swot, Revisao-swot               | `swot.tsx`, `swot-revisao.tsx`                            | lista por parte                                                                                                 |
| Persona, Revisao-persona         | `persona.tsx`, `persona-revisao.tsx`                      | seletor de ilustração mulher/homem                                                                              |
| Ponto-equilibrio                 | `equilibrio.tsx`                                          | "O que você vende?", "maior custo", card verde; erro preço ≤ custo                                              |
| Analise                          | `analise.tsx`                                             |                                                                                                                 |
| Plano-acao                       | `plano-acao.tsx`                                          | lembrete por tarefa                                                                                             |
| Paywall                          | `paywall.tsx`                                             | só a opção única de R$ 29,90; tirar a escolha 1 ou 3                                                            |
| Paywall-credito                  | —                                                         | **fora do app** (créditos foram trocados por desbloqueio único)                                                 |
| Estado-sem-creditos              | —                                                         | **fora do app**                                                                                                 |
| Estado-compra-falhou             | sheet sobre o paywall                                     | trocar "Nada foi cobrado…" por um texto que aponte para "Restaurar compra"                                      |
| Estado-compra-pendente           | sheet sobre o hub/paywall                                 |                                                                                                                 |
| Estado-gerando, Documento-pronto | `documento.tsx`                                           |                                                                                                                 |
| Ajustes                          | `ajustes.tsx`                                             | aparência, licenças; **acrescentar "Restaurar compra"** e trocar a linha de créditos pelo status do desbloqueio |
| Escuro-*                         | modo escuro de lista, hub e formulário                    | referência para tokens dark                                                                                     |
| PDF-1 … PDF-8 (+2b)              | `features/documento/paginas/*`                            | 9 páginas; PDF-3-lean-canvas e PDF-4-bmc em paisagem                                                            |
| Guia-de-estilo                   | tokens, tipografia, componentes                           |                                                                                                                 |
| Logo, Icone-app                  | `ui/Logo.tsx`, `assets/icon*.png`, adaptive icon          |                                                                                                                 |
