import React, { useState } from 'react';
import { DollarSign, Plus, X, TrendingUp, TrendingDown, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials, generateId } from '../../lib/fitpro-storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const STATUS_COLOR = { pago: '#34d399', pendente: '#fbbf24', vencido: '#ef4444', cancelado: '#64748b' };
const STATUS_LABEL = { pago: 'Pago', pendente: 'Pendente', vencido: 'Vencido', cancelado: 'Cancelado' };
const STATUS_ICON = { pago: CheckCircle2, pendente: Clock, vencido: AlertCircle, cancelado: X };
const TIPOS = ['Mensalidade', 'Avaliação', 'Plano de Treino', 'Consulta Parceiro', 'Produto', 'Outro'];

function emptyTransacao() {
  return { descricao: '', tipo: 'Mensalidade', valor: '', data: new Date().toISOString().split('T')[0], status: 'pendente', alunoId: '', observacoes: '', categoria: 'receita' };
}

export default function FinanceiroView() {
  const { transacoes, alunos, addTransacao } = useApp();
  const { user } = useAuth();

  const creds = getCredentials();
  const myCred = creds.find(c => c.id === user?.id);
  const professorId = myCred?.linkedId || '';

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTransacao());
  const [saved, setSaved] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('');

  const todasTransacoes = (transacoes || []).sort((a, b) => new Date(b.data) - new Date(a.data));

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

  // Chart: agrupado por mês
  const chartData = meses.slice(0, 6).reverse().map(mes => {
    const mesTransacoes = todasTransacoes.filter(t => t.data?.startsWith(mes));
    return {
      mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      receitas: mesTransacoes.filter(t => t.status === 'pago' && (t.categoria === 'receita' || !t.categoria)).reduce((a, t) => a + (parseFloat(t.valor) || 0), 0),
      pendente: mesTransacoes.filter(t => t.status === 'pendente').reduce((a, t) => a + (parseFloat(t.valor) || 0), 0),
    };
  });

  const handleSave = () => {
    if (!form.descricao.trim() || !form.valor) return alert('Preencha descrição e valor');
    addTransacao({ ...form, valor: parseFloat(form.valor) || 0 });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setForm(emptyTransacao()); }, 1200);
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
          { label: 'Saldo', value: saldo, color: saldo >= 0 ? '#34d399' : '#ef4444', icon: DollarSign, prefix: 'R$ ' },
          { label: 'Recebido', value: totalPago, color: '#34d399', icon: TrendingUp, prefix: 'R$ ' },
          { label: 'Pendente', value: totalPendente, color: '#fbbf24', icon: Clock, prefix: 'R$ ' },
          { label: 'Vencido', value: totalVencido, color: '#ef4444', icon: AlertCircle, prefix: 'R$ ' },
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
                {k.prefix}{k.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              <Bar dataKey="receitas" name="Recebido" fill="#34d399" radius={[4,4,0,0]} />
              <Bar dataKey="pendente" name="Pendente" fill="#fbbf24" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filtros */}
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

      {/* Lista de transações */}
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
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${statusColor}20` }}>
                  <StatusIcon size={16} style={{ color: statusColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{t.descricao}</div>
                  <div className="text-xs text-slate-500">
                    {t.tipo} {aluno ? `• ${aluno.nome}` : ''} • {new Date(t.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: t.categoria === 'despesa' ? '#ef4444' : '#34d399' }}>
                    {t.categoria === 'despesa' ? '-' : '+'}R$ {parseFloat(t.valor || 0).toFixed(2)}
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor}15`, color: statusColor }}>
                    {STATUS_LABEL[t.status] || t.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
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
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
                      style={{ background: form.categoria === cat ? (cat === 'receita' ? '#34d39920' : '#ef444420') : 'rgba(255,255,255,0.04)', color: form.categoria === cat ? (cat === 'receita' ? '#34d399' : '#ef4444') : '#64748b', border: form.categoria === cat ? `1px solid ${cat === 'receita' ? '#34d39930' : '#ef444430'}` : '1px solid rgba(255,255,255,0.06)' }}>
                      {cat === 'receita' ? '↑ Receita' : '↓ Despesa'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Ex: Mensalidade João" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
                  <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
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
                  <label className="text-xs text-slate-400 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              {alunos.length > 0 && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Aluno (opcional)</label>
                  <select value={form.alunoId} onChange={e => setForm(f => ({ ...f, alunoId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <option value="">Nenhum</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
              )}
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