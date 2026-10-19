# Diferenças entre o app e o design

O que o app faz diferente das telas em `design/` e por quê. Serve para atualizar o
design e para a revisão tela a tela da fase 7.

## Por causa do desbloqueio único (decisão de 19/10)

| Tela                   | Design                                       | App                                                                                     |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| Paywall                | escolha "1 negócio" ou "Pacote com 3"        | um card só, "Plano completo", com o preço da loja e a lista do que libera               |
| Paywall-credito        | "Você tem N créditos"                        | não existe                                                                              |
| Estado-sem-creditos    | "Seus créditos acabaram"                     | não existe                                                                              |
| Estado-compra-falhou   | "Nada foi cobrado…"                          | sem essa frase (a conexão pode cair depois da cobrança); aponta para "Restaurar compra" |
| Estado-compra-pendente | "seu crédito entra aqui", "3 créditos…"      | "o plano completo é liberado aqui"; etapa final "Plano completo liberado no app"        |
| Ajustes                | card "Créditos disponíveis" + "Comprar mais" | card "Plano completo" (status ou "Liberar · preço") + linha "Restaurar compra"          |
| Onboarding-2           | "R$ 19,90 por negócio"                       | "Pagamento único, para todos os seus negócios" (preço só no paywall, vindo da loja)     |
| Hub-gratis             | "1 crédito libera tudo deste negócio"        | "A compra única libera tudo, em todos os seus negócios…"                                |
| Guia-de-estilo         | ícone de crédito (bilhete)                   | não usado                                                                               |

## Acessibilidade (contraste AA)

| Onde                                  | Design                               | App                                         |
| ------------------------------------- | ------------------------------------ | ------------------------------------------- |
| "Por onde começar" (Estado-negocio-0) | goiaba #EF6F7A sobre #E4ECF7 (2,4:1) | goiaba escuro #8A2433 no tema claro (7,3:1) |
| "Plano liberado" no card da análise   | verde #1D7A52 sobre #E4ECF7 (4,46:1) | verde do selo #145C3D (6,9:1)               |

## Escolhas de implementação

- **Ordem do BMC:** segue o §5 do plano (Recursos 6, Atividades 7, Parcerias 8, Custos 9). O
  Formulario do design numera Atividades, Recursos e Parcerias como 7, 8 e 9.
- **Textos das perguntas:** o design trazia só Lean 8–9, BMC 7–9 e a Persona. Os demais
  foram escritos no mesmo tom e estão em `src/core/i18n/locales/pt.json` (`quadros.*`) para
  revisão.
- **Hub grátis:** ganhou o anel de progresso e o rodapé "Gerar documento" (o design só os
  tinha no hub liberado e no Estado-negocio-0), porque o plano pede o mesmo % nos dois.
- **Card de negócio liberado:** mostra "Próximo: …" e o selo "Plano liberado" juntos.
- **Idioma em Ajustes:** controle Auto / Português / English / Español (não estava no
  design; en e es entram na fase 7).
- **Capa do PDF:** a terceira coluna era "Preparado por [NOME]". O app não pede nome, então
  mostra "Plano preenchido N%".
- **PDF, "Como conquistar":** o design tinha "Quando: fim da tarde…", que não sai das
  respostas. O app mostra "Onde falar com…", "Como … decide" e "O que dizer", citando o que a
  pessoa escreveu.
- **PDF, "Dor do cliente × Como resolve":** uma linha (o que incomoda × a solução do Lean),
  em vez das três do exemplo, que não existem como dados separados.
- **PDF, Lean e BMC:** vão girados 90° dentro de páginas A4 retrato (ver
  `src/features/documento/estilos.ts`). O spike no Chromium mostrou páginas nomeadas
  funcionando, mas o expo-print usa um tamanho de papel único por trabalho; a troca é uma
  constante se o teste em aparelho mostrar o contrário.
- **Splash no Android 12+:** só o logo (o sistema recorta a imagem num círculo); o nome e o
  slogan aparecem no iOS. A faixa azul com o círculo goiaba do design não cabe na splash
  nativa.
- **Modo escuro:** cores de erro, goiaba suave e cards do equilíbrio/atenção no escuro não
  estavam no design; foram derivadas mantendo AA (ver `src/core/theme/tokens.ts`).
