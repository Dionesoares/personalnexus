import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Dumbbell, Calendar, Plus, Share2, Copy, CheckCircle2, X, Settings, AlertCircle, Clock, QrCode } from 'lucide-react';

const PIX_DADOS_KEY = 'fitpro_admin_pix_dados';

function gerarPayloadPix(chave, nome, cidade, valor = null) {
  const nomeClean = nome.substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const cidadeClean = cidade.substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const merchantAccountInfo = `0014BR.GOV.BCB.PIX01${String(chave.length).padStart(2,'0')}${chave}`;
  const mai = `26${String(merchantAccountInfo.length).padStart(2,'0')}${merchantAccountInfo}`;
  const currency = '5303986';
  const valorStr = valor ? `54${String(Number(valor).toFixed(2).length).padStart(2,'0')}${Number(valor).toFixed(2)}` : '';
  const country = '5802BR';
  const nomeField = `59${String(nomeClean.length).padStart(2,'0')}${nomeClean}`;
  const cidadeField = `60${String(cidadeClean.length).padStart(2,'0')}${cidadeClean}`;
  const txid = '62070503***';
  const payload = `000201${mai}52040000${currency}${valorStr}${country}${nomeField}${cidadeField}${txid}6304`;
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) { crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1; }
  }
  return payload + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials } from '../../lib/fitpro-storage';
import ModalEditarPerfil from '../../components/fitpro/ModalEditarPerfil';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

export default function DashboardProfessor({ onNav }) {
  const { alunos, avaliacoes, planosTreino, periodizacoes, transacoes } = useApp();
  const { user } = useAuth();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showEditarPerfil, setShowEditarPerfil] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixDados] = useState(() => { try { return JSON.parse(localStorage.getItem(PIX_DADOS_KEY)) || {}; } catch { return {}; } });

  const [professorId, setProfessorId_] = useState('');
  useEffect(() => {
    getCredentials().then(creds => {
      const myCred = creds.find(c => c.id === user?.id);
      setProfessorId_(myCred?.linkedId || '');
    });
  }, [user?.id]);

  const meusAlunos = professorId ? alunos.filter(a => a.professorId === professorId) : alunos;

  // Cobranças do admin para este professor
  // Regra: só exibe se houver data de vencimento E ela já chegou (hoje ou passou). Sem vencimento = não exibe.
  // Status "pago" = em dia = não exibe alerta.
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const cobrancasAdmin = (transacoes || []).filter(t => {
    if (t.professorId !== professorId || t.alunoId) return false;
    if (t.status === 'pago' || t.status === 'cancelado') return false;
    // Só exibe se tiver vencimento definido e a data já chegou
    if (!t.vencimento) return false;
    const venc = new Date(t.vencimento); venc.setHours(0,0,0,0);
    return venc <= hoje;
  });
  const cobrancaVencida = cobrancasAdmin.some(t => {
    const venc = new Date(t.vencimento); venc.setHours(0,0,0,0);
    return venc < hoje;
  });
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

      {/* Notificação de cobrança do admin */}
      {cobrancasAdmin.length > 0 && (
        <div className="p-4 rounded-2xl"
          style={{ background: cobrancaVencida ? '#ef444412' : '#fbbf2412', border: `1px solid ${cobrancaVencida ? '#ef444440' : '#fbbf2440'}` }}>
          <div className="flex items-start gap-3">
            {cobrancaVencida ? <AlertCircle size={18} color="#ef4444" className="flex-shrink-0 mt-0.5" /> : <Clock size={18} color="#fbbf24" className="flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: cobrancaVencida ? '#ef4444' : '#fbbf24' }}>
                {cobrancaVencida ? '⚠️ Cobrança Vencida' : '💰 Cobrança Pendente'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {cobrancasAdmin.length === 1
                  ? `${cobrancasAdmin[0].descricao} — R$ ${parseFloat(cobrancasAdmin[0].valor || 0).toFixed(2)}`
                  : `Você possui ${cobrancasAdmin.length} cobranças de plano pendentes/vencidas.`}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPixModal(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: cobrancaVencida ? '#ef444420' : '#fbbf2420', color: cobrancaVencida ? '#ef4444' : '#fbbf24', border: `1px solid ${cobrancaVencida ? '#ef444440' : '#fbbf2440'}` }}>
            <QrCode size={15} />Pagar agora via PIX
          </button>
        </div>
      )}

      {/* Modal PIX */}
      {showPixModal && (() => {
        const valorTotal = cobrancasAdmin.reduce((acc, t) => acc + parseFloat(t.valor || 0), 0);
        const pixOk = pixDados?.chave && pixDados?.nome && pixDados?.cidade;
        const payload = pixOk ? gerarPayloadPix(pixDados.chave, pixDados.nome, pixDados.cidade, valorTotal) : null;
        const qrUrl = payload ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}` : null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowPixModal(false); }}>
            <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Pagamento via PIX</h3>
                  <p className="text-xs text-slate-500">Escaneie o QR Code para pagar</p>
                </div>
                <button onClick={() => setShowPixModal(false)} className="p-2 rounded-xl hover:bg-white/5"><X size={16} color="#6b7280" /></button>
              </div>

              {/* Resumo da cobrança */}
              <div className="mb-4 p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {cobrancasAdmin.length === 1 ? (
                  <>
                    <div className="text-xs text-slate-400">{cobrancasAdmin[0].descricao}</div>
                    {cobrancasAdmin[0].vencimento && <div className="text-xs text-slate-500">Venc. {new Date(cobrancasAdmin[0].vencimento).toLocaleDateString('pt-BR')}</div>}
                  </>
                ) : (
                  <div className="text-xs text-slate-400">{cobrancasAdmin.length} cobranças pendentes/vencidas</div>
                )}
                <div className="text-2xl font-black text-white mt-1">R$ {valorTotal.toFixed(2)}</div>
              </div>

              {qrUrl ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-2xl" style={{ background: 'white' }}>
                      <img src={qrUrl} alt="QR Code PIX" className="w-52 h-52 object-contain" />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-sm font-bold text-white">{pixDados.nome}</div>
                    <div className="text-xs text-slate-400">{pixDados.banco && `${pixDados.banco} · `}{pixDados.tipochave?.toUpperCase()}: {pixDados.chave}</div>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(payload); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: pixCopied ? '#34d39920' : '#1e2a3a', color: pixCopied ? '#34d399' : '#94a3b8', border: `1px solid ${pixCopied ? '#34d39930' : 'rgba(255,255,255,0.08)'}` }}>
                    <Copy size={14} />{pixCopied ? '✓ Código Copiado!' : 'Copiar código PIX (copia e cola)'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <QrCode size={48} className="opacity-20 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-500 text-center">PIX não configurado pelo administrador.</p>
                </div>
              )}
              <p className="text-xs text-center text-slate-500 mt-4">Após o pagamento, aguarde a confirmação do administrador.</p>
            </div>
          </div>
        );
      })()}

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