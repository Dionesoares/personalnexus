import { generateId } from './fitpro-storage';

// Cria exercício com nome exato da biblioteca (para match de gifUrl em runtime)
const ex = (nome, grupoMuscular, series, repeticoes, descanso = 60, observacoes = '') => ({
  id: generateId(), nome, grupoMuscular, series, repeticoes, carga: 0, descanso, tecnica: 'Normal', observacoes,
});

const sessao = (nome, dia, exercicios) => ({ id: generateId(), nome, dia, exercicios });

export const TREINO_TEMPLATES = {
  Iniciante: {
    nome: 'Treino Padrão Iniciante — Fullbody',
    objetivo: 'Condicionamento',
    nivel: 'Iniciante',
    duracaoSemanas: 4,
    descricao: 'Treino fullbody 3x/semana ideal para quem está começando. Foco em aprender os movimentos básicos com segurança.',
    sessoes: [
      sessao('Treino A — Fullbody', 'Segunda-feira', [
        ex('Agachamento (Padrão)', 'Quadríceps', 3, '15-20', 45, 'Joelhos na direção dos dedos'),
        ex('Levantamento Terra Romênio com Halteres', 'Isquiotibiais', 3, '10-12', 75, 'Sinta o estiramento no femoral'),
        ex('Ponte em Unilateral', 'Glúteos', 3, '15 por perna', 45, 'Contraia o glúteo no topo'),
        ex('Addução do Quadril Lateral com Alavanca', 'Adutores', 3, '15 por perna', 45),
        ex('Elevação de Panturrilha em Pé (Calistenia)', 'Panturrilha', 3, '20-30', 45),
        ex('Mesa Flexora Unilateral (Máquina)', 'Isquiotibiais', 3, '12 por perna', 60),
      ]),
      sessao('Treino B — Fullbody', 'Quarta-feira', [
        ex('Agachamento (Padrão)', 'Quadríceps', 3, '15-20', 45),
        ex('Elevação de Panturrilha em Uma Perna', 'Panturrilha', 3, '15 por perna', 45),
        ex('Adução do Quadril com Cabo', 'Adutores', 3, '15 por perna', 45),
        ex('Levantamento Terra com Kettlebell', 'Costas', 3, '10-12', 90, 'Coluna neutra durante todo o movimento'),
        ex('Ponte em Unilateral', 'Glúteos', 3, '15 por perna', 45),
        ex('Levantamento Terra Romênio com Halteres', 'Isquiotibiais', 3, '10-12', 75),
      ]),
      sessao('Treino C — Fullbody', 'Sexta-feira', [
        ex('Agachamento (Padrão)', 'Quadríceps', 3, '15-20', 45),
        ex('Addução do Quadril Lateral com Alavanca', 'Adutores', 3, '15 por perna', 45),
        ex('Elevação de Panturrilha em Pé (Calistenia)', 'Panturrilha', 4, '20-30', 45),
        ex('Levantamento Terra com Kettlebell', 'Costas', 3, '10-12', 90),
        ex('Mesa Flexora Unilateral (Máquina)', 'Isquiotibiais', 3, '12 por perna', 60),
        ex('Ponte em Unilateral', 'Glúteos', 3, '15 por perna', 45, 'Excelente para ativação de glúteos'),
      ]),
    ],
  },

  Intermediário: {
    nome: 'Treino Padrão Intermediário — Push/Pull/Legs',
    objetivo: 'Hipertrofia',
    nivel: 'Intermediário',
    duracaoSemanas: 8,
    descricao: 'Divisão Push/Pull/Legs 6x/semana. Foco em hipertrofia com sobrecarga progressiva.',
    sessoes: [
      sessao('Push A — Peito & Ombros & Tríceps', 'Segunda-feira', [
        ex('Agachamento Skater', 'Glúteos', 3, '10 por lado', 60, 'Ativa abdutores e glúteo médio'),
        ex('Peso Morto Romeno com Barra', 'Isquiotibiais', 4, '10-12', 90, 'Barra próxima ao corpo durante todo o movimento'),
        ex('Levantamento Terra com Barra no Landmine', 'Costas', 3, '10-12', 90),
        ex('Stiff Unilateral com Halteres', 'Isquiotibiais', 3, '10-12 por perna', 75),
        ex('Levantamento de Panturrilha com Apoio e Sobrecarga', 'Panturrilha', 4, '12-15 por perna', 45),
        ex('Bom Dia (Variação)', 'Lombares', 3, '10-12', 90, 'Fortalece lombares e posterior'),
      ]),
      sessao('Pull A — Costas & Bíceps', 'Terça-feira', [
        ex('Levantamento Terra com Barra no Landmine', 'Costas', 4, '10-12', 90),
        ex('Levantamento Terra Unilateral', 'Costas', 3, '8-10 por perna', 90, 'Detecta e corrige assimetrias'),
        ex('Stiff Unilateral com Halteres', 'Isquiotibiais', 3, '10-12 por perna', 75),
        ex('Agachamento Skater', 'Glúteos', 3, '10 por lado', 60),
        ex('Rosca no Cabo Deitado', 'Bíceps', 3, '10-12', 60, 'Maior ativação do bíceps com vetor alterado'),
        ex('Levantamento de Panturrilha com Apoio e Sobrecarga', 'Panturrilha', 3, '12-15 por perna', 45),
      ]),
      sessao('Legs A — Quadríceps & Glúteos & Panturrilha', 'Quarta-feira', [
        ex('Agachamento Skater', 'Glúteos', 4, '10 por lado', 60),
        ex('Peso Morto Romeno com Barra', 'Isquiotibiais', 4, '10-12', 90),
        ex('Afundo Profundo', 'Glúteos', 3, '10 por perna', 75, 'Maior amplitude ativa mais os glúteos'),
        ex('Levantamento Terra Unilateral', 'Costas', 3, '8-10 por perna', 90),
        ex('Levantamento de Panturrilha com Apoio e Sobrecarga', 'Panturrilha', 4, '12-15 por perna', 45),
        ex('Bom Dia (Variação)', 'Lombares', 3, '10-12', 90),
      ]),
      sessao('Push B — Peito & Ombros & Tríceps', 'Quinta-feira', [
        ex('Peso Morto Romeno com Barra', 'Isquiotibiais', 4, '10-12', 90),
        ex('Agachamento Skater', 'Glúteos', 3, '10 por lado', 60),
        ex('Levantamento Terra com Barra no Landmine', 'Costas', 3, '10-12', 90),
        ex('Afundo Profundo', 'Glúteos', 3, '10 por perna', 75),
        ex('Rosca no Cabo Deitado', 'Bíceps', 3, '10-12', 60),
        ex('Levantamento de Panturrilha com Apoio e Sobrecarga', 'Panturrilha', 3, '12-15 por perna', 45),
      ]),
      sessao('Pull B — Costas & Bíceps', 'Sexta-feira', [
        ex('Levantamento Terra Unilateral', 'Costas', 4, '8-10 por perna', 90),
        ex('Stiff Unilateral com Halteres', 'Isquiotibiais', 4, '10-12 por perna', 75),
        ex('Bom Dia (Variação)', 'Lombares', 3, '10-12', 90),
        ex('Agachamento Skater', 'Glúteos', 3, '10 por lado', 60),
        ex('Rosca no Cabo Deitado', 'Bíceps', 3, '10-12', 60),
        ex('Levantamento de Panturrilha com Apoio e Sobrecarga', 'Panturrilha', 3, '12-15 por perna', 45),
      ]),
      sessao('Legs B — Posterior & Adutores', 'Sábado', [
        ex('Peso Morto Romeno com Barra', 'Isquiotibiais', 4, '10-12', 90, 'Sinta o estiramento no femoral'),
        ex('Afundo Profundo', 'Glúteos', 3, '10 por perna', 75),
        ex('Levantamento Terra Unilateral', 'Costas', 3, '8-10 por perna', 90),
        ex('Stiff Unilateral com Halteres', 'Isquiotibiais', 3, '10-12 por perna', 75),
        ex('Levantamento de Panturrilha com Apoio e Sobrecarga', 'Panturrilha', 4, '12-15 por perna', 45),
        ex('Agachamento Skater', 'Glúteos', 3, '10 por lado', 60),
      ]),
    ],
  },

  Avançado: {
    nome: 'Treino Padrão Avançado — Upper/Lower Split',
    objetivo: 'Força',
    nivel: 'Avançado',
    duracaoSemanas: 12,
    descricao: 'Upper/Lower 4x/semana com periodização de força e hipertrofia. Volume e intensidade elevados com técnicas avançadas.',
    sessoes: [
      sessao('Upper A — Força (Segunda)', 'Segunda-feira', [
        ex('Agachamento Zercher', 'Quadríceps', 4, '6-10', 90, 'Ativa fortemente core e bíceps'),
        ex('Levantamento com Suporte', 'Costas', 4, '4-6', 180, 'Permite maior carga reduzindo amplitude'),
        ex('Stiff Unilateral com Barra', 'Isquiotibiais', 3, '8-10 por perna', 90),
        ex('Salto em Caixa com Uma Perna', 'Quadríceps', 3, '5-6 por perna', 90, 'Potência e equilíbrio unilateral'),
        ex('Pulo de Impulso de Quadril de Uma Perna', 'Glúteos', 3, '8-10 por perna', 60),
        ex('Swing 360', 'Core', 3, '5-8', 90, 'Alta habilidade coordenativa'),
      ]),
      sessao('Lower A — Força (Terça)', 'Terça-feira', [
        ex('Agachamento com Trava', 'Quadríceps', 4, '3-6', 180, 'Foco na porção de travamento — cargas máximas'),
        ex('Levantamento com Suporte', 'Costas', 4, '4-6', 180),
        ex('Stiff Unilateral com Barra', 'Isquiotibiais', 4, '8-10 por perna', 90),
        ex('Agachamento Hack Invertido', 'Glúteos', 3, '10-12', 90, 'Ativa fortemente glúteos com posição invertida'),
        ex('Salto em Caixa com Uma Perna', 'Quadríceps', 3, '5-6 por perna', 90),
        ex('Pulo de Impulso de Quadril de Uma Perna', 'Glúteos', 3, '8-10 por perna', 60),
      ]),
      sessao('Upper B — Hipertrofia (Quinta)', 'Quinta-feira', [
        ex('Agachamento Zercher', 'Quadríceps', 4, '8-10', 90),
        ex('Agachamento com Cinto', 'Quadríceps', 3, '10-15', 90, 'Elimina carga axial na coluna'),
        ex('Swing 360', 'Core', 3, '5-8', 90),
        ex('Stiff Unilateral com Barra', 'Isquiotibiais', 3, '8-10 por perna', 90),
        ex('Agachamento Hack Invertido', 'Glúteos', 3, '10-12', 90),
        ex('Levantamento com Suporte', 'Costas', 3, '4-6', 180),
      ]),
      sessao('Lower B — Hipertrofia (Sexta)', 'Sexta-feira', [
        ex('Agachamento com Trava', 'Quadríceps', 3, '3-6', 180),
        ex('Agachamento Hack Invertido', 'Glúteos', 4, '10-12', 90, 'Ativa glúteos intensamente'),
        ex('Stiff Unilateral com Barra', 'Isquiotibiais', 4, '8-10 por perna', 90),
        ex('Salto em Caixa com Uma Perna', 'Quadríceps', 3, '5-6 por perna', 90),
        ex('Pulo de Impulso de Quadril de Uma Perna', 'Glúteos', 3, '8-10 por perna', 60),
        ex('Agachamento com Cinto', 'Quadríceps', 3, '10-15', 90),
      ]),
    ],
  },
};

// Enriquece exercícios do template com dados da biblioteca (gifUrl, dicas, etc.)
function enriquecerComBiblioteca(exercicios, biblioteca) {
  return exercicios.map(e => {
    const match = biblioteca.find(b => b.nome?.toLowerCase() === e.nome?.toLowerCase());
    if (!match) return e;
    return {
      ...e,
      gifUrl: match.gifUrl || e.gifUrl,
      observacoes: e.observacoes || match.dicas || '',
    };
  });
}

export function aplicarTemplate(nivel, alunoId, biblioteca = []) {
  const template = TREINO_TEMPLATES[nivel];
  if (!template) return null;
  return {
    ...template,
    alunoId,
    sessoes: template.sessoes.map(s => ({
      ...s,
      id: generateId(),
      exercicios: enriquecerComBiblioteca(
        s.exercicios.map(e => ({ ...e, id: generateId() })),
        biblioteca
      ),
    })),
  };
}