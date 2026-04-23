import React, { useState } from 'react';
import { ClipboardList, Plus, X, Search, CheckCircle2, Clock, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../../context/FitProContext';
import { generateId } from '../../lib/fitpro-storage';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

const STATUS = {
  pendente: { label: 'Pendente', color: '#fbbf24', icon: Clock },
  processando: { label: 'Processando', color: '#60a5fa', icon: Clock },
  enviado: { label: 'Enviado', color: '#a78bfa', icon: Truck },
  entregue: { label: 'Entregue', color: '#34d399', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: '#ef4444', icon: XCircle },
};

function emptyPedido(alunos, produtos) {
  return { alunoId: alunos[0]?.id || '', itens: [], status: 'pendente', formaPagamento: 'pix', observacoes: '', dataPedido: new Date().toISOString().split('T')[0] };
}

export default function PedidosView() {
  const { alunos, produtos, addTransacao } = useApp();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fitpro_pedidos') || '[]'); } catch { return []; }
  });
  const savePedidos = (p) => { setPedidos(p); localStorage.setItem('fitpro_pedidos', JSON.stringify(p)); };

  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ alunoId: '', itens: [], status: 'pendente', formaPagamento: 'pix', observacoes: '', dataPedido: new Date().toISOString().split('T')[0] });
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const listaProdutos = produtos || [];
  const filtrados = pedidos.filter(p => {
    const aluno = alunos.find(a => a.id === p.alunoId);
    const matchSearch = !search || (aluno?.nome || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));

  const addItem = () => setForm(f => ({ ...f, itens: [...f.itens, { id: generateId(), produtoId: listaProdutos[0]?.id || '', quantidade: 1 }] }));
  const removeItem = (id) => setForm(f => ({ ...f, itens: f.itens.filter(i => i.id !== id) }));
  const updateItem = (id, field, value) => setForm(f => ({ ...f, itens: f.itens.map(i => i.id === id ? { ...i, [field]: value } : i) }));

  const calcTotal = (itens) => itens.reduce((acc, item) => {
    const prod = listaProdutos.find(p => p.id === item.produtoId);
    const preco = prod?.precoPromocional > 0 ? prod.precoPromocional : prod?.preco || 0;
    return acc + preco * (parseInt(item.quantidade) || 1);
  }, 0);

  const handleSave = () => {
    if (!form.alunoId) return alert('Selecione um aluno');
    if (form.itens.length === 0) return alert('Adicione pelo menos um item');
    const total = calcTotal(form.itens);
    const novoPedido = { ...form, id: generateId(), total, createdAt: new Date().toISOString() };
    const novos = [novoPedido, ...pedidos];
    savePedidos(novos);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setForm({ alunoId: '', itens: [], status: 'pendente', formaPagamento: 'pix', observacoes: '', dataPedido: new Date().toISOString().split('T')[0] }); }, 1200);
  };

  const updateStatus = (id, status) => {
    const novos = pedidos.map(p => p.id === id ? { ...p, status } : p);
    savePedidos(novos);
  };

  const deletePedido = (id) => { if (confirm('Excluir pedido?')) savePedidos(pedidos.filter(p => p.id !== id)); };

  const totalReceita = pedidos.filter(p => p.status === 'entregue').reduce((acc, p) => acc + (p.total || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><ClipboardList size={20} color="#f472b6" />Pedidos</h2>
          <p className="text-xs text-slate-500">{filtrados.length} pedido(s)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#f472b620', color: '#f472b6', border: '1px solid #f472b630' }}>
          <Plus size={14} />Novo Pedido
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Pedidos', value: pedidos.length, color: '#f472b6' },
          { label: 'Pendentes', value: pedidos.filter(p => p.status === 'pendente').length, color: '#fbbf24' },
          { label: 'Entregues', value: pedidos.filter(p => p.status === 'entregue').length, color: '#34d399' },
          { label: 'Receita', value: `R$${totalReceita.toFixed(0)}`, color: '#34d399' },
        ].map((k, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por aluno..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['todos', ...Object.keys(STATUS)].map(s => {
            const color = s === 'todos' ? '#64748b' : STATUS[s].color;
            return (
              <button key={s} onClick={() => setFiltroStatus(s)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: filtroStatus === s ? `${color}20` : 'rgba(255,255,255,0.03)', color: filtroStatus === s ? color : '#64748b', border: filtroStatus === s ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)' }}>
                {s === 'todos' ? 'Todos' : STATUS[s].label}
              </button>
            );
          })}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><ClipboardList size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum pedido encontrado</p></div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((pedido, i) => {
            const aluno = alunos.find(a => a.id === pedido.alunoId);
            const st = STATUS[pedido.status] || STATUS.pendente;
            const StatusIcon = st.icon;
            const expanded = expandedId === pedido.id;
            return (
              <motion.div key={pedido.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <button onClick={() => setExpandedId(expanded ? null : pedido.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${st.color}20` }}>
                    <StatusIcon size={16} style={{ color: st.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">{aluno?.nome || 'Aluno não encontrado'}</div>
                    <div className="text-xs text-slate-500">{new Date(pedido.dataPedido).toLocaleDateString('pt-BR')} • {pedido.itens?.length || 0} item(s)</div>
                  </div>
                  <div className="text-right mr-2">
                    <div className="text-sm font-bold text-green-400">R$ {parseFloat(pedido.total || 0).toFixed(2)}</div>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${st.color}15`, color: st.color }}>{st.label}</span>
                  </div>
                  {expanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                </button>
                {expanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {(pedido.itens || []).map((item, j) => {
                      const prod = listaProdutos.find(p => p.id === item.produtoId);
                      const preco = prod?.precoPromocional > 0 ? prod.precoPromocional : prod?.preco || 0;
                      return (
                        <div key={item.id || j} className="flex items-center justify-between p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="text-sm text-white">{prod?.nome || 'Produto removido'}</span>
                          <span className="text-xs text-slate-400">{item.quantidade}x R${preco.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    {pedido.observacoes && <p className="text-xs text-slate-500">📝 {pedido.observacoes}</p>}
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">Alterar status:</span>
                      {Object.entries(STATUS).map(([key, s]) => (
                        <button key={key} onClick={() => updateStatus(pedido.id, key)}
                          className="px-2 py-1 rounded-lg text-xs transition-all"
                          style={{ background: pedido.status === key ? `${s.color}20` : 'rgba(255,255,255,0.04)', color: pedido.status === key ? s.color : '#64748b', border: pedido.status === key ? `1px solid ${s.color}30` : '1px solid rgba(255,255,255,0.06)' }}>
                          {s.label}
                        </button>
                      ))}
                      <button onClick={() => deletePedido(pedido.id)} className="ml-auto px-2 py-1 rounded-lg text-xs" style={{ color: '#ef4444' }}>Excluir</button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Novo Pedido</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Aluno</label>
                <select value={form.alunoId} onChange={e => setForm(f => ({ ...f, alunoId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">Selecionar aluno</option>
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Itens do Pedido</label>
                  <button onClick={addItem} className="text-xs px-2 py-1 rounded-lg" style={{ background: '#f472b615', color: '#f472b6' }}>+ Item</button>
                </div>
                {form.itens.length === 0 && <p className="text-xs text-slate-600 text-center py-3">Adicione itens ao pedido</p>}
                {form.itens.map((item, i) => {
                  const prod = listaProdutos.find(p => p.id === item.produtoId);
                  const preco = prod?.precoPromocional > 0 ? prod.precoPromocional : prod?.preco || 0;
                  return (
                    <div key={item.id} className="flex gap-2 mb-2">
                      <select value={item.produtoId} onChange={e => updateItem(item.id, 'produtoId', e.target.value)}
                        className="flex-1 px-2 py-2 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {listaProdutos.map(p => <option key={p.id} value={p.id}>{p.nome} — R${parseFloat(p.preco||0).toFixed(2)}</option>)}
                      </select>
                      <input type="number" value={item.quantidade} onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
                        className="w-14 px-2 py-2 rounded-lg text-xs text-white outline-none text-center" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                      <button onClick={() => removeItem(item.id)} className="text-red-400"><X size={14} /></button>
                    </div>
                  );
                })}
                {form.itens.length > 0 && (
                  <div className="text-right text-sm font-bold text-green-400 mt-1">Total: R$ {calcTotal(form.itens).toFixed(2)}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Forma de Pagamento</label>
                  <select value={form.formaPagamento} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {['pix','cartão de crédito','cartão de débito','dinheiro','boleto'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Data</label>
                  <input type="date" value={form.dataPedido} onChange={e => setForm(f => ({ ...f, dataPedido: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f472b6, #db2777)' }}>
              {saved ? '✓ Salvo!' : 'Criar Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}