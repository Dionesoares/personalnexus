import { generateId } from './fitpro-storage';

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
        ex('Agachamento Livre', 'Pernas', 3, '12-15', 90, 'Mantenha o joelho alinhado com o pé'),
        ex('Supino com Halteres', 'Peito', 3, '12-15', 60),
        ex('Remada Curvada com Halteres', 'Costas', 3, '12-15', 60),
        ex('Desenvolvimento com Halteres', 'Ombros', 3, '12-15', 60),
        ex('Rosca Direta com Halteres', 'Bíceps', 3, '12-15', 45),
        ex('Tríceps Testa com Halteres', 'Tríceps', 3, '12-15', 45),
        ex('Prancha Abdominal', 'Abdômen', 3, '20-30s', 45, 'Mantenha o corpo reto, não eleve o quadril'),
      ]),
      sessao('Treino B — Fullbody', 'Quarta-feira', [
        ex('Leg Press 45°', 'Pernas', 3, '12-15', 90),
        ex('Supino Inclinado com Halteres', 'Peito', 3, '12-15', 60),
        ex('Puxada Alta (Pulley)', 'Costas', 3, '12-15', 60),
        ex('Elevação Lateral com Halteres', 'Ombros', 3, '15', 45),
        ex('Rosca Martelo', 'Bíceps', 3, '12-15', 45),
        ex('Tríceps Corda no Cabo', 'Tríceps', 3, '12-15', 45),
        ex('Crunch Abdominal', 'Abdômen', 3, '15-20', 45),
      ]),
      sessao('Treino C — Fullbody', 'Sexta-feira', [
        ex('Avanço com Halteres', 'Pernas', 3, '12 cada', 60, 'Mantenha o tronco ereto'),
        ex('Crossover (Polia)', 'Peito', 3, '15', 60),
        ex('Serrote com Halter', 'Costas', 3, '12 cada', 60),
        ex('Elevação Frontal', 'Ombros', 3, '12-15', 45),
        ex('Rosca Concentrada', 'Bíceps', 3, '12 cada', 45),
        ex('Tríceps Coice com Halteres', 'Tríceps', 3, '12', 45),
        ex('Abdominal Bicicleta', 'Abdômen', 3, '20 cada', 45),
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
        ex('Supino Reto com Barra', 'Peito', 4, '8-12', 90, 'Progressão de carga a cada semana'),
        ex('Supino Inclinado com Halteres', 'Peito', 3, '10-12', 75),
        ex('Crossover (Polia Alta)', 'Peito', 3, '12-15', 60),
        ex('Desenvolvimento com Barra', 'Ombros', 4, '8-12', 90),
        ex('Elevação Lateral com Halteres', 'Ombros', 3, '12-15', 45),
        ex('Elevação Posterior (Voador Invertido)', 'Ombros', 3, '12-15', 45),
        ex('Tríceps Testa com Barra W', 'Tríceps', 3, '10-12', 75),
        ex('Tríceps Corda no Cabo', 'Tríceps', 3, '12-15', 60),
      ]),
      sessao('Pull A — Costas & Bíceps', 'Terça-feira', [
        ex('Barra Fixa (Pullup)', 'Costas', 4, 'máximo', 120, 'Se não conseguir, use assistência'),
        ex('Remada Curvada com Barra', 'Costas', 4, '8-12', 90),
        ex('Puxada Frontal (Pulley)', 'Costas', 3, '10-12', 75),
        ex('Remada Unilateral com Halter', 'Costas', 3, '10-12 cada', 75),
        ex('Rosca Direta com Barra', 'Bíceps', 3, '10-12', 75),
        ex('Rosca Martelo com Halteres', 'Bíceps', 3, '10-12', 60),
        ex('Rosca Concentrada', 'Bíceps', 2, '12-15 cada', 45),
      ]),
      sessao('Legs A — Quadríceps & Glúteos & Panturrilha', 'Quarta-feira', [
        ex('Agachamento Livre com Barra', 'Pernas', 4, '8-12', 120, 'Rei dos exercícios — mantenha postura'),
        ex('Leg Press 45°', 'Pernas', 3, '10-15', 90),
        ex('Extensão de Pernas (Cadeira)', 'Pernas', 3, '12-15', 60),
        ex('Avanço com Barra', 'Glúteos', 3, '10-12 cada', 75),
        ex('Elevação Pélvica (Hip Thrust)', 'Glúteos', 3, '10-15', 90),
        ex('Panturrilha em Pé (Smith)', 'Panturrilha', 4, '15-20', 45),
      ]),
      sessao('Push B — Peito & Ombros & Tríceps', 'Quinta-feira', [
        ex('Supino Declinado com Barra', 'Peito', 4, '8-12', 90),
        ex('Supino Inclinado com Barra', 'Peito', 3, '8-12', 90),
        ex('Peck Deck (Voador)', 'Peito', 3, '12-15', 60),
        ex('Desenvolvimento Arnold', 'Ombros', 4, '10-12', 75),
        ex('Elevação Lateral no Cabo', 'Ombros', 3, '15', 45),
        ex('Tríceps Francês com Halter', 'Tríceps', 3, '10-12', 75),
        ex('Mergulho em Paralelas', 'Tríceps', 3, '8-12', 90),
      ]),
      sessao('Pull B — Costas & Bíceps', 'Sexta-feira', [
        ex('Remada Cavalinho', 'Costas', 4, '8-12', 90),
        ex('Puxada Neutra (Pulley)', 'Costas', 3, '10-12', 75),
        ex('Pullover com Halter', 'Costas', 3, '12-15', 60),
        ex('Remada Alta com Barra', 'Ombros', 3, '12-15', 60),
        ex('Rosca Scott com Barra W', 'Bíceps', 3, '10-12', 75),
        ex('Rosca Direta com Halteres', 'Bíceps', 3, '10-12', 60),
      ]),
      sessao('Legs B — Posterior & Adutores', 'Sábado', [
        ex('Stiff com Barra', 'Pernas', 4, '10-12', 90, 'Sinta o alongamento no femoral'),
        ex('Mesa Flexora (Leg Curl)', 'Pernas', 3, '12-15', 60),
        ex('Agachamento Sumô com Halter', 'Glúteos', 3, '12-15', 75),
        ex('Abdutor (Cadeira)', 'Glúteos', 3, '15-20', 45),
        ex('Adutor (Cadeira)', 'Pernas', 3, '15-20', 45),
        ex('Panturrilha Sentado', 'Panturrilha', 4, '15-20', 45),
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
        ex('Supino Reto com Barra', 'Peito', 5, '3-5', 180, 'Foco em força máxima — cargas pesadas'),
        ex('Remada Curvada com Barra', 'Costas', 5, '3-5', 180),
        ex('Desenvolvimento Militar com Barra', 'Ombros', 4, '5-6', 120),
        ex('Barra Fixa com Peso', 'Costas', 4, '5-8', 120),
        ex('Tríceps Mergulho com Peso', 'Tríceps', 3, '6-8', 90),
        ex('Rosca Direta com Barra', 'Bíceps', 3, '6-8', 90),
        ex('Face Pull com Corda', 'Ombros', 3, '15', 45, 'Saúde do manguito rotador'),
      ]),
      sessao('Lower A — Força (Terça)', 'Terça-feira', [
        ex('Agachamento Livre com Barra', 'Pernas', 5, '3-5', 180, 'Agachamento completo — abaixo do paralelo'),
        ex('Levantamento Terra', 'Costas', 4, '3-5', 180, 'Rei do levantamento — forma impecável'),
        ex('Leg Press com Carga Alta', 'Pernas', 3, '8-10', 90),
        ex('Stiff com Barra', 'Pernas', 3, '8-10', 90),
        ex('Elevação Pélvica com Barra (Barbell Hip Thrust)', 'Glúteos', 4, '8-10', 90),
        ex('Panturrilha em Pé com Carga', 'Panturrilha', 5, '8-12', 60),
      ]),
      sessao('Upper B — Hipertrofia (Quinta)', 'Quinta-feira', [
        ex('Supino Inclinado com Halteres', 'Peito', 4, '8-12', 90, 'Técnica de pausa na fase excêntrica'),
        ex('Puxada Frontal com Supinação', 'Costas', 4, '8-12', 75),
        ex('Desenvolvimento Arnold com Halteres', 'Ombros', 4, '10-12', 75),
        ex('Remada Unilateral com Halter', 'Costas', 3, '10-12 cada', 75),
        ex('Crossover (Polia Alta → Baixa)', 'Peito', 3, '12-15', 60, 'Técnica drop-set na última série'),
        ex('Elevação Lateral com Halteres (drop-set)', 'Ombros', 4, '12-15+drop', 45, 'Última série: drop imediato para carga 50%'),
        ex('Superset: Rosca + Tríceps Corda', 'Bíceps', 3, '12+12', 60, 'Sem descanso entre os exercícios do superset'),
      ]),
      sessao('Lower B — Hipertrofia (Sexta)', 'Sexta-feira', [
        ex('Agachamento Búlgaro com Halteres', 'Pernas', 4, '10-12 cada', 75, 'Excelente para simetria e glúteo'),
        ex('Mesa Flexora (Leg Curl) — Unilateral', 'Pernas', 4, '10-12 cada', 60),
        ex('Hack Squat (45°)', 'Pernas', 3, '10-15', 90),
        ex('Avanço Caminhando com Barra', 'Glúteos', 3, '12 cada', 75),
        ex('Abdutor (Cabo ou Cadeira)', 'Glúteos', 3, '15-20', 45),
        ex('Extensão de Pernas + Flexão (Superset)', 'Pernas', 3, '15+15', 60, 'Superset de isolamento'),
        ex('Panturrilha Sentado (Soleus)', 'Panturrilha', 5, '15-20', 45),
      ]),
    ],
  },
};

export function aplicarTemplate(nivel, alunoId) {
  const template = TREINO_TEMPLATES[nivel];
  if (!template) return null;
  // Regenera IDs para evitar duplicatas
  return {
    ...template,
    alunoId,
    sessoes: template.sessoes.map(s => ({
      ...s,
      id: generateId(),
      exercicios: s.exercicios.map(e => ({ ...e, id: generateId() })),
    })),
  };
}