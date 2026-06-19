import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
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

    // Busca config Stripe salva (reutilizando entidade ConfiguracaoPagBank: email=publishableKey, token=secretKey)
    const configs = await base44.asServiceRole.entities.ConfiguracaoPagBank.filter({});
    const cfg = configs[0];

    if (!cfg || !cfg.token) {
      return Response.json({ error: 'Stripe não configurado. Acesse Financeiro > Stripe e salve suas credenciais.' }, { status: 400 });
    }

    // Busca a transação
    const transacao = await base44.asServiceRole.entities.Transacao.get(transacaoId);
    if (!transacao) {
      return Response.json({ error: 'Transação não encontrada' }, { status: 404 });
    }

    const stripe = new Stripe(cfg.token, { apiVersion: '2023-10-16' });
    const valorCentavos = Math.round(parseFloat(transacao.valor) * 100);
    const parcelas = parseInt(cartao.parcelas) || 1;

    // Cria PaymentMethod com os dados do cartão
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cartao.numero.replace(/\s/g, ''),
        exp_month: parseInt(cartao.mesValidade),
        exp_year: parseInt(cartao.anoValidade),
        cvc: cartao.cvv,
      },
      billing_details: {
        name: cartao.nomeTitular,
        email: comprador?.email || user.email,
      },
    });

    // Cria e confirma o PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: valorCentavos,
      currency: 'brl',
      payment_method: paymentMethod.id,
      confirm: true,
      description: transacao.descricao || 'Pagamento FitPro',
      metadata: {
        transacaoId,
        alunoNome: comprador?.nome || '',
        cpf: comprador?.cpf || '',
      },
      // Parcelamento via installments (disponível para contas BR)
      ...(parcelas > 1 ? {
        payment_method_options: {
          card: {
            installments: { enabled: true },
            request_three_d_secure: 'automatic',
          },
        },
      } : {}),
      return_url: 'https://app.base44.com',
    });

    console.log('Stripe PaymentIntent:', paymentIntent.id, 'status:', paymentIntent.status);

    // Mapeia status Stripe → status interno
    let novoStatus = 'pendente';
    if (paymentIntent.status === 'succeeded') novoStatus = 'pago';
    else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method') novoStatus = 'cancelado';

    // Atualiza transação no banco
    await base44.asServiceRole.entities.Transacao.update(transacaoId, {
      status: novoStatus,
      stripePaymentIntentId: paymentIntent.id,
      dataAtualizacaoStripe: new Date().toISOString(),
    });

    return Response.json({
      ok: true,
      status: paymentIntent.status,
      novoStatus,
      chargeId: paymentIntent.id,
      mensagem: novoStatus === 'pago'
        ? 'Pagamento aprovado com sucesso!'
        : novoStatus === 'cancelado'
          ? 'Pagamento recusado. Verifique os dados do cartão.'
          : 'Pagamento em análise.',
    });

  } catch (error) {
    console.error('Stripe error:', error.message);
    // Erro de cartão recusado da Stripe vem como StripeCardError
    const msg = error.type === 'StripeCardError'
      ? error.message
      : 'Erro ao processar pagamento. Tente novamente.';
    return Response.json({ error: msg }, { status: 400 });
  }
});