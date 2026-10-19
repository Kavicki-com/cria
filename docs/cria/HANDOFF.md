# Handoff do Cria para o Claude Code (CLI)

Este arquivo é o ponto de partida. Ele explica como montar o repositório, o que colar
no Claude Code e como conduzir fase por fase. O plano técnico completo está em
`PLANO.md` e as telas em `design/`.

## O que tem no pacote

```
cria-handoff/
  HANDOFF.md        ← este arquivo (para você, Jorge)
  PLANO.md          ← plano técnico (para o Claude Code)
  design/           ← 42 telas finais (.dc.html) + canvas.json + README.md (tela → rota)
```

## 1. Preparar o repositório (uma vez, no terminal)

```bash
# cria o repo a partir do kit e já clona
gh repo create Kavicki-com/cria --template Kavicki-com/boillerplate --private --clone
cd cria

# coloca o handoff dentro do repo
mkdir -p docs
cp -R ~/Downloads/cria-handoff docs/cria     # ajuste o caminho de onde você descompactou
git add docs/cria
git commit -m "docs: plano e telas de design do Cria"
git push
```

Depois, acrescente no **fim** do `CLAUDE.md` do repo do Cria a seção abaixo. Ela é
específica deste app, então fica só aqui e não volta para o kit:

```markdown
## Cria — onde está o plano

Este app é o **Cria — Meu plano de negócios**. Antes de qualquer tarefa, leia
`docs/cria/PLANO.md` (plano, fases, modelo de dados, regras) e use `docs/cria/design/`
como referência visual — o mapa tela → rota está em `docs/cria/design/README.md`.
Referências de código da casa: `Kavicki-com/penduro` (principal) e
`Kavicki-com/churrapp`. Não use o Vjez como referência.
Trabalhe uma fase por vez e pare no fim de cada uma para revisão.
```

Faça o commit dessa mudança e abra o Claude Code dentro da pasta: `claude`.

## 2. O que deixar pronto antes (só você consegue)

- [ ] `eas login` feito na conta da Kavicki (o Claude Code roda o `eas init` na fase 0).
- [ ] Projeto no RevenueCat com as chaves públicas de iOS e Android.
- [ ] O produto **não consumível** `com.kavicki.cria.desbloqueio` (R$ 29,90) criado na
      App Store Connect e no Play Console, ligado ao entitlement `cria_pro` e à offering
      `default` no RevenueCat (como o Pendurô e o Churrapp). Só a fase 3 precisa disso; dá para começar sem.
- [ ] Conta de testador sandbox (iOS) e faixa de teste interno (Play).
- [ ] Clone local do Pendurô e do Churrapp ao lado do Cria (`../penduro`, `../churrapp`),
      para o Claude Code consultar os padrões.

## 3. Primeiro prompt (colar no Claude Code)

```
Você vai construir o app Cria — Meu plano de negócios neste repositório, que foi criado
a partir do kit Kavicki-com/boillerplate.

1. Leia o CLAUDE.md inteiro, depois docs/cria/PLANO.md inteiro, depois
   docs/cria/design/README.md.
2. Dê uma olhada em ../penduro (principal) e ../churrapp para ver os padrões da casa:
   src/data/db.ts, src/data/mudancas.ts, src/core/theme/fonts.ts, src/features/dinheiro.ts,
   src/features/lembretes, src/features/backup/formato.ts. Não use o Vjez.
3. Me devolva um resumo curto do que entendeu e qualquer conflito que você veja entre o
   PLANO.md e o código do kit. Não escreva código ainda.
```

Quando o resumo estiver ok:

```
Execute a Fase 0 do PLANO.md (§2). Pare antes do `eas init` e me avise para eu confirmar.
No fim, rode `npm run check` e `npx expo prebuild --platform android`, me mostre os
avisos e faça um commit convencional dizendo o que foi e o que não foi verificado.
```

## 4. Prompts das fases seguintes

Use um por vez e revise o resultado no aparelho antes de seguir.

| Fase | Prompt                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `Execute a Fase 1 do PLANO.md. Compare cada tela com o .dc.html correspondente em docs/cria/design antes de dar por pronta.`                                                         |
| 2    | `Execute a Fase 2. Os testes de progresso.ts, calculo.ts e unidade.ts (pluralizar) precisam passar com node --test.`                                                                 |
| 3    | `Execute a Fase 3 (desbloqueio, §6). Comece trazendo para o core as correções do Pendurô/Churrapp listadas no §6. Me avise antes de qualquer build EAS e diga qual perfil vai usar.` |
| 4    | `Execute a Fase 4. O BMC pré-preenche a partir do Lean; a Persona tem o seletor de ilustração mulher/homem.`                                                                         |
| 5    | `Execute a Fase 5 (análise, §7). A fixture Lanches da Vila tem que bater todos os números do §7 em teste.`                                                                           |
| 6    | `Execute a Fase 6 (PDF, §8). Faça primeiro o spike de orientação paisagem e me mostre o resultado no iOS e no Android antes de seguir.`                                              |
| 7    | `Execute a Fase 7: modo escuro, en/es, acessibilidade, iPad. Liste as diferenças que restarem em relação ao design.`                                                                 |
| 8    | `Execute a Fase 8: store/ e site/ no padrão do Pendurô; textos-loja.md em pt-BR.`                                                                                                    |

## 5. Regras para lembrar o Claude Code, se ele se perder

- Uma fase por vez, com `npm run check` verde e commit no fim de cada uma.
- Nenhum texto visível no código: tudo vai nos locales (pt é a base).
- Dinheiro sempre em centavos e formatado por `dinheiro.ts`.
- Desbloqueio único não consumível, com "Restaurar compra" em Ajustes. Nada de créditos.
- Perguntar antes de gastar build EAS e dizer qual perfil vai usar (`development`
  ou `development-sim`).
- Na dúvida entre o PLANO.md e o design, o design manda no visual e o plano manda no
  comportamento. Se os dois conflitarem, perguntar.

## 6. Decisões já fechadas (resumo)

- Offline; a análise vem de regras + frases. IA no aparelho fica para depois.
- Grátis: Lean Canvas, ponto de equilíbrio e prévia com 1 insight. Pago: compra única
  de R$ 29,90 libera, em todos os negócios, BMC, SWOT, Persona, Plano de ação,
  análise completa e PDF.
- A compra volta por "Restaurar compra". O backup dos negócios fica para a v1.1.
- A calculadora pergunta "O que você vende?" e "Qual é o seu maior custo?".
- Lean 8 "Como saber se está dando certo" e 9 "O que ninguém copia fácil".
- A Persona usa ilustrações próprias de mulher e homem.
