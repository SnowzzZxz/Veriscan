// =====================================================
// 🔔 WEBHOOK DO ZPAY → Discord (canal PIX-APROVADO)
// =====================================================

const DISCORD_PIX_APROVADO = 'https://discord.com/api/webhooks/1553603832603217971/PKsNHVIYchZi_O8uYSpHAygEtv2Em_MIT-K9Rf1UBXwSuOD0QzZBV4IxbhARiubMeDbA';

module.exports = async (req, res) => {
    // ZPay manda POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { event, data } = req.body || {};

        console.log('📩 Webhook ZPay recebido:', event, data?.id);

        // Só processa pagamentos aprovados
        if (event !== 'payment.paid') {
            return res.status(200).json({ ok: true, ignored: event });
        }

        // Monta os campos do embed
        const fields = [
            { name: '💵 Valor',    value: 'R$ ' + Number(data.amount || 0).toFixed(2).replace('.', ','), inline: true },
            { name: '🆔 ID',       value: data.id || '—',                                                inline: true },
            { name: '👤 Cliente',  value: data.donorName || '—',                                          inline: true },
            { name: '💳 Método',   value: (data.paymentMethod || 'pix').toUpperCase(),                    inline: true }
        ];

        if (data.message) {
            fields.push({ name: '📝 Descrição', value: data.message, inline: false });
        }

        if (data.paidAt) {
            fields.push({
                name: '🕒 Pago em',
                value: new Date(data.paidAt).toLocaleString('pt-BR'),
                inline: true
            });
        }

        // Envia pro Discord (canal PIX-APROVADO)
        await fetch(DISCORD_PIX_APROVADO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'PIX Aprovado 💰',
                embeds: [{
                    title: '💰 PIX APROVADO',
                    color: 0x22C55E,
                    fields: fields,
                    footer: { text: 'ZPay Solution' },
                    timestamp: new Date().toISOString()
                }]
            })
        });

        // Obrigatório: responde 200 pro ZPay (senão ele reenvia)
        return res.status(200).json({ ok: true });

    } catch (error) {
        console.error('❌ Erro no webhook ZPay:', error.message);
        // Mesmo com erro, responde 200 pra evitar reenvios infinitos
        return res.status(200).json({ ok: true, error: error.message });
    }
};
