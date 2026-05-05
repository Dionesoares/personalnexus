import React from 'react';
import { motion } from 'framer-motion';
import { Download, Edit2, Copy, Trash2 } from 'lucide-react';
import { gerarPDFTreino } from '../../lib/fitpro-pdf';
import { generateId } from '../../lib/fitpro-storage';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const COLORS = ['#f472b6', '#a78bfa', '#34d399', '#60a5fa', '#fb923c', '#fbbf24'];

export default function TreinoCard({ treino, i, alunos, user, setSelectedTreino, setForm, setEditId, setShowForm, addPlanoTreino, deletePlanoTreino }) {
  const aluno = alunos.find(a => a.id === treino.alunoId);
  const totalExs = treino.sessoes?.reduce((a, s) => a + s.exercicios.length, 0) || 0;
  const color = COLORS[i % COLORS.length];

  return (
    <motion.div key={treino.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="p-5 rounded-2xl hover:opacity-90 transition-all"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black mb-3" style={{ background: `${color}20`, color }}>
        {String.fromCharCode(65 + i)}
      </div>
      <h3 className="font-bold text-white mb-1 truncate">{treino.nome}</h3>
      <p className="text-xs text-slate-500 mb-3">{aluno?.nome} • {treino.nivel}</p>
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{treino.sessoes?.length || 0} sessões</span>
        <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{treino.duracaoSemanas} sem</span>
        <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{totalExs} exerc</span>
        {treino.dataInicio && <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>▶ {new Date(treino.dataInicio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}
        {treino.dataFim && <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>⏹ {new Date(treino.dataFim + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setSelectedTreino(treino)} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          Ver Planilha
        </button>
        <button onClick={() => gerarPDFTreino(treino, aluno)}
          className="px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-all" title="Baixar PDF" style={{ color: '#34d399' }}>
          <Download size={14} />
        </button>
        {user?.role !== 'admin' && user?.role !== 'aluno' && (
          <>
            <button onClick={() => { setForm({ ...treino, sessoes: treino.sessoes || [] }); setEditId(treino.id); setShowForm(true); }}
              className="px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-all" style={{ color: '#fbbf24' }}>
              <Edit2 size={14} />
            </button>
            <button onClick={() => {
              const clone = { ...treino, id: undefined, nome: `${treino.nome} (cópia)`, sessoes: (treino.sessoes || []).map(s => ({ ...s, id: generateId(), exercicios: (s.exercicios || []).map(ex => ({ ...ex, id: generateId() })) })) };
              addPlanoTreino(clone);
            }} className="px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-all" title="Clonar" style={{ color: '#60a5fa' }}>
              <Copy size={14} />
            </button>
            <button onClick={() => { if (confirm('Excluir este treino?')) deletePlanoTreino(treino.id); }}
              className="px-3 py-2 rounded-xl text-xs hover:bg-red-500/10 transition-all" style={{ color: '#ef4444' }}>
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}