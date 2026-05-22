import React, { useState, useEffect } from 'react';
import { X, Folder, FolderPlus, Check } from 'lucide-react';
import { useApp, useAuth } from '../../context/FitProContext';

const CARD = '#0d1525';

export default function SalvarEmPastaModal({ treino, onClose }) {
  const { addBibliotecaTreino } = useApp();
  const { user } = useAuth();

  const [pastas, setPastas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fitpro_bib_pastas') || '[]'); } catch { return []; }
  });
  const [pastaSelecionada, setPastaSelecionada] = useState('');
  const [novaPasta, setNovaPasta] = useState('');
  const [criandoNova, setCriandoNova] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const handleCriarPasta = () => {
    if (!novaPasta.trim()) return;
    if (pastas.includes(novaPasta.trim())) return alert('Já existe uma pasta com esse nome');
    const novas = [...pastas, novaPasta.trim()];
    setPastas(novas);
    localStorage.setItem('fitpro_bib_pastas', JSON.stringify(novas));
    setPastaSelecionada(novaPasta.trim());
    setNovaPasta('');
    setCriandoNova(false);
  };

  const handleSalvar = async () => {
    if (!pastaSelecionada) return alert('Selecione uma pasta');
    setSalvando(true);
    await addBibliotecaTreino({
      nome: treino.nome,
      descricao: treino.descricao || '',
      nivel: treino.nivel,
      objetivo: treino.objetivo,
      sessoes: treino.sessoes || [],
      pasta: pastaSelecionada,
      professorId: user?.id || '',
      alunoId: treino.alunoId,
      cor: '#a78bfa',
      origem: 'meus-treinos',
    });
    setSalvando(false);
    setSalvo(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm">Salvar em Treinos Personalizados</h3>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{treino.nome}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5"><X size={16} color="#6b7280" /></button>
        </div>

        {pastas.length === 0 && !criandoNova ? (
          <div className="text-center py-4 mb-4">
            <p className="text-xs text-slate-500 mb-3">Nenhuma pasta criada ainda</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {pastas.map(p => (
              <button key={p} onClick={() => setPastaSelecionada(p)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: pastaSelecionada === p ? '#a78bfa15' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${pastaSelecionada === p ? '#a78bfa40' : 'rgba(255,255,255,0.07)'}`,
                  color: pastaSelecionada === p ? '#a78bfa' : '#94a3b8'
                }}>
                <Folder size={14} />
                <span className="flex-1 text-left">{p}</span>
                {pastaSelecionada === p && <Check size={13} />}
              </button>
            ))}
          </div>
        )}

        {criandoNova ? (
          <div className="flex gap-2 mb-4">
            <input autoFocus value={novaPasta} onChange={e => setNovaPasta(e.target.value)}
              placeholder="Nome da nova pasta..."
              className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: '#1e2a3a', border: '1px solid #a78bfa40' }}
              onKeyDown={e => { if (e.key === 'Enter') handleCriarPasta(); if (e.key === 'Escape') setCriandoNova(false); }} />
            <button onClick={handleCriarPasta}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: '#a78bfa' }}>OK</button>
            <button onClick={() => { setCriandoNova(false); setNovaPasta(''); }}
              className="p-2 rounded-xl hover:bg-white/5"><X size={14} color="#6b7280" /></button>
          </div>
        ) : (
          <button onClick={() => setCriandoNova(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold mb-4 transition-all"
            style={{ background: '#a78bfa10', color: '#a78bfa', border: '1px solid #a78bfa25' }}>
            <FolderPlus size={13} />Nova Pasta
          </button>
        )}

        <button onClick={handleSalvar} disabled={salvando || salvo || !pastaSelecionada}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: salvo ? 'linear-gradient(135deg, #34d399, #059669)' : pastaSelecionada ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : '#374151',
            opacity: !pastaSelecionada ? 0.5 : 1
          }}>
          {salvo ? '✓ Salvo com sucesso!' : salvando ? '⏳ Salvando...' : 'Salvar na Pasta'}
        </button>
      </div>
    </div>
  );
}