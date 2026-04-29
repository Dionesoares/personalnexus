import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, X, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2, Users, ChevronDown, ChevronUp, Zap, Ban, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials } from '../../lib/fitpro-storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const STATUS_COLOR = { pago: '#34d399', pendente: '#fbbf24', vencido: '#ef4444', cancelado: '#64748b' };
const STATUS_LABEL = { pago: 'Pago', pendente: 'Pendente', vencido: 'Vencido', cancelado: 'Cancelado' };
const STATUS_ICON = { pago: CheckCircle2, pendente: Clock, vencido: AlertCircle, cancelado: X };
const TIPOS = ['Mensalidade', 'Avaliação', 'Plano de Treino', 'Consulta Parceiro', 'Produto', 'Outro'];

function emptyTransacao(alunoId = '') {
  return {
    descricao: alunoId ? 'Mensalidade' : '',
    tipo: 'Mensalidade',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    vencimento: '',
    status: 'pendente',
    alunoId,
    observacoes: '',
    categoria: 'receita',
  };
}

// Dado um aluno, retorna o status financeiro baseado nas transações de mensalidade
function statusFinanceiroAluno(alunoId, transacoes) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const mensalidades = transacoes.filter(t =>
    t.alunoId === alunoId &&
    t.tipo === 'Mensalidade' &&
    t.categoria !== 'despesa'
  );

  if (mensalidades.length === 0) return 'sem_cobranca';

  // Verifica se há alguma vencida (data vencimento no passado e não paga)
  const temVencida = mensalidades.some(t => {
    if (t.status === 'pago') return false;
    const venc = t.vencimento ? new Date(t.vencimento) : new Date(t.data);
    venc.setHours(0, 0, 0, 0);
    return venc < hoje;
  });
  if (temVencida) return 'vencido';

  // Verifica se há pendente
  const temPendente = mensalidades.some(t => t.status === 'pendente');
  if (temPendente) return 'pendente';

  return 'pago';
}

const ALUNO_STATUS_CONFIG = {
  pago:         { label: 'Em dia',       color: '#34d399', bg: '#34d39915', border: '#34d39930', icon: CheckCircle2 },
  pendente:     { label: 'Pendente',     color: '#fbbf24', bg: '#fbbf2415', border: '#fbbf2430', icon: Clock },
  vencido:      { label: 'Vencido',      color: '#ef4444', bg: '#ef444415', border: '#ef444430', icon: AlertCircle },
  sem_cobranca: { label: 'Sem cobrança', color: '#64748b', bg: '#64748b10', border: '#64748b25', icon: DollarSign },
};

export default function FinanceiroView() {
  const { transacoes, alunos, addTransacao, updateTransacao, deleteTransacao } = useApp();
  const [confirmando, setConfirmando] = useState(null); // id da transação sendo confirmada
  const { user } = useAuth();

  const [professorId, setProfessorId] = useState('');
  useEffect(() => {
    getCredentials().then(creds => {
      const myCred = creds.find(c => c.id === user?.id);
      setProfessorId(myCred?.linkedId || '');
    });
  }, [user?.id]);

  const alunosFiltrados = user?.role === 'professor'
    ? alunos.filter(a => professorId && a.professorId === professorId)
    : alunos;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTransacao());
  const [saved, setSaved] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('transacoes'); // 'transacoes' | 'alunos'
  const [filtroAlunosStatus, setFiltroAlunosStatus] = useState('todos');

  // Excluir cobranças do admin para o professor (t.professorId sem t.alunoId = cobrança de plano do admin)
  const todasTransacoes = (transacoes || [])
    .filter(t => !(t.professorId && !t.alunoId))
    .sort((a, b) => new Date(b.data) - new Date(a.data));
  const meses = [...new Set(todasTransacoes.map(t => t.data?.slice(0, 7)))].filter(Boolean).sort().reverse();

  const filtradas = todasTransacoes.filter(t => {
    const matchStatus = filtroStatus === 'todos' || t.status === filtroStatus;
    const matchMes = !filtroMes || t.data?.startsWith(filtroMes);
    return matchStatus && matchMes;
  });

  const receitas = filtradas.filter(t => t.categoria === 'receita' || !t.categoria);
  const despesas = filtradas.filter(t => t.categoria === 'despesa');
  const totalReceitas = receitas.reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);
  const totalDespesas = despesas.reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);
  const saldo = totalReceitas - totalDespesas;

  const totalPago = filtradas.filter(t => t.status === 'pago').reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);
  const totalPendente = filtradas.filter(t => t.status === 'pendente').reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);
  const totalVencido = filtradas.filter(t => t.status === 'vencido').reduce((acc, t) => acc + (parseFloat(t.valor) || 0), 0);

  const chartData = meses.slice(0, 6).reverse().map(mes => {
    const mesTransacoes = todasTransacoes.filter(t => t.data?.startsWith(mes));
    return {
      mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receitas: mesTransacoes.filter(t => t.status === 'pago' && (t.categoria === 'receita' || !t.categoria)).reduce((a, t) => a + (parseFloat(t.valor) || 0), 0),
      pendente: mesTransacoes.filter(t => t.status === 'pendente').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0),
    };
  });

  // Status de cada aluno
  const alunosComStatus = alunosFiltrados.map(a => ({
    ...a,
    statusFinanceiro: statusFinanceiroAluno(a.id, todasTransacoes),
  }));

  const alunosExibidos = filtroAlunosStatus === 'todos'
    ? alunosComStatus
    : alunosComStatus.filter(a => a.statusFinanceiro === filtroAlunosStatus);

  const countsPorStatus = {
    pago: alunosComStatus.filter(a => a.statusFinanceiro === 'pago').length,
    pendente: alunosComStatus.filter(a => a.statusFinanceiro === 'pendente').length,
    vencido: alunosComStatus.filter(a => a.statusFinanceiro === 'vencido').length,
    sem_cobranca: alunosComStatus.filter(a => a.statusFinanceiro === 'sem_cobranca').length,
  };

  const handleSave = () => {
    if (!form.valor) return alert('Preencha o valor');
    if (!form.descricao.trim()) return alert('Preencha a descrição');
    addTransacao({ ...form, valor: parseFloat(form.valor) || 0 });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setForm(emptyTransacao()); }, 1200);
  };

  const gerarCobranca = (aluno) => {
    setForm({ ...emptyTransacao(aluno.id), descricao: `Mensalidade — ${aluno.nome}` });
    setShowForm(true);
  };

  const confirmarRecebido = async (transacaoId) => {
    setConfirmando(transacaoId);
    await updateTransacao(transacaoId, { status: 'pago' });
    setConfirmando(null);
  };

  // Retorna a mensalidade pendente/vencida mais recente de um aluno
  const getMensalidadePendenteAluno = (alunoId) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return todasTransacoes.find(t =>
      t.alunoId === alunoId &&
      t.tipo === 'Mensalidade' &&
      t.categoria !== 'despesa' &&
      (t.status === 'pendente' || t.status === 'vencido')
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><DollarSign size={20} color="#34d399" />Financeiro</h2>
          <p className="text-xs text-slate-500">{filtradas.length} transação(ões)</p>
        </div>
        <button onClick={() => { setForm(emptyTransacao()); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
          <Plus size={14} />Nova Transação
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Saldo', value: saldo, color: saldo >= 0 ? '#34d399' : '#ef4444', icon: DollarSign },
          { label: 'Recebido', value: totalPago, color: '#34d399', icon: TrendingUp },
          { label: 'Pendente', value: totalPendente, color: '#fbbf24', icon: Clock },
          { label: 'Vencido', value: totalVencido, color: '#ef4444', icon: AlertCircle },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="p-4 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{k.label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}20` }}>
                  <Icon size={14} style={{ color: k.color }} />
                </div>
              </div>
              <div className="text-lg font-bold" style={{ color: k.color }}>
                R$ {k.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      {chartData.length > 1 && (
        <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4">Receitas por Mês</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d1225', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                formatter={(val) => [`R$ ${val.toFixed(2)}`, '']} />
              <Bar dataKey="receitas" name="Recebido" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendente" name="Pendente" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Abas: Transações | Alunos */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {[
          { id: 'transacoes', label: '💳 Transações' },
          { id: 'alunos', label: `👥 Controle de Alunos ${countsPorStatus.vencido > 0 ? `(${countsPorStatus.vencido} vencido${countsPorStatus.vencido > 1 ? 's' : ''})` : ''}` },
        ].map(a => (
          <button key={a.id} onClick={() => setAbaAtiva(a.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: abaAtiva === a.id ? (a.id === 'alunos' && countsPorStatus.vencido > 0 ? '#ef444415' : '#34d39915') : 'transparent',
              color: abaAtiva === a.id ? (a.id === 'alunos' && countsPorStatus.vencido > 0 ? '#ef4444' : '#34d399') : '#64748b',
            }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ABA TRANSAÇÕES */}
      {abaAtiva === 'transacoes' && (
        <>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {['todos', 'pago', 'pendente', 'vencido'].map(s => {
                const color = s === 'todos' ? '#64748b' : STATUS_COLOR[s];
                return (
                  <button key={s} onClick={() => setFiltroStatus(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{ background: filtroStatus === s ? `${color}20` : 'rgba(255,255,255,0.03)', color: filtroStatus === s ? color : '#64748b', border: filtroStatus === s ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)' }}>
                    {s === 'todos' ? 'Todos' : STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
            {meses.length > 0 && (
              <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs text-white outline-none"
                style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="">Todos os meses</option>
                {meses.map(m => <option key={m} value={m}>{new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>)}
              </select>
            )}
          </div>

          {filtradas.length === 0 ? (
            <div className="text-center py-16 text-slate-500"><DollarSign size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhuma transação registrada</p></div>
          ) : (
            <div className="space-y-2">
              {filtradas.map((t, i) => {
                const statusColor = STATUS_COLOR[t.status] || '#64748b';
                const StatusIcon = STATUS_ICON[t.status] || Clock;
                const aluno = alunos.find(a => a.id === t.alunoId);
                return (
                  <motion.div key={t.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor}20` }}>
                      <StatusIcon size={16} style={{ color: statusColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{t.descricao}</div>
                      <div className="text-xs text-slate-500">
                        {t.tipo}{aluno ? ` • ${aluno.nome}` : ''} • {new Date(t.data).toLocaleDateString('pt-BR')}
                        {t.vencimento && ` • venc. ${new Date(t.vencimento).toLocaleDateString('pt-BR')}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(t.status === 'pendente' || t.status === 'vencido') && (
                        <button
                          onClick={() => confirmarRecebido(t.id)}
                          disabled={confirmando === t.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
                          <CheckCircle2 size={11} />
                          {confirmando === t.id ? '...' : 'Recebido'}
                        </button>
                      )}
                      {t.status !== 'cancelado' && (
                        <button
                          onClick={() => updateTransacao(t.id, { status: 'cancelado' })}
                          title="Cancelar cobrança"
                          className="p-1.5 rounded-xl text-xs transition-all hover:opacity-90"
                          style={{ background: '#64748b15', color: '#94a3b8', border: '1px solid #64748b25' }}>
                          <Ban size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm('Excluir esta transação?')) deleteTransacao(t.id); }}
                        title="Excluir cobrança"
                        className="p-1.5 rounded-xl text-xs transition-all hover:opacity-90"
                        style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444425' }}>
                        <Trash2 size={13} />
                      </button>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: t.categoria === 'despesa' ? '#ef4444' : '#34d399' }}>
                          {t.categoria === 'despesa' ? '-' : '+'}R$ {parseFloat(t.valor || 0).toFixed(2)}
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor}15`, color: statusColor }}>
                          {STATUS_LABEL[t.status] || t.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ABA ALUNOS */}
      {abaAtiva === 'alunos' && (
        <div className="space-y-4">
          {/* Resumo por status */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(ALUNO_STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button key={key} onClick={() => setFiltroAlunosStatus(filtroAlunosStatus === key ? 'todos' : key)}
                  className="p-3 rounded-2xl text-center transition-all"
                  style={{ background: filtroAlunosStatus === key ? cfg.bg : CARD, border: `1px solid ${filtroAlunosStatus === key ? cfg.border : BORDER}` }}>
                  <Icon size={18} className="mx-auto mb-1" style={{ color: cfg.color }} />
                  <div className="text-xl font-bold" style={{ color: cfg.color }}>{countsPorStatus[key]}</div>
                  <div className="text-xs text-slate-500">{cfg.label}</div>
                </button>
              );
            })}
          </div>

          {/* Lista de alunos */}
          {alunosExibidos.length === 0 ? (
            <div className="text-center py-12 text-slate-500"><Users size={36} className="mx-auto mb-3 opacity-30" /><p>Nenhum aluno nesta categoria</p></div>
          ) : (
            <div className="space-y-2">
              {alunosExibidos.map(aluno => {
                const cfg = ALUNO_STATUS_CONFIG[aluno.statusFinanceiro];
                const Icon = cfg.icon;
                // Última mensalidade do aluno
                const ultimaMensalidade = todasTransacoes
                  .filter(t => t.alunoId === aluno.id && t.tipo === 'Mensalidade' && t.categoria !== 'despesa')
                  .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

                return (
                  <motion.div key={aluno.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: CARD, border: `1px solid ${cfg.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: `${cfg.color}20` }}>
                      {aluno.nome?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{aluno.nome}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon size={11} style={{ color: cfg.color }} />
                        <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                        {ultimaMensalidade && (
                          <span className="text-xs text-slate-500">
                            • R$ {parseFloat(ultimaMensalidade.valor || 0).toFixed(0)}
                            {ultimaMensalidade.vencimento && ` • venc. ${new Date(ultimaMensalidade.vencimento).toLocaleDateString('pt-BR')}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {(aluno.statusFinanceiro === 'pendente' || aluno.statusFinanceiro === 'vencido') && (() => {
                        const mens = getMensalidadePendenteAluno(aluno.id);
                        return mens ? (
                          <button
                            onClick={() => confirmarRecebido(mens.id)}
                            disabled={confirmando === mens.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
                            <CheckCircle2 size={11} />
                            {confirmando === mens.id ? '...' : 'Recebido'}
                          </button>
                        ) : null;
                      })()}
                      <button
                        onClick={() => gerarCobranca(aluno)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: '#64748b15', color: '#94a3b8', border: '1px solid #64748b25' }}>
                        <Zap size={11} />Cobrar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Nova Transação</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Categoria</label>
                <div className="flex gap-2">
                  {['receita', 'despesa'].map(cat => (
                    <button key={cat} onClick={() => setForm(f => ({ ...f, categoria: cat }))}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: form.categoria === cat ? (cat === 'receita' ? '#34d39920' : '#ef444420') : 'rgba(255,255,255,0.04)', color: form.categoria === cat ? (cat === 'receita' ? '#34d399' : '#ef4444') : '#64748b', border: form.categoria === cat ? `1px solid ${cat === 'receita' ? '#34d39930' : '#ef444430'}` : '1px solid rgba(255,255,255,0.06)' }}>
                      {cat === 'receita' ? '↑ Receita' : '↓ Despesa'}
                    </button>
                  ))}
                </div>
              </div>

              {alunosFiltrados.length > 0 && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Aluno</label>
                  <select value={form.alunoId} onChange={e => {
                    const a = alunos.find(al => al.id === e.target.value);
                    setForm(f => ({
                      ...f,
                      alunoId: e.target.value,
                      descricao: e.target.value && f.tipo === 'Mensalidade' ? `Mensalidade — ${a?.nome || ''}` : f.descricao,
                    }));
                  }}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <option value="">Nenhum aluno</option>
                    {alunosFiltrados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                <select value={form.tipo} onChange={e => {
                  const tipo = e.target.value;
                  const a = alunos.find(al => al.id === form.alunoId);
                  setForm(f => ({
                    ...f,
                    tipo,
                    descricao: tipo === 'Mensalidade' && a ? `Mensalidade — ${a.nome}` : f.descricao,
                  }));
                }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Mensalidade João" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
                  <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Data da cobrança</label>
                  <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Vencimento</label>
                  <input type="date" value={form.vencimento} onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #34d399, #059669)' }}>
              {saved ? '✓ Salvo!' : 'Salvar Transação'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}