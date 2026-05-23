import React, { useEffect, useState } from 'react';
import { X, MessageSquare, CheckCheck, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VerFeedbackModal({ aluno, onClose, onMarcarLido }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.FeedbackTreino.filter({ alunoId: aluno.id })
      .then(list => {
        const sorted = [...list].sort((a, b) => new Date(b.data) - new Date(a.data));
        setFeedbacks(sorted);
        // marca todos como lido
        list.filter(f => !f.lido).forEach(f => {
          base44.entities.FeedbackTreino.update(f.id, { lido: true });
        });
        if (list.some(f => !f.lido)) onMarcarLido?.();
      })
      .finally(() => setLoading(false));
  }, [aluno.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ background: '#080d1a', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#60a5fa20' }}>
              <MessageSquare size={16} color="#60a5fa" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Feedbacks de Treino</h3>
              <p className="text-xs text-slate-500">{aluno.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} color="#6b7280" /></button>
        </div>

        {/* Lista */}
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 420 }}>
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-sm">Carregando...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-20 text-slate-400" />
              <p className="text-slate-500 text-sm">Nenhum feedback enviado ainda</p>
            </div>
          ) : feedbacks.map(f => (
            <div key={f.id} className="p-4 rounded-xl"
              style={{ background: f.lido ? '#1e2a3a' : '#60a5fa0d', border: `1px solid ${f.lido ? 'rgba(255,255,255,0.06)' : '#60a5fa30'}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-300 truncate">{f.treinoNome}</span>
                <div className="flex items-center gap-1 flex-shrink-0 text-xs text-slate-500">
                  {f.lido
                    ? <CheckCheck size={12} color="#34d399" />
                    : <Clock size={12} color="#60a5fa" />}
                  <span>{new Date(f.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{f.mensagem}</p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#080d1a' }}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}