import React, { useState } from 'react';
import { X, MessageSquarePlus, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FeedbackTreinoModal({ treino, aluno, onClose }) {
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const handleSalvar = async () => {
    if (!mensagem.trim()) return;
    setSalvando(true);
    await base44.entities.FeedbackTreino.create({
      treinoId: treino.id,
      treinoNome: treino.nome,
      alunoId: aluno?.id || '',
      alunoNome: aluno?.nome || '',
      professorId: treino.professorId || '',
      mensagem: mensagem.trim(),
      lido: false,
      data: new Date().toISOString(),
    });
    setSalvando(false);
    setSalvo(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ background: '#080d1a', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#60a5fa20' }}>
              <MessageSquarePlus size={16} color="#60a5fa" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Feedback do Treino</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{treino.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} color="#6b7280" /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400">
            Deixe uma mensagem para seu professor sobre este treino — dificuldades, dores, observações ou sugestões.
          </p>
          <textarea
            autoFocus
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Ex: Senti dificuldade no exercício X, tive dor no ombro, gostei do treino..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none"
            style={{ background: '#1e2a3a', border: '1px solid #60a5fa30' }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#080d1a' }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancelar
          </button>
          <button onClick={handleSalvar}
            disabled={!mensagem.trim() || salvando || salvo}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{
              background: salvo
                ? 'linear-gradient(135deg, #34d399, #059669)'
                : mensagem.trim()
                  ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                  : '#374151',
              opacity: !mensagem.trim() ? 0.5 : 1,
            }}>
            {salvo ? '✓ Enviado!' : salvando ? '⏳...' : <><Send size={12} />Enviar Feedback</>}
          </button>
        </div>
      </div>
    </div>
  );
}