import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadState, saveState, generateId, getCredentials, login as doLogin, logout as doLogout, getSession } from '../lib/fitpro-storage';

// ── App Context ──────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function FitProAppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    try { saveState(state); } catch (e) { console.warn('[FitPro] saveState:', e); }
  }, [state]);

  const addAluno = useCallback((aluno) => {
    const id = generateId();
    setState(s => ({ ...s, alunos: [...s.alunos, { ...aluno, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updateAluno = useCallback((id, aluno) => setState(s => ({ ...s, alunos: s.alunos.map(a => a.id === id ? { ...a, ...aluno } : a) })), []);
  const deleteAluno = useCallback((id) => setState(s => ({ ...s, alunos: s.alunos.filter(a => a.id !== id) })), []);

  const addProfessor = useCallback((prof) => {
    const id = generateId();
    setState(s => ({ ...s, professores: [...s.professores, { ...prof, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updateProfessor = useCallback((id, prof) => setState(s => ({ ...s, professores: s.professores.map(p => p.id === id ? { ...p, ...prof } : p) })), []);
  const deleteProfessor = useCallback((id) => setState(s => ({ ...s, professores: s.professores.filter(p => p.id !== id) })), []);

  const addAvaliacao = useCallback((av) => {
    const id = generateId();
    setState(s => ({ ...s, avaliacoes: [...s.avaliacoes, { ...av, id }] }));
    return id;
  }, []);
  const updateAvaliacao = useCallback((id, av) => setState(s => ({ ...s, avaliacoes: s.avaliacoes.map(a => a.id === id ? { ...a, ...av } : a) })), []);

  const addPlanoTreino = useCallback((plano) => {
    const id = generateId();
    const now = new Date().toISOString();
    setState(s => ({ ...s, planosTreino: [...s.planosTreino, { ...plano, id, createdAt: now, updatedAt: now }] }));
    return id;
  }, []);
  const updatePlanoTreino = useCallback((id, plano) => setState(s => ({ ...s, planosTreino: s.planosTreino.map(p => p.id === id ? { ...p, ...plano, updatedAt: new Date().toISOString() } : p) })), []);
  const deletePlanoTreino = useCallback((id) => setState(s => ({ ...s, planosTreino: s.planosTreino.filter(p => p.id !== id) })), []);

  const addPeriodizacao = useCallback((per) => {
    const id = generateId();
    setState(s => ({ ...s, periodizacoes: [...s.periodizacoes, { ...per, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updatePeriodizacao = useCallback((id, per) => setState(s => ({ ...s, periodizacoes: s.periodizacoes.map(p => p.id === id ? { ...p, ...per } : p) })), []);
  const deletePeriodizacao = useCallback((id) => setState(s => ({ ...s, periodizacoes: s.periodizacoes.filter(p => p.id !== id) })), []);

  const addEspecialista = useCallback((esp) => {
    const id = generateId();
    setState(s => ({ ...s, especialistas: [...s.especialistas, { ...esp, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updateEspecialista = useCallback((id, esp) => setState(s => ({ ...s, especialistas: s.especialistas.map(e => e.id === id ? { ...e, ...esp } : e) })), []);
  const deleteEspecialista = useCallback((id) => setState(s => ({ ...s, especialistas: s.especialistas.filter(e => e.id !== id) })), []);

  const addPastaTreino = useCallback((p) => {
    const id = generateId();
    setState(s => ({ ...s, pastasTreino: [...(s.pastasTreino || []), { ...p, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updatePastaTreino = useCallback((id, p) => setState(s => ({ ...s, pastasTreino: (s.pastasTreino || []).map(x => x.id === id ? { ...x, ...p } : x) })), []);
  const deletePastaTreino = useCallback((id) => setState(s => ({ ...s, pastasTreino: (s.pastasTreino || []).filter(x => x.id !== id), rotinasTreino: (s.rotinasTreino || []).filter(r => r.pastaId !== id) })), []);

  const addRotinaTreino = useCallback((r) => {
    const id = generateId();
    const now = new Date().toISOString();
    setState(s => ({ ...s, rotinasTreino: [...(s.rotinasTreino || []), { ...r, id, createdAt: now, updatedAt: now }] }));
    return id;
  }, []);
  const updateRotinaTreino = useCallback((id, r) => setState(s => ({ ...s, rotinasTreino: (s.rotinasTreino || []).map(x => x.id === id ? { ...x, ...r, updatedAt: new Date().toISOString() } : x) })), []);
  const deleteRotinaTreino = useCallback((id) => setState(s => ({ ...s, rotinasTreino: (s.rotinasTreino || []).filter(x => x.id !== id) })), []);

  const addExercicioBiblioteca = useCallback((ex) => {
    const id = generateId();
    const now = new Date().toISOString();
    setState(s => ({ ...s, exerciciosBiblioteca: [...(s.exerciciosBiblioteca || []), { ...ex, id, createdAt: now, updatedAt: now }] }));
    return id;
  }, []);
  const updateExercicioBiblioteca = useCallback((id, ex) => setState(s => ({ ...s, exerciciosBiblioteca: (s.exerciciosBiblioteca || []).map(e => e.id === id ? { ...e, ...ex, updatedAt: new Date().toISOString() } : e) })), []);
  const deleteExercicioBiblioteca = useCallback((id) => setState(s => ({ ...s, exerciciosBiblioteca: (s.exerciciosBiblioteca || []).filter(e => e.id !== id) })), []);

  const addTransacao = useCallback((t) => {
    const id = generateId();
    setState(s => ({ ...s, transacoes: [...(s.transacoes || []), { ...t, id, dataCriacao: new Date().toISOString() }] }));
    return id;
  }, []);

  const addProduto = useCallback((p) => {
    const id = generateId();
    const now = new Date().toISOString();
    setState(s => ({ ...s, produtos: [...(s.produtos || []), { ...p, id, createdAt: now, updatedAt: now }] }));
    return id;
  }, []);
  const updateProduto = useCallback((id, p) => setState(s => ({ ...s, produtos: (s.produtos || []).map(x => x.id === id ? { ...x, ...p, updatedAt: new Date().toISOString() } : x) })), []);
  const deleteProduto = useCallback((id) => setState(s => ({ ...s, produtos: (s.produtos || []).filter(x => x.id !== id) })), []);

  const addMensalidade = useCallback((m) => {
    const id = generateId();
    setState(s => ({ ...s, mensalidades: [...(s.mensalidades || []), { ...m, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updateMensalidade = useCallback((id, m) => setState(s => ({ ...s, mensalidades: (s.mensalidades || []).map(x => x.id === id ? { ...x, ...m, updatedAt: new Date().toISOString() } : x) })), []);
  const deleteMensalidade = useCallback((id) => setState(s => ({ ...s, mensalidades: (s.mensalidades || []).filter(x => x.id !== id) })), []);

  const addPlanoMensalidade = useCallback((p) => {
    const id = generateId();
    setState(s => ({ ...s, planosMensalidade: [...(s.planosMensalidade || []), { ...p, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updatePlanoMensalidade = useCallback((id, p) => setState(s => ({ ...s, planosMensalidade: (s.planosMensalidade || []).map(x => x.id === id ? { ...x, ...p } : x) })), []);
  const deletePlanoMensalidade = useCallback((id) => setState(s => ({ ...s, planosMensalidade: (s.planosMensalidade || []).filter(x => x.id !== id) })), []);

  const addPlanoDieta = useCallback((dieta) => {
    const id = generateId();
    setState(s => ({ ...s, planosDieta: [...(s.planosDieta || []), { ...dieta, id, createdAt: new Date().toISOString() }] }));
    return id;
  }, []);
  const updatePlanoDieta = useCallback((id, dieta) => setState(s => ({ ...s, planosDieta: (s.planosDieta || []).map(d => d.id === id ? { ...d, ...dieta } : d) })), []);

  const value = {
    ...state,
    addAluno, updateAluno, deleteAluno,
    addProfessor, updateProfessor, deleteProfessor,
    addAvaliacao, updateAvaliacao,
    addPlanoTreino, updatePlanoTreino, deletePlanoTreino,
    addPeriodizacao, updatePeriodizacao, deletePeriodizacao,
    addPlanoDieta, updatePlanoDieta,
    addEspecialista, updateEspecialista, deleteEspecialista,
    addPastaTreino, updatePastaTreino, deletePastaTreino,
    addRotinaTreino, updateRotinaTreino, deleteRotinaTreino,
    addExercicioBiblioteca, updateExercicioBiblioteca, deleteExercicioBiblioteca,
    addTransacao,
    addProduto, updateProduto, deleteProduto,
    addMensalidade, updateMensalidade, deleteMensalidade,
    addPlanoMensalidade, updatePlanoMensalidade, deletePlanoMensalidade,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within FitProAppProvider');
  return ctx;
}

// ── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function FitProAuthProvider({ children }) {
  const [user, setUser] = useState(getSession);

  const login = useCallback((email, password) => {
    const u = doLogin(email, password);
    if (u) { setUser(u); return true; }
    return false;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isProfessor: user?.role === 'professor',
    isAluno: user?.role === 'aluno',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within FitProAuthProvider');
  return ctx;
}