import React, { useState, useEffect } from 'react';
import { FolderPlus, Folder, FolderOpen, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp, Save, Dumbbell, GripVertical, CalendarDays, Users, CheckCircle2, Zap, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials, generateId } from '../../lib/fitpro-storage';
import { aplicarTemplate, TREINO_TEMPLATES } from '../../lib/treinoTemplates';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const COR_SESSAO = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];
const PASTA_CORES = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fb923c', '#fbbf24'];
const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const emptyRotina = () => ({ nome: '', descricao: '', nivel: 'Intermediário', objetivo: 'Hipertrofia', sessoes: [], cor: PASTA_CORES[0] });
const emptyEx = () => ({ id: generateId(), nome: '', series: 3, repeticoes: '10-12', carga: 0, descanso: 60, grupoMuscular: '', observacoes: '' });
const emptySessao = (idx) => ({ id: generateId(), nome: `Treino ${String.fromCharCode(65 + idx)}`, dia: 'Segunda-feira', exercicios: [] });

const inp = "w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none";
const inpStyle = { background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' };

// ─── Modal de Rotina (criar/editar) ─────────────────────────────────────────
function RotinaModal({ rotina, exerciciosBiblioteca, alunos, professorId, pasta, pastas, addBibliotecaTreino, onSave, onClose }) {
  const [form, setForm] = useState(rotina || emptyRotina());
  const [pastaEscolhida, setPastaEscolhida] = useState(pasta || '');
  const [collapsedSessoes, setCollapsedSessoes] = useState({});
  const [bibSearch, setBibSearch] = useState({});
  const [saving, setSaving] = useState(false);
  const [alunoId, setAlunoId] = useState('');
  const [gerandoAnual, setGerandoAnual] = useState(false);
  const [planoAnualGerado, setPlanoAnualGerado] = useState(false);

  const addSessao = () => setForm(f => ({ ...f, sessoes: [...f.sessoes, emptySessao(f.sessoes.length)] }));
  const removeSessao = (id) => setForm(f => ({ ...f, sessoes: f.sessoes.filter(s => s.id !== id) }));
  const updateSessao = (id, field, val) => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === id ? { ...s, [field]: val } : s) }));

  const addEx = (sessaoId) => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: [...s.exercicios, emptyEx()] } : s) }));
  const removeEx = (sessaoId, exId) => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: s.exercicios.filter(e => e.id !== exId) } : s) }));
  const updateEx = (sessaoId, exId, field, val) => setForm(f => ({
    ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: s.exercicios.map(e => e.id === exId ? { ...e, [field]: val } : e) } : s)
  }));

  const addFromBib = (sessaoId, bEx) => {
    const novo = { id: generateId(), nome: bEx.nome, grupoMuscular: bEx.grupoMuscular || '', series: parseInt(bEx.series?.split('-')[0] || '3') || 3, repeticoes: bEx.repeticoes || '10-12', carga: 0, descanso: bEx.descanso || 60, observacoes: bEx.dicas || '' };
    setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: [...s.exercicios, novo] } : s) }));
  };

  const onDragEnd = (sessaoId, result) => {
    if (!result.destination) return;
    setForm(f => ({
      ...f, sessoes: f.sessoes.map(s => {
        if (s.id !== sessaoId) return s;
        const exs = Array.from(s.exercicios);
        const [moved] = exs.splice(result.source.index, 1);
        exs.splice(result.destination.index, 0, moved);
        return { ...s, exercicios: exs };
      })
    }));
  };

  // Gera plano anual automático: 12 registros mensais salvos na BibliotecaTreino (NÃO em PlanoTreino/Meus Treinos)
  const handleGerarPlanoAnual = async () => {
    if (!alunoId) return alert('Selecione um aluno para gerar o plano anual');
    setGerandoAnual(true);
    const base = new Date();
    const sessoesBase = form.sessoes.length > 0 ? form.sessoes : (() => {
      const t = aplicarTemplate(form.nivel, alunoId, exerciciosBiblioteca || []);
      return t ? t.sessoes : [];
    })();

    const planos = [];
    for (let m = 0; m < 12; m++) {
      const inicio = new Date(base.getFullYear(), base.getMonth() + m, 1);
      const fim = new Date(base.getFullYear(), base.getMonth() + m + 1, 0);
      planos.push({
        nome: `${form.nome || pasta || 'Treino'} — ${MESES[inicio.getMonth()]} ${inicio.getFullYear()}`,
        descricao: `Plano mensal gerado automaticamente`,
        alunoId,
        objetivo: form.objetivo,
        nivel: form.nivel,
        cor: form.cor,
        sessoes: sessoesBase.map(s => ({ ...s, id: generateId(), exercicios: (s.exercicios || []).map(e => ({ ...e, id: generateId() })) })),
        pasta: pasta || '',
        professorId: professorId || '',
        tipo: 'plano_mensal',
        dataInicio: inicio.toISOString().split('T')[0],
        dataFim: fim.toISOString().split('T')[0],
      });
    }

    for (const p of planos) { await addBibliotecaTreino(p); }
    setGerandoAnual(false);
    setPlanoAnualGerado(true);
    setTimeout(() => setPlanoAnualGerado(false), 3000);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return alert('Nome é obrigatório');
    setSaving(true);
    await onSave({ ...form, pasta: pastaEscolhida, alunoId: alunoId || undefined });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-2xl rounded-2xl p-6 my-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">{rotina ? 'Editar Rotina de Treino' : 'Nova Rotina de Treino'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5"><X size={18} color="#6b7280" /></button>
        </div>

        {/* Seletor de Pasta */}
        <div className="mb-4 p-3 rounded-2xl" style={{ background: '#a78bfa08', border: '1px solid #a78bfa30' }}>
          <div className="flex items-center gap-2 mb-2">
            <Folder size={13} color="#a78bfa" />
            <span className="text-xs font-semibold text-white">Salvar na Pasta</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(pastas || []).map(p => (
              <button key={p} onClick={() => setPastaEscolhida(p)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: pastaEscolhida === p ? '#a78bfa25' : 'rgba(255,255,255,0.04)', color: pastaEscolhida === p ? '#a78bfa' : '#94a3b8', border: `1px solid ${pastaEscolhida === p ? '#a78bfa40' : 'rgba(255,255,255,0.06)'}` }}>
                <Folder size={10} />{p}
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Aluno */}
        <div className="mb-4 p-4 rounded-2xl" style={{ background: '#60a5fa08', border: '1px solid #60a5fa25' }}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} color="#60a5fa" />
            <span className="text-xs font-semibold text-white">Aluno (opcional)</span>
            <span className="text-xs text-slate-500">— para gerar plano anual ou vincular ao treino</span>
          </div>
          <select value={alunoId} onChange={e => setAlunoId(e.target.value)} className={inp} style={inpStyle}>
            <option value="">Selecionar aluno...</option>
            {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>

        {/* Info básica */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nome da Rotina</label>
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Push — Peito e Ombros" className={inp} style={inpStyle} />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Descrição (opcional)</label>
            <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descreva o foco desta rotina..." className={inp} style={inpStyle} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Objetivo</label>
              <select value={form.objetivo} onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))} className={inp} style={inpStyle}>
                {['Hipertrofia', 'Força', 'Emagrecimento', 'Condicionamento', 'Resistência'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nível</label>
              <select value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))} className={inp} style={inpStyle}>
                {['Iniciante', 'Intermediário', 'Avançado'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Cor</label>
            <div className="flex gap-2">
              {PASTA_CORES.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, cor: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, border: form.cor === c ? `2px solid white` : '2px solid transparent', opacity: form.cor === c ? 1 : 0.5 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Botão Plano Anual Automático */}
        <div className="mb-5 p-4 rounded-2xl" style={{ background: '#a78bfa08', border: '1px solid #a78bfa30' }}>
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={15} color="#a78bfa" />
            <span className="text-sm font-bold text-white">Gerar Plano Anual Automático</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Cria automaticamente <strong className="text-white">12 planos mensais editáveis</strong> para o aluno selecionado, usando as sessões desta rotina (ou o template padrão do nível escolhido).
          </p>
          <button
            onClick={handleGerarPlanoAnual}
            disabled={gerandoAnual || planoAnualGerado}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: planoAnualGerado ? 'linear-gradient(135deg, #34d399, #059669)' : gerandoAnual ? '#a78bfa40' : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              color: '#fff',
              opacity: gerandoAnual ? 0.7 : 1
            }}>
            {planoAnualGerado
              ? <><CheckCircle2 size={14} />12 planos criados com sucesso!</>
              : gerandoAnual
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Gerando 12 meses...</>
              : <><Zap size={14} />Gerar 12 Planos Mensais em 1 Clique</>
            }
          </button>
          {!alunoId && <p className="text-xs text-yellow-400 mt-2 text-center">⚠️ Selecione um aluno acima para habilitar</p>}
        </div>

        {/* Sessões */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white text-sm">Sessões de Treino</h4>
            <button onClick={addSessao} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#f472b620', color: '#f472b6', border: '1px solid #f472b630' }}>
              <Plus size={12} />Sessão
            </button>
          </div>

          {form.sessoes.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">Clique em "Sessão" para adicionar treinos</p>
          )}

          {form.sessoes.map((sessao, si) => {
            const cor = COR_SESSAO[si % COR_SESSAO.length];
            const collapsed = collapsedSessoes[sessao.id];
            const busca = (bibSearch[sessao.id] || '').toLowerCase();
            const filtrados = busca.length > 0 ? (exerciciosBiblioteca || []).filter(b => b.nome?.toLowerCase().includes(busca)).slice(0, 20) : [];

            return (
              <div key={sessao.id} className="mb-3 rounded-xl overflow-visible" style={{ border: `1px solid ${cor}30` }}>
                <div className="flex items-center gap-2 p-3" style={{ background: `${cor}10` }}>
                  <span className="font-bold text-xs" style={{ color: cor }}>{String.fromCharCode(65 + si)}</span>
                  <input value={sessao.nome} onChange={e => updateSessao(sessao.id, 'nome', e.target.value)}
                    className="flex-1 px-2 py-1 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(0,0,0,0.2)' }} />
                  <select value={sessao.dia} onChange={e => updateSessao(sessao.id, 'dia', e.target.value)}
                    className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {DIAS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <button onClick={() => setCollapsedSessoes(c => ({ ...c, [sessao.id]: !c[sessao.id] }))} className="text-slate-500 hover:text-white">
                    {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  <button onClick={() => removeSessao(sessao.id)} className="text-red-400"><X size={13} /></button>
                </div>

                {!collapsed && (
                  <div className="p-3 space-y-2">
                    <DragDropContext onDragEnd={(result) => onDragEnd(sessao.id, result)}>
                      <Droppable droppableId={sessao.id}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                            {sessao.exercicios.map((ex, ei) => (
                              <Draggable key={ex.id} draggableId={ex.id} index={ei}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps}
                                    className="flex gap-2 items-start p-2 rounded-xl"
                                    style={{ background: snapshot.isDragging ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', ...provided.draggableProps.style }}>
                                    <div {...provided.dragHandleProps} className="mt-1 cursor-grab"><GripVertical size={13} color="#475569" /></div>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                                      style={{ background: `${cor}25`, color: cor }}>{ei + 1}</span>
                                    <div className="flex-1 grid grid-cols-2 gap-1">
                                      <input value={ex.nome} onChange={e => updateEx(sessao.id, ex.id, 'nome', e.target.value)}
                                        placeholder="Exercício" className="col-span-2 px-2 py-1 rounded-lg text-xs text-white outline-none" style={inpStyle} />
                                      <input type="number" value={ex.series} onChange={e => updateEx(sessao.id, ex.id, 'series', parseInt(e.target.value) || 1)}
                                        placeholder="Séries" className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={inpStyle} />
                                      <input value={ex.repeticoes} onChange={e => updateEx(sessao.id, ex.id, 'repeticoes', e.target.value)}
                                        placeholder="Reps" className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={inpStyle} />
                                      <input type="number" value={ex.carga || ''} onChange={e => updateEx(sessao.id, ex.id, 'carga', parseFloat(e.target.value) || 0)}
                                        placeholder="Carga (kg)" className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={inpStyle} />
                                      <input type="number" value={ex.descanso} onChange={e => updateEx(sessao.id, ex.id, 'descanso', parseInt(e.target.value) || 60)}
                                        placeholder="Descanso (s)" className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={inpStyle} />
                                    </div>
                                    <button onClick={() => removeEx(sessao.id, ex.id)} className="text-red-400 mt-1"><X size={12} /></button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div className="flex gap-2 mt-1">
                      <button onClick={() => addEx(sessao.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                        style={{ background: `${cor}10`, color: cor }}>
                        <Plus size={10} />Exercício
                      </button>
                      <div className="flex-1 relative">
                        <input value={bibSearch[sessao.id] || ''} onChange={e => setBibSearch(s => ({ ...s, [sessao.id]: e.target.value }))}
                          placeholder="🔍 Buscar da biblioteca..."
                          className="w-full px-2 py-1 rounded-lg text-xs text-white outline-none" style={inpStyle} />
                        {filtrados.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-20 max-h-44 overflow-y-auto"
                            style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                            {filtrados.map(b => (
                              <button key={b.id} type="button"
                                onMouseDown={() => { addFromBib(sessao.id, b); setBibSearch(s => ({ ...s, [sessao.id]: '' })); }}
                                className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 flex items-center gap-2">
                                <span className="text-slate-400">{b.grupoMuscular}</span><span>{b.nome}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #f472b6, #db2777)' }}>
          {saving ? '⏳ Salvando...' : <><Save size={14} className="inline mr-2" />{rotina ? 'Salvar Alterações' : 'Criar Rotina de Treino'}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Modal Nova Pasta ────────────────────────────────────────────────────────
function NovaPastaModal({ onSave, onClose }) {
  const [nome, setNome] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Nova Pasta</h3>
          <button onClick={onClose}><X size={18} color="#6b7280" /></button>
        </div>
        <input autoFocus value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Nome da pasta..."
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none mb-4"
          style={{ background: '#1e2a3a', border: '1px solid #a78bfa40' }}
          onKeyDown={e => { if (e.key === 'Enter' && nome.trim()) onSave(nome.trim()); }} />
        <button onClick={() => nome.trim() && onSave(nome.trim())}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
          Criar Pasta
        </button>
      </div>
    </div>
  );
}

// ─── Modal Mover Rotina para Pasta ───────────────────────────────────────────
function MoverPastaModal({ rotina, pastas, onMover, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm">Mover Rotina</h3>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{rotina.nome}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5"><X size={16} color="#6b7280" /></button>
        </div>
        <div className="space-y-2">
          <button onClick={() => onMover('')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.07)', color: rotina.pasta === '' || !rotina.pasta ? '#94a3b8' : '#64748b' }}>
            <Folder size={14} color="#64748b" />
            <span>Sem pasta</span>
            {(!rotina.pasta) && <span className="ml-auto text-xs text-slate-500">atual</span>}
          </button>
          {pastas.map(p => (
            <button key={p} onClick={() => onMover(p)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ border: `1px solid ${rotina.pasta === p ? '#a78bfa40' : 'rgba(255,255,255,0.07)'}`, background: rotina.pasta === p ? '#a78bfa10' : 'transparent', color: rotina.pasta === p ? '#a78bfa' : '#94a3b8' }}>
              <Folder size={14} color={rotina.pasta === p ? '#a78bfa' : '#64748b'} />
              <span>{p}</span>
              {rotina.pasta === p && <span className="ml-auto text-xs text-slate-500">atual</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Card de Rotina ──────────────────────────────────────────────────────────
function RotinaCard({ rotina, i, onEdit, onDelete, onMover }) {
  const cor = rotina.cor || COR_SESSAO[i % COR_SESSAO.length];
  const totalExs = rotina.sessoes?.reduce((a, s) => a + (s.exercicios?.length || 0), 0) || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="p-4 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cor}20` }}>
          <Dumbbell size={18} style={{ color: cor }} />
        </div>
        <div className="flex gap-1">
          <button onClick={onMover} className="p-1.5 rounded-lg hover:bg-white/5" title="Mover para pasta"><ArrowRightLeft size={13} color="#60a5fa" /></button>
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/5"><Edit2 size={13} color="#fbbf24" /></button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={13} color="#ef4444" /></button>
        </div>
      </div>
      <h4 className="font-bold text-white text-sm mb-1 truncate">{rotina.nome}</h4>
      {rotina.descricao && <p className="text-xs text-slate-500 mb-2 truncate">{rotina.descricao}</p>}
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cor}15`, color: cor }}>{rotina.sessoes?.length || 0} sessões</span>
        <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{totalExs} exerc.</span>
        {rotina.nivel && <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{rotina.nivel}</span>}
      </div>
    </motion.div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function BibliotecaTreinosView({ initialNovaPasta = false, onNovaPastaCriada }) {
  const { bibliotecaTreinos, addBibliotecaTreino, updateBibliotecaTreino, deleteBibliotecaTreino, exerciciosBiblioteca, alunos } = useApp();
  const { user } = useAuth();

  const [professorId, setProfessorId] = useState('');
  useEffect(() => {
    getCredentials().then(creds => {
      const mine = creds.find(c => c.id === user?.id);
      setProfessorId(mine?.linkedId || '');
    });
  }, [user?.id]);

  const minhas = (bibliotecaTreinos || []).filter(b => !professorId || b.professorId === professorId || b.professorId === user?.id);

  const alunosFiltrados = professorId
    ? (alunos || []).filter(a => a.professorId === professorId)
    : (alunos || []);

  const [pastas, setPastas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fitpro_bib_pastas') || '[]'); } catch { return []; }
  });
  const savePastas = (p) => { setPastas(p); localStorage.setItem('fitpro_bib_pastas', JSON.stringify(p)); };

  const [pastasAbertas, setPastasAbertas] = useState({});
  const [showNovaPasta, setShowNovaPasta] = useState(initialNovaPasta);
  const [editandoPasta, setEditandoPasta] = useState(null);
  // { mode: 'new'|'edit', pasta: string, rotina: obj|null }
  const [rotinaModalState, setRotinaModalState] = useState(null);
  // rotina sendo movida de pasta
  const [moverRotina, setMoverRotina] = useState(null);

  useEffect(() => { if (initialNovaPasta) setShowNovaPasta(true); }, [initialNovaPasta]);

  const abrirNovaRotina = (pasta) => setRotinaModalState({ mode: 'new', pasta, rotina: null });
  const abrirEditarRotina = (pasta, rotina) => setRotinaModalState({ mode: 'edit', pasta, rotina });
  const fecharRotinaModal = () => setRotinaModalState(null);

  const handleCriarPasta = (nome) => {
    if (pastas.includes(nome)) return alert('Já existe uma pasta com esse nome');
    const novas = [...pastas, nome];
    savePastas(novas);
    setPastasAbertas(p => ({ ...p, [nome]: true }));
    setShowNovaPasta(false);
    if (onNovaPastaCriada) onNovaPastaCriada(nome);
    abrirNovaRotina(nome);
  };

  const handleRenamePasta = (oldNome, newNome) => {
    if (!newNome.trim() || oldNome === newNome) { setEditandoPasta(null); return; }
    minhas.filter(b => b.pasta === oldNome).forEach(r => updateBibliotecaTreino(r.id, { ...r, pasta: newNome }));
    savePastas(pastas.map(p => p === oldNome ? newNome : p));
    setEditandoPasta(null);
  };

  const handleDeletePasta = (nome) => {
    if (!confirm(`Excluir a pasta "${nome}" e todas as rotinas dentro dela?`)) return;
    minhas.filter(b => b.pasta === nome).forEach(r => deleteBibliotecaTreino(r.id));
    savePastas(pastas.filter(p => p !== nome));
  };

  const handleSaveRotina = async (form) => {
    // pasta já vem definida pelo seletor dentro do modal (form.pasta)
    const payload = { ...form, professorId: professorId || user?.id };
    if (form.id) { await updateBibliotecaTreino(form.id, payload); }
    else { await addBibliotecaTreino(payload); }
    fecharRotinaModal();
  };

  const handleDeleteRotina = async (id) => {
    if (!confirm('Excluir esta rotina?')) return;
    await deleteBibliotecaTreino(id);
  };

  const handleMoverRotina = async (novaPasta) => {
    if (!moverRotina) return;
    await updateBibliotecaTreino(moverRotina.id, { ...moverRotina, pasta: novaPasta });
    setMoverRotina(null);
  };

  const rotinasDaPasta = (pasta) => minhas.filter(b => b.pasta === pasta);
  const rotinasSemPasta = minhas.filter(b => !b.pasta);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder size={20} color="#a78bfa" />Biblioteca de Treinos
          </h2>
          <p className="text-xs text-slate-500">{minhas.length} rotina(s) em {pastas.length} pasta(s)</p>
        </div>
        <button onClick={() => setShowNovaPasta(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}>
          <FolderPlus size={14} />Nova Pasta
        </button>
      </div>

      {/* Lista de pastas */}
      {pastas.length === 0 && rotinasSemPasta.length === 0 ? (
        <div className="text-center py-20">
          <FolderPlus size={48} className="mx-auto mb-4 opacity-20 text-slate-400" />
          <p className="text-slate-400 font-semibold mb-1">Nenhuma pasta criada ainda</p>
          <p className="text-xs text-slate-600 mb-4">Organize suas rotinas de treino em pastas</p>
          <button onClick={() => setShowNovaPasta(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
            Criar Primeira Pasta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pastas.map((pasta) => {
            const rotinas = rotinasDaPasta(pasta);
            const isOpen = pastasAbertas[pasta] !== false;
            const editando = editandoPasta?.nome === pasta;

            return (
              <motion.div key={pasta} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl overflow-visible" style={{ border: '1px solid #a78bfa30' }}>
                {/* Cabeçalho da pasta */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ background: '#a78bfa0a' }}>
                  <button onClick={() => setPastasAbertas(p => ({ ...p, [pasta]: !isOpen }))}
                    className="flex items-center gap-2 flex-1 min-w-0">
                    {isOpen ? <FolderOpen size={18} color="#a78bfa" /> : <Folder size={18} color="#a78bfa" />}
                    {editando ? (
                      <input autoFocus defaultValue={pasta}
                        onBlur={e => handleRenamePasta(pasta, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRenamePasta(pasta, e.target.value); if (e.key === 'Escape') setEditandoPasta(null); }}
                        className="flex-1 px-2 py-0.5 rounded-lg text-sm text-white outline-none"
                        style={{ background: '#1e2a3a', border: '1px solid #a78bfa40' }}
                        onClick={e => e.stopPropagation()} />
                    ) : (
                      <span className="font-bold text-white text-left flex-1 truncate">{pasta}</span>
                    )}
                    <span className="text-xs text-slate-400 flex-shrink-0">{rotinas.length} rotina{rotinas.length !== 1 ? 's' : ''}</span>
                    {isOpen ? <ChevronUp size={15} color="#6b7280" /> : <ChevronDown size={15} color="#6b7280" />}
                  </button>
                  <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => abrirNovaRotina(pasta)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: '#f472b615', color: '#f472b6', border: '1px solid #f472b625' }}>
                      <Plus size={11} />Rotina
                    </button>
                    <button onClick={() => setEditandoPasta({ nome: pasta })}
                      className="p-1.5 rounded-xl hover:bg-white/5" title="Renomear pasta">
                      <Edit2 size={13} color="#fbbf24" />
                    </button>
                    <button onClick={() => handleDeletePasta(pasta)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10" title="Excluir pasta">
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>

                {/* Rotinas dentro da pasta */}
                {isOpen && (
                  <div className="p-4">
                    {rotinas.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-slate-500 mb-3">Nenhuma rotina nesta pasta</p>
                        <button onClick={() => abrirNovaRotina(pasta)}
                          className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: '#f472b615', color: '#f472b6', border: '1px solid #f472b625' }}>
                          <Plus size={11} />Criar rotina de treino
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                        {rotinas.map((rotina, i) => (
                          <RotinaCard key={rotina.id} rotina={rotina} i={i}
                            onEdit={() => abrirEditarRotina(pasta, rotina)}
                            onDelete={() => handleDeleteRotina(rotina.id)}
                            onMover={() => setMoverRotina(rotina)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {rotinasSemPasta.length > 0 && (
            <div>
              {pastas.length > 0 && <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Sem pasta</p>}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {rotinasSemPasta.map((rotina, i) => (
                  <RotinaCard key={rotina.id} rotina={rotina} i={i}
                    onEdit={() => abrirEditarRotina('', rotina)}
                    onDelete={() => handleDeleteRotina(rotina.id)}
                    onMover={() => setMoverRotina(rotina)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showNovaPasta && <NovaPastaModal onSave={handleCriarPasta} onClose={() => setShowNovaPasta(false)} />}

      {rotinaModalState && (
        <RotinaModal
          rotina={rotinaModalState.rotina}
          exerciciosBiblioteca={exerciciosBiblioteca}
          alunos={alunosFiltrados}
          professorId={professorId}
          pasta={rotinaModalState.pasta}
          pastas={pastas}
          addBibliotecaTreino={addBibliotecaTreino}
          onSave={handleSaveRotina}
          onClose={fecharRotinaModal}
        />
      )}

      {moverRotina && (
        <MoverPastaModal
          rotina={moverRotina}
          pastas={pastas}
          onMover={handleMoverRotina}
          onClose={() => setMoverRotina(null)}
        />
      )}
    </div>
  );
}