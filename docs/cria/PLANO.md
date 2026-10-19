# Cria — Meu plano de negócios · Plano de desenvolvimento

Handoff para o Claude Code. Leia este arquivo inteiro antes de abrir o projeto e
releia a seção da fase antes de começá-la.

- **Referências de código:** `Kavicki-com/penduro` (principal) e
  `Kavicki-com/churrapp`. **Não use o Vjez como referência.**
- **Base:** criado a partir do kit `Kavicki-com/boillerplate` ("Use this template").
  O `CLAUDE.md` do kit vale integralmente: invariantes, onde o código mora, armadilhas
  de config e estilo de commit. Este plano não repete o que já está lá; ele só diz o
  que é específico do Cria.
- **Design:** a pasta `design/` tem as 42 telas finais (`*.dc.html`) e o `canvas.json`.
  São HTML com estilos inline e servem de referência visual e de texto. Elas não
  abrem sozinhas no navegador porque dependem de um `support.js` do editor; leia a
  marcação. O mapa tela → rota está em `design/README.md`.

---

## 1. O produto em uma página

O Cria leva quem está começando um pequeno negócio a montar um plano de negócio,
uma pergunta por vez, em português claro. No fim, gera um PDF de 9 páginas para
mostrar a sócio, banco ou Sebrae.

|                                                    | Grátis                                              | Cria completo (compra única)    |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| Negócios                                           | quantos quiser                                      | quantos quiser, todos liberados |
| Sua ideia em uma página (Lean Canvas, 9 perguntas) | ✅                                                  | ✅                              |
| Ponto de equilíbrio (calculadora)                  | ✅                                                  | ✅                              |
| Análise                                            | prévia: 1 ponto de atenção visível, o resto borrado | completa                        |
| Como o negócio funciona (BMC, 9)                   | 🔒                                                  | ✅                              |
| Forças e fraquezas (SWOT, 4 partes)                | 🔒                                                  | ✅                              |
| Seu cliente ideal (Persona + proposta de valor, 6) | 🔒                                                  | ✅                              |
| Plano de ação (tarefas + lembretes)                | 🔒                                                  | ✅                              |
| Documento PDF                                      | 🔒                                                  | ✅, quantas vezes quiser        |

**Preço:** compra única de R$ 29,90 (não consumível). Ela libera o plano completo em
**todos** os negócios, os de agora e os que vierem, e volta com "Restaurar compra"
depois de reinstalar ou num aparelho novo da mesma conta da loja. É o mesmo modelo do
Pendurô e do Churrapp.

**Restrições firmes:**

- **Offline.** Nada de backend, conta ou chamada de rede, salvo a loja via RevenueCat
  (invariante 7).
- **Análise sem IA na nuvem.** Ela vem de um motor de regras com um banco de frases
  (§7). IA no aparelho fica como camada opcional futura (§13).
- **Idioma:** pt-BR é o padrão e o fallback; en e es entram na fase 7.

---

## 2. Setup (Fase 0)

1. Crie o repositório `Kavicki-com/cria` com "Use this template" a partir do kit.
2. Em `package.json`, apague `kavickiTemplate: true` e mude `name` para `"cria"`.
3. Em `app.config.ts`, use estes identificadores (siga o padrão do Pendurô):
   ```ts
   const APP_NAME = 'Cria';
   const APP_SLUG = 'cria';
   const APP_SCHEME = 'cria';
   const BUNDLE_ID = 'com.kavicki.cria';
   ```
   O nome nas lojas é "Cria — Meu plano de negócios". O `APP_NAME` do ícone é só "Cria".
4. Rode `eas init` e cole o projectId como literal em `extra.eas.projectId` (veja o
   CLAUDE.md).
5. Para o `.env.local` do RevenueCat, veja o §6. O desbloqueio usa o entitlement do kit,
   como no Pendurô e no Churrapp.
6. Instale as dependências:
   ```bash
   npx expo install expo-sqlite expo-print expo-sharing expo-file-system expo-asset
   npm i @expo-google-fonts/poppins @expo-google-fonts/roboto zustand
   ```
   Algumas já vêm no kit: confira antes. Para ícones, use `lucide-react-native` +
   `react-native-svg`, como no Churrapp. O logo é um SVG próprio (§9).
7. Rode `npm run check` e confirme que fica verde. Rode também
   `npx expo prebuild --platform android` e leia os avisos.

**Pronto quando:** o app abre num dev build com o nome Cria e o check passa.

---

## 3. Arquitetura

Siga a do Pendurô: slices em `src/features` com nomes em português, `src/data` com
SQLite, rotas finas em `src/app`.

```
src/
  app/                          # Expo Router — só delega
    _layout.tsx                 # fontes, tema, bootstrap de compras (usePurchasesBootstrap do kit)
    index.tsx                   # Meus negócios (lista / estado vazio)
    onboarding.tsx              # 3 passos, só na 1ª abertura
    ajustes.tsx
    negocio/novo.tsx
    negocio/[id]/index.tsx      # Hub (grátis ou liberado — mesma rota)
    negocio/[id]/lean.tsx       # formulário guiado (?pergunta=n)
    negocio/[id]/lean-revisao.tsx
    negocio/[id]/bmc.tsx
    negocio/[id]/bmc-revisao.tsx
    negocio/[id]/swot.tsx
    negocio/[id]/swot-revisao.tsx
    negocio/[id]/persona.tsx
    negocio/[id]/persona-revisao.tsx
    negocio/[id]/equilibrio.tsx
    negocio/[id]/analise.tsx
    negocio/[id]/plano-acao.tsx
    negocio/[id]/documento.tsx  # gerando → pronto
    paywall.tsx                 # paywall (modal), aberto por openPaywall(source) de qualquer lugar
    restaurar.tsx               # Restaurar compra, a partir de Ajustes (como churrapp/desbloqueio)
  features/
    negocios/        # lista, criar, editar, progresso (progresso.ts + teste)
    quadros/         # definição declarativa das perguntas (lean, bmc, persona) + FormularioGuiado + Revisao
    swot/            # UI de lista por parte (é diferente do formulário de texto único)
    equilibrio/      # calculadora: calculo.ts (puro + teste) + EquilibrioScreen
    analise/         # motor de regras (puro + testes) + AnaliseScreen + PreviaAnalise
    planoAcao/       # tarefas + agendador de lembretes (como penduro/lembretes)
    desbloqueio/     # PaywallScreen, RestaurarScreen, Resultado (como penduro/churrapp desbloqueio)
    documento/       # templates HTML do PDF (puros + teste) + fontes base64 + telas
    boasVindas/      # onboarding (como penduro/boasVindas)
    ajustes/
    ui/              # peças compartilhadas do app: BarraProgresso, AnelProgresso, Logo, Selo
    dinheiro.ts      # copie de penduro/src/features/dinheiro.ts (centavos ↔ texto, sem Intl)
    plano.ts         # constantes do tier grátis (QUADROS_GRATIS = ['lean','equilibrio'], INSIGHTS_PREVIA = 1)
  data/
    db.ts            # lazy require do expo-sqlite, PRAGMA user_version, SCHEMA_VERSION
    mudancas.ts      # barramento de mudanças (copie o do Pendurô) + useSyncExternalStore
    negociosRepository.ts
    respostasRepository.ts
    swotRepository.ts
    numerosRepository.ts
    tarefasRepository.ts
    types.ts
    index.ts
```

**Regras:**

- A direção das dependências é `app → features → core` e `features → data`. Nada em
  `src/core` importa de `features`, `data` ou `app` (invariante 4).
- **Perguntas são dados, não telas.** `quadros/definicoes.ts` declara cada quadro:
  `{ id, campos: [{ id, chaveI18n }] }`. Os textos (pergunta, "por que importa",
  exemplo, rótulo curto da revisão) ficam em `locales/*.json` sob
  `quadros.<quadro>.<campo>.*`. Um único `FormularioGuiado` serve Lean, BMC e
  Persona. O SWOT tem UI própria (lista de itens por parte).
- Todo texto visível vai para os locales (invariante 6). Isso vale também para as
  frases da análise e do PDF.
- Dinheiro é sempre guardado em **centavos inteiros** e formatado só por `dinheiro.ts`.

---

## 4. Modelo de dados (SQLite, `cria.db`)

`SCHEMA_VERSION = 1`. As migrações seguem o padrão `if (current < n) { … }` do
`penduro/src/data/db.ts`.

```sql
CREATE TABLE negocios (
  id TEXT PRIMARY KEY,               -- uuid
  nome TEXT NOT NULL,
  segmento TEXT NOT NULL,            -- 'alimentacao'|'beleza'|'comercio'|'servicos'|'moda'|'saude'|'educacao'|'outro'
  estagio TEXT NOT NULL,             -- 'ideia'|'vendendo'
  criado_em INTEGER NOT NULL,
  atualizado_em INTEGER NOT NULL
);

CREATE TABLE respostas (             -- Lean, BMC e Persona (campos de texto)
  negocio_id TEXT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  quadro TEXT NOT NULL,              -- 'lean'|'bmc'|'persona'
  campo TEXT NOT NULL,               -- id do campo em quadros/definicoes.ts
  texto TEXT NOT NULL,
  pulada INTEGER NOT NULL DEFAULT 0, -- "Pular por enquanto"
  atualizado_em INTEGER NOT NULL,
  PRIMARY KEY (negocio_id, quadro, campo)
);

CREATE TABLE swot_itens (
  id TEXT PRIMARY KEY,
  negocio_id TEXT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  parte TEXT NOT NULL,               -- 'forcas'|'fraquezas'|'oportunidades'|'ameacas'
  texto TEXT NOT NULL,
  ordem INTEGER NOT NULL
);

CREATE TABLE numeros (               -- ponto de equilíbrio
  negocio_id TEXT PRIMARY KEY REFERENCES negocios(id) ON DELETE CASCADE,
  fixos_centavos INTEGER,
  custo_unitario_centavos INTEGER,
  preco_centavos INTEGER,
  dias_por_mes INTEGER NOT NULL DEFAULT 26,
  unidade_singular TEXT,             -- "O que você vende?": "lanche", "corte", "aula"
  unidade_plural TEXT,               -- gerado por pluralizar() e editável; NULL = usar o gerado
  maior_custo TEXT                   -- "Qual é o seu maior custo?" (opcional): "carne", "tinta"…
);

CREATE TABLE tarefas (
  id TEXT PRIMARY KEY,
  negocio_id TEXT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data TEXT,                         -- 'YYYY-MM-DD' ou NULL
  lembrete INTEGER NOT NULL DEFAULT 0,
  notificacao_id TEXT,
  feita INTEGER NOT NULL DEFAULT 0,
  origem_regra TEXT,                 -- id da regra da análise que sugeriu a tarefa (evita duplicar)
  ordem INTEGER NOT NULL,
  criado_em INTEGER NOT NULL
);
```

- **A liberação não fica no banco.** É o flag `unlocked` do kit (MMKV, atualizado pelo
  RevenueCat), que vale para todos os negócios. Nenhuma tabela guarda compra.
- `notificarMudanca()` roda depois de cada escrita, e as telas leem com
  `useSyncExternalStore`, como no Pendurô.
- **Ilustração da persona:** guardada em `respostas` como `quadro='persona', campo='ilustracao'`,
  valor `'mulher'` ou `'homem'` (padrão `'mulher'`). Não conta no progresso.
- **Progresso (%)** = campos preenchidos ÷ total. O total são 9 do Lean, 9 do BMC,
  4 partes do SWOT com pelo menos 1 item, 6 da Persona, 1 do Equilíbrio (os 3 números
  válidos) e 1 do Plano de ação (≥1 tarefa), ou seja, 30. No tier grátis o hub mostra
  o mesmo %, contando só o que existe. A fórmula fica em `progresso.ts`, com teste. Os
  números das telas de design são ilustrativos.
- **Pré-preenchimento do BMC:** Segmentos, Proposta de valor, Canais, Fontes de receita
  e Estrutura de custos já existem no Lean. Ao abrir o BMC pela 1ª vez, esses campos
  vêm sugeridos a partir do Lean, editáveis e marcados como "veio da sua ideia".

---

## 5. Os quadros (conteúdo)

Os textos exatos das perguntas, da ajuda e dos exemplos estão nas telas de design
(`Formulario`, `Swot`, `Persona`, `Revisao*`). Copie-os para `pt.json`.

- **Lean Canvas: "Sua ideia em uma página"** (9 campos)
  1. Problema
  2. Para quem
  3. O que te faz diferente
  4. Solução
  5. Onde o cliente te encontra
  6. Como ganha dinheiro
  7. Principais custos
  8. Como saber se está dando certo (métricas-chave)
  9. O que ninguém copia fácil (vantagem injusta)

  Textos de 8 e 9 (aprovados; a tela `Revisao` já mostra os 9):

  | Campo                              | Pergunta                                                      | Por que isso importa?                                                                                                   | Ex.:                                                      |
  | ---------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
  | 8 · Como saber se está dando certo | Que números mostram que o negócio está indo bem?              | Escolha 1 ou 2 números para olhar toda semana. Sem isso, fica difícil saber se precisa mudar alguma coisa.              | lanches vendidos por mês, clientes que voltam em 30 dias. |
  | 9 · O que ninguém copia fácil      | O que você tem que um concorrente não consegue copiar rápido? | Pode ser uma receita, um ponto, um contato ou a confiança da vizinhança. Se ainda não tiver, tudo bem: deixe em branco. | receita própria de molho e a relação com os vizinhos.     |

  No PDF (página 4) os blocos mantêm os nomes técnicos: "Métricas-chave" e "Vantagem
  injusta".

- **BMC: "Como o negócio funciona"** (9 campos)
  1. Segmentos
  2. Proposta de valor
  3. Canais
  4. Relacionamento
  5. Fontes de receita
  6. Recursos principais
  7. Atividades principais
  8. Parcerias principais
  9. Estrutura de custos
- **SWOT: "Forças e fraquezas"**
  - As 4 partes: Forças, Fraquezas, Oportunidades e Ameaças, rotuladas "ajuda/atrapalha
    · dentro/fora do negócio".
  - Cada parte é uma lista de itens curtos, com a dica "de 2 a 4 bastam".
- **Persona: "Seu cliente ideal"** (6 campos)
  1. Quem é (nome e idade)
  2. Como é a vida
  3. O que ela quer
  4. O que incomoda
  5. Como decide
  6. Proposta de valor (em destaque no PDF)
- **Ponto de equilíbrio** (tela `Ponto-equilibrio`, já atualizada):
  - **O que você vende?** Texto, uma unidade no singular ("lanche"). Abaixo aparece
    "No plural fica **lanches**". O plural vem de `pluralizar()` em
    `equilibrio/unidade.ts`, uma função pura com teste:
    - `ão→ões`, `vogal+l→is`, `m→ns`, `r/z/s→es`, senão `+s`;
    - só a 1ª palavra vai para o plural ("corte de cabelo" → "cortes de cabelo");
    - vazio → "venda"/"vendas".
      Toda a tela (rótulos, card, erro) e a análise/PDF usam `{singular}`/`{plural}`
      no lugar de "lanche(s)". Em en/es, peça o plural num 2º campo, porque a regra é
      só para pt.
  - Custos fixos/mês, custo de cada {singular} e preço de venda.
  - **Qual é o seu maior custo? (opcional).** Quando preenchido, o card verde ganha a
    linha: "Seu maior custo é **carne**. Se ele subir R$ 1 em cada lanche, você
    precisa vender **+17 lanches** por mês para empatar."
  - Se `preço ≤ custo`, mostre o estado de erro "Assim não fecha a conta".
- **Plano de ação:** tarefas com data opcional e lembrete local, separadas em
  pendentes e feitas.
  - Os lembretes reaproveitam `@/core/notifications`; o modelo é
    `penduro/src/features/lembretes/agendador.ts`.

**Ilustração da persona:** **duas ilustrações próprias**, mulher e homem, desenhadas
para o Cria. São SVG, ficam dentro do app e não têm questão de licença. A pessoa
escolhe no seletor "Ilustração do seu cliente" (tela `Persona`, dois círculos de 44 pt
com `role="radio"`).

- A ilustração escolhida aparece no card do formulário, na revisão e no PDF (página 7).
- **SVG:** copie os paths de `Persona.dc.html` (sc-if `ehMulher` / `ehHomem`) para
  `features/ui/IlustracaoPersona.tsx` (react-native-svg) e para o template do PDF.
- **Fundo:** goiaba-soft `#FCE3E5` para mulher e azul-soft `#E4ECF7` para homem.

---

## 6. Desbloqueio (compra única)

O Cria usa o modelo do kit sem mudança de forma: **um desbloqueio não consumível por
entitlement**, igual ao Pendurô e ao Churrapp, que já foram testados na loja. Use
`useUnlock`, `useGate`, `openPaywall` e `usePurchasesBootstrap` do core. O paywall do
app mora em `features/desbloqueio/` (siga o `PaywallScreen` do Churrapp e o do Pendurô).

**Produto** (App Store Connect / Play Console, **não consumível**):

- `com.kavicki.cria.desbloqueio`: R$ 29,90
- Entitlement `cria_pro`, offering `default` no RevenueCat. No `.env.local`:
  `EXPO_PUBLIC_RC_ENTITLEMENT_ID=cria_pro`, `EXPO_PUBLIC_RC_PRODUCT_ID=com.kavicki.cria.desbloqueio`.

**O que fica livre e o que fica bloqueado** está em `features/plano.ts`
(`QUADROS_GRATIS`, `INSIGHTS_PREVIA`), como o `LIMITE_CLIENTES_GRATIS` do Pendurô. Um
negócio novo, criado antes ou depois da compra, segue o flag global: com `unlocked`
tudo está aberto em todos os negócios.

**Antes de começar, traga estas correções dos outros apps para o core** (elas não
estão no kit; leve-as para o `boillerplate` também, linha 2 do CLAUDE.md):

1. `isUnlocked()` em `purchases/gating.ts` respeitando o `devUnlock` em `__DEV__`
   (penduro/churrapp). Sem isso, com "Simulate unlock" ligado a navegação ainda manda
   para o paywall.
2. `core/navigation` com `pushOnce`/`replaceOnce`/`dismissToOnce` (penduro/churrapp),
   usado pelo `openPaywall`.
3. Status `pending` em `purchases/client.ts` para `PAYMENT_PENDING_ERROR` (churrapp).

**Fluxo de compra:**

1. Qualquer item bloqueado (quadros pagos, análise completa, "Gerar documento") chama
   `openPaywall(source)`.
2. Cancelamento volta ao paywall sem mensagem.
3. Sucesso mostra o resultado de compra concluída e volta para o hub, já liberado.
4. `pending` (Play "slow card", Ask to Buy) mostra `Estado-compra-pendente`. A
   liberação chega depois pelo listener do customer info, sem estado local.
5. Erro mostra `Estado-compra-falhou` com Tentar de novo. **Não diga "Nada foi
   cobrado"**: a conexão pode cair depois da cobrança. Aponte para "Restaurar compra",
   como o Churrapp.

**Restaurar compra** é obrigatório para não consumível (Apple). Fica em Ajustes e abre
`restaurar.tsx` (siga o `RestaurarScreen` do Churrapp).

**Estados do paywall:**

| Situação        | Tela de design                                |
| --------------- | --------------------------------------------- |
| bloqueado       | `Paywall` (só a opção única, sem "1 ou 3")    |
| compra pendente | `Estado-compra-pendente`                      |
| erro            | `Estado-compra-falhou` (texto ajustado acima) |

`Paywall-credito` e `Estado-sem-creditos` saem do app.

- **Dev:** o "Simulate unlock" do kit em Ajustes, sem nada novo.
- **Preço exibido:** sempre o `priceString` da loja via `useUnlock().price`.

---

## 7. Motor de análise (offline, regras + banco de frases)

**Decisão assumida.** O Jorge exigiu "tem que ser offline" e perguntou sobre IA local.
A recomendação, que este plano assume, é que o MVP use **regras determinísticas +
frases dos locales**. Assim a análise é instantânea, funciona em qualquer aparelho, é
testável e sai igual no app e no PDF. Se ele quiser outra coisa, isto muda antes da
fase 5.

`src/features/analise/` traz funções puras, sem React e sem banco:

```ts
type Entrada = { negocio; respostas; swot; numeros; tarefas };
type Analise = {
  indicadores: {
    margemPct;
    margemUnit;
    empateMes;
    empateDia;
    faturamentoEmpate;
    sensibilidadeCusto;
  };
  cenarios: { vendas; resultado }[]; // 3 cenários
  eSe: { chave: 'preco' | 'custo' | 'fixos'; delta; novoEmpate }[];
  atencao: Achado[]; // até 3, por severidade
  bom: Achado[]; // até 2
  passos: Passo[]; // até 3, derivados dos achados
  cruzamentosSwot: Achado[]; // p/ o PDF
  conquistar: string[]; // "Como conquistar a Carla" (PDF persona)
};
type Achado = { regra: string; severidade: 1 | 2 | 3; params: Record<string, string | number> };
```

**Cálculos.** O teste de aceite usa a fixture "Lanches da Vila": fixos R$ 6.240,
custo R$ 12, preço R$ 32.

- margem = preço − custo = **R$ 20 (62,5%)**
- empate = ceil(fixos / margem) = **312/mês**; ÷ 26 dias, arredondando para cima,
  **≈12/dia**
- faturamento no empate = **R$ 9.984**
- sensibilidade = empate(custo + R$ 1) − empate = **+17 lanches/mês**
- cenários: ~0,8×, 1,3× e 1,6× o empate, arredondados para múltiplos de 50 (250, 400,
  500); resultado = vendas × margem − fixos, ou seja, **−1.240 / +1.760 / +3.760**
- "e se…": preço +~6%, custo +~15% e fixos +~15%, cada um arredondado para um valor
  "redondo" (34, 14, +1.000), com novo empate **284 / 347 / 362**
- O teste confere exatamente esses números.

**Regras** (`regras.ts`): uma lista de objetos `{ id, quando(entrada, indicadores) → params | null, severidade, passo? }`.
Comece com estas:

| id                    | Dispara quando                                                           | Tipo                                                             |
| --------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `canais_vazios`       | Lean "Onde o cliente te encontra" vazio/pulado                           | atenção 3 → passo "Responda seus canais"                         |
| `custo_dominante`     | `maior_custo` preenchido e sensibilidade ≥ 5% do empate                  | atenção 2 → passo "Cotar um segundo fornecedor de {maior_custo}" |
| `capacidade`          | fraqueza contém pessoa/sozinho/um(a) **ou** empateDia alto p/ o segmento | atenção 2 (cita a 1ª fraqueza entre aspas)                       |
| `margem_baixa`        | margemPct < 30%                                                          | atenção 3                                                        |
| `margem_boa`          | margemPct ≥ 50%                                                          | bom                                                              |
| `empate_alto`         | empateDia > limite do segmento (tabela em `limites.ts`)                  | atenção 2                                                        |
| `proposta_mensuravel` | proposta de valor contém número/tempo (regex `\d`)                       | bom (cita a proposta)                                            |
| `proposta_vaga`       | proposta < 25 caracteres ou sem diferencial                              | atenção 1                                                        |
| `sem_numeros`         | equilíbrio não preenchido                                                | atenção 3 → passo "Preencha os 3 números"                        |
| `swot_desequilibrado` | fraquezas+ameaças > 2× forças                                            | atenção 1                                                        |
| `persona_sem_decisao` | "Como decide" vazio                                                      | atenção 1                                                        |
| `sem_tarefas`         | 0 tarefas pendentes                                                      | passo "Crie a 1ª tarefa do plano"                                |
| `ideia_sem_validacao` | estágio "ideia" e nenhuma métrica-chave                                  | atenção 2                                                        |

- **Frases:** ficam em `locales/*.json` sob `analise.regras.<id>.{titulo,texto,passo}`,
  com placeholders (`{{maiorCusto}}`, `{{empateDia}}`, `{{fraqueza}}`). Quando houver
  variantes (`texto_1`, `texto_2`), escolha uma por `hash(negocio.id + regra)`, para a
  frase não mudar a cada render.
- **Citar a pessoa** ("quente em 25 minutos") vem dos dados dela, então não é uma
  string fixa e não fere a invariante 6.
- **Cruzamentos do SWOT (PDF):** força × oportunidade ("use"), fraqueza × ameaça
  ("proteja-se"), força × ameaça e fraqueza × oportunidade. Cada cruzamento é uma
  frase-modelo que combina o 1º item de cada parte.
- **"Como conquistar a {persona}":** 3 frases a partir de "o que incomoda", "como
  decide" e canais.
- **Prévia grátis:** calcule tudo, mas `PreviaAnalise` só mostra `atencao[0]` inteiro.
  Os demais aparecem como esqueleto/borrão sem o texto real (siga `Hub-gratis`). Não
  dependa de `BlurView` no Android: um overlay com barras de esqueleto basta.
- **Próximo passo → tarefa:** o botão "Adicionar ao plano" cria uma tarefa com
  `origem_regra` e não duplica a que já existe.
- **Testes:** cada regra tem casos de dispara e não dispara, há a fixture completa da
  Lanches da Vila e um teste garante que toda `regra.id` tem chaves nos 3 locales.

---

## 8. Documento PDF (`src/features/documento/`)

São 9 páginas A4 (veja `design/PDF-*`):

| #   | Página                                 | Orientação   |
| --- | -------------------------------------- | ------------ |
| 1   | Capa                                   | retrato      |
| 2   | Sumário executivo                      | retrato      |
| 3   | Diagnóstico                            | retrato      |
| 4   | Lean Canvas                            | **paisagem** |
| 5   | BMC                                    | **paisagem** |
| 6   | SWOT + cruzamentos                     | retrato      |
| 7   | Persona + "Como conquistar"            | retrato      |
| 8   | Números: equilíbrio, cenários, "e se…" | retrato      |
| 9   | Plano de ação                          | retrato      |

- **Montagem:** `montarDocumento(entrada, analise, t, fontesCss) → string`, uma função
  pura com uma função por página. O teste de snapshot e de conteúdo cobre o HTML
  (nome do negócio presente, nenhuma chave i18n crua, 9 `section.pagina`).
- **Fontes:** o WebView de impressão não acessa as fontes do app. Leia os `.ttf` de
  Poppins 600 e Roboto 400/500/700 com `expo-asset` + `expo-file-system`, converta
  para base64 e gere `@font-face` com `data:` URI. Faça cache em memória na sessão.
- **Paisagem misturada com retrato:** o `expo-print` não garante `@page` nomeado nos
  dois WebViews. Faça um **spike no 1º dia da fase**:
  - (a) testar `@page paisagem { size: A4 landscape }` + `page: paisagem` no iOS e no
    Android;
  - (b) se falhar, todas as páginas ficam em retrato e as 4 e 5 entram rotacionadas
    90° via CSS (`transform: rotate(-90deg)` num container de 297×210 mm).
  - Escolha a que funcionar nos dois sistemas e registre a decisão.
- **Paginação:** `section.pagina { width:210mm; height:297mm; page-break-after:always; overflow:hidden }`.
  Textos longos são truncados com reticências e limite de linhas por bloco. Nunca deixe
  um bloco empurrar a página seguinte.
- **Cores e papel:** fundo `#FFFDF9`; use `-webkit-print-color-adjust: exact`.
- **Atribuição CC BY-SA 3.0** no rodapé das páginas 4 e 5:
  - Lean Canvas: adaptado do Business Model Canvas por Ash Maurya
  - BMC: Strategyzer AG
  - Ajustes repete as duas atribuições (já está no design).
- **Fluxo:**
  - **Gerar documento:** `Estado-gerando` (progresso por etapa) → `Print.printToFileAsync({ html })`
    → move o arquivo para `Plano-<nome-slug>.pdf` → `Documento-pronto`.
  - **Compartilhar:** `Sharing.shareAsync`, que já cobre "Salvar em Arquivos".
  - **Abrir:** `Print.printAsync({ uri })` (pré-visualização do sistema).
- O `sharePdf` do kit gera e compartilha numa chamada só. Crie em `documento/` um
  `gerarPdf()` que devolve a `uri`. Isso também é bom para o kit; leve depois.
- Os campos pulados aparecem no PDF como "—" discreto, nunca como "undefined" ou vazio
  quebrado.
- O PDF usa a unidade do negócio ("312 lanches por mês") e a ilustração de persona
  escolhida.

---

## 9. Design system → código

Os tokens vão em `src/core/theme/tokens.ts`. Os valores do kit são substituídos; a
**forma** do arquivo é a mesma do kit, para não quebrar o core.

| Token                   | Claro                                      | Escuro                                |
| ----------------------- | ------------------------------------------ | ------------------------------------- |
| background              | `#FAF7F2`                                  | `#10151D`                             |
| surface                 | `#FFFFFF`                                  | `#19212C`                             |
| ink                     | `#18212E`                                  | `#ECF0F5`                             |
| muted                   | `#545F6E`                                  | `#A6B0BE`                             |
| line                    | `#E7E1D7`                                  | `#2A3442`                             |
| primary                 | `#1F4F8F` (pressed `#173B6C`)              | `#8DB6EE` (texto sobre ele `#0D1A2E`) |
| primarySoft / card tint | `#E4ECF7`, borda `#C9D7EE`                 | `#1E2E47`                             |
| accent (goiaba)         | `#EF6F7A`, soft `#FCE3E5`, texto `#8A2433` | conferir em `Escuro-*`                |
| success                 | `#1D7A52`, selo `#DDF3E7` / `#145C3D`      | conferir em `Escuro-*`                |
| error                   | `#B3261E` / `#FBE9E7`                      | conferir em `Escuro-*`                |
| paper (PDF)             | `#FFFDF9`                                  | —                                     |

- **Tipografia:** títulos em Poppins 600 e corpo em Roboto 400/500/700. Importe por
  caminho (`@expo-google-fonts/poppins/600SemiBold`, etc.), igual ao `useAppFonts` do
  Pendurô. Nunca use o barrel.
- **Medidas:** alvos de toque ≥ 44 pt, raio de card 20, raio de botão 14–16, botão
  primário com 54–56 de altura. As telas foram desenhadas em 390×844.
- **Logo B (degraus):** quadrado azul arredondado (rx 18/64), caminho branco
  `M15 47h11V37h11V27h11` (traço 4,5, cantos redondos) e círculo goiaba em cx 48,
  cy 17, r 5,5. Viram os componentes `ui/Logo.tsx` (react-native-svg), ícone do app,
  splash e favicon do site (veja `design/Logo`, `Icone-app` e `Splash`).
- **Selo "Plano liberado"** é **verde** (success), nunca vermelho.
- **Card de equilíbrio** é verde.
- **Cards** usam o tint azul claro. **Não use cards pretos.**
- **Modo escuro:** só no app; o PDF é sempre claro. Siga `Escuro-meus-negocios`,
  `Escuro-hub` e `Escuro-formulario`. Ajustes tem Automático/Claro/Escuro (config do
  kit). Lembre de `expo-system-ui` (CLAUDE.md).
- **Splash:** fundo `#FFFDF9`, logo + "Cria" + "Meu plano de negócios" e faixa azul
  embaixo com círculo goiaba. Use `expo-splash-screen` com uma imagem exportada do
  design.

---

## 10. Telas → rotas

O mapa completo está em `design/README.md`. Pontos de atenção:

- **Hub** é uma rota só. Sem desbloqueio (`useUnlock().unlocked` falso), renderiza
  `Hub-gratis`; com ele, `Hub`.
  - **Itens bloqueados** chamam `openPaywall(source)`.
  - **Gerar documento** no grátis abre o paywall e, no liberado, vai para `documento`.
  - As telas pagas conferem `unlocked` de novo, porque um deep link pode cair nelas
    direto (como o `pro.tsx` do kit).
  - **Header** fica separado do card de análise: o design foi desembolado de
    propósito, não junte de novo.
- **Estado-negocio-0:** se o negócio está em 0%, o hub destaca "Por onde começar → Sua
  ideia em uma página" e "Gerar documento" fica desabilitado.
- **Onboarding:** `Main` → `Onboarding-2` → `Onboarding-3`, com "Pular". Só aparece na
  1ª abertura (flag no MMKV).
- **Estado-vazio** é o que a lista de negócios mostra quando não há nenhum.
- **Formulário guiado:**
  - Cada resposta salva ao sair do campo (sem botão salvar). "Pular por enquanto"
    marca `pulada=1`.
  - O topo mostra uma barra segmentada com N de 9.
  - "Por que isso importa?" expande e recolhe.
- **Revisões:** tocar numa resposta abre o formulário naquela pergunta. As puladas
  aparecem com "Responder".

---

## 11. Fases

Cada fase termina com `npm run check` verde, launch num dev build Android e um
commit convencional dizendo o que foi e o que não foi verificado.

| Fase                   | Entrega                                                                                                                                                               | Pronto quando                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 · Setup**          | §2                                                                                                                                                                    | app abre como Cria, check verde                                                                                                                       |
| **1 · Base**           | tokens, fontes, Logo, splash, ícone, `db.ts` + migração 1, `mudancas.ts`, onboarding, Meus negócios (vazio/lista), Novo negócio, Ajustes (aparência, sobre, licenças) | criar/listar/excluir negócio persiste após matar o app                                                                                                |
| **2 · Produto grátis** | `quadros/` + FormularioGuiado + Lean + revisão; calculadora de equilíbrio; Hub-gratis; progresso                                                                      | um usuário sem pagar faz Lean + equilíbrio do começo ao fim                                                                                           |
| **3 · Desbloqueio**    | §6: correções do core vindas do Pendurô/Churrapp, paywall e estados, Restaurar compra                                                                                 | sandbox iOS + teste interno Play: compra, cancelamento, falha, pendente (Play "slow card"), restaurar após reinstalar, liberação sobrevive a reinício |
| **4 · Quadros pagos**  | BMC (com pré-preenchimento), SWOT, Persona (+ ilustração mulher/homem), revisões, Plano de ação + lembretes                                                           | negócio liberado chega a 100%                                                                                                                         |
| **5 · Análise**        | §7: motor + testes, tela Análise, prévia borrada no grátis, passo → tarefa                                                                                            | fixture Lanches da Vila bate todos os números do §7                                                                                                   |
| **6 · PDF**            | §8: spike de orientação, fontes base64, 9 páginas, gerando/pronto, compartilhar/abrir                                                                                 | PDF abre certo no iOS e no Android, com Poppins/Roboto visíveis, sem página estourada, com textos longos e com campos pulados                         |
| **7 · Polimento**      | modo escuro completo, en + es (`i18n:check`), acessibilidade (rótulos, Dynamic Type até 200% sem cortar CTA, contraste AA), iPad                                      | revisão tela a tela contra `design/`                                                                                                                  |
| **8 · Lançamento**     | `store/` (textos-loja.md, capturas no padrão de nomes do Pendurô), `site/` (index, privacidade, termos — copiar estrutura do Pendurô), builds de produção             | submissão nas duas lojas                                                                                                                              |

---

## 12. Decisões tomadas e riscos

**Decididas pelo Jorge (19/10):**

- **Desbloqueio único em vez de créditos.** Um não consumível de R$ 29,90 libera tudo
  em todos os negócios, como no Pendurô e no Churrapp. Substitui os créditos
  consumíveis (R$ 19,90 / 3 por R$ 39,90), que exigiriam registro, reconciliação e
  não voltariam ao reinstalar.
- **Backup dos negócios fica para a v1.1,** no formato versionado e validado de
  `penduro/features/backup/formato.ts`. A compra não entra no backup: ela volta pelo
  "Restaurar compra". Não entra no MVP; deixe o modelo de dados pronto para exportar.
- **"O que você vende?" e "Qual é o seu maior custo?"** entram na calculadora (§5).
- **Lean 8 e 9** usam os textos do §5.
- **Persona** usa ilustrações próprias de mulher e homem (§5).

**Riscos que continuam:**

1. **Revisão da App Store:** a descrição do produto tem que deixar claro o que a compra
   libera, e o "Restaurar compra" precisa estar visível. Deixe a captura do paywall
   pronta para a revisão (o Churrapp tem `appstore-revisao-paywall`).
2. **Licença CC BY-SA 3.0:** os nomes Lean Canvas e Business Model Canvas aparecem com
   atribuição. Não use os logos da Strategyzer.
3. **Preço exibido:** use o `priceString` da loja via RevenueCat. Nunca escreva
   "R$ 29,90" fixo no código; os valores do design são só referência.
4. **Pluralização** é heurística: "pão" vira "pões". Por isso o plural precisa ser
   editável (tocar em "No plural fica…").
5. **Fora do MVP:** sincronização, contas, IA em nuvem e compartilhar plano editável.

---

## 13. Futuro: IA no aparelho (opcional, depois do lançamento)

Esta camada **reescreve** as frases das regras com mais naturalidade. Ela **nunca
calcula números** e nunca é necessária para a análise existir.

- **iOS:** framework Foundation Models da Apple (iOS 26+, aparelhos com Apple
  Intelligence), via um módulo Expo nativo próprio.
- **Android:** Gemini Nano via ML Kit GenAI, em aparelhos compatíveis.
- **Regras do kit:**
  - probe de capacidade (invariante 5): "o modelo está disponível neste aparelho?";
  - o módulo nativo, se ele lança erro no import, fica em `LAZY_ONLY_MODULES` com um
    dono só (invariante 1);
  - fallback silencioso para as frases das regras.
- **Validação:** a saída passa por checagem (mesmos números e mesmos itens citados) e,
  se divergir, usa a frase da regra.
