import React, { useState, useEffect } from 'react';
import { X, Folder, FolderOpen, FolderPlus, Check, ChevronRight, Dumbbell } from 'lucide-react';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials } from '../../lib/fitpro-storage';

const CARD = '#0d1225';
const BORDER = 'rgba(255,255,255,0.08)';

export default function SalvarEmPastaModal({ treino, onClose }) {
  const { addBibliotecaTreino } = useApp();
  const { user } = useAuth();

  const [professorId, setProfessorId] = useState('');
  const [pastasKey, setPastasKey] = useState('fitpro_bib_pastas');

  // Busca o linkedId correto do professor — igual ao BibliotecaTreinosView
  useEffect(() => {
    getCredentials().then(creds => {
      const mine = creds.find(c => c.id === user?.id);
      const pid = mine?.linkedId || user?.id || '';
      setProfessorId(pid);
      // Chave de pastas específica por professor para evitar conflitos
      setPastasKey(`fitpro_bib_pastas_${pid || 'default'}`);
    });
  }, [user?.id]);

  const [pastas, setPastas] = useState([]);

  // Recarrega pastas quando a chave muda
  useEffect(() => {
    if (!pastasKey) return;
    try {
      // Tenta também a chave global (compatibilidade com dados anteriores)
      const global = JSON.parse(localStorage.getItem('fitpro_bib_pastas') || '[]');
      const especifica = JSON.parse(localStorage.getItem(pastasKey) || '[]');
      // Mescla sem duplicatas
      const merged = [...new Set([...global, ...especifica])];
      setPastas(merged);
    } catch { setPastas([]); }
  }, [pastasKey]);

  const savePastas = (novas) => {
    setPastas(novas);
    localStorage.setItem(pastasKey, JSON.stringify(novas));
    // Sincroniza também a chave global para compatibilidade
    localStorage.setItem('fitpro_bib_pastas', JSON.stringify(novas));
  };

  const [pastaSelecionada, setPastaSelecionada] = useState(null);
  const [criandoNovaPasta, setCriandoNovaPasta] = useState(false);
  const [nomePasta, setNomePasta] = useState('Nova pasta');
  const [nomeEditavel, setNomeEditavel] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Cria nova pasta inline (estilo Windows)
  const handleCriarNovaPasta = () => {
    setNomePasta('Nova pasta');
    setCriandoNovaPasta(true);
    setPastaSelecionada('__nova__');
    setNomeEditavel(true);
  };

  const handleConfirmarNovaPasta = () => {
    const nome = nomePasta.trim() || 'Nova pasta';
    if (pastas.includes(nome)) {
      // Adiciona número se já existe
      let n = 2;
      while (pastas.includes(`${nome} (${n})`)) n++;
      const nomeUnico = `${nome} (${n})`;
      savePastas([...pastas, nomeUnico]);
      setPastaSelecionada(nomeUnico);
    } else {
      savePastas([...pastas, nome]);
      setPastaSelecionada(nome);
    }
    setCriandoNovaPasta(false);
    setNomeEditavel(false);
  };

  const handleSalvar = async () => {
    const pasta = pastaSelecionada === '__nova__' ? nomePasta.trim() || 'Nova pasta' : pastaSelecionada;
    if (!pasta) return;

    // Se ainda estava criando pasta, confirma primeiro
    if (criandoNovaPasta) {
      handleConfirmarNovaPasta();
    }

    setSalvando(true);
    await addBibliotecaTreino({
      nome: treino.nome,
      descricao: treino.descricao || '',
      nivel: treino.nivel,
      objetivo: treino.objetivo,
      sessoes: treino.sessoes || [],
      pasta: pasta,
      professorId: professorId || user?.id || '',
      alunoId: treino.alunoId,
      cor: '#a78bfa',
      origem: 'meus-treinos',
    });
    setSalvando(false);
    setSalvo(true);
    setTimeout(onClose, 1200);
  };

  const pastaNomeFinal = pastaSelecionada === '__nova__' ? nomePasta : pastaSelecionada;
  const podesSalvar = !!pastaSelecionada && (pastaSelecionada !== '__nova__' || nomePasta.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0d1525', border: `1px solid ${BORDER}`, boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ background: '#0a0f1e', borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#a78bfa20' }}>
              <FolderPlus size={16} color="#a78bfa" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Salvar em Treinos Personalizados</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                <Dumbbell size={10} className="inline mr-1 text-slate-500" />{treino.nome}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Breadcrumb / caminho */}
        <div className="flex items-center gap-1 px-5 py-2.5 text-xs text-slate-500"
          style={{ background: '#080d1a', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
          <Folder size={11} color="#a78bfa" />
          <span style={{ color: '#a78bfa' }}>Treinos Personalizados</span>
          {pastaNomeFinal && (
            <>
              <ChevronRight size={11} />
              <span className="text-white">{pastaNomeFinal}</span>
            </>
          )}
        </div>

        {/* Lista de pastas estilo Explorer */}
        <div className="p-3" style={{ minHeight: 200, maxHeight: 280, overflowY: 'auto' }}>
          {pastas.length === 0 && !criandoNovaPasta && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Folder size={32} className="mb-2 opacity-20 text-slate-400" />
              <p className="text-xs text-slate-500">Nenhuma pasta criada</p>
              <p className="text-xs text-slate-600">Clique em "Nova Pasta" abaixo</p>
            </div>
          )}

          {pastas.map(p => (
            <button key={p}
              onClick={() => { setPastaSelecionada(p); setCriandoNovaPasta(false); }}
              onDoubleClick={() => { setPastaSelecionada(p); handleSalvar(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left group"
              style={{
                background: pastaSelecionada === p ? '#a78bfa20' : 'transparent',
                border: `1px solid ${pastaSelecionada === p ? '#a78bfa35' : 'transparent'}`,
              }}>
              {pastaSelecionada === p
                ? <FolderOpen size={18} color="#a78bfa" />
                : <Folder size={18} color="#64748b" className="group-hover:text-slate-300" />}
              <span className={pastaSelecionada === p ? 'text-white font-semibold' : 'text-slate-400'}>{p}</span>
              {pastaSelecionada === p && <Check size={13} color="#a78bfa" className="ml-auto" />}
            </button>
          ))}

          {/* Linha de nova pasta em criação inline */}
          {criandoNovaPasta && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
              style={{ background: '#a78bfa20', border: '1px solid #a78bfa35' }}>
              <FolderOpen size={18} color="#a78bfa" />
              <input
                autoFocus
                value={nomePasta}
                onChange={e => setNomePasta(e.target.value)}
                onFocus={e => e.target.select()}
                onBlur={handleConfirmarNovaPasta}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirmarNovaPasta();
                  if (e.key === 'Escape') { setCriandoNovaPasta(false); setPastaSelecionada(null); }
                }}
                className="flex-1 text-sm text-white outline-none font-semibold bg-transparent"
                style={{ borderBottom: '1px solid #a78bfa60' }}
              />
            </div>
          )}
        </div>

        {/* Footer com ações */}
        <div className="flex items-center justify-between px-5 py-4 gap-3"
          style={{ borderTop: `1px solid ${BORDER}`, background: '#0a0f1e' }}>
          <button onClick={handleCriarNovaPasta}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: '#a78bfa12', color: '#a78bfa', border: '1px solid #a78bfa25' }}>
            <FolderPlus size={13} />Nova Pasta
          </button>

          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancelar
            </button>
            <button onClick={handleSalvar}
              disabled={!podesSalvar || salvando || salvo}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{
                background: salvo
                  ? 'linear-gradient(135deg, #34d399, #059669)'
                  : podesSalvar
                    ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
                    : '#374151',
                opacity: !podesSalvar ? 0.5 : 1,
                cursor: !podesSalvar ? 'not-allowed' : 'pointer'
              }}>
              {salvo ? '✓ Salvo!' : salvando ? '⏳ Salvando...' : 'Salvar aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}