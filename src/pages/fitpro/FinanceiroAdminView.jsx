import React, { useState } from 'react';
import { DollarSign, Plus, X, TrendingUp, Clock, AlertCircle, CheckCircle2, UserCheck, Zap, Ban, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/FitProContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const STATUS_COLOR = { pago: '#34d399', pendente: '#fbbf24', vencido: '#ef4444', cancelado: '#64748b' };
const STATUS_LABEL = { pago: 'Pago', pendente: 'Pendente', vencido: 'Vencido', cancelado: 'Cancelado' };
const STATUS_ICON = { pago: CheckCircle2, pendente: Clock, vencido: AlertCircle, cancelado: X };

const PROF_STATUS_CONFIG = {
  pago:         { label: 'Em dia',       color: '#34d399', bg: '#34d39915', border: '#34d39930', icon: CheckCircle2 },
  pendente:     { label: 'Pendente',     color: '#fbbf24', bg: '#fbbf2415', border: '#fbbf2430', icon: Clock },
  vencido:      { label: 'Vencido',      color: '#ef4444', bg: '#ef444415', border: '#ef444430', icon: AlertCircle },
  sem_cobranca: { label: 'Sem cobrança', color: '#64748b', bg: '#64748b10', border: '#64748b25', icon: DollarSign },
};

function statusFinanceiroProfessor(profId, transacoes) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const mensalidades = transacoes.filter(t =>
    t.professorId === profId && t.tipo === 'Mensalidade' && t.categoria !== 'despesa'
  );
  if (mensalidades.length === 0) return 'sem_cobranca';
  const temVencida = mensalidades.some(t => {
    if (t.status === 'pago') return false;
    const venc = t.vencimento ? new Date(t.vencimento) : new Date(t.data);
    venc.setHours(0, 0, 0, 0);
    return venc < hoje;
  });
  if (temVencida) return 'vencido';
  if (mensalidades.some(t => t.status === 'pendente')) return 'pendente';
  return 'pago';
}

function emptyCobrancaProf(profId = '') {
  return {
    descricao: '',
    tipo: 'Mensalidade',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    vencimento: '',
    status: 'pendente',
    professorId: profId,
    alunoId: '',
    observacoes: '',
    categoria: 'receita',
  };
}

export default function FinanceiroAdminView() {
  const { transacoes, professores, addTransacao, updateTransacao, deleteTransacao } = useApp();

  // Apenas transações vinculadas a professores (plano do professor, não dos alunos)
  const transacoesProfessores = (transacoes || [])
    .filter(t => t.professorId && !t.alunoId)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const meses = [...new Set(transacoesProfessores.map(t => t.data?.slice(0, 7)))].filter(Boolean).sort().reverse();

  const [abaAtiva, setAbaAtiva] = useState('professores'); // 'professores' | 'transacoes'
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroProfStatus, setFiltroProfStatus] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCobrancaProf());
  const [saved, setSaved] = useState(false);
  const [confirmando, setConfirmando] = useState(null);

  const filtradas = transacoesProfessores.filter(t => {
    const matchStatus = filtroStatus === 'todos' || t.status === filtroStatus;
    const matchMes = !filtroMes || t.data?.startsWith(filtroMes);
    return matchStatus && matchMes;
  });

  const totalPago = transacoesProfessores.filter(t => t.status === 'pago').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0);
  const totalPendente = transacoesProfessores.filter(t => t.status === 'pendente').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0);
  const totalVencido = transacoesProfessores.filter(t => t.status === 'vencido').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0);
  const saldo = totalPago;

  const chartData = meses.slice(0, 6).reverse().map(mes => {
    const mt = transacoesProfessores.filter(t => t.data?.startsWith(mes));
    return {
      mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      recebido: mt.filter(t => t.status === 'pago').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0),
      pendente: mt.filter(t => t.status === 'pendente').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0),
    };
  });

  const professoresComStatus = professores.map(p => ({
    ...p,
    statusFinanceiro: statusFinanceiroProfessor(p.id, transacoesProfessores),
  }));

  const countsPorStatus = {
    pago: professoresComStatus.filter(p => p.statusFinanceiro === 'pago').length,
    pendente: professoresComStatus.filter(p => p.statusFinanceiro === 'pendente').length,
    vencido: professoresComStatus.filter(p => p.statusFinanceiro === 'vencido').length,
    sem_cobranca: professoresComStatus.filter(p => p.statusFinanceiro === 'sem_cobranca').length,
  };

  const professoresExibidos = filtroProfStatus === 'todos'
    ? professoresComStatus
    : professoresComStatus.filter(p => p.statusFinanceiro === filtroProfStatus);

  const getCobrancaPendenteProf = (profId) =>
    transacoesProfessores.find(t =>
      t.professorId === profId &&
      t.tipo === 'Mensalidade' &&
      (t.status === 'pendente' || t.status === 'vencido')
    );

  const gerarCobrancaProf = (prof) => {
    setForm({ ...emptyCobrancaProf(prof.id), descricao: `Mensalidade — ${prof.nome}` });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.valor) return alert('Preencha o valor');
    if (!form.descricao.trim()) return alert('Preencha a descrição');
    if (!form.professorId) return alert('Selecione um professor');
    addTransacao({ ...form, valor: parseFloat(form.valor) || 0 });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setForm(emptyCobrancaProf()); }, 1200);
  };

  const confirmarRecebido = async (id) => {
    setConfirmando(id);
    await updateTransacao(id, { status: 'pago' });
    setConfirmando(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign size={20} color="#00d4ff" />Financeiro — Planos de Professores
          </h2>
          <p className="text-xs text-slate-500">Gerencie cobranças dos planos de assinatura dos professores</p>
        </div>
        <button onClick={() => { setForm(emptyCobrancaProf()); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#00d4ff20', color: '#00d4ff', border: '1px solid #00d4ff30' }}>
          <Plus size={14} />Nova Cobrança
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Recebido', value: totalPago, color: '#34d399', icon: TrendingUp },
          { label: 'Pendente', value: totalPendente, color: '#fbbf24', icon: Clock },
          { label: 'Vencido', value: totalVencido, color: '#ef4444', icon: AlertCircle },
          { label: 'Professores', value: professores.length, color: '#00d4ff', icon: UserCheck, isCount: true },
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
                {k.isCount ? k.value : `R$ ${k.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      {chartData.length > 1 && (
        <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4">Receitas de Planos por Mês</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d1225', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                formatter={(val) => [`R$ ${val.toFixed(2)}`, '']} />
              <Bar dataKey="recebido" name="Recebido" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendente" name="Pendente" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {[
          { id: 'professores', label: `👨‍🏫 Controle de Professores${countsPorStatus.vencido > 0 ? ` (${countsPorStatus.vencido} vencido${countsPorStatus.vencido > 1 ? 's' : ''})` : ''}` },
          { id: 'transacoes', label: '💳 Transações' },
        ].map(a => (
          <button key={a.id} onClick={() => setAbaAtiva(a.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: abaAtiva === a.id ? (a.id === 'professores' && countsPorStatus.vencido > 0 ? '#ef444415' : '#00d4ff15') : 'transparent',
              color: abaAtiva === a.id ? (a.id === 'professores' && countsPorStatus.vencido > 0 ? '#ef4444' : '#00d4ff') : '#64748b',
            }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ABA PROFESSORES */}
      {abaAtiva === 'professores' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(PROF_STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button key={key} onClick={() => setFiltroProfStatus(filtroProfStatus === key ? 'todos' : key)}
                  className="p-3 rounded-2xl text-center transition-all"
                  style={{ background: filtroProfStatus === key ? cfg.bg : CARD, border: `1px solid ${filtroProfStatus === key ? cfg.border : BORDER}` }}>
                  <Icon size={18} className="mx-auto mb-1" style={{ color: cfg.color }} />
                  <div className="text-xl font-bold" style={{ color: cfg.color }}>{countsPorStatus[key]}</div>
                  <div className="text-xs text-slate-500">{cfg.label}</div>
                </button>
              );
            })}
          </div>

          {professoresExibidos.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <UserCheck size={36} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum professor nesta categoria</p>
            </div>
          ) : (
            <div className="space-y-2">
              {professoresExibidos.map(prof => {
                const cfg = PROF_STATUS_CONFIG[prof.statusFinanceiro];
                const Icon = cfg.icon;
                const ultimaCobranca = transacoesProfessores
                  .filter(t => t.professorId === prof.id)
                  .sort((a, b) => new Date(b.data) - new Date(a.data))[0];
                const cobrancaPendente = getCobrancaPendenteProf(prof.id);

                return (
                  <motion.div key={prof.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: CARD, border: `1px solid ${cfg.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: `${cfg.color}20` }}>
                      {prof.nome?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{prof.nome}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Icon size={11} style={{ color: cfg.color }} />
                        <span className="text-xs" style={{ color: cfg.color }}>{cfg.label}</span>
                        {ultimaCobranca && (
                          <span className="text-xs text-slate-500">
                            • R$ {parseFloat(ultimaCobranca.valor || 0).toFixed(0)}
                            {ultimaCobranca.vencimento && ` • venc. ${new Date(ultimaCobranca.vencimento).toLocaleDateString('pt-BR')}`}
                          </span>
                        )}
                        {prof.planoAssinatura && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#00d4ff15', color: '#00d4ff' }}>
                            {prof.planoAssinatura}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {cobrancaPendente && (
                        <button
                          onClick={() => confirmarRecebido(cobrancaPendente.id)}
                          disabled={confirmando === cobrancaPendente.id}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                          style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
                          <CheckCircle2 size={11} />
                          {confirmando === cobrancaPendente.id ? '...' : 'Recebido'}
                        </button>
                      )}
                      <button
                        onClick={() => gerarCobrancaProf(prof)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: '#00d4ff15', color: '#00d4ff', border: '1px solid #00d4ff25' }}>
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
            <div className="text-center py-16 text-slate-500">
              <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
              <p>Nenhuma cobrança de professor registrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtradas.map((t, i) => {
                const statusColor = STATUS_COLOR[t.status] || '#64748b';
                const StatusIcon = STATUS_ICON[t.status] || Clock;
                const prof = professores.find(p => p.id === t.professorId);
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
                        {prof?.nome || 'Professor'} • {new Date(t.data).toLocaleDateString('pt-BR')}
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
                          className="p-1.5 rounded-xl transition-all hover:opacity-90"
                          style={{ background: '#64748b15', color: '#94a3b8', border: '1px solid #64748b25' }}>
                          <Ban size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm('Excluir esta cobrança?')) deleteTransacao(t.id); }}
                        title="Excluir cobrança"
                        className="p-1.5 rounded-xl transition-all hover:opacity-90"
                        style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444425' }}>
                        <Trash2 size={13} />
                      </button>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: '#34d399' }}>
                          R$ {parseFloat(t.valor || 0).toFixed(2)}
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

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Nova Cobrança — Professor</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Professor</label>
                <select value={form.professorId} onChange={e => {
                  const p = professores.find(pr => pr.id === e.target.value);
                  setForm(f => ({ ...f, professorId: e.target.value, descricao: p ? `Mensalidade — ${p.nome}` : f.descricao }));
                }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">Selecionar professor</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Plano Profissional — João" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
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
                    {Object.entries({ pendente: 'Pendente', pago: 'Pago', vencido: 'Vencido' }).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Data</label>
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
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00d4ff, #0088cc)' }}>
              {saved ? '✓ Salvo!' : 'Salvar Cobrança'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}