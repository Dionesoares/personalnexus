import React, { useState } from 'react';
import { QrCode, Save, Copy, Eye, X } from 'lucide-react';

const CARD = '#0d1525';
const BORDER = 'rgba(255,255,255,0.07)';

function gerarPayloadPix(chave, nome, cidade, valor = null) {
  const nomeClean = nome.substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const cidadeClean = cidade.substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const merchantAccountInfo = `0014BR.GOV.BCB.PIX01${String(chave.length).padStart(2,'0')}${chave}`;
  const mai = `26${String(merchantAccountInfo.length).padStart(2,'0')}${merchantAccountInfo}`;
  const currency = '5303986';
  const valorStr = valor ? `54${String(Number(valor).toFixed(2).length).padStart(2,'0')}${Number(valor).toFixed(2)}` : '';
  const country = '5802BR';
  const nomeField = `59${String(nomeClean.length).padStart(2,'0')}${nomeClean}`;
  const cidadeField = `60${String(cidadeClean.length).padStart(2,'0')}${cidadeClean}`;
  const txid = '62070503***';
  const payload = `000201${mai}52040000${currency}${valorStr}${country}${nomeField}${cidadeField}${txid}6304`;
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) { crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1; }
  }
  return payload + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function gerarQrUrl(payload) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
}

export function loadPixProfessor(professorId) {
  try { return JSON.parse(localStorage.getItem(`fitpro_pix_prof_${professorId}`)) || {}; } catch { return {}; }
}

export function savePixProfessor(professorId, dados) {
  localStorage.setItem(`fitpro_pix_prof_${professorId}`, JSON.stringify(dados));
}

export default function PixProfessorConfig({ professorId }) {
  const pixDefault = { chave: '', nome: '', cidade: '', banco: '', tipochave: 'cpf' };
  const [pixDadosSalvos, setPixDadosSalvos] = useState(() => loadPixProfessor(professorId) || pixDefault);
  const [editando, setEditando] = useState(!pixDadosSalvos?.chave);
  const [pixForm, setPixForm] = useState(pixDadosSalvos);
  const [pixSaved, setPixSaved] = useState(false);
  const [pixValorPreview, setPixValorPreview] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const pixDados = pixDadosSalvos;
  const pixPayload = pixForm.chave && pixForm.nome && pixForm.cidade
    ? gerarPayloadPix(pixForm.chave, pixForm.nome, pixForm.cidade, pixValorPreview || null)
    : null;
  const pixQrUrl = pixPayload ? gerarQrUrl(pixPayload) : null;

  const salvar = () => {
    savePixProfessor(professorId, pixForm);
    setPixDadosSalvos(pixForm);
    setEditando(false);
    setPixSaved(true);
    setTimeout(() => setPixSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Dados PIX */}
      <div className="p-5 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode size={18} color="#34d399" />
            <div>
              <h3 className="font-semibold text-white">Meus Dados PIX</h3>
              <p className="text-xs text-slate-500">Cadastre sua chave PIX para cobrar alunos via QR Code</p>
            </div>
          </div>
          {!editando && pixDadosSalvos?.chave && (
            <button onClick={() => { setPixForm(pixDadosSalvos); setEditando(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#fbbf2415', color: '#fbbf24', border: '1px solid #fbbf2425' }}>
              <Save size={12} />Alterar PIX
            </button>
          )}
        </div>

        {/* Modo visualização */}
        {!editando && pixDadosSalvos?.chave ? (
          <div className="space-y-2">
            {[
              { label: 'Chave PIX', value: `${pixDadosSalvos.tipochave?.toUpperCase()}: ${pixDadosSalvos.chave}` },
              { label: 'Beneficiário', value: pixDadosSalvos.nome },
              { label: 'Cidade', value: pixDadosSalvos.cidade },
              ...(pixDadosSalvos.banco ? [{ label: 'Banco', value: pixDadosSalvos.banco }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: '#34d39908', border: '1px solid #34d39920' }}>
                <span className="text-xs text-slate-400 w-24 flex-shrink-0">{item.label}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2 px-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-400">PIX configurado e salvo</span>
            </div>
          </div>
        ) : (
          /* Modo edição */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de Chave</label>
                <select value={pixForm.tipochave} onChange={e => setPixForm(f => ({ ...f, tipochave: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Chave PIX</label>
                <input value={pixForm.chave} onChange={e => setPixForm(f => ({ ...f, chave: e.target.value }))}
                  placeholder={pixForm.tipochave === 'cpf' ? '000.000.000-00' : pixForm.tipochave === 'email' ? 'email@ex.com' : 'Chave PIX'}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome do Beneficiário</label>
              <input value={pixForm.nome} onChange={e => setPixForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Seu nome completo"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cidade</label>
                <input value={pixForm.cidade} onChange={e => setPixForm(f => ({ ...f, cidade: e.target.value }))}
                  placeholder="São Paulo"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Banco</label>
                <input value={pixForm.banco} onChange={e => setPixForm(f => ({ ...f, banco: e.target.value }))}
                  placeholder="Nubank, Itaú..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={salvar}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
                <Save size={14} />{pixSaved ? '✓ Salvo!' : 'Salvar Dados PIX'}
              </button>
              {editando && pixDadosSalvos?.chave && (
                <button onClick={() => setEditando(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancelar
                </button>
              )}
              {pixQrUrl && (
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}>
                  <Eye size={14} />Ver QR Code
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview QR Code */}
      {pixForm.chave && pixForm.nome && pixForm.cidade && (
        <div className="p-5 rounded-2xl" style={{ background: CARD, border: '1px solid #34d39920' }}>
          <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-2">
            <QrCode size={15} color="#34d399" />Pré-visualização do QR Code
          </h4>
          <div className="flex gap-2 mb-4 items-center">
            <span className="text-xs text-slate-400">Valor (opcional):</span>
            <input type="number" value={pixValorPreview} onChange={e => setPixValorPreview(e.target.value)}
              placeholder="0.00" className="px-2 py-1.5 rounded-lg text-sm text-white outline-none w-28"
              style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-slate-500">Deixe vazio para valor livre</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl" style={{ background: 'white' }}>
              <img src={pixQrUrl} alt="QR Code PIX" className="w-44 h-44 object-contain" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{pixForm.nome}</div>
              <div className="text-xs text-slate-400">{pixForm.banco && `${pixForm.banco} · `}{pixForm.tipochave?.toUpperCase()}: {pixForm.chave}</div>
              <div className="text-xs text-slate-500">{pixForm.cidade}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(pixPayload); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: pixCopied ? '#34d39920' : '#1e2a3a', color: pixCopied ? '#34d399' : '#94a3b8', border: `1px solid ${pixCopied ? '#34d39930' : 'rgba(255,255,255,0.08)'}` }}>
              <Copy size={12} />{pixCopied ? 'Código copiado!' : 'Copiar código PIX (copia e cola)'}
            </button>
          </div>
        </div>
      )}

      {!pixForm.chave && (
        <div className="p-6 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <QrCode size={40} className="mx-auto mb-2 opacity-20 text-slate-500" />
          <p className="text-sm text-slate-500">Preencha os dados acima para gerar seu QR Code PIX</p>
        </div>
      )}

      {/* Modal QR Code expandido */}
      {showModal && pixQrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">QR Code PIX</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5"><X size={16} color="#6b7280" /></button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-5 rounded-2xl" style={{ background: 'white' }}>
                <img src={pixQrUrl} alt="QR Code PIX" className="w-52 h-52 object-contain" />
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="text-base font-bold text-white">{pixForm.nome}</div>
              <div className="text-xs text-slate-400">{pixForm.banco && `${pixForm.banco} · `}{pixForm.tipochave?.toUpperCase()}: {pixForm.chave}</div>
              <div className="text-xs text-slate-500">{pixForm.cidade}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(pixPayload); setPixCopied(true); setTimeout(() => setPixCopied(false), 2000); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: pixCopied ? '#34d39920' : '#34d39920', color: '#34d399', border: '1px solid #34d39930' }}>
              <Copy size={14} />{pixCopied ? '✓ Código Copiado!' : 'Copiar código PIX'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente modal de pagamento PIX para o aluno
export function ModalPixAluno({ transacao, onClose, professorId }) {
  const [copied, setCopied] = useState(false);
  const pixDados = loadPixProfessor(professorId);
  const valor = parseFloat(transacao?.valor || 0);

  const pixOk = pixDados?.chave && pixDados?.nome && pixDados?.cidade;

  function gerarPayloadPixLocal(chave, nome, cidade, v) {
    const nomeClean = nome.substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const cidadeClean = cidade.substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const merchantAccountInfo = `0014BR.GOV.BCB.PIX01${String(chave.length).padStart(2,'0')}${chave}`;
    const mai = `26${String(merchantAccountInfo.length).padStart(2,'0')}${merchantAccountInfo}`;
    const currency = '5303986';
    const valorStr = v ? `54${String(Number(v).toFixed(2).length).padStart(2,'0')}${Number(v).toFixed(2)}` : '';
    const country = '5802BR';
    const nomeField = `59${String(nomeClean.length).padStart(2,'0')}${nomeClean}`;
    const cidadeField = `60${String(cidadeClean.length).padStart(2,'0')}${cidadeClean}`;
    const txid = '62070503***';
    const payload = `000201${mai}52040000${currency}${valorStr}${country}${nomeField}${cidadeField}${txid}6304`;
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) { crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1; }
    }
    return payload + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  const payload = pixOk ? gerarPayloadPixLocal(pixDados.chave, pixDados.nome, pixDados.cidade, valor) : null;
  const qrUrl = payload ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#0d1525', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Pagamento via PIX</h3>
            <p className="text-xs text-slate-500">Escaneie o QR Code para pagar</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5"><X size={16} color="#6b7280" /></button>
        </div>

        {/* Resumo da cobrança */}
        <div className="mb-4 p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs text-slate-400">{transacao?.descricao}</div>
          {transacao?.vencimento && (
            <div className="text-xs text-slate-500">Venc. {new Date(transacao.vencimento).toLocaleDateString('pt-BR')}</div>
          )}
          <div className="text-2xl font-black text-white mt-1">R$ {valor.toFixed(2)}</div>
        </div>

        {qrUrl ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl" style={{ background: 'white' }}>
                <img src={qrUrl} alt="QR Code PIX" className="w-52 h-52 object-contain" />
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="text-sm font-bold text-white">{pixDados.nome}</div>
              <div className="text-xs text-slate-400">
                {pixDados.banco && `${pixDados.banco} · `}{pixDados.tipochave?.toUpperCase()}: {pixDados.chave}
              </div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(payload); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: copied ? '#34d39920' : '#1e2a3a', color: copied ? '#34d399' : '#94a3b8', border: `1px solid ${copied ? '#34d39930' : 'rgba(255,255,255,0.08)'}` }}>
              <Copy size={14} />{copied ? '✓ Código Copiado!' : 'Copiar código PIX (copia e cola)'}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <QrCode size={48} className="opacity-20 text-slate-500 mb-3" />
            <p className="text-sm text-slate-500 text-center">PIX não configurado pelo professor.</p>
            <p className="text-xs text-slate-600 mt-1">Entre em contato para pagar.</p>
          </div>
        )}
        <p className="text-xs text-center text-slate-500 mt-4">Após o pagamento, aguarde a confirmação do professor.</p>
      </div>
    </div>
  );
}