import React, { useState, useRef } from 'react';
import { BookOpen, Plus, X, Trash2, Edit2, Search, ImagePlus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { useApp, useAuth } from '../../context/FitProContext';
import { generateId } from '../../lib/fitpro-storage';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

const GRUPOS = ['Peito', 'Costas', 'Quadríceps', 'Posterior de Coxa', 'Glúteos', 'Ombros', 'Bíceps', 'Tríceps', 'Core', 'Panturrilha', 'Antebraço', 'Cardio', 'Funcional'];
const TIPOS = ['Força', 'Hipertrofia', 'Resistência', 'Cardio', 'Funcional', 'Flexibilidade'];
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const EQUIPAMENTOS = ['Sem equipamento', 'Barra', 'Halteres', 'Cabo', 'Máquina', 'Elástico', 'TRX', 'Kettlebell'];

const GROUP_COLORS = {
  'Peito': '#f472b6', 'Costas': '#60a5fa', 'Quadríceps': '#34d399', 'Posterior de Coxa': '#fbbf24',
  'Glúteos': '#a78bfa', 'Ombros': '#fb923c', 'Bíceps': '#34d399', 'Tríceps': '#60a5fa',
  'Core': '#f472b6', 'Panturrilha': '#fbbf24', 'Antebraço': '#a78bfa', 'Cardio': '#ef4444', 'Funcional': '#00d4ff',
};

function emptyEx() {
  return {
    nome: '', grupoMuscular: 'Peito', musculosSecundarios: [], tipo: 'Força', nivel: 'Intermediário',
    equipamento: 'Barra', descricao: '', execucao: '', dicas: '', errosComuns: '',
    series: '3-4', repeticoes: '10-12', descanso: 75, videoUrl: '', gifUrl: '', publico: true,
  };
}

export default function BibliotecaView() {
  const { exerciciosBiblioteca, addExercicioBiblioteca, updateExercicioBiblioteca, deleteExercicioBiblioteca } = useApp();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyEx());
  const [saved, setSaved] = useState(false);
  const [selectedEx, setSelectedEx] = useState(null);
  const [uploadingGif, setUploadingGif] = useState(false);
  const gifInputRef = useRef(null);

  const handleGifUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes('gif') && !file.type.includes('image')) return alert('Selecione um arquivo de imagem ou GIF.');
    setUploadingGif(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, gifUrl: file_url }));
    setUploadingGif(false);
  };

  const exercicios = exerciciosBiblioteca || [];
  const filtered = exercicios.filter(e => {
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase()) || (e.grupoMuscular || '').toLowerCase().includes(search.toLowerCase());
    const matchGrupo = !filtroGrupo || e.grupoMuscular === filtroGrupo;
    const matchNivel = !filtroNivel || e.nivel === filtroNivel;
    return matchSearch && matchGrupo && matchNivel;
  });

  const handleSave = () => {
    if (!form.nome.trim()) return alert('Nome é obrigatório');
    const data = { ...form, professorId: user?.id || 'system', updatedAt: new Date().toISOString() };
    if (editId) updateExercicioBiblioteca(editId, data);
    else addExercicioBiblioteca({ ...data, createdAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm(emptyEx()); }, 1200);
  };

  if (selectedEx) {
    const ex = exercicios.find(e => e.id === selectedEx.id) || selectedEx;
    const color = GROUP_COLORS[ex.grupoMuscular] || '#64748b';
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedEx(null)} className="p-2 rounded-xl hover:bg-white/5">
            <BookOpen size={18} color="#9ca3af" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{ex.nome}</h2>
            <p className="text-xs text-slate-500">{ex.grupoMuscular} • {ex.nivel} • {ex.equipamento}</p>
          </div>
          <button onClick={() => { setForm({ ...ex }); setEditId(ex.id); setSelectedEx(null); setShowForm(true); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
            <Edit2 size={12} className="inline mr-1" />Editar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Séries', value: ex.series, color: '#f472b6' },
            { label: 'Repetições', value: ex.repeticoes, color: '#a78bfa' },
            { label: 'Descanso', value: `${ex.descanso}s`, color: '#60a5fa' },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-xl text-center" style={{ background: `${k.color}10`, border: `1px solid ${k.color}25` }}>
              <div className="text-lg font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${color}15`, color }}>{ex.grupoMuscular}</span>
            <span className="text-xs px-2 py-1 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{ex.tipo}</span>
            <span className="text-xs px-2 py-1 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{ex.equipamento}</span>
            <span className="text-xs px-2 py-1 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>{ex.nivel}</span>
          </div>
          {ex.descricao && <div><h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Descrição</h4><p className="text-sm text-slate-300">{ex.descricao}</p></div>}
          {ex.execucao && <div><h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Execução</h4><p className="text-sm text-slate-300 whitespace-pre-line">{ex.execucao}</p></div>}
          {ex.dicas && <div><h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">💡 Dicas</h4><p className="text-sm text-slate-300">{ex.dicas}</p></div>}
          {ex.errosComuns && <div><h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">⚠️ Erros Comuns</h4><p className="text-sm text-slate-300">{ex.errosComuns}</p></div>}
          {ex.gifUrl && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Demonstração</h4>
              <img src={ex.gifUrl} alt="Demonstração do exercício" className="w-full max-h-64 object-contain rounded-xl" style={{ background: '#0a0e1a' }} />
            </div>
          )}
          {ex.videoUrl && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Vídeo</h4>
              <a href={ex.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 underline">{ex.videoUrl}</a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen size={20} color="#f472b6" />Biblioteca de Exercícios</h2>
          <p className="text-xs text-slate-500">{filtered.length} exercício(s)</p>
        </div>
        <button onClick={() => { setForm(emptyEx()); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#f472b620', color: '#f472b6', border: '1px solid #f472b630' }}>
          <Plus size={14} />Novo Exercício
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar exercício..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <select value={filtroGrupo} onChange={e => setFiltroGrupo(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <option value="">Todos grupos</option>
          {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
          <option value="">Todos níveis</option>
          {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Grupos pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFiltroGrupo('')}
          className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0"
          style={{ background: !filtroGrupo ? '#f472b620' : 'rgba(255,255,255,0.03)', color: !filtroGrupo ? '#f472b6' : '#64748b', border: !filtroGrupo ? '1px solid #f472b630' : '1px solid rgba(255,255,255,0.06)' }}>
          Todos
        </button>
        {GRUPOS.filter(g => exercicios.some(e => e.grupoMuscular === g)).map(g => {
          const color = GROUP_COLORS[g] || '#64748b';
          return (
            <button key={g} onClick={() => setFiltroGrupo(filtroGrupo === g ? '' : g)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
              style={{ background: filtroGrupo === g ? `${color}20` : 'rgba(255,255,255,0.03)', color: filtroGrupo === g ? color : '#64748b', border: filtroGrupo === g ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.06)' }}>
              {g}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><BookOpen size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum exercício encontrado</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((ex, i) => {
            const color = GROUP_COLORS[ex.grupoMuscular] || '#64748b';
            return (
              <motion.div key={ex.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-2xl hover:opacity-90 transition-all cursor-pointer"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                onClick={() => setSelectedEx(ex)}>
                {ex.gifUrl && (
                  <img src={ex.gifUrl} alt={ex.nome} className="w-full h-36 object-contain rounded-xl mb-3" style={{ background: '#0a0e1a' }} />
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white text-sm">{ex.nome}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: `${color}15`, color }}>{ex.grupoMuscular}</span>
                  </div>
                  {user?.role !== 'aluno' && (
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setForm({ ...ex }); setEditId(ex.id); setSelectedEx(null); setShowForm(true); }}
                        className="p-1 rounded-lg hover:bg-white/5 transition-all" style={{ color: '#94a3b8' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); if (confirm('Excluir?')) deleteExercicioBiblioteca(ex.id); }}
                        className="p-1 rounded-lg hover:bg-red-500/10 transition-all" style={{ color: '#ef4444' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 text-xs text-slate-500 flex-wrap">
                  <span>{ex.equipamento}</span>
                  <span>•</span>
                  <span>{ex.nivel}</span>
                  <span>•</span>
                  <span style={{ color }}>{ex.series}×{ex.repeticoes}</span>
                </div>
                {ex.descricao && <p className="text-xs text-slate-600 mt-2 line-clamp-2">{ex.descricao}</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-xl rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">{editId ? 'Editar' : 'Novo'} Exercício</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome do Exercício</label>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Supino Reto com Barra"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Grupo Muscular</label>
                  <select value={form.grupoMuscular} onChange={e => setForm(f => ({ ...f, grupoMuscular: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Equipamento</label>
                  <select value={form.equipamento} onChange={e => setForm(f => ({ ...f, equipamento: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {EQUIPAMENTOS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nível</label>
                  <select value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Séries</label>
                  <input value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))} placeholder="3-4"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Repetições</label>
                  <input value={form.repeticoes} onChange={e => setForm(f => ({ ...f, repeticoes: e.target.value }))} placeholder="10-12"
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descanso (segundos)</label>
                <input type="number" value={form.descanso} onChange={e => setForm(f => ({ ...f, descanso: parseInt(e.target.value) || 60 }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Execução (passo a passo)</label>
                <textarea value={form.execucao} onChange={e => setForm(f => ({ ...f, execucao: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dicas</label>
                  <textarea value={form.dicas} onChange={e => setForm(f => ({ ...f, dicas: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Erros Comuns</label>
                  <textarea value={form.errosComuns} onChange={e => setForm(f => ({ ...f, errosComuns: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">URL do Vídeo (opcional)</label>
                <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">GIF do Exercício (opcional)</label>
                <input ref={gifInputRef} type="file" accept="image/gif,image/*" className="hidden" onChange={handleGifUpload} />
                {form.gifUrl ? (
                  <div className="relative">
                    <img src={form.gifUrl} alt="GIF do exercício" className="w-full max-h-48 object-contain rounded-xl" style={{ background: '#1e2a3a' }} />
                    <button onClick={() => setForm(f => ({ ...f, gifUrl: '' }))}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 hover:bg-red-500">
                      <X size={12} color="#fff" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => gifInputRef.current?.click()} disabled={uploadingGif}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
                    style={{ background: '#1e2a3a', border: '1px dashed rgba(255,255,255,0.15)', color: '#64748b' }}>
                    {uploadingGif ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                    {uploadingGif ? 'Enviando...' : 'Clique para anexar imagem/GIF'}
                  </button>
                )}
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f472b6, #db2777)' }}>
              {saved ? '✓ Salvo!' : `${editId ? 'Salvar' : 'Cadastrar'} Exercício`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}