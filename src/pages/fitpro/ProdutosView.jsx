import React, { useState } from 'react';
import { ShoppingBag, Plus, X, Trash2, Edit2, Search, Tag, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../../context/FitProContext';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const CATEGORIAS = ['Suplementos', 'Roupas', 'Equipamentos', 'Acessórios', 'Livros', 'Serviços', 'Outros'];
const CATEGORIA_COLOR = {
  'Suplementos': '#34d399', 'Roupas': '#f472b6', 'Equipamentos': '#60a5fa',
  'Acessórios': '#fbbf24', 'Livros': '#a78bfa', 'Serviços': '#fb923c', 'Outros': '#64748b',
};

function emptyProduto() {
  return { nome: '', descricao: '', categoria: 'Suplementos', preco: '', precoPromocional: '', estoque: '', unidade: 'un', imagemUrl: '', linkLoja: '', ativo: true, destaque: false };
}

export default function ProdutosView() {
  const { produtos, addProduto, updateProduto, deleteProduto } = useApp();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyProduto());
  const [saved, setSaved] = useState(false);

  const lista = (produtos || []);
  const filtered = lista.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filtroCategoria || p.categoria === filtroCategoria;
    return matchSearch && matchCat;
  });

  const handleSave = () => {
    if (!form.nome.trim()) return alert('Nome é obrigatório');
    if (!form.preco) return alert('Preço é obrigatório');
    const data = { ...form, preco: parseFloat(form.preco) || 0, precoPromocional: parseFloat(form.precoPromocional) || 0, estoque: parseInt(form.estoque) || 0 };
    if (editId) updateProduto(editId, data);
    else addProduto(data);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm(emptyProduto()); }, 1200);
  };

  const toggleAtivo = (id, ativo) => updateProduto(id, { ativo: !ativo });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingBag size={20} color="#fb923c" />Produtos</h2>
          <p className="text-xs text-slate-500">{filtered.length} produto(s)</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setForm(emptyProduto()); setEditId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#fb923c20', color: '#fb923c', border: '1px solid #fb923c30' }}>
            <Plus size={14} />Novo Produto
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <option value="">Todas categorias</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: lista.length, color: '#fb923c' },
          { label: 'Ativos', value: lista.filter(p => p.ativo).length, color: '#34d399' },
          { label: 'Em destaque', value: lista.filter(p => p.destaque).length, color: '#fbbf24' },
        ].map(k => (
          <div key={k.label} className="p-3 rounded-xl text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><ShoppingBag size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum produto cadastrado</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((prod, i) => {
            const color = CATEGORIA_COLOR[prod.categoria] || '#64748b';
            const temPromocao = prod.precoPromocional > 0 && prod.precoPromocional < prod.preco;
            return (
              <motion.div key={prod.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${prod.ativo ? BORDER : 'rgba(255,255,255,0.03)'}`, opacity: prod.ativo ? 1 : 0.6 }}>
                {prod.imagemUrl ? (
                  <img src={prod.imagemUrl} alt={prod.nome} className="w-full h-32 object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${color}10` }}>
                    <Package size={32} style={{ color }} />
                  </div>
                )}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-white text-sm flex-1">{prod.nome}</h3>
                  {prod.destaque && <span className="text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ background: '#fbbf2415', color: '#fbbf24' }}>⭐</span>}
                </div>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{prod.categoria}</span>
                  {prod.estoque !== undefined && <span className="text-xs text-slate-500 py-0.5">Estoque: {prod.estoque}{prod.unidade}</span>}
                </div>
                {prod.descricao && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{prod.descricao}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    {temPromocao ? (
                      <>
                        <div className="text-xs text-slate-500 line-through">R$ {prod.preco.toFixed(2)}</div>
                        <div className="text-lg font-bold text-green-400">R$ {prod.precoPromocional.toFixed(2)}</div>
                      </>
                    ) : (
                      <div className="text-lg font-bold" style={{ color: '#34d399' }}>R$ {parseFloat(prod.preco || 0).toFixed(2)}</div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => toggleAtivo(prod.id, prod.ativo)} className="px-2 py-1.5 rounded-lg text-xs"
                        style={{ background: prod.ativo ? '#34d39915' : '#64748b15', color: prod.ativo ? '#34d399' : '#64748b' }}>
                        {prod.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                      <button onClick={() => { setForm({ ...prod, preco: String(prod.preco), precoPromocional: String(prod.precoPromocional || ''), estoque: String(prod.estoque || '') }); setEditId(prod.id); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: '#94a3b8' }}><Edit2 size={13} /></button>
                      <button onClick={() => { if (confirm('Excluir?')) deleteProduto(prod.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">{editId ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Categoria</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço (R$)</label>
                  <input type="number" value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preço Promocional (R$)</label>
                  <input type="number" value={form.precoPromocional} onChange={e => setForm(f => ({ ...f, precoPromocional: e.target.value }))} placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Estoque</label>
                  <input type="number" value={form.estoque} onChange={e => setForm(f => ({ ...f, estoque: e.target.value }))} placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unidade</label>
                  <select value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {['un','kg','g','L','mL','cx'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">URL do Produto (imagem)</label>
                <input value={form.imagemUrl} onChange={e => setForm(f => ({ ...f, imagemUrl: e.target.value }))} placeholder="https://exemplo.com/imagem-produto.jpg"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                {form.imagemUrl ? (
                  <img src={form.imagemUrl} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl" onError={e => e.target.style.display='none'} />
                ) : null}
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">🔗 Link da Loja Parceira</label>
                <input value={form.linkLoja || ''} onChange={e => setForm(f => ({ ...f, linkLoja: e.target.value }))} placeholder="https://lojaparceira.com.br/produto"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <p className="text-xs text-slate-600 mt-1">Ao clicar em "Comprar na loja parceira", o usuário será redirecionado para este link.</p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-sm text-slate-300">Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.destaque} onChange={e => setForm(f => ({ ...f, destaque: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-sm text-slate-300">Destaque ⭐</span>
                </label>
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #fb923c, #ea580c)' }}>
              {saved ? '✓ Salvo!' : `${editId ? 'Salvar' : 'Cadastrar'} Produto`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}