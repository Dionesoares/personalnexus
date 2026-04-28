import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Dumbbell, Calendar, Plus, Share2, Copy, CheckCircle2, X, Link2, Settings } from 'lucide-react';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials } from '../../lib/fitpro-storage';
import ModalEditarPerfil from '../../components/fitpro/ModalEditarPerfil';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

export default function DashboardProfessor({ onNav }) {
  const { alunos, avaliacoes, planosTreino, periodizacoes } = useApp();
  const { user } = useAuth();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);

  const [professorId, setProfessorId_] = useState('');
  useEffect(() => {
    getCredentials().then(creds => {
      const myCred = creds.find(c => c.id === user?.id);
      setProfessorId_(myCred?.linkedId || '');
    });
  }, [user?.id]);

  const meusAlunos = professorId ? alunos.filter(a => a.professorId === professorId) : alunos;
  const minhasAvaliacoes = avaliacoes.filter(a => meusAlunos.some(al => al.id === a.alunoId));
  const meusTreinos = planosTreino.filter(t => meusAlunos.some(al => al.id === t.alunoId));
  const minhasPeriodizacoes = periodizacoes.filter(p => meusAlunos.some(al => al.id === p.alunoId));

  const baseUrl = window.location.origin;
  const linkCadastro = `${baseUrl}/fitpro/cadastro`;

  const copiar = (tipo) => {
    const texto = tipo === 'link' ? linkCadastro : `🏋️ FitPro - Cadastre-se como meu aluno!\n\nAcesse: ${linkCadastro}\n\nApós o cadastro, informe seu email para vinculação.`;
    navigator.clipboard.writeText(texto).then(() => { setCopied(tipo); setTimeout(() => setCopied(null), 2200); });
  };

  const stats = [
    { label: 'Alunos', value: meusAlunos.length, icon: '👥', color: '#c084fc', sub: 'cadastrados' },
    { label: 'Avaliações', value: minhasAvaliacoes.length, icon: '📊', color: '#fb923c', sub: 'realizadas' },
    { label: 'Treinos', value: meusTreinos.length, icon: '💪', color: '#f472b6', sub: 'criados' },
    { label: 'Periodizações', value: minhasPeriodizacoes.length, icon: '📅', color: '#facc15', sub: 'ativas' },
  ];

  const quickActions = [
    { label: 'Novo Aluno', emoji: '👤', color: '#c084fc', desc: 'Cadastrar aluno', view: 'alunos' },
    { label: 'Avaliação', emoji: '📊', color: '#fb923c', desc: 'Dobras cutâneas', view: 'avaliacao' },
    { label: 'Criar Treino', emoji: '💪', color: '#f472b6', desc: 'Plano de treino', view: 'treinos' },
    { label: 'Periodização', emoji: '📅', color: '#facc15', desc: 'Linha do tempo', view: 'periodizacao' },
    { label: 'Ver Alunos', emoji: '👥', color: '#38bdf8', desc: 'Todos os alunos', view: 'alunos' },
    { label: 'Parceiros', emoji: '🏥', color: '#4ade80', desc: 'Saúde & bem-estar', view: 'parceiros' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0d1525, #0a1628)', border: `1px solid ${BORDER}` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c084fc, transparent)' }} />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💪</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#34d39915', color: '#34d399', border: '1px solid #34d39925' }}>PROFESSOR ATIVO</span>
            </div>
            <h2 className="text-2xl font-black text-white">Olá, {user?.nome?.split(' ')[0]}! 🏆</h2>
            <p className="text-slate-400 text-sm mt-1">
              {meusAlunos.length > 0 ? `Você tem ${meusAlunos.length} aluno${meusAlunos.length > 1 ? 's' : ''} sob sua orientação` : 'Comece cadastrando seu primeiro aluno'}
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => setShowEditarPerfil(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
              <Settings size={14} />Meu Perfil
            </button>
            <button onClick={() => setShowLinkModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
              <Share2 size={14} />Convidar Aluno
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-6">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-lg">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <button key={i} onClick={() => onNav(action.view)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 cursor-pointer"
              style={{ background: `${action.color}08`, border: `1px solid ${action.color}20` }}>
              <span className="text-xl">{action.emoji}</span>
              <span className="text-xs font-semibold text-white">{action.label}</span>
              <span className="text-xs text-slate-500 text-center">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Avaliações Recentes */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Avaliações Recentes</h3>
            <button onClick={() => onNav('avaliacao')} className="text-xs text-slate-500">Ver todas →</button>
          </div>
          {minhasAvaliacoes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhuma avaliação realizada</div>
          ) : (
            <div className="space-y-3">
              {[...minhasAvaliacoes].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5).map((av, i) => {
                const aluno = meusAlunos.find(a => a.id === av.alunoId);
                return (
                  <div key={av.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: ['#a78bfa','#fb923c','#34d399'][i % 3] + '30' }}>
                      {aluno?.nome?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1"><div className="text-sm text-white">{aluno?.nome}</div><div className="text-xs text-slate-500">{new Date(av.data).toLocaleDateString('pt-BR')}</div></div>
                    <div className="text-right">
                      {av.percentualGordura !== undefined && <div className="text-xs font-bold" style={{ color: '#fb923c' }}>{av.percentualGordura?.toFixed(1)}% gord</div>}
                      {av.massaMagra !== undefined && <div className="text-xs text-slate-500">{av.massaMagra?.toFixed(1)}kg</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Meus Alunos */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Meus Alunos</h3>
            <button onClick={() => onNav('alunos')} className="text-xs text-slate-500">Ver todos →</button>
          </div>
          {meusAlunos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm mb-3">Nenhum aluno cadastrado ainda</p>
              <button onClick={() => setShowLinkModal(true)} className="text-xs px-3 py-1.5 rounded-xl" style={{ background: '#38bdf815', color: '#38bdf8', border: '1px solid #38bdf825' }}>
                Convidar alunos
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {meusAlunos.map((aluno, i) => {
                const avsAluno = avaliacoes.filter(a => a.alunoId === aluno.id);
                const treinosAluno = planosTreino.filter(t => t.alunoId === aluno.id);
                return (
                  <div key={aluno.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: ['#c084fc','#fb923c','#34d399'][i % 3] + '30' }}>
                      {aluno.nome.charAt(0)}
                    </div>
                    <div className="flex-1"><div className="text-sm text-white">{aluno.nome}</div><div className="text-xs text-slate-500">{aluno.objetivo}</div></div>
                    <div className="flex gap-1 text-xs">
                      <span style={{ color: '#fb923c' }}>{avsAluno.length} aval</span>
                      <span className="text-slate-600">•</span>
                      <span style={{ color: '#f472b6' }}>{treinosAluno.length} treino{treinosAluno.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showEditarPerfil && (
        <ModalEditarPerfil user={user} tipoUsuario="professor" onClose={() => setShowEditarPerfil(false)} />
      )}

      {/* Modal de link */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowLinkModal(false); }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-bold text-white">Link de Cadastro</h3><p className="text-xs text-slate-500">Convide alunos para a plataforma</p></div>
              <button onClick={() => setShowLinkModal(false)} className="p-2 rounded-xl hover:bg-white/5"><X size={16} color="#6b7280" /></button>
            </div>
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2">Link de cadastro</p>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xs text-slate-300 flex-1 truncate">{linkCadastro}</span>
                <button onClick={() => copiar('link')} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{ background: copied === 'link' ? '#4ade8020' : '#38bdf815', color: copied === 'link' ? '#4ade80' : '#38bdf8' }}>
                  {copied === 'link' ? <><CheckCircle2 size={12} />Copiado!</> : <><Copy size={12} />Copiar</>}
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl text-xs mb-4" style={{ background: '#38bdf808', border: '1px solid #38bdf820' }}>
              <p className="text-slate-400 mb-2">Enviar convite pelo WhatsApp</p>
              <p className="text-slate-300">{`🏋️ FitPro - Cadastre-se como meu aluno!\n\nAcesse: ${linkCadastro}`}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => copiar('whats')} className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {copied === 'whats' ? '✓ Copiado!' : 'Copiar texto'}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`🏋️ FitPro - Cadastre-se como meu aluno!\n\nAcesse: ${linkCadastro}`)}`} target="_blank" rel="noreferrer"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-center transition-all" style={{ background: '#25d36615', color: '#25d366', border: '1px solid #25d36625' }}>
                  Abrir WhatsApp
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-500 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              💡 Após o aluno se cadastrar, acesse <strong className="text-slate-300">Meus Alunos → Editar</strong> para vincular o perfil.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}