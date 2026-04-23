import React, { useState } from 'react';
import { UserCheck, Plus, X, Trash2, Edit2, ChevronRight, Search, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/FitProContext';
import { getCredentials, addCredential, deleteCredential } from '../../lib/fitpro-storage';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

const emptyForm = {
  nome: '', email: '', telefone: '', cref: '', especialidade: '',
  endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' }
};

export default function ProfessoresView() {
  const { professores, alunos, avaliacoes, planosTreino, addProfessor, updateProfessor, deleteProfessor } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);

  const filtered = professores.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.nome.trim()) return alert('Nome é obrigatório');
    if (editId) {
      updateProfessor(editId, form);
    } else {
      const profId = addProfessor(form);
      if (form.email && form.senha) {
        addCredential({ email: form.email, password: form.senha, role: 'professor', nome: form.nome, linkedId: profId, ativo: true, autoRegistrado: false });
      }
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm(emptyForm); }, 1200);
  };

  if (selectedProf) {
    const prof = professores.find(p => p.id === selectedProf.id) || selectedProf;
    const meusAlunos = alunos.filter(a => a.professorId === prof.id);
    const avsTotal = avaliacoes.filter(av => meusAlunos.some(a => a.id === av.alunoId)).length;
    const treinosTotal = planosTreino.filter(t => meusAlunos.some(a => a.id === t.alunoId)).length;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedProf(null)} className="p-2 rounded-xl hover:bg-white/5">
            <ChevronRight size={18} color="#9ca3af" className="rotate-180" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{prof.nome}</h2>
            <p className="text-xs text-slate-500">{prof.especialidade} {prof.cref ? `• CREF: ${prof.cref}` : ''}</p>
          </div>
          <button onClick={() => { setForm({ ...prof }); setEditId(prof.id); setShowForm(true); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
            <Edit2 size={12} className="inline mr-1" />Editar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Alunos', value: meusAlunos.length, color: '#a78bfa' },
            { label: 'Avaliações', value: avsTotal, color: '#fb923c' },
            { label: 'Treinos', value: treinosTotal, color: '#f472b6' },
          ].map(k => (
            <div key={k.label} className="p-3 rounded-xl text-center" style={{ background: `${k.color}10`, border: `1px solid ${k.color}25` }}>
              <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contato</h4>
          <div className="space-y-2">
            {prof.email && <div className="flex items-center gap-2 text-sm text-slate-300"><Mail size={14} color="#64748b" />{prof.email}</div>}
            {prof.telefone && <div className="flex items-center gap-2 text-sm text-slate-300"><Phone size={14} color="#64748b" />{prof.telefone}</div>}
          </div>
        </div>

        {meusAlunos.length > 0 && (
          <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <h4 className="font-semibold text-white mb-3">Alunos ({meusAlunos.length})</h4>
            <div className="space-y-2">
              {meusAlunos.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: ['#a78bfa','#34d399','#60a5fa'][i%3] + '30' }}>{a.nome.charAt(0)}</div>
                  <div className="flex-1"><div className="text-sm text-white">{a.nome}</div><div className="text-xs text-slate-500">{a.objetivo}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserCheck size={20} color="#34d399" />Professores</h2>
          <p className="text-xs text-slate-500">{filtered.length} professor(es)</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
          <Plus size={14} />Novo Professor
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar professor..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
          style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><UserCheck size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum professor cadastrado</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((prof, i) => {
            const meusAlunos = alunos.filter(a => a.professorId === prof.id);
            const colors = ['#34d399','#60a5fa','#a78bfa','#fb923c','#f472b6'];
            const color = colors[i % 5];
            return (
              <motion.div key={prof.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-5 rounded-2xl cursor-pointer hover:opacity-90 transition-all"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                    style={{ background: `${color}25` }}>{prof.nome.charAt(0)}</div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{prof.nome}</div>
                    <div className="text-xs text-slate-400">{prof.especialidade} {prof.cref ? `• ${prof.cref}` : ''}</div>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  {[{ label: 'Alunos', value: meusAlunos.length, color }].map(s => (
                    <div key={s.label} className="flex-1 p-2 rounded-xl text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                      <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedProf(prof)} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>Ver Perfil</button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm('Excluir este professor?')) deleteProfessor(prof.id); }}
                    className="px-3 py-2 rounded-xl text-xs hover:bg-red-500/10" style={{ color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 my-4" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">{editId ? 'Editar' : 'Novo'} Professor</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }}><X size={18} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nome', field: 'nome', placeholder: 'Nome completo' },
                { label: 'Email', field: 'email', placeholder: 'email@exemplo.com' },
                { label: 'Telefone', field: 'telefone', placeholder: '(11) 99999-9999' },
                { label: 'CREF', field: 'cref', placeholder: '000000-G/SP' },
              ].map(f => (
                <div key={f.field}>
                  <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                  <input value={form[f.field] || ''} onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                    placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Especialidade</label>
                <select value={form.especialidade || ''} onChange={e => setForm(p => ({ ...p, especialidade: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="">Selecionar</option>
                  {['Musculação','Personal Trainer','Funcional','CrossFit','Pilates','Avaliação Física'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              {!editId && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Senha de acesso (opcional)</label>
                  <input type="password" value={form.senha || ''} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                    placeholder="Deixe vazio para não criar acesso" className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              )}
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #34d399, #059669)' }}>
              {saved ? '✓ Salvo!' : `${editId ? 'Salvar' : 'Cadastrar'} Professor`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}