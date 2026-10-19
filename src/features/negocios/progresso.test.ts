// Runs with `npm test` (node --test). The percentage is on every card and on
// the hub; it has to move exactly when the person does something.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  NUMEROS_VAZIOS,
  type Quadro,
  type Resposta,
  type RespostasPorQuadro,
  type SwotItem,
  type Tarefa,
} from '../../data/types';
import { QUADROS } from '../quadros/definicoes';
import { calcularProgresso, proximaParte, TOTAL_PROGRESSO } from './progresso';

function respostas(preenchidas: Partial<Record<Quadro, number>>): RespostasPorQuadro {
  const resultado: RespostasPorQuadro = { lean: {}, bmc: {}, persona: {} };
  for (const quadro of ['lean', 'bmc', 'persona'] as const) {
    const n = preenchidas[quadro] ?? 0;
    for (const campo of QUADROS[quadro].campos.slice(0, n)) {
      resultado[quadro][campo] = resposta(quadro, campo, 'algo');
    }
  }
  return resultado;
}

function resposta(quadro: Quadro, campo: string, texto: string, pulada = false): Resposta {
  return { quadro, campo, texto, pulada, atualizadoEm: 0 };
}

const swotCompleto: SwotItem[] = (['forcas', 'fraquezas', 'oportunidades', 'ameacas'] as const).map(
  (parte, ordem) => ({ id: parte, parte, texto: 'x', ordem }),
);

const tarefa: Tarefa = {
  id: 't',
  negocioId: 'n',
  nome: 'Cotar fornecedor',
  data: null,
  lembrete: false,
  notificacaoId: null,
  feita: false,
  origemRegra: null,
  ordem: 0,
  criadoEm: 0,
};

const numerosOk = { ...NUMEROS_VAZIOS, fixos: 624_000, custoUnitario: 1_200, preco: 3_200 };

test('o total é 30, como no §4', () => {
  assert.equal(TOTAL_PROGRESSO, 30);
});

test('vazio: 0% e "por onde começar"', () => {
  const p = calcularProgresso({
    respostas: respostas({}),
    swot: [],
    numeros: NUMEROS_VAZIOS,
    tarefas: [],
  });
  assert.equal(p.percentual, 0);
  assert.equal(p.vazio, true);
  assert.equal(proximaParte(p), 'lean');
});

test('tudo preenchido: 100% e nada a seguir', () => {
  const p = calcularProgresso({
    respostas: respostas({ lean: 9, bmc: 9, persona: 6 }),
    swot: swotCompleto,
    numeros: numerosOk,
    tarefas: [tarefa],
  });
  assert.equal(p.percentual, 100);
  assert.equal(proximaParte(p), null);
});

test('grátis completo (Lean 9 + equilíbrio) = 10 de 30', () => {
  const p = calcularProgresso({
    respostas: respostas({ lean: 9 }),
    swot: [],
    numeros: numerosOk,
    tarefas: [],
  });
  assert.equal(p.percentual, 33);
  assert.equal(proximaParte(p), 'bmc');
});

test('pulada e ilustração não contam', () => {
  const r = respostas({ persona: 2 });
  r.lean.problema = resposta('lean', 'problema', '', true);
  r.lean.paraQuem = resposta('lean', 'paraQuem', 'texto antigo', true);
  r.persona.ilustracao = resposta('persona', 'ilustracao', 'homem');
  const p = calcularProgresso({ respostas: r, swot: [], numeros: NUMEROS_VAZIOS, tarefas: [] });
  assert.equal(p.lean.feitos, 0);
  assert.equal(p.persona.feitos, 2);
});

test('equilíbrio só conta com os 3 números válidos (preço acima do custo)', () => {
  const naoFecha = { ...numerosOk, preco: 1_200 };
  const p = calcularProgresso({
    respostas: respostas({}),
    swot: [],
    numeros: naoFecha,
    tarefas: [],
  });
  assert.equal(p.equilibrio, false);
});

test('SWOT conta partes com ao menos 1 item, não itens', () => {
  const p = calcularProgresso({
    respostas: respostas({}),
    swot: [
      { id: 'a', parte: 'forcas', texto: 'a', ordem: 0 },
      { id: 'b', parte: 'forcas', texto: 'b', ordem: 1 },
    ],
    numeros: NUMEROS_VAZIOS,
    tarefas: [],
  });
  assert.deepEqual(p.swot, { feitos: 1, total: 4 });
});
