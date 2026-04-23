import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Save, ArrowLeft, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useApp, useAuth } from '../../context/FitProContext';
import { getCredentials } from '../../lib/fitpro-storage';
import {
  calcularDensidadeCorporal, calcularPercentualGordura, calcularIMC, classificarIMC,
  classificarGordura, calcularIdade, calcularTMB, calcularGEB, getCorClassificacao
} from '../../lib/fitpro-calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

export default function AvaliacaoFisicaView() {
  const { alunos, addAvaliacao, avaliacoes } = useApp();
  const { user } = useAuth();

  const creds = getCredentials();
  const myCred = creds.find(c => c.id === user?.id);
  const professorId = myCred?.linkedId || '';

  const [alunoId, setAlunoId] = useState('');
  const [protocolo, setProtocolo] = useState('7');
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('dobras');

  const [dobras, setDobras] = useState({ peito: '', axilarMedia: '', triceps: '', subescapular: '', abdomen: '', suprailíaca: '', coxa: '', panturrilha: '', biceps: '' });
  const [circunferencias, setCircs] = useState({ circCintura: '', circQuadril: '', circBracoDireito: '', circBracoEsquerdo: '', circCoxaDireita: '', circCoxaEsquerda: '' });
  const [vitais, setVitais] = useState({ pressaoArterial: '', freqCardiacaRepouso: '', nivelAtividade: 'moderado' });
  const [observacoes, setObservacoes] = useState('');

  const alunosFiltrados = user?.role === 'professor' ? alunos.filter(a => a.professorId === professorId) : alunos;
  const aluno = alunos.find(a => a.id === alunoId);
  const historico = avaliacoes.filter(a => a.alunoId === alunoId).sort((a, b) => new Date(a.data) - new Date(b.data));

  const calcular = () => {
    if (!aluno) return null;
    const idade = calcularIdade(aluno.dataNascimento);
    let soma = 0;
    if (protocolo === '7') {
      soma = ['peito', 'axilarMedia', 'triceps', 'subescapular', 'abdomen', 'suprailíaca', 'coxa'].reduce((acc, k) => acc + (parseFloat(dobras[k]) || 0), 0);
    } else {
      if (aluno.sexo === 'M') soma = ['peito', 'abdomen', 'coxa'].reduce((acc, k) => acc + (parseFloat(dobras[k]) || 0), 0);
      else soma = ['triceps', 'suprailíaca', 'coxa'].reduce((acc, k) => acc + (parseFloat(dobras[k]) || 0), 0);
    }
    const densidade = calcularDensidadeCorporal(aluno.sexo, soma, idade, protocolo);
    const percGordura = Math.max(0, calcularPercentualGordura(densidade));
    const massaGorda = (percGordura / 100) * aluno.peso;
    const massaMagra = aluno.peso - massaGorda;
    const imc = calcularIMC(aluno.peso, aluno.altura);
    const tmb = calcularTMB(aluno.peso, aluno.altura, idade, aluno.sexo);
    const geb = calcularGEB(tmb, vitais.nivelAtividade);
    const rcq = circunferencias.circCintura && circunferencias.circQuadril
      ? parseFloat(circunferencias.circCintura) / parseFloat(circunferencias.circQuadril) : undefined;
    return {
      somaDobras: soma, densidadeCorporal: densidade, percentualGordura: percGordura,
      massaGorda, massaMagra, imc, classificacaoIMC: classificarIMC(imc),
      classificacaoGordura: classificarGordura(percGordura, aluno.sexo, idade),
      relacaoCinturaQuadril: rcq, tmb, geb, idade
    };
  };

  const resultados = aluno ? calcular() : null;

  const handleSave = () => {
    if (!aluno || !resultados) return alert('Selecione um aluno e calcule os resultados');
    const data = {
      alunoId, data: new Date().toISOString().split('T')[0],
      idade: resultados.idade, peso: aluno.peso, altura: aluno.altura,
      ...Object.fromEntries(Object.entries(dobras).map(([k, v]) => [k, parseFloat(v) || undefined])),
      ...Object.fromEntries(Object.entries(circunferencias).map(([k, v]) => [k, parseFloat(v) || undefined])),
      pressaoArterial: vitais.pressaoArterial,
      freqCardiacaRepouso: parseFloat(vitais.freqCardiacaRepouso) || undefined,
      somaDobras: resultados.somaDobras,
      densidadeCorporal: resultados.densidadeCorporal,
      percentualGordura: resultados.percentualGordura,
      massaGorda: resultados.massaGorda,
      massaMagra: resultados.massaMagra,
      imc: resultados.imc,
      classificacaoIMC: resultados.classificacaoIMC,
      classificacaoGordura: resultados.classificacaoGordura,
      relacaoCinturaQuadril: resultados.relacaoCinturaQuadril,
      observacoes
    };
    addAvaliacao(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = historico.map(av => ({
    data: new Date(av.data).toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' }),
    gordura: av.percentualGordura?.toFixed(1),
    massaMagra: av.massaMagra?.toFixed(1),
    peso: av.peso
  }));

  const sections = [
    { id: 'dobras', label: 'Dobras Cutâneas' },
    { id: 'circunferencias', label: 'Circunferências' },
    { id: 'vitais', label: 'Sinais Vitais' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} color="#fb923c" />Avaliação Física</h2>
        <p className="text-xs text-slate-500">Dobras Cutâneas — Protocolo Jackson & Pollock</p>
      </div>

      {/* Seleção do aluno */}
      <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Aluno</label>
            <select value={alunoId} onChange={e => setAlunoId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="">Selecione o aluno...</option>
              {alunosFiltrados.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.sexo === 'M' ? 'Masc' : 'Fem'}{a.dataNascimento ? `, ${calcularIdade(a.dataNascimento)} anos` : ''})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Protocolo</label>
            <select value={protocolo} onChange={e => setProtocolo(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="7">7 Dobras (Jackson & Pollock)</option>
              <option value="3">3 Dobras (Jackson & Pollock)</option>
            </select>
          </div>
        </div>
        {aluno && (
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#a78bfa15', color: '#a78bfa' }}>{aluno.nome}</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{aluno.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{aluno.peso}kg / {aluno.altura}cm</span>
          </div>
        )}
      </div>

      {/* Sections */}
      {sections.map(section => (
        <div key={section.id} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <button onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5">
            <h3 className="font-semibold text-white text-sm">{section.label}</h3>
            {activeSection === section.id ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
          </button>
          {activeSection === section.id && (
            <div className="px-4 pb-4">
              {section.id === 'dobras' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {(protocolo === '7' || aluno?.sexo === 'M' ? ['peito', 'axilarMedia'] : []).concat(['triceps', 'subescapular', 'abdomen', 'suprailíaca', 'coxa', 'panturrilha', 'biceps']).map(campo => (
                    <div key={campo}>
                      <label className="text-xs text-slate-400 block mb-1 capitalize">{campo === 'suprailíaca' ? 'Suprailíaca' : campo === 'axilarMedia' ? 'Axilar Média' : campo.charAt(0).toUpperCase() + campo.slice(1)} (mm)</label>
                      <input type="number" value={dobras[campo]} onChange={e => setDobras(d => ({ ...d, [campo]: e.target.value }))} placeholder="0"
                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>
                  ))}
                </div>
              )}
              {section.id === 'circunferencias' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'circCintura', label: 'Cintura (cm)' },
                    { key: 'circQuadril', label: 'Quadril (cm)' },
                    { key: 'circBracoDireito', label: 'Braço Direito (cm)' },
                    { key: 'circBracoEsquerdo', label: 'Braço Esquerdo (cm)' },
                    { key: 'circCoxaDireita', label: 'Coxa Direita (cm)' },
                    { key: 'circCoxaEsquerda', label: 'Coxa Esquerda (cm)' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                      <input type="number" value={circunferencias[f.key]} onChange={e => setCircs(c => ({ ...c, [f.key]: e.target.value }))} placeholder="0"
                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>
                  ))}
                </div>
              )}
              {section.id === 'vitais' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-400 block mb-1">Pressão Arterial</label><input value={vitais.pressaoArterial} onChange={e => setVitais(v => ({ ...v, pressaoArterial: e.target.value })) } placeholder="120/80" className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} /></div>
                  <div><label className="text-xs text-slate-400 block mb-1">Freq. Cardíaca Repouso</label><input type="number" value={vitais.freqCardiacaRepouso} onChange={e => setVitais(v => ({ ...v, freqCardiacaRepouso: e.target.value }))} placeholder="65" className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} /></div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Nível de Atividade</label>
                    <select value={vitais.nivelAtividade} onChange={e => setVitais(v => ({ ...v, nivelAtividade: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <option value="sedentario">Sedentário</option><option value="leve">Levemente Ativo</option>
                      <option value="moderado">Moderadamente Ativo</option><option value="ativo">Muito Ativo</option><option value="muitoAtivo">Extremamente Ativo</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Observações */}
      <div className="p-4 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <label className="text-xs text-slate-400 block mb-2">Observações</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} placeholder="Anotações clínicas, observações..."
          className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none" style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      {/* Resultados */}
      {resultados && aluno && (
        <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4">Resultados</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: '% Gordura', value: `${resultados.percentualGordura.toFixed(1)}%`, color: '#fb923c' },
              { label: 'Massa Magra', value: `${resultados.massaMagra.toFixed(1)}kg`, color: '#34d399' },
              { label: 'Massa Gorda', value: `${resultados.massaGorda.toFixed(1)}kg`, color: '#ef4444' },
              { label: 'IMC', value: resultados.imc.toFixed(1), color: '#60a5fa' },
              { label: 'Classif. Gordura', value: resultados.classificacaoGordura, color: getCorClassificacao(resultados.classificacaoGordura) },
              { label: 'Classif. IMC', value: resultados.classificacaoIMC, color: '#a78bfa' },
              { label: 'TMB', value: `${resultados.tmb.toFixed(0)} kcal`, color: '#fbbf24' },
              { label: 'Gasto Energético', value: `${resultados.geb.toFixed(0)} kcal`, color: '#60a5fa' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                <div className="text-sm font-bold truncate" style={{ color: item.color }}>{item.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: saved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #fb923c, #ea580c)' }}>
            <Save size={16} />{saved ? 'Avaliação Salva!' : 'Salvar Avaliação'}
          </button>
        </div>
      )}

      {/* Histórico chart */}
      {chartData.length > 1 && (
        <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} color="#34d399" />Evolução do Aluno</h3>
          <p className="text-xs text-slate-400 mb-3">% Gordura</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="data" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0d1225', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="gordura" stroke="#fb923c" fill="#fb923c20" name="% Gordura" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}