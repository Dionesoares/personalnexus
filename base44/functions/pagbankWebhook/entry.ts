import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Mapa de status PagSeguro/PagBank -> status interno FitPro
const STATUS_MAP = {
  // PagSeguro legado
  'PAID': 'pago',
  'AVAILABLE': 'pago',
  'APPROVED': 'pago',
  'AUTHORIZED': 'pago',
  'CANCELLED': 'cancelado',
  'REFUNDED': 'cancelado',
  'CHARGED_BACK': 'cancelado',
  'IN_ANALYSIS': 'pendente',
  'WAITING': 'pendente',
  'WAITING_PAYMENT': 'pendente',
  // PagBank novo
  'PAID': 'pago',
  'DECLINED': 'cancelado',
  'CANCELED': 'cancelado',
};

Deno.serve(async (req) => {
  // Aceita apenas POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  // Extrai dados do payload PagSeguro/PagBank
  // Suporta formato legado (notificationType/notificationCode) e novo (charges[]/orders[])
  const notificationType = body.notificationType;
  const charges = body.charges || (body.order?.charges) || [];
  const orderStatus = body.order?.status || body.status;
  const referenceId = body.referenceId || body.order?.referenceId || body.reference_id;

  console.log('PagBank webhook recebido:', JSON.stringify({ notificationType, orderStatus, referenceId, chargesCount: charges.length }));

  // Resolve status interno
  let novoStatus = null;

  if (charges.length > 0) {
    // Formato novo PagBank (charges dentro do order)
    const charge = charges[0];
    novoStatus = STATUS_MAP[charge.status?.toUpperCase()] || null;
  } else if (orderStatus) {
    novoStatus = STATUS_MAP[orderStatus?.toUpperCase()] || null;
  }

  if (!novoStatus) {
    console.log('Status não mapeado ou não identificado:', { orderStatus, charges });
    return Response.json({ ok: true, message: 'Status não requer atualização' });
  }

  // Tenta encontrar a transação pelo referenceId
  if (referenceId) {
    const transacoes = await base44.asServiceRole.entities.Transacao.filter({ referenceId });

    if (transacoes.length > 0) {
      const transacao = transacoes[0];
      await base44.asServiceRole.entities.Transacao.update(transacao.id, {
        status: novoStatus,
        dataAtualizacaoPagBank: new Date().toISOString(),
        payloadPagBank: JSON.stringify(body).substring(0, 500),
      });
      console.log(`Transação ${transacao.id} atualizada para: ${novoStatus}`);
      return Response.json({ ok: true, transacaoId: transacao.id, novoStatus });
    }
  }

  // Tenta encontrar pelo valor e data (fallback)
  const chargeAmount = charges[0]?.amount?.value;
  const valorReais = chargeAmount ? chargeAmount / 100 : null;

  if (valorReais) {
    const todas = await base44.asServiceRole.entities.Transacao.filter({ status: 'pendente' });
    const match = todas.find(t => Math.abs(parseFloat(t.valor) - valorReais) < 0.01);

    if (match) {
      await base44.asServiceRole.entities.Transacao.update(match.id, {
        status: novoStatus,
        dataAtualizacaoPagBank: new Date().toISOString(),
        payloadPagBank: JSON.stringify(body).substring(0, 500),
      });
      console.log(`Transação ${match.id} atualizada por valor (R$${valorReais}) para: ${novoStatus}`);
      return Response.json({ ok: true, transacaoId: match.id, novoStatus, matchBy: 'valor' });
    }
  }

  console.log('Nenhuma transação encontrada para o webhook:', { referenceId, valorReais });
  return Response.json({ ok: true, message: 'Nenhuma transação correspondente encontrada' });
});