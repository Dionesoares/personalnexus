import React, { useState, useEffect } from 'react';
import { X, UserCheck, Send, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials } from '../../lib/fitpro-storage';
import { base44 } from '@/api/base44Client';

const BORDER = 'rgba(255,255,255,0.07)';

export default function SolicitarVinculoModal({ onClose }) {
  const { professores, alunos } = useApp();
  const { user } = useAuth();
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [resolvedAlunoId, setResolvedAlunoId] = useState('');
  const [alunoData, setAlunoData] = useState(null);

  useEffect(() => {
    getCredentials().then(creds => {
      const myCred = creds.find(c => c.id === user?.id);
      const alunoId = myCred?.linkedId || '';
      if (alunoId) { setResolvedAlunoId(alunoId); return; }
      const byEmail = alunos.find(a => a.email?.toLowerCase() === user?.email?.toLowerCase());
      setResolvedAlunoId(byEmail?.id || '');
    });
  }, [user?.id, alunos]);

  useEffect(() => {
    if (!resolvedAlunoId) return;
    const a = alunos.find(x => x.id === resolvedAlunoId);
    setAlunoData(a);
    base44.entities.SolicitacaoVinculo.filter({ alunoId: resolvedAlunoId })
      .then(list => setSolicitacoes(list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))));
  }, [resolvedAlunoId, alunos]);

  const profAtual = professores.find(p => p.id === alunoData?.professorId);

  const handleEnviar = async () => {
    if (!selectedProfessor) return;
    const prof = professores.find(p => p.id === selectedProfessor);
    setEnviando(true);
    await base44.entities.SolicitacaoVinculo.create({
      alunoId: resolvedAlunoId,
      alunoNome: alunoData?.nome || user?.nome || '',
      alunoEmail: alunoData?.email || user?.email || '',
      professorId: selectedProfessor,
      professorNome: prof?.nome || '',
      status: 'pendente',
      mensagem: mensagem.trim(),
    });
    const list = await base44.entities.SolicitacaoVinculo.filter({ alunoId: resolvedAlunoId });
    setSolicitacoes(list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setSelectedProfessor('');
    setMensagem('');
    setEnviando(false);
  };

  const statusConfig = {
    pendente:  { icon: Clock,         color: '#fbbf24', label: 'Aguardando' },
    aceito:    { icon: CheckCircle2,  color: '#34d399', label: 'Aceito' },
    recusado:  { icon: XCircle,       color: '#ef4444', label: 'Recusado' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1525', border: `1px solid ${BORDER}`, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: '#080d1a', borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#a78bfa20' }}>
              <UserCheck size={16} color="#a78bfa" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Solicitar Professor</h3>
              <p className="text-xs text-slate-500">Peça para um professor te aceitar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} color="#6b7280" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Professor atual */}
          {profAtual && (
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#34d39910', border: '1px solid #34d39930' }}>
              <CheckCircle2 size={16} color="#34d399" className="flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Seu professor atual</p>
                <p className="text-sm font-semibold text-white">{profAtual.nome}</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Escolher Professor</label>
            <select value={selectedProfessor} onChange={e => setSelectedProfessor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none mb-3"
              style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="">Selecionar professor...</option>
              {professores.map(p => (
                <option key={p.id} value={p.id}>{p.nome}{p.especialidade ? ` — ${p.especialidade}` : ''}</option>
              ))}
            </select>

            <label className="text-xs text-slate-400 block mb-1">Mensagem (opcional)</label>
            <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={2}
              placeholder="Ex: Quero começar a treinar com foco em emagrecimento..."
              className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none mb-3"
              style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />

            <button onClick={handleEnviar} disabled={!selectedProfessor || enviando || !resolvedAlunoId}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                background: (!selectedProfessor || !resolvedAlunoId)
                  ? '#1e2a3a'
                  : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                color: (!selectedProfessor || !resolvedAlunoId) ? '#475569' : '#fff',
                opacity: enviando ? 0.7 : 1,
              }}>
              <Send size={14} />
              {enviando ? 'Enviando...' : 'Enviar Solicitação'}
            </button>

            {!resolvedAlunoId && (
              <p className="text-xs text-amber-400 mt-2 text-center">
                ⚠️ Seu cadastro de aluno não foi encontrado. Peça ao admin para criar seu perfil.
              </p>
            )}
          </div>

          {/* Histórico de solicitações */}
          {solicitacoes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Histórico de Solicitações</h4>
              <div className="space-y-2">
                {solicitacoes.map(sol => {
                  const cfg = statusConfig[sol.status] || statusConfig.pendente;
                  const Icon = cfg.icon;
                  const prof = professores.find(p => p.id === sol.professorId);
                  return (
                    <div key={sol.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}25` }}>
                      <Icon size={16} color={cfg.color} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{prof?.nome || sol.professorNome}</p>
                        <p className="text-xs" style={{ color: cfg.color }}>{cfg.label}</p>
                      </div>
                      {sol.created_date && (
                        <p className="text-xs text-slate-600 flex-shrink-0">
                          {new Date(sol.created_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}