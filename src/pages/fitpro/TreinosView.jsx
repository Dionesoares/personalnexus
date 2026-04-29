import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, X, Save, Trash2, ChevronDown, ChevronUp, ChevronRight, Sparkles, Play, GripVertical, Edit2, Copy, Download } from 'lucide-react';
import { gerarPDFTreino } from '../../lib/fitpro-pdf';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials, generateId } from '../../lib/fitpro-storage';
import { TREINO_TEMPLATES, aplicarTemplate } from '../../lib/treinoTemplates';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';
const COR_SESSAO = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#fb923c'];

const emptyTreino = { nome: '', objetivo: 'Hipertrofia', nivel: 'Intermediário', duracaoSemanas: 12, sessoes: [] };
const emptyEx = () => ({ id: generateId(), nome: '', series: 3, repeticoes: '10-12', carga: 0, descanso: 60, tecnica: 'Normal', observacoes: '', grupoMuscular: 'Peito' });

export default function TreinosView() {
  const { planosTreino, alunos, exerciciosBiblioteca, addPlanoTreino, updatePlanoTreino, deletePlanoTreino } = useApp();
  const { user } = useAuth();

  const [professorId, setProfessorId_] = useState('');
  useEffect(() => {
    getCredentials().then(creds => {
      const myCred = creds.find(c => c.id === user?.id);
      setProfessorId_(myCred?.linkedId || '');
    });
  }, [user?.id]);

  const [selectedTreino, setSelectedTreino] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyTreino);
  const [collapsedSessoes, setCollapsedSessoes] = useState({});
  const [saved, setSaved] = useState(false);
  const [gifModal, setGifModal] = useState(null); // { nome, gifUrl, series, repeticoes, descanso, observacoes, dicas, cor }

  const [alunoId, setAlunoId] = useState('');
  useEffect(() => {
    if (user?.role === 'aluno') {
      getCredentials().then(creds => {
        const myCred = creds.find(c => c.id === user?.id);
        const linkedId = myCred?.linkedId || '';
        if (linkedId) { setAlunoId(linkedId); return; }
        const byEmail = alunos.find(a => a.email?.toLowerCase() === user?.email?.toLowerCase());
        setAlunoId(byEmail?.id || '');
      });
    }
  }, [user?.id, alunos]);

  const alunosFiltrados = user?.role === 'professor' ? alunos.filter(a => a.professorId === professorId) : alunos;
  const treinosFiltrados = user?.role === 'professor'
    ? planosTreino.filter(t => alunosFiltrados.some(a => a.id === t.alunoId))
    : user?.role === 'aluno'
    ? planosTreino.filter(t => t.alunoId === alunoId)
    : planosTreino;

  const [alunoFilter, setAlunoFilter] = useState('');
  const treinosExibidos = user?.role === 'aluno'
    ? treinosFiltrados
    : alunoFilter ? treinosFiltrados.filter(t => t.alunoId === alunoFilter) : treinosFiltrados;

  const handleSave = () => {
    if (!form.nome.trim()) return alert('Nome é obrigatório');
    if (!form.alunoId) return alert('Selecione um aluno');
    if (editId) { updatePlanoTreino(editId, form); } else { addPlanoTreino(form); }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm(emptyTreino); }, 1200);
  };

  const addSessao = () => {
    const idx = form.sessoes.length;
    setForm(f => ({ ...f, sessoes: [...f.sessoes, { id: generateId(), nome: `Treino ${String.fromCharCode(65 + idx)}`, dia: 'Segunda-feira', exercicios: [] }] }));
  };

  const removeSessao = (sessaoId) => setForm(f => ({ ...f, sessoes: f.sessoes.filter(s => s.id !== sessaoId) }));

  const addExercicio = (sessaoId) => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: [...s.exercicios, emptyEx()] } : s) }));

  const updateExercicio = (sessaoId, exId, field, value) => setForm(f => ({
    ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? {
      ...s, exercicios: s.exercicios.map(e => e.id === exId ? { ...e, [field]: value } : e)
    } : s)
  }));

  const removeExercicio = (sessaoId, exId) => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: s.exercicios.filter(e => e.id !== exId) } : s) }));

  const addFromBiblioteca = (sessaoId, bEx) => {
    const novo = { id: generateId(), nome: bEx.nome, grupoMuscular: bEx.grupoMuscular, series: parseInt(bEx.series?.split('-')[0] || '3') || 3, repeticoes: bEx.repeticoes || '10-12', carga: 0, descanso: bEx.descanso || 60, tecnica: 'Normal', observacoes: bEx.dicas || '' };
    setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessaoId ? { ...s, exercicios: [...s.exercicios, novo] } : s) }));
  };

  const onDragEnd = (sessaoId, result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;
    setForm(f => ({
      ...f,
      sessoes: f.sessoes.map(s => {
        if (s.id !== sessaoId) return s;
        const exs = Array.from(s.exercicios);
        const [moved] = exs.splice(source.index, 1);
        exs.splice(destination.index, 0, moved);
        return { ...s, exercicios: exs };
      })
    }));
  };

  if (selectedTreino) {
    const treino = planosTreino.find(t => t.id === selectedTreino.id) || selectedTreino;
    const aluno = alunos.find(a => a.id === treino.alunoId);
    const gifMap = Object.fromEntries((exerciciosBiblioteca || []).filter(e => e.gifUrl).map(e => [e.nome?.toLowerCase(), e.gifUrl]));
    const totalExs = treino.sessoes?.reduce((a, s) => a + s.exercicios.length, 0) || 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedTreino(null)} className="p-2 rounded-xl hover:bg-white/5"><ChevronRight size={18} color="#9ca3af" className="rotate-180" /></button>
          <div className="flex-1"><h2 className="text-lg font-bold text-white">{treino.nome}</h2><p className="text-xs text-slate-500">{aluno?.nome} • {treino.nivel} • {treino.duracaoSemanas} semanas</p></div>
          <button onClick={() => gerarPDFTreino(treino, aluno)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
            <Download size={13} />PDF
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Sessões', value: treino.sessoes?.length || 0, color: '#f472b6' }, { label: 'Exercícios', value: totalExs, color: '#a78bfa' }, { label: 'Semanas', value: treino.duracaoSemanas, color: '#fbbf24' }].map(k => (
            <div key={k.label} className="p-3 rounded-xl text-center" style={{ background: `${k.color}10`, border: `1px solid ${k.color}25` }}>
              <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Modal GIF execução */}
        {gifModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}
            onClick={() => setGifModal(null)}>
            <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: '#0d1525', border: `1px solid ${gifModal.cor}40` }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
                <h3 className="font-bold text-white text-sm">{gifModal.nome}</h3>
                <button onClick={() => setGifModal(null)}><X size={18} color="#6b7280" /></button>
              </div>
              <img src={gifModal.gifUrl} alt={gifModal.nome} className="w-full object-contain" style={{ maxHeight: 280, background: '#0a0e1a' }} />
              <div className="p-4 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: `${gifModal.cor}20`, color: gifModal.cor }}>{gifModal.series}×{gifModal.repeticoes}</span>
                  {gifModal.carga > 0 && <span className="px-3 py-1.5 rounded-xl text-sm text-white" style={{ background: 'rgba(255,255,255,0.06)' }}>{gifModal.carga}kg</span>}
                  <span className="px-3 py-1.5 rounded-xl text-sm text-slate-400" style={{ background: 'rgba(255,255,255,0.04)' }}>⏱ {gifModal.descanso}s descanso</span>
                </div>
                {gifModal.execucao && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Execução</div>
                    <p className="text-xs text-slate-300 whitespace-pre-line">{gifModal.execucao}</p>
                  </div>
                )}
                {gifModal.dicas && (
                  <div className="px-3 py-2 rounded-xl text-xs text-yellow-300" style={{ background: '#fbbf2410', border: '1px solid #fbbf2420' }}>
                    💡 {gifModal.dicas}
                  </div>
                )}
                {gifModal.errosComuns && (
                  <div className="px-3 py-2 rounded-xl text-xs text-red-300" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                    ⚠️ {gifModal.errosComuns}
                  </div>
                )}
                {gifModal.observacoes && <p className="text-xs text-slate-500">📝 {gifModal.observacoes}</p>}
              </div>
            </div>
          </div>
        )}

        {treino.sessoes?.map((sessao, si) => {
          const cor = COR_SESSAO[si % COR_SESSAO.length];
          const collapsed = collapsedSessoes[sessao.id];
          return (
            <div key={sessao.id} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${cor}30` }}>
              <button onClick={() => setCollapsedSessoes(c => ({ ...c, [sessao.id]: !c[sessao.id] }))}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white" style={{ background: `${cor}25` }}>{String.fromCharCode(65 + si)}</div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">{sessao.nome}</div>
                  <div className="text-xs text-slate-500">{sessao.dia} • {sessao.exercicios.length} exercício{sessao.exercicios.length !== 1 ? 's' : ''}</div>
                </div>
                {collapsed ? <ChevronDown size={16} color="#6b7280" /> : <ChevronUp size={16} color="#6b7280" />}
              </button>
              {!collapsed && (
                <div className="px-4 pb-4 space-y-3">
                  {sessao.exercicios.map((ex, ei) => {
                    const gifUrl = ex.gifUrl || gifMap[ex.nome?.toLowerCase()];
                    const bibEx = (exerciciosBiblioteca || []).find(b => b.nome?.toLowerCase() === ex.nome?.toLowerCase());
                    return (
                    <div key={ex.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: `${cor}08`, border: `1px solid ${cor}15` }}>
                      {/* Thumbnail GIF pequeno — clica para expandir */}
                      <button
                        onClick={() => gifUrl && setGifModal({ nome: ex.nome, gifUrl, series: ex.series, repeticoes: ex.repeticoes, descanso: ex.descanso, carga: ex.carga, tecnica: ex.tecnica, observacoes: ex.observacoes, dicas: bibEx?.dicas, execucao: bibEx?.execucao, errosComuns: bibEx?.errosComuns, cor })}
                        className="flex-shrink-0 relative rounded-lg overflow-hidden"
                        style={{ width: 56, height: 56, background: gifUrl ? '#0a0e1a' : `${cor}15`, cursor: gifUrl ? 'pointer' : 'default' }}>
                        {gifUrl ? (
                          <>
                            <img src={gifUrl} alt={ex.nome} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)' }}>
                              <Play size={16} color="#fff" fill="#fff" />
                            </div>
                          </>
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-xl">💪</span>
                        )}
                      </button>
                      {/* Info do exercício */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${cor}25`, color: cor }}>{ei + 1}</span>
                          <span className="text-sm font-semibold text-white truncate">{ex.nome}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap text-xs">
                          <span className="px-2 py-0.5 rounded-lg font-bold" style={{ background: `${cor}20`, color: cor }}>{ex.series}×{ex.repeticoes}</span>
                          {ex.carga > 0 && <span className="px-2 py-0.5 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.06)' }}>{ex.carga}kg</span>}
                          <span className="px-2 py-0.5 rounded-lg text-slate-400" style={{ background: 'rgba(255,255,255,0.04)' }}>⏱ {ex.descanso}s</span>
                          {ex.tecnica && ex.tecnica !== 'Normal' && <span className="px-2 py-0.5 rounded-lg" style={{ background: `${cor}15`, color: cor }}>{ex.tecnica}</span>}
                        </div>
                        {ex.observacoes && <p className="text-xs text-slate-500 mt-1 truncate">📝 {ex.observacoes}</p>}
                      </div>
                    </div>
                  );})}
                  {sessao.exercicios.length === 0 && <p className="text-xs text-slate-600 text-center py-4">Nenhum exercício nesta sessão</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-white">Planos de Treino</h2><p className="text-xs text-slate-500">{treinosExibidos.length} plano(s)</p></div>
        {user?.role === 'professor' && (
          <button onClick={() => { setForm({ ...emptyTreino, alunoId: alunosFiltrados[0]?.id || '' }); setEditId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#f472b620', color: '#f472b6', border: '1px solid #f472b630' }}>
            <Plus size={14} />Criar Treino
          </button>
        )}
      </div>

      {user?.role !== 'aluno' && alunosFiltrados.length > 0 && (
        <select value={alunoFilter} onChange={e => setAlunoFilter(e.target.value)} className="px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <option value="">Todos os alunos</option>
          {alunosFiltrados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
      )}

      {treinosExibidos.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><Dumbbell size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum plano de treino criado</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {treinosExibidos.map((treino, i) => {
            const aluno = alunos.find(a => a.id === treino.alunoId);
            const totalExs = treino.sessoes?.reduce((a, s) => a + s.exercicios.length, 0) || 0;
            const colors = ['#f472b6', '#a78bfa', '#34d399', '#60a5fa', '#fb923c', '#fbbf24'];
            const color = colors[i % 6];
            return (
              <motion.div key={treino.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-5 rounded-2xl cursor-pointer hover:opacity-90 transition-all"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black mb-3" style={{ background: `${color}20`, color }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <h3 className="font-bold text-white mb-1">{treino.nome}</h3>
                <p className="text-xs text-slate-500 mb-3">{aluno?.nome} • {treino.nivel}</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{treino.sessoes?.length || 0} sessões</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{treino.duracaoSemanas} sem</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{totalExs} exerc</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedTreino(treino)} className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                    Ver Planilha
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); gerarPDFTreino(treino, aluno); }}
                    className="px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-all" title="Baixar PDF" style={{ color: '#34d399' }}>
                    <Download size={14} />
                  </button>
                  {user?.role !== 'admin' && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setForm({ ...treino, sessoes: treino.sessoes || [] }); setEditId(treino.id); setShowForm(true); }}
                        className="px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-all" style={{ color: '#fbbf24' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); const clone = { ...treino, id: undefined, nome: `${treino.nome} (cópia)`, sessoes: (treino.sessoes || []).map(s => ({ ...s, id: generateId(), exercicios: (s.exercicios || []).map(ex => ({ ...ex, id: generateId() })) })) }; addPlanoTreino(clone); }}
                        className="px-3 py-2 rounded-xl text-xs hover:bg-white/5 transition-all" title="Clonar treino" style={{ color: '#60a5fa' }}>
                        <Copy size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); if (confirm('Excluir este treino?')) deletePlanoTreino(treino.id); }}
                        className="px-3 py-2 rounded-xl text-xs hover:bg-red-500/10 transition-all" style={{ color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Novo Plano de Treino</h3>
              <button onClick={() => setShowForm(false)}><X size={18} color="#6b7280" /></button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Aluno</label>
                <select value={form.alunoId || ''} onChange={e => setForm(f => ({ ...f, alunoId: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">Selecionar aluno</option>
                  {alunosFiltrados.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-slate-400 block mb-1">Nome do Plano</label><input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Hipertrofia A/B/C" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Objetivo</label>
                  <select value={form.objetivo} onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Hipertrofia','Força','Emagrecimento','Condicionamento','Resistência'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nível</label>
                  <select value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Iniciante','Intermediário','Avançado'].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs text-slate-400 block mb-1">Duração (semanas)</label><input type="number" value={form.duracaoSemanas} onChange={e => setForm(f => ({ ...f, duracaoSemanas: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} /></div>
            </div>

            {/* Treino Padrão Automático */}
            {TREINO_TEMPLATES[form.nivel] && (
              <div className="mb-4 p-4 rounded-2xl" style={{ background: '#a78bfa08', border: '1px solid #a78bfa25' }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#a78bfa20' }}>
                    <Sparkles size={16} color="#a78bfa" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-0.5">Treino Padrão para {form.nivel}</div>
                    <div className="text-xs text-slate-400 mb-1">{TREINO_TEMPLATES[form.nivel].descricao}</div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#a78bfa15', color: '#a78bfa' }}>{TREINO_TEMPLATES[form.nivel].sessoes.length} sessões</span>
                      <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{TREINO_TEMPLATES[form.nivel].duracaoSemanas} semanas</span>
                      <span className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{TREINO_TEMPLATES[form.nivel].objetivo}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {TREINO_TEMPLATES[form.nivel].sessoes.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.06)' }}>{s.nome.split('—')[0].trim()}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const template = aplicarTemplate(form.nivel, form.alunoId);
                        if (template) setForm(f => ({ ...f, nome: template.nome, objetivo: template.objetivo, duracaoSemanas: template.duracaoSemanas, sessoes: template.sessoes }));
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff' }}>
                      <Sparkles size={12} />Aplicar Treino Padrão Automático
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sessões */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white text-sm">Sessões de Treino</h4>
                <button onClick={addSessao} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: '#f472b620', color: '#f472b6', border: '1px solid #f472b630' }}>
                  <Plus size={12} />Adicionar Sessão
                </button>
              </div>
              {form.sessoes.map((sessao, si) => {
                const cor = COR_SESSAO[si % COR_SESSAO.length];
                return (
                  <div key={sessao.id} className="mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${cor}30` }}>
                    <div className="flex items-center gap-2 p-3" style={{ background: `${cor}10` }}>
                      <span className="font-bold text-sm" style={{ color: cor }}>Sessão {String.fromCharCode(65 + si)}</span>
                      <input value={sessao.nome} onChange={e => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessao.id ? { ...s, nome: e.target.value } : s) }))}
                        className="flex-1 px-2 py-1 rounded-lg text-sm text-white outline-none" style={{ background: 'rgba(0,0,0,0.2)' }} />
                      <select value={sessao.dia} onChange={e => setForm(f => ({ ...f, sessoes: f.sessoes.map(s => s.id === sessao.id ? { ...s, dia: e.target.value } : s) }))}
                        className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Domingo'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <button onClick={() => removeSessao(sessao.id)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                    </div>
                    <DragDropContext onDragEnd={(result) => onDragEnd(sessao.id, result)}>
                    <div className="p-3 space-y-2">
                      <Droppable droppableId={sessao.id}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                            {sessao.exercicios.map((ex, ei) => (
                              <Draggable key={ex.id} draggableId={ex.id} index={ei}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex gap-2 items-start p-2 rounded-xl transition-shadow"
                                    style={{
                                      background: snapshot.isDragging ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                                      boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : undefined,
                                      ...provided.draggableProps.style
                                    }}>
                                    {/* Handle de arrastar */}
                                    <div {...provided.dragHandleProps} className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing" title="Arrastar para reordenar">
                                      <GripVertical size={14} color="#475569" />
                                    </div>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: `${cor}25`, color: cor }}>{ei + 1}</span>
                                    <div className="flex-1 grid grid-cols-2 gap-1">
                                      <input value={ex.nome} onChange={e => updateExercicio(sessao.id, ex.id, 'nome', e.target.value)} placeholder="Exercício" className="col-span-2 px-2 py-1 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                                      <input type="number" value={ex.series} onChange={e => updateExercicio(sessao.id, ex.id, 'series', parseInt(e.target.value) || 1)} placeholder="Séries" className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                                      <input value={ex.repeticoes} onChange={e => updateExercicio(sessao.id, ex.id, 'repeticoes', e.target.value)} placeholder="Reps" className="px-2 py-1 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                                    </div>
                                    <button onClick={() => removeExercicio(sessao.id, ex.id)} className="text-red-400 text-xs mt-1 flex-shrink-0"><X size={12} /></button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => addExercicio(sessao.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs" style={{ background: `${cor}10`, color: cor }}>
                          <Plus size={10} />Exercício
                        </button>
                        {(() => {
                          const all = exerciciosBiblioteca || [];
                          const bibDisponivel = user?.role === 'admin'
                            ? all
                            : all.filter(b => !b.professorId || b.professorId === 'system' || b.professorId === 'admin' || b.professorId === user?.id);
                          if (bibDisponivel.length === 0) return null;
                          const padrao = bibDisponivel.filter(b => !b.professorId || b.professorId === 'system' || b.professorId === 'admin');
                          const meus = bibDisponivel.filter(b => b.professorId === user?.id);
                          return (
                            <select onChange={e => { if (e.target.value) { const bEx = bibDisponivel.find(b => b.id === e.target.value); if (bEx) addFromBiblioteca(sessao.id, bEx); e.target.value = ''; }}}
                              className="flex-1 px-2 py-1 rounded-lg text-xs text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <option value="">+ Da biblioteca...</option>
                              {padrao.length > 0 && <optgroup label="📚 Biblioteca Padrão">{padrao.slice(0, 50).map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}</optgroup>}
                              {meus.length > 0 && <optgroup label="⭐ Meus Exercícios">{meus.slice(0, 50).map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}</optgroup>}
                            </select>
                          );
                        })()}
                      </div>
                    </div>
                    </DragDropContext>
                  </div>
                );
              })}
              {form.sessoes.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Clique em "Adicionar Sessão" para começar</p>}
            </div>

            <button onClick={handleSave} className="w-full py-3 rounded-xl font-semibold text-sm text-white" style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f472b6, #db2777)' }}>
              {saved ? '✓ Salvo!' : 'Salvar Plano de Treino'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}