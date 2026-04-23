import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCheck, Stethoscope, BookOpen,
  Menu, X, Zap, LogOut, Shield, Settings, BarChart2, DollarSign,
  ShoppingBag, ClipboardList, Activity, Dumbbell, Calendar,
  ChevronRight, TrendingUp, Heart, Award, Target, Flame,
  AlertCircle, Clock, Plus, Share2, Copy, CheckCircle2,
  Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Link2, ArrowUpRight,
  Star, Bell
} from 'lucide-react';

// ─── Color theme (dark navy like original) ───────────────────────────────────
const BG = '#0a0e1a';
const CARD = '#0d1525';
const CARD2 = '#111827';
const BORDER = 'rgba(255,255,255,0.07)';

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockAlunos = [
  { id: 'a1', nome: 'Lucas Ferreira', objetivo: 'Hipertrofia', peso: 78, altura: 178, professorId: 'p1', dataNascimento: '1995-03-15' },
  { id: 'a2', nome: 'Mariana Costa', objetivo: 'Emagrecimento', peso: 62, altura: 165, professorId: 'p1', dataNascimento: '1998-07-22' },
  { id: 'a3', nome: 'Pedro Alves', objetivo: 'Condicionamento', peso: 85, altura: 182, professorId: 'p1', dataNascimento: '1992-11-08' },
  { id: 'a4', nome: 'Ana Lima', objetivo: 'Saúde', peso: 58, altura: 162, professorId: 'p2', dataNascimento: '2000-01-30' },
  { id: 'a5', nome: 'Carlos Souza', objetivo: 'Performance', peso: 90, altura: 185, professorId: 'p2', dataNascimento: '1990-05-12' },
];

const mockProfessores = [
  { id: 'p1', nome: 'Dr. Rafael Santos', especialidade: 'Musculação', cref: 'CREF 12345-G/SP' },
  { id: 'p2', nome: 'Prof. Camila Nunes', especialidade: 'Funcional', cref: 'CREF 54321-G/SP' },
];

const mockAvaliacoes = [
  { id: 'av1', alunoId: 'a1', data: '2026-04-15', percentualGordura: 14.2, massaMagra: 66.9, imc: 24.6, classificacaoGordura: 'Ótimo' },
  { id: 'av2', alunoId: 'a2', data: '2026-04-10', percentualGordura: 22.1, massaMagra: 48.3, imc: 22.8, classificacaoGordura: 'Bom' },
  { id: 'av3', alunoId: 'a3', data: '2026-04-08', percentualGordura: 18.5, massaMagra: 69.3, imc: 25.7, classificacaoGordura: 'Regular' },
  { id: 'av4', alunoId: 'a1', data: '2026-03-01', percentualGordura: 16.8, massaMagra: 64.9, imc: 24.1, classificacaoGordura: 'Bom' },
  { id: 'av5', alunoId: 'a1', data: '2026-02-01', percentualGordura: 19.2, massaMagra: 63.1, imc: 23.8, classificacaoGordura: 'Regular' },
];

const mockTreinos = [
  { id: 't1', alunoId: 'a1', nome: 'Hipertrofia A/B/C', nivel: 'Intermediário', sessoes: [{}, {}, {}] },
  { id: 't2', alunoId: 'a2', nome: 'Emagrecimento Funcional', nivel: 'Iniciante', sessoes: [{}, {}] },
  { id: 't3', alunoId: 'a3', nome: 'Condicionamento Full', nivel: 'Avançado', sessoes: [{}, {}, {}, {}] },
];

const mockEspecialistas = [
  { id: 'e1', nome: 'Dra. Juliana Mello', especialidade: 'Nutricionista', parceiro: true, valorConsulta: 180 },
  { id: 'e2', nome: 'Dr. Marcos Lima', especialidade: 'Fisioterapeuta', parceiro: true, valorConsulta: 150 },
  { id: 'e3', nome: 'Dra. Patrícia Rosa', especialidade: 'Psicólogo', parceiro: false, valorConsulta: 200 },
];

// ─── Sidebar content per role ─────────────────────────────────────────────────
const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', color: '#00d4ff', view: 'dashboard' },
  { icon: Users, label: 'Alunos', color: '#a78bfa', view: 'alunos' },
  { icon: UserCheck, label: 'Professores', color: '#34d399', view: 'professores' },
  { icon: Stethoscope, label: 'Especialistas', color: '#60a5fa', view: 'especialistas' },
  { icon: BookOpen, label: 'Biblioteca', color: '#f472b6', view: 'biblioteca' },
  { icon: ShoppingBag, label: 'Produtos', color: '#fb923c', view: 'produtos' },
  { icon: ClipboardList, label: 'Pedidos', color: '#f472b6', view: 'pedidos' },
  { icon: BarChart2, label: 'Relatórios', color: '#fbbf24', view: 'relatorios' },
  { icon: DollarSign, label: 'Financeiro', color: '#34d399', view: 'financeiro' },
  { icon: Settings, label: 'Usuários', color: '#e879f9', view: 'usuarios' },
];

const professorNav = [
  { icon: LayoutDashboard, label: 'Dashboard', color: '#00d4ff', view: 'dashboard' },
  { icon: Users, label: 'Meus Alunos', color: '#a78bfa', view: 'alunos' },
  { icon: Activity, label: 'Avaliações', color: '#fb923c', view: 'avaliacoes' },
  { icon: Dumbbell, label: 'Treinos', color: '#f472b6', view: 'treinos' },
  { icon: Calendar, label: 'Periodização', color: '#fbbf24', view: 'periodizacao' },
  { icon: Stethoscope, label: 'Parceiros', color: '#34d399', view: 'parceiros' },
  { icon: DollarSign, label: 'Financeiro', color: '#60a5fa', view: 'financeiro' },
];

const alunoNav = [
  { icon: LayoutDashboard, label: 'Dashboard', color: '#00d4ff', view: 'dashboard' },
  { icon: Activity, label: 'Minhas Avaliações', color: '#fb923c', view: 'avaliacoes' },
  { icon: Dumbbell, label: 'Meus Treinos', color: '#f472b6', view: 'treinos' },
  { icon: TrendingUp, label: 'Minha Evolução', color: '#fbbf24', view: 'evolucao' },
  { icon: Stethoscope, label: 'Serviços Parceiros', color: '#60a5fa', view: 'servicos' },
];

// ─── Components ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </motion.div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { role: 'Admin', email: 'admin@fitpro.com', password: 'admin123', icon: Shield, color: '#00d4ff', desc: 'Acesso total' },
    { role: 'Professor', email: 'professor@fitpro.com', password: 'prof123', icon: UserCheck, color: '#34d399', desc: 'Gestão de alunos' },
    { role: 'Aluno', email: 'aluno@fitpro.com', password: 'aluno123', icon: Users, color: '#a78bfa', desc: 'Minha área' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const found = demoAccounts.find(a => a.email === email && a.password === password);
    if (found) {
      onLogin(found.role.toLowerCase());
    } else {
      setError('Email ou senha incorretos. Use as credenciais demo abaixo.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: BG }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1525 0%, #0a1628 100%)', borderRight: `1px solid ${BORDER}` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
          <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#00d4ff20', border: '1px solid #00d4ff30' }}>
            <Zap size={20} color="#00d4ff" />
          </div>
          <span className="font-bold text-white">FitPro</span>
          <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: '#00d4ff15', color: '#00d4ff', border: '1px solid #00d4ff25' }}>Assessment Platform</span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-6">
            Transforme <span style={{ color: '#00d4ff' }}>Resultados</span> em Dados Reais
          </h1>
          <p className="text-slate-400 mb-8">Plataforma completa de avaliação física, treinos personalizados e especialidades.</p>
          <div className="space-y-3">
            {[
              { icon: '📊', text: 'Avaliação por dobras cutâneas (Jackson & Pollock)' },
              { icon: '💪', text: 'Planilhas de treino animadas e personalizadas' },
              { icon: '📅', text: 'Periodização com linha do tempo de evolução' },
              { icon: '🏥', text: 'Rede de especialistas de saúde parceiros' },
              { icon: '📈', text: 'Dashboard de performance e evolução corporal' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">FitPro Assessment System v2.0 © 2025</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Zap size={20} color="#00d4ff" />
            <span className="font-bold text-white text-lg">FitPro</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h2>
          <p className="text-slate-400 text-sm mb-6">Faça login para acessar sua área</p>

          {/* Demo shortcuts */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-3">Acesso rápido (demo):</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.role}
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                  className="p-3 rounded-xl text-center transition-all hover:scale-105 cursor-pointer"
                  style={{ background: `${acc.color}10`, border: `1px solid ${acc.color}25` }}>
                  <acc.icon size={16} color={acc.color} className="mx-auto mb-1" />
                  <div className="text-xs font-semibold text-white">{acc.role}</div>
                  <div className="text-xs" style={{ color: acc.color }}>{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <div className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)', color: '#fff' }}>
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={16} />Entrar na Plataforma</>}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: '#111827', border: `1px solid ${BORDER}` }}>
            <p className="text-xs text-slate-500 mb-2">Credenciais de demonstração</p>
            {demoAccounts.map(acc => (
              <div key={acc.role} className="flex items-center gap-2 text-xs mb-1">
                <span className="font-semibold" style={{ color: acc.color }}>{acc.role}</span>
                <span className="text-slate-400">{acc.email} / {acc.password}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ navItems, activeView, onNav, role, userName, onLogout, isMobile, onClose }) {
  const roleColor = role === 'admin' ? '#00d4ff' : role === 'professor' ? '#34d399' : '#a78bfa';
  const roleLabel = role === 'admin' ? 'Administrador' : role === 'professor' ? 'Professor' : 'Aluno';
  const roleIcon = role === 'admin' ? Shield : role === 'professor' ? UserCheck : Users;
  const RoleIcon = roleIcon;

  return (
    <div className="flex flex-col h-full" style={{ background: '#080d1a', borderRight: `1px solid ${BORDER}` }}>
      {/* Logo */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#00d4ff20', border: '1px solid #00d4ff30' }}>
            <Zap size={16} color="#00d4ff" />
          </div>
          <span className="font-bold text-white text-sm">FitPro</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}25` }}>
            {roleLabel}
          </span>
        </div>
        {isMobile && <button onClick={onClose}><X size={18} color="#6b7280" /></button>}
      </div>

      {/* User */}
      <div className="p-4 mx-3 mt-3 rounded-xl" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `${roleColor}25` }}>
            {userName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{userName}</div>
            <div className="text-xs flex items-center gap-1" style={{ color: roleColor }}>
              <RoleIcon size={10} />{roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <button key={item.view} onClick={() => { onNav(item.view); if (isMobile) onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                background: active ? `${item.color}15` : 'transparent',
                color: active ? item.color : '#6b7280',
                border: `1px solid ${active ? item.color + '25' : 'transparent'}`,
              }}>
              <Icon size={16} />
              {item.label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 transition-all">
          <LogOut size={16} />Sair da conta
        </button>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const parceiros = mockEspecialistas.filter(e => e.parceiro).length;

  const professoresRanking = mockProfessores.map(p => ({
    ...p,
    totalAlunos: mockAlunos.filter(a => a.professorId === p.id).length,
    totalAvaliacoes: mockAvaliacoes.filter(av => mockAlunos.find(a => a.id === av.alunoId && a.professorId === p.id)).length,
  })).sort((a, b) => b.totalAlunos - a.totalAlunos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-slate-400 text-sm mt-1">Olá, Administrador 👋</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Alunos" value={mockAlunos.length} icon={Users} color="#a78bfa" sub="na plataforma" />
        <StatCard label="Professores" value={mockProfessores.length} icon={UserCheck} color="#34d399" sub="ativos" />
        <StatCard label="Especialistas" value={mockEspecialistas.length} icon={Stethoscope} color="#60a5fa" sub={`${parceiros} parceiros`} />
        <StatCard label="Avaliações" value={mockAvaliacoes.length} icon={Activity} color="#fbbf24" sub="realizadas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ranking professores */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Desempenho por Professor</h3>
            <span className="text-xs text-slate-500">Ver relatórios →</span>
          </div>
          <div className="space-y-3">
            {professoresRanking.map((prof, i) => {
              const pct = mockAlunos.length > 0 ? Math.round((prof.totalAlunos / mockAlunos.length) * 100) : 0;
              const colors = ['#a78bfa', '#34d399', '#60a5fa'];
              return (
                <div key={prof.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: `${colors[i]}20`, color: colors[i] }}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white font-medium">{prof.nome}</span>
                      <span className="text-slate-400 text-xs">{prof.totalAlunos} alunos</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: colors[i] }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gestão links */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4">Gestão Rápida</h3>
          <div className="space-y-2">
            {[
              { label: 'Alunos', value: mockAlunos.length, color: '#a78bfa', icon: Users },
              { label: 'Professores', value: mockProfessores.length, color: '#34d399', icon: UserCheck },
              { label: 'Especialistas', value: mockEspecialistas.length, color: '#60a5fa', icon: Stethoscope },
              { label: 'Relatórios', value: '', color: '#fb923c', icon: BarChart2 },
              { label: 'Usuários', value: '', color: '#e879f9', icon: Settings },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
                style={{ border: '1px solid transparent' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                {item.value !== '' && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${item.color}15`, color: item.color }}>{item.value}</span>}
                <ChevronRight size={12} color="#374151" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alunos recentes + alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4">Alunos Recentes</h3>
          <div className="space-y-2">
            {mockAlunos.slice(0, 5).map((aluno, i) => {
              const temAv = mockAvaliacoes.some(av => av.alunoId === aluno.id);
              const temTreino = mockTreinos.some(t => t.alunoId === aluno.id);
              return (
                <div key={aluno.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: ['#a78bfa','#34d399','#60a5fa','#fb923c','#f472b6'][i % 5] + '30' }}>
                    {aluno.nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{aluno.nome}</div>
                    <div className="text-xs text-slate-500">{aluno.objetivo}</div>
                  </div>
                  <div className="flex gap-1">
                    {temAv && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: '#34d39915', color: '#34d399' }}>Aval</span>}
                    {temTreino && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: '#f472b615', color: '#f472b6' }}>Treino</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={16} color="#fbbf24" />Atenção
          </h3>
          <div className="space-y-2">
            {mockAlunos.filter(a => !mockAvaliacoes.some(av => av.alunoId === a.id)).map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: '#fbbf2408', border: '1px solid #fbbf2420' }}>
                <Clock size={12} color="#fbbf24" />
                <span className="text-sm text-white">{a.nome}</span>
                <span className="text-xs text-slate-500 ml-auto">sem avaliação</span>
              </div>
            ))}
            {mockAlunos.filter(a => !mockTreinos.some(t => t.alunoId === a.id)).slice(0,2).map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: '#f472b608', border: '1px solid #f472b620' }}>
                <Dumbbell size={12} color="#f472b6" />
                <span className="text-sm text-white">{a.nome}</span>
                <span className="text-xs text-slate-500 ml-auto">sem treino</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Professor Dashboard ──────────────────────────────────────────────────────
function ProfessorDashboard() {
  const meusAlunos = mockAlunos.filter(a => a.professorId === 'p1');
  const minhasAvaliacoes = mockAvaliacoes.filter(a => meusAlunos.some(al => al.id === a.alunoId));
  const meusTreinos = mockTreinos.filter(t => meusAlunos.some(al => al.id === t.alunoId));

  const stats = [
    { label: 'Alunos', value: meusAlunos.length, icon: '👥', color: '#c084fc', sub: 'cadastrados' },
    { label: 'Avaliações', value: minhasAvaliacoes.length, icon: '📊', color: '#fb923c', sub: 'realizadas' },
    { label: 'Treinos', value: meusTreinos.length, icon: '💪', color: '#f472b6', sub: 'criados' },
    { label: 'Periodizações', value: 2, icon: '📅', color: '#facc15', sub: 'ativas' },
  ];

  const quickActions = [
    { label: 'Novo Aluno', emoji: '👤', color: '#c084fc', desc: 'Cadastrar aluno' },
    { label: 'Avaliação', emoji: '📊', color: '#fb923c', desc: 'Dobras cutâneas' },
    { label: 'Criar Treino', emoji: '💪', color: '#f472b6', desc: 'Plano de treino' },
    { label: 'Periodização', emoji: '📅', color: '#facc15', desc: 'Linha do tempo' },
    { label: 'Ver Alunos', emoji: '👥', color: '#38bdf8', desc: 'Todos os alunos' },
    { label: 'Parceiros', emoji: '🏥', color: '#4ade80', desc: 'Saúde & bem-estar' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0d1525, #0a1628)', border: `1px solid ${BORDER}` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #c084fc, transparent)' }} />
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💪</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#34d39915', color: '#34d399', border: '1px solid #34d39925' }}>PROFESSOR ATIVO</span>
            </div>
            <h2 className="text-2xl font-black text-white">Olá, Rafael! 🏆</h2>
            <p className="text-slate-400 text-sm mt-1">Você tem {meusAlunos.length} alunos sob sua orientação</p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}>
            <Share2 size={14} />Convidar Aluno
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-lg">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <h3 className="font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <button key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 cursor-pointer"
              style={{ background: `${action.color}08`, border: `1px solid ${action.color}20` }}>
              <span className="text-xl">{action.emoji}</span>
              <span className="text-xs font-semibold text-white">{action.label}</span>
              <span className="text-xs text-slate-500 text-center">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Avaliações recentes */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Avaliações Recentes</h3>
            <span className="text-xs text-slate-500">Ver todas →</span>
          </div>
          <div className="space-y-3">
            {minhasAvaliacoes.map((av, i) => {
              const aluno = meusAlunos.find(a => a.id === av.alunoId);
              return (
                <div key={av.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: ['#a78bfa','#fb923c','#34d399'][i % 3] + '30' }}>
                    {aluno?.nome.charAt(0) ?? '?'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{aluno?.nome}</div>
                    <div className="text-xs text-slate-500">{new Date(av.data).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ color: '#fb923c' }}>{av.percentualGordura?.toFixed(1)}% gord</div>
                    <div className="text-xs text-slate-500">{av.massaMagra?.toFixed(1)}kg</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meus alunos */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Meus Alunos</h3>
            <span className="text-xs text-slate-500">Ver todos →</span>
          </div>
          <div className="space-y-2">
            {meusAlunos.map((aluno, i) => {
              const avsAluno = mockAvaliacoes.filter(a => a.alunoId === aluno.id);
              const treinosAluno = mockTreinos.filter(t => t.alunoId === aluno.id);
              return (
                <div key={aluno.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: ['#c084fc','#fb923c','#34d399'][i % 3] + '30' }}>
                    {aluno.nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{aluno.nome}</div>
                    <div className="text-xs text-slate-500">{aluno.objetivo}</div>
                  </div>
                  <div className="flex gap-1 text-xs">
                    <span style={{ color: '#fb923c' }}>{avsAluno.length} aval</span>
                    <span className="text-slate-600">•</span>
                    <span style={{ color: '#f472b6' }}>{treinosAluno.length} treinos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Aluno Dashboard ──────────────────────────────────────────────────────────
function AlunoDashboard() {
  const aluno = mockAlunos[0]; // Lucas Ferreira
  const minhasAvaliacoes = mockAvaliacoes.filter(a => a.alunoId === 'a1').sort((a, b) => new Date(b.data) - new Date(a.data));
  const meusTreinos = mockTreinos.filter(t => t.alunoId === 'a1');
  const ultimaAvaliacao = minhasAvaliacoes[0];
  const parceiros = mockEspecialistas.filter(e => e.parceiro);

  const quickNav = [
    { label: 'Avaliações', icon: Activity, value: minhasAvaliacoes.length, color: '#fb923c' },
    { label: 'Treinos', icon: Dumbbell, value: meusTreinos.length, color: '#f472b6' },
    { label: 'Evolução', icon: Calendar, value: minhasAvaliacoes.length, color: '#fbbf24' },
    { label: 'Saúde', icon: Stethoscope, value: parceiros.length, color: '#60a5fa' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #1a0533, #0d1525)', border: `1px solid ${BORDER}` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        </div>
        <p className="text-slate-400 text-sm mb-1">Bem-vindo 👋</p>
        <h2 className="text-2xl font-black text-white">{aluno.nome.split(' ')[0]}</h2>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#a78bfa15', color: '#a78bfa', border: '1px solid #a78bfa25' }}>{aluno.objetivo}</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: `1px solid ${BORDER}` }}>30 anos</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: `1px solid ${BORDER}` }}>{aluno.peso}kg</span>
        </div>
      </div>

      {/* Quick Nav 2x2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickNav.map((item, i) => {
          const Icon = item.icon;
          return (
            <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 cursor-pointer text-center"
              style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}20` }}>
                <Icon size={18} style={{ color: item.color }} />
              </div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Última Avaliação */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Última Avaliação</h3>
            <span className="text-xs text-slate-500">Ver tudo →</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">{new Date(ultimaAvaliacao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '% Gordura', value: `${ultimaAvaliacao.percentualGordura?.toFixed(1)}%`, color: '#fb923c' },
              { label: 'Massa Magra', value: `${ultimaAvaliacao.massaMagra?.toFixed(1)}kg`, color: '#34d399' },
              { label: 'IMC', value: ultimaAvaliacao.imc?.toFixed(1), color: '#60a5fa' },
              { label: 'Classificação', value: ultimaAvaliacao.classificacaoGordura, color: '#a78bfa' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                <div className="text-base font-bold" style={{ color: item.color }}>{item.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Minha Evolução */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} color="#34d399" />Minha Evolução
          </h3>
          <div className="space-y-3">
            {minhasAvaliacoes.slice(0, 3).map((av, i) => (
              <div key={av.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: '#a78bfa20', color: '#a78bfa' }}>#{minhasAvaliacoes.length - i}</div>
                <div className="text-xs text-slate-400">{new Date(av.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                <div className="flex gap-2 ml-auto">
                  <span className="text-xs font-bold" style={{ color: '#fb923c' }}>{av.percentualGordura?.toFixed(1)}%</span>
                  <span className="text-xs font-bold" style={{ color: '#34d399' }}>{av.massaMagra?.toFixed(1)}kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meus Treinos */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Dumbbell size={16} color="#f472b6" />Meus Treinos</h3>
          <span className="text-xs text-slate-500">Ver tudo →</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {meusTreinos.map((treino, i) => (
            <div key={treino.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
              style={{ background: '#f472b608', border: '1px solid #f472b620' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                style={{ background: '#f472b620', color: '#f472b6' }}>
                {String.fromCharCode(65 + i)}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{treino.nome}</div>
                <div className="text-xs text-slate-500">{treino.sessoes.length} sessões • {treino.nivel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parceiros */}
      <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Heart size={16} color="#60a5fa" />Serviços Parceiros</h3>
          <span className="text-xs text-slate-500">Ver todos →</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {parceiros.map(esp => (
            <div key={esp.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#60a5fa08', border: '1px solid #60a5fa20' }}>
              <span className="text-xl">{esp.especialidade === 'Nutricionista' ? '🥗' : '🏥'}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{esp.nome}</div>
                <div className="text-xs text-slate-500">{esp.especialidade}</div>
              </div>
              <div className="text-sm font-bold" style={{ color: '#34d399' }}>R${esp.valorConsulta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Generic list views ───────────────────────────────────────────────────────
function AlunosView({ role }) {
  const alunos = role === 'professor' ? mockAlunos.filter(a => a.professorId === 'p1') : mockAlunos;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{role === 'professor' ? 'Meus Alunos' : 'Alunos'}</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}>
          <Plus size={14} />Novo Aluno
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {alunos.map((aluno, i) => {
          const avsAluno = mockAvaliacoes.filter(a => a.alunoId === aluno.id);
          const treinosAluno = mockTreinos.filter(t => t.alunoId === aluno.id);
          const colors = ['#a78bfa','#fb923c','#34d399','#60a5fa','#f472b6'];
          return (
            <div key={aluno.id} className="p-4 rounded-2xl cursor-pointer hover:opacity-90 transition-all"
              style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white"
                  style={{ background: colors[i % 5] + '25' }}>
                  {aluno.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{aluno.nome}</div>
                  <div className="text-xs text-slate-400">{aluno.objetivo} • {aluno.peso}kg • {aluno.altura}cm</div>
                </div>
                <ChevronRight size={16} color="#374151" />
              </div>
              <div className="flex gap-3 mt-3">
                <div className="flex-1 p-2 rounded-xl text-center" style={{ background: '#fb923c08', border: '1px solid #fb923c20' }}>
                  <div className="text-sm font-bold" style={{ color: '#fb923c' }}>{avsAluno.length}</div>
                  <div className="text-xs text-slate-500">Avaliações</div>
                </div>
                <div className="flex-1 p-2 rounded-xl text-center" style={{ background: '#f472b608', border: '1px solid #f472b620' }}>
                  <div className="text-sm font-bold" style={{ color: '#f472b6' }}>{treinosAluno.length}</div>
                  <div className="text-xs text-slate-500">Treinos</div>
                </div>
                {role !== 'aluno' && (
                  <div className="flex-1 p-2 rounded-xl text-center" style={{ background: '#34d39908', border: '1px solid #34d39920' }}>
                    <div className="text-sm font-bold" style={{ color: '#34d399' }}>{aluno.peso}kg</div>
                    <div className="text-xs text-slate-500">Peso</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvaliacoesView() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Avaliações Físicas</h2>
      <div className="space-y-3">
        {mockAvaliacoes.map((av, i) => {
          const aluno = mockAlunos.find(a => a.id === av.alunoId);
          const colors = ['#fb923c', '#34d399', '#60a5fa'];
          return (
            <div key={av.id} className="p-4 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: colors[i % 3] + '30' }}>{aluno?.nome.charAt(0)}</div>
                  <div>
                    <div className="font-semibold text-white">{aluno?.nome}</div>
                    <div className="text-xs text-slate-500">{new Date(av.data).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#34d39915', color: '#34d399', border: '1px solid #34d39925' }}>
                  {av.classificacaoGordura}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '% Gordura', value: `${av.percentualGordura?.toFixed(1)}%`, color: '#fb923c' },
                  { label: 'Massa Magra', value: `${av.massaMagra?.toFixed(1)}kg`, color: '#34d399' },
                  { label: 'IMC', value: av.imc?.toFixed(1), color: '#60a5fa' },
                  { label: 'Classif.', value: av.classificacaoGordura, color: '#a78bfa' },
                ].map((item, j) => (
                  <div key={j} className="p-2 rounded-xl text-center" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                    <div className="text-xs font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TreinosView() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Planos de Treino</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#f472b620', color: '#f472b6', border: '1px solid #f472b630' }}>
          <Plus size={14} />Criar Treino
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mockTreinos.map((treino, i) => {
          const aluno = mockAlunos.find(a => a.id === treino.alunoId);
          const colors = ['#f472b6', '#a78bfa', '#34d399'];
          return (
            <div key={treino.id} className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black mb-3"
                style={{ background: colors[i % 3] + '20', color: colors[i % 3] }}>
                {String.fromCharCode(65 + i)}
              </div>
              <h3 className="font-bold text-white mb-1">{treino.nome}</h3>
              <p className="text-xs text-slate-500 mb-3">{aluno?.nome} • {treino.nivel}</p>
              <div className="flex justify-between text-xs">
                <span className="px-2 py-1 rounded-full" style={{ background: colors[i % 3] + '15', color: colors[i % 3] }}>
                  {treino.sessoes.length} sessões
                </span>
                <span className="text-slate-500">{treino.nivel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GenericView({ title, icon: Icon, color }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={32} style={{ color }} />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-slate-500 text-sm text-center">Esta seção está disponível no sistema completo</p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FitPro() {
  const [role, setRole] = useState(null); // null = login
  const [activeView, setActiveView] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'professor' ? professorNav : alunoNav;
  const userName = role === 'admin' ? 'Administrador' : role === 'professor' ? 'Rafael Santos' : 'Lucas Ferreira';

  const handleLogin = (r) => { setRole(r); setActiveView('dashboard'); };
  const handleLogout = () => { setRole(null); setActiveView('dashboard'); };

  if (!role) return <LoginPage onLogin={handleLogin} />;

  const renderView = () => {
    if (activeView === 'dashboard') {
      if (role === 'admin') return <AdminDashboard />;
      if (role === 'professor') return <ProfessorDashboard />;
      return <AlunoDashboard />;
    }
    if (activeView === 'alunos') return <AlunosView role={role} />;
    if (activeView === 'avaliacoes') return <AvaliacoesView />;
    if (activeView === 'treinos') return <TreinosView />;
    const viewMap = {
      professores: { title: 'Professores', icon: UserCheck, color: '#34d399' },
      especialistas: { title: 'Especialistas', icon: Stethoscope, color: '#60a5fa' },
      biblioteca: { title: 'Biblioteca de Exercícios', icon: BookOpen, color: '#f472b6' },
      produtos: { title: 'Cadastro de Produtos', icon: ShoppingBag, color: '#fb923c' },
      pedidos: { title: 'Pedidos', icon: ClipboardList, color: '#f472b6' },
      relatorios: { title: 'Relatórios', icon: BarChart2, color: '#fbbf24' },
      financeiro: { title: 'Financeiro', icon: DollarSign, color: '#34d399' },
      usuarios: { title: 'Usuários', icon: Settings, color: '#e879f9' },
      periodizacao: { title: 'Periodização', icon: Calendar, color: '#fbbf24' },
      parceiros: { title: 'Parceiros de Saúde', icon: Stethoscope, color: '#34d399' },
      evolucao: { title: 'Minha Evolução', icon: TrendingUp, color: '#fbbf24' },
      servicos: { title: 'Serviços Parceiros', icon: Heart, color: '#60a5fa' },
    };
    const v = viewMap[activeView];
    if (v) return <GenericView {...v} />;
    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0">
        <Sidebar navItems={navItems} activeView={activeView} onNav={setActiveView}
          role={role} userName={userName} onLogout={handleLogout} isMobile={false} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setSideOpen(false)} />
            <motion.div initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden">
              <Sidebar navItems={navItems} activeView={activeView} onNav={setActiveView}
                role={role} userName={userName} onLogout={handleLogout} isMobile={true} onClose={() => setSideOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: '#080d1a', borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(!sideOpen)} className="lg:hidden p-2 rounded-xl hover:bg-white/5">
              <Menu size={18} color="#6b7280" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white">
                {navItems.find(n => n.view === activeView)?.label || 'FitPro'}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">FitPro Assessment Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-white/5 relative">
              <Bell size={16} color="#6b7280" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#fb923c' }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: (role === 'admin' ? '#00d4ff' : role === 'professor' ? '#34d399' : '#a78bfa') + '25' }}>
              {userName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden flex items-center justify-around px-2 py-2 flex-shrink-0"
          style={{ background: '#080d1a', borderTop: `1px solid ${BORDER}` }}>
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button key={item.view} onClick={() => setActiveView(item.view)}
                className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all"
                style={{ color: active ? item.color : '#4b5563' }}>
                <Icon size={18} />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}