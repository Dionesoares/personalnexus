import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PAGBANK_SANDBOX_URL = 'https://sandbox.api.pagseguro.com';
const PAGBANK_PROD_URL = 'https://api.pagseguro.com';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { transacaoId, cartao, comprador } = body;

  if (!transacaoId || !cartao) {
    return Response.json({ error: 'transacaoId e cartao são obrigatórios' }, { status: 400 });
  }

  // Busca config PagBank salva
  const configs = await base44.asServiceRole.entities.ConfiguracaoPagBank.filter({});
  const cfg = configs[0];

  if (!cfg || !cfg.token) {
    return Response.json({ error: 'PagBank não configurado. Acesse Financeiro > PagBank e salve suas credenciais.' }, { status: 400 });
  }

  // Busca a transação
  const transacao = await base44.asServiceRole.entities.Transacao.get(transacaoId);
  if (!transacao) {
    return Response.json({ error: 'Transação não encontrada' }, { status: 404 });
  }

  const baseUrl = cfg.ambiente === 'producao' ? PAGBANK_PROD_URL : PAGBANK_SANDBOX_URL;
  const valorCentavos = Math.round(parseFloat(transacao.valor) * 100);

  // Monta payload PagBank
  const payload = {
    reference_id: transacaoId,
    customer: {
      name: comprador?.nome || 'Cliente FitPro',
      email: comprador?.email || user.email,
      tax_id: (comprador?.cpf || '00000000000').replace(/\D/g, ''),
      phones: comprador?.telefone ? [{
        country: '55',
        area: comprador.telefone.replace(/\D/g, '').substring(0, 2),
        number: comprador.telefone.replace(/\D/g, '').substring(2),
        type: 'MOBILE',
      }] : [],
    },
    items: [{
      reference_id: transacaoId,
      name: transacao.descricao || 'Mensalidade',
      quantity: 1,
      unit_amount: valorCentavos,
    }],
    charges: [{
      reference_id: transacaoId,
      description: transacao.descricao || 'Mensalidade FitPro',
      amount: {
        value: valorCentavos,
        currency: 'BRL',
      },
      payment_method: {
        type: 'CREDIT_CARD',
        installments: parseInt(cartao.parcelas) || 1,
        capture: true,
        card: {
          number: cartao.numero.replace(/\s/g, ''),
          exp_month: cartao.mesValidade,
          exp_year: cartao.anoValidade,
          security_code: cartao.cvv,
          holder: {
            name: cartao.nomeTitular,
          },
        },
      },
    }],
    notification_urls: [
      'https://api.base44.com/api/apps/682a6a7af17a7a718e0765ce/functions/pagbankWebhook',
    ],
  };

  console.log('Enviando para PagBank:', JSON.stringify({ baseUrl, ambiente: cfg.ambiente, valor: valorCentavos }));

  const response = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
      'x-api-version': '4.0',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log('Resposta PagBank:', JSON.stringify(result));

  if (!response.ok) {
    return Response.json({
      error: result.error_messages?.[0]?.description || result.description || 'Erro ao processar pagamento',
      details: result,
    }, { status: 400 });
  }

  // Verifica se foi aprovado
  const charge = result.charges?.[0];
  const chargeStatus = charge?.status;

  let novoStatus = 'pendente';
  if (chargeStatus === 'PAID' || chargeStatus === 'AUTHORIZED') novoStatus = 'pago';
  else if (chargeStatus === 'DECLINED' || chargeStatus === 'CANCELED') novoStatus = 'cancelado';

  // Atualiza transação no banco
  await base44.asServiceRole.entities.Transacao.update(transacaoId, {
    status: novoStatus,
    pagbankOrderId: result.id,
    pagbankChargeId: charge?.id,
    dataAtualizacaoPagBank: new Date().toISOString(),
  });

  return Response.json({
    ok: true,
    status: chargeStatus,
    novoStatus,
    orderId: result.id,
    chargeId: charge?.id,
    mensagem: novoStatus === 'pago'
      ? 'Pagamento aprovado com sucesso!'
      : novoStatus === 'cancelado'
        ? 'Pagamento recusado. Verifique os dados do cartão.'
        : 'Pagamento em análise.',
  });
});