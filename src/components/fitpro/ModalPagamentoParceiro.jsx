import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Landmark, CheckCircle2, Copy, ChevronRight, Lock } from 'lucide-react';
import { generateId } from '../../lib/fitpro-storage';

const BORDER = 'rgba(255,255,255,0.07)';
const EMOJIS = { Médico: '👨‍⚕️', Nutricionista: '🥗', Fisioterapeuta: '🏥', Psicólogo: '🧠', Cardiologista: '❤️', Ortopedista: '🦴', 'Professor de Educação Física': '💪', 'Personal Trainer': '🏋️' };

const METODOS = [
  { id: 'pix', label: 'PIX', icon: Smartphone, color: '#34d399', desc: 'Aprovação instantânea' },
  { id: 'credito', label: 'Cartão de Crédito', icon: CreditCard, color: '#60a5fa', desc: 'Em até 12x sem juros' },
  { id: 'debito', label: 'Cartão de Débito', icon: Landmark, color: '#a78bfa', desc: 'Débito em conta' },
];

const PIX_KEY_FAKE = '12.345.678/0001-99';
const PIX_CODE_FAKE = '00020126580014BR.GOV.BCB.PIX0136fitpro@plataforma.com.br5204000053039865802BR5913FitPro Saude6009SAO PAULO62070503***6304ABCD';

function formatCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v) {
  return v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
}

export default function ModalPagamentoParceiro({ especialista, usuario, tipoUsuario = 'aluno', onClose, onSuccess }) {
  const [step, setStep] = useState('metodo'); // metodo | dados | processando | sucesso
  const [metodo, setMetodo] = useState('pix');
  const [card, setCard] = useState({ numero: '', nome: '', validade: '', cvv: '' });
  const [pixCopiado, setPixCopiado] = useState(false);
  const [parcelas, setParcelas] = useState('1');

  const valor = parseFloat(especialista.valorConsulta) || 0;
  const comissao = valor * (parseFloat(especialista.percentualComissao) || 0) / 100;

  const copiarPix = () => {
    navigator.clipboard.writeText(PIX_CODE_FAKE).catch(() => {});
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2500);
  };

  const salvarAgendamento = (metodoUsado) => {
    const pedidoId = generateId();
    const novo = {
      id: pedidoId,
      solicitanteId: usuario?.id || '',
      tipoSolicitante: tipoUsuario,
      especialistaId: especialista.id,
      dataAgendamento: new Date().toISOString().split('T')[0],
      horario: '',
      status: 'confirmado',
      observacoes: `Pago via ${metodoUsado} — contratado pelo app`,
      valorConsulta: valor,
      comissaoPlataforma: parseFloat(especialista.percentualComissao) || 0,
      formaPagamento: metodoUsado,
      createdAt: new Date().toISOString(),
    };
    try {
      const existentes = JSON.parse(localStorage.getItem('fitpro_pedidos_especialistas') || '[]');
      localStorage.setItem('fitpro_pedidos_especialistas', JSON.stringify([novo, ...existentes]));
    } catch {}
    return pedidoId;
  };

  const handlePagar = () => {
    if (metodo !== 'pix') {
      if (!card.numero || !card.nome || !card.validade || !card.cvv) return alert('Preencha todos os dados do cartão');
    }
    setStep('processando');
    setTimeout(() => {
      const id = salvarAgendamento(metodo);
      setStep('sucesso');
      if (onSuccess) onSuccess({ metodo, valor, comissao, id });
    }, 2200);
  };

  const metodoAtual = METODOS.find(m => m.id === metodo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 'processando') onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#0d1525', border: `1px solid ${BORDER}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <Lock size={14} color="#34d399" />
            <span className="text-sm font-bold text-white">Pagamento Seguro</span>
          </div>
          {step !== 'processando' && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X size={16} color="#6b7280" /></button>
          )}
        </div>

        {/* Especialista resumo */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}`, background: '#34d39908' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{EMOJIS[especialista.especialidade] || '👨‍⚕️'}</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">{especialista.nome}</div>
              <div className="text-xs text-slate-400">{especialista.especialidade}</div>
              {especialista.disponibilidade && <div className="text-xs text-slate-500 mt-0.5">🕐 {especialista.disponibilidade}</div>}
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-green-400">R$ {valor.toFixed(2)}</div>
              <div className="text-xs text-slate-500">Consulta</div>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* STEP: SUCESSO */}
          {step === 'sucesso' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#34d39920' }}>
                <CheckCircle2 size={32} color="#34d399" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Pagamento Confirmado!</h3>
              <p className="text-sm text-slate-400 mb-1">Sua consulta com <strong className="text-white">{especialista.nome}</strong> foi agendada.</p>
              <p className="text-xs text-slate-500 mb-6">Você receberá uma confirmação em breve.</p>
              <div className="p-3 rounded-xl mb-4 text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Método</span><span className="text-white capitalize">{metodoAtual?.label}</span></div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Valor pago</span><span className="text-green-400 font-bold">R$ {valor.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Status</span><span className="text-green-400">✓ Aprovado</span></div>
              </div>
              <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
                Fechar
              </button>
            </div>
          )}

          {/* STEP: PROCESSANDO */}
          {step === 'processando' && (
            <div className="text-center py-10">
              <div className="w-14 h-14 border-4 border-t-green-400 rounded-full animate-spin mx-auto mb-5" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#34d399' }} />
              <p className="text-white font-semibold mb-1">Processando pagamento...</p>
              <p className="text-xs text-slate-500">Aguarde, estamos confirmando sua transação</p>
            </div>
          )}

          {/* STEP: METODO */}
          {step === 'metodo' && (
            <>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Escolha o método de pagamento</h4>
              <div className="space-y-2 mb-5">
                {METODOS.map(m => {
                  const Icon = m.icon;
                  const ativo = metodo === m.id;
                  return (
                    <button key={m.id} onClick={() => setMetodo(m.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left"
                      style={{ background: ativo ? `${m.color}15` : 'rgba(255,255,255,0.04)', border: ativo ? `1px solid ${m.color}40` : '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}20` }}>
                        <Icon size={18} style={{ color: m.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{m.label}</div>
                        <div className="text-xs text-slate-500">{m.desc}</div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: ativo ? m.color : '#374151' }}>
                        {ativo && <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Resumo valor */}
              <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Valor da consulta</span><span className="text-white">R$ {valor.toFixed(2)}</span></div>
                {metodo === 'credito' && (
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Parcelamento</span><span className="text-slate-300">até 12x sem juros</span></div>
                )}
                <div className="flex justify-between text-xs font-bold pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-white">Total</span><span className="text-green-400">R$ {valor.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => setStep('dados')}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${metodoAtual?.color || '#60a5fa'}, #1d4ed8)` }}>
                Continuar <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* STEP: DADOS */}
          {step === 'dados' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('metodo')} className="p-1 rounded-lg hover:bg-white/5">
                  <ChevronRight size={16} color="#6b7280" className="rotate-180" />
                </button>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  {React.createElement(metodoAtual?.icon || CreditCard, { size: 16, style: { color: metodoAtual?.color } })}
                  {metodoAtual?.label}
                </h4>
              </div>

              {metodo === 'pix' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl text-center" style={{ background: '#34d39908', border: '1px solid #34d39930' }}>
                    {/* QR Code simulado */}
                    <div className="w-44 h-44 mx-auto mb-3 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: '#fff' }}>
                      <div className="grid grid-cols-7 gap-0.5 p-2">
                        {Array.from({ length: 49 }).map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded-sm"
                            style={{ background: [0,1,2,3,4,5,6,7,13,14,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48].includes(i) ? '#111' : '#fff' }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Chave PIX</p>
                    <p className="text-sm font-bold text-white mb-3">{PIX_KEY_FAKE}</p>
                    <div className="p-2 rounded-xl mb-3 text-xs font-mono text-slate-400 break-all" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      {PIX_CODE_FAKE.slice(0, 60)}...
                    </div>
                    <button onClick={copiarPix}
                      className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: pixCopiado ? '#34d39920' : '#1e2a3a', color: pixCopiado ? '#34d399' : '#94a3b8', border: `1px solid ${pixCopiado ? '#34d39940' : 'rgba(255,255,255,0.08)'}` }}>
                      <Copy size={14} />{pixCopiado ? 'Código copiado!' : 'Copiar código PIX'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">Após o pagamento, confirme aqui abaixo</p>
                  <button onClick={handlePagar}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
                    ✓ Confirmar Pagamento via PIX
                  </button>
                </div>
              )}

              {(metodo === 'credito' || metodo === 'debito') && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Número do Cartão</label>
                    <input value={card.numero} onChange={e => setCard(c => ({ ...c, numero: formatCard(e.target.value) }))}
                      placeholder="0000 0000 0000 0000" maxLength={19}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none font-mono tracking-widest"
                      style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nome no Cartão</label>
                    <input value={card.nome} onChange={e => setCard(c => ({ ...c, nome: e.target.value.toUpperCase() }))}
                      placeholder="NOME COMPLETO"
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none tracking-wider"
                      style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Validade</label>
                      <input value={card.validade} onChange={e => setCard(c => ({ ...c, validade: formatExpiry(e.target.value) }))}
                        placeholder="MM/AA" maxLength={5}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">CVV</label>
                      <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123" type="password"
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>
                  </div>

                  {metodo === 'credito' && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Parcelas</label>
                      <select value={parcelas} onChange={e => setParcelas(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {[1,2,3,4,6,8,10,12].map(n => (
                          <option key={n} value={n}>{n}x de R$ {(valor / n).toFixed(2)}{n === 1 ? ' (à vista)' : ' sem juros'}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Lock size={11} />Seus dados são criptografados e protegidos
                  </div>

                  <button onClick={handlePagar}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                    style={{ background: `linear-gradient(135deg, ${metodo === 'credito' ? '#60a5fa, #2563eb' : '#a78bfa, #7c3aed'})` }}>
                    Pagar R$ {valor.toFixed(2)} {metodo === 'credito' ? `em ${parcelas}x` : 'no Débito'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}