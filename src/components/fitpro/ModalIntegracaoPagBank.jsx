import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, AlertCircle, Copy, Eye, EyeOff, ExternalLink, Shield, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PAGBANK_KEY = 'fitpro_pagbank_config';

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(PAGBANK_KEY)) || {}; } catch { return {}; }
}
function saveConfig(cfg) {
  localStorage.setItem(PAGBANK_KEY, JSON.stringify(cfg));
}

const ABA_ITEMS = [
  { id: 'credenciais', label: 'Credenciais' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'pagamentos', label: 'Pagamentos' },
];

const RECURSOS = [
  { icon: '💳', label: 'Cartão de Crédito', desc: 'Débito e crédito à vista ou parcelado' },
  { icon: '🔳', label: 'PIX', desc: 'Pagamento instantâneo via QR Code ou copia e cola' },
  { icon: '📄', label: 'Boleto Bancário', desc: 'Boleto com vencimento configurável' },
  { icon: '🔄', label: 'Recorrência', desc: 'Cobranças automáticas mensais para planos' },
  { icon: '🔔', label: 'Webhooks', desc: 'Notificações em tempo real de pagamentos' },
  { icon: '↩️', label: 'Estorno / Reembolso', desc: 'Cancelamento e devolução de valores' },
];

export default function ModalIntegracaoPagBank({ onClose }) {
  const [config, setConfig] = useState(loadConfig);
  const [aba, setAba] = useState('credenciais');
  const [form, setForm] = useState({
    email: config.email || '',
    token: config.token || '',
    ambiente: config.ambiente || 'sandbox',
    webhookUrl: config.webhookUrl || '',
    notificarPagamento: config.notificarPagamento ?? true,
    notificarCancelamento: config.notificarCancelamento ?? true,
    metodos: config.metodos || ['pix', 'cartao', 'boleto'],
    parcelasMax: config.parcelasMax || '12',
  });
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tokenCopiado, setTokenCopiado] = useState(false);

  const isConectado = !!(config.email && config.token);

  const handleSave = async () => {
    // Salva no localStorage (para uso local imediato)
    saveConfig(form);
    setConfig(form);

    // Salva na entidade (para uso pelo backend)
    const existentes = await base44.entities.ConfiguracaoPagBank.list();
    if (existentes.length > 0) {
      await base44.entities.ConfiguracaoPagBank.update(existentes[0].id, form);
    } else {
      await base44.entities.ConfiguracaoPagBank.create(form);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const desconectar = async () => {
    if (!confirm('Desconectar integração com PagBank?')) return;
    localStorage.removeItem(PAGBANK_KEY);
    const existentes = await base44.entities.ConfiguracaoPagBank.list();
    for (const e of existentes) await base44.entities.ConfiguracaoPagBank.delete(e.id);
    setConfig({});
    setForm({ email: '', token: '', ambiente: 'sandbox', webhookUrl: '', notificarPagamento: true, notificarCancelamento: true, metodos: ['pix', 'cartao', 'boleto'], parcelasMax: '12' });
  };

  const toggleMetodo = (m) => {
    setForm(f => ({
      ...f,
      metodos: f.metodos.includes(m) ? f.metodos.filter(x => x !== m) : [...f.metodos, m],
    }));
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '95vh', height: 'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: '#080d1a', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00b94a20, #0066cc20)', border: '1px solid rgba(0,185,74,0.3)' }}>
              <span className="text-xl">🏦</span>
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Integração PagBank
                {isConectado && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                    style={{ background: '#34d39915', color: '#34d399', border: '1px solid #34d39930' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">PagSeguro · PagBank · API REST</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Recursos em destaque — versão compacta em linha */}
        {!isConectado && (
          <div className="px-6 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {RECURSOS.map(r => (
                <span key={r.label} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ background: 'rgba(0,185,74,0.08)', color: '#00b94a', border: '1px solid rgba(0,185,74,0.2)' }}>
                  {r.icon} {r.label}
                </span>
              ))}
            </div>
            <a href="https://app.pipefy.com/public/form/k8aKYyJE" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#00b94a10', color: '#00b94a', border: '1px solid #00b94a25' }}>
              <ExternalLink size={11} />Solicitar acesso à plataforma PagBank
            </a>
          </div>
        )}

        {/* Abas */}
        <div className="flex gap-1 px-5 pt-4 flex-shrink-0">
          {ABA_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => setAba(id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: aba === id ? '#00b94a15' : 'rgba(255,255,255,0.03)',
                color: aba === id ? '#00b94a' : '#64748b',
                border: aba === id ? '1px solid #00b94a30' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">

          {/* ABA: CREDENCIAIS */}
          {aba === 'credenciais' && (
            <>
              <div className="p-3 rounded-xl flex items-start gap-2"
                style={{ background: '#fbbf2408', border: '1px solid #fbbf2425' }}>
                <AlertCircle size={14} color="#fbbf24" className="flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  Obtenha seu Token de integração em{' '}
                  <a href="https://minhaconta.pagseguro.uol.com.br/minha-conta/preferencias/integracoes"
                    target="_blank" rel="noreferrer" className="underline" style={{ color: '#00b94a' }}>
                    Minha Conta → Preferências → Integrações
                  </a>
                  {' '}no painel PagSeguro.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Ambiente</label>
                <div className="flex gap-2">
                  {['sandbox', 'producao'].map(env => (
                    <button key={env} onClick={() => setForm(f => ({ ...f, ambiente: env }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all capitalize"
                      style={{
                        background: form.ambiente === env ? (env === 'producao' ? '#00b94a15' : '#60a5fa15') : 'rgba(255,255,255,0.03)',
                        color: form.ambiente === env ? (env === 'producao' ? '#00b94a' : '#60a5fa') : '#64748b',
                        border: `1px solid ${form.ambiente === env ? (env === 'producao' ? '#00b94a30' : '#60a5fa30') : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      {env === 'sandbox' ? '🧪 Sandbox (Testes)' : '🚀 Produção'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">E-mail da conta PagBank</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@pagseguro.com"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Token de Integração</label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={form.token}
                    onChange={e => setForm(f => ({ ...f, token: e.target.value }))}
                    placeholder="Cole aqui seu token PagBank"
                    className="w-full px-3 pr-20 py-2.5 rounded-xl text-sm text-white outline-none font-mono"
                    style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button onClick={() => setShowToken(v => !v)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                      {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    {form.token && (
                      <button onClick={() => { navigator.clipboard.writeText(form.token); setTokenCopiado(true); setTimeout(() => setTokenCopiado(false), 2000); }}
                        className="p-1.5 rounded-lg hover:bg-white/10"
                        style={{ color: tokenCopiado ? '#34d399' : '#64748b' }}>
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isConectado && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: '#34d39908', border: '1px solid #34d39920' }}>
                  <CheckCircle2 size={14} color="#34d399" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">Integração configurada</p>
                    <p className="text-xs text-slate-500">{config.email} · {config.ambiente === 'producao' ? '🚀 Produção' : '🧪 Sandbox'}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ABA: WEBHOOKS */}
          {aba === 'webhooks' && (
            <>
              <div className="p-3 rounded-xl"
                style={{ background: '#60a5fa08', border: '1px solid #60a5fa20' }}>
                <p className="text-xs text-slate-400">
                  Configure a URL do webhook no painel PagBank para receber notificações automáticas de pagamentos aprovados, cancelados e estornados.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">URL do Webhook (Endpoint)</label>
                <div className="relative">
                  <input
                    readOnly
                    value="https://api.base44.com/api/apps/682a6a7af17a7a718e0765ce/functions/pagbankWebhook"
                    className="w-full px-3 pr-10 py-2.5 rounded-xl text-xs text-emerald-400 outline-none font-mono cursor-text select-all"
                    style={{ background: '#0a1a12', border: '1px solid rgba(52,211,153,0.25)' }}
                    onClick={e => e.target.select()}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText('https://api.base44.com/api/apps/682a6a7af17a7a718e0765ce/functions/pagbankWebhook')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
                    <Copy size={13} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">📌 Registre esta URL em: <strong>PagBank → Sua Conta → Notificações</strong></p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2">Notificar quando:</label>
                <div className="space-y-2">
                  {[
                    { key: 'notificarPagamento', label: '✅ Pagamento aprovado', desc: 'Marcar cobrança como paga automaticamente' },
                    { key: 'notificarCancelamento', label: '❌ Cancelamento / Estorno', desc: 'Atualizar status da cobrança ao cancelar' },
                  ].map(({ key, label, desc }) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: form[key] ? '#34d39910' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form[key] ? '#34d39930' : 'rgba(255,255,255,0.07)'}`,
                      }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: form[key] ? '#34d399' : 'rgba(255,255,255,0.08)' }}>
                        {form[key] && <CheckCircle2 size={12} color="#fff" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{label}</div>
                        <div className="text-xs text-slate-500">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ABA: PAGAMENTOS */}
          {aba === 'pagamentos' && (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-2">Métodos de Pagamento Aceitos</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pix', label: 'PIX', emoji: '🔳' },
                    { id: 'cartao', label: 'Cartão', emoji: '💳' },
                    { id: 'boleto', label: 'Boleto', emoji: '📄' },
                  ].map(({ id, label, emoji }) => {
                    const ativo = form.metodos.includes(id);
                    return (
                      <button key={id} onClick={() => toggleMetodo(id)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                        style={{
                          background: ativo ? '#00b94a12' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${ativo ? '#00b94a35' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs font-semibold" style={{ color: ativo ? '#00b94a' : '#64748b' }}>{label}</span>
                        {ativo && <CheckCircle2 size={11} color="#00b94a" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Parcelas máximas no cartão</label>
                <select value={form.parcelasMax} onChange={e => setForm(f => ({ ...f, parcelasMax: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {['1','2','3','4','6','9','12'].map(n => (
                    <option key={n} value={n}>{n === '1' ? 'À vista' : `Até ${n}x`}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold text-slate-400">Taxas PagBank (referência)</p>
                {[
                  { label: 'PIX', taxa: '0,99%' },
                  { label: 'Débito', taxa: '1,99%' },
                  { label: 'Crédito à vista', taxa: '2,99%' },
                  { label: 'Crédito 12x', taxa: '5,49%' },
                  { label: 'Boleto', taxa: 'R$ 1,49/unidade' },
                ].map(({ label, taxa }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-semibold text-white">{taxa}</span>
                  </div>
                ))}
                <p className="text-xs text-slate-600 pt-1">* Taxas aproximadas. Consulte seu contrato PagBank para valores exatos.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {isConectado && (
            <button onClick={desconectar}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}>
              <RefreshCw size={12} />Desconectar
            </button>
          )}
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{ background: saved ? 'linear-gradient(135deg, #34d399, #059669)' : 'linear-gradient(135deg, #00b94a, #008f38)' }}>
            {saved ? <><CheckCircle2 size={15} />Salvo!</> : <><Shield size={15} />Salvar Configuração</>}
          </button>
        </div>
      </div>
    </div>
  );
}