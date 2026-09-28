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

        // ⏭️ FILTRO: ignora eventos com mais de 1 hora (evita spam de vendas antigas)
        if (data.paidAt) {
            const agora = Date.now();
            const pago = new Date(data.paidAt).getTime();
            const diffMinutos = (agora - pago) / 1000 / 60;
            if (diffMinutos > 60) {
                console.log('⏭️ Evento antigo ignorado:', data.id, Math.round(diffMinutos) + 'min atrás');
                return res.status(200).json({ ok: true, ignored: 'old' });
            }
        }

        // ---------- Monta os campos do embed ----------
        const fields = [
            { 
                name: '💵 Valor', 
                value: 'R$ ' + Number(data.amount || 0).toFixed(2).replace('.', ','), 
                inline: true 
            },
            { 
                name: '💳 Método', 
                value: (data.paymentMethod || 'pix').toUpperCase(), 
                inline: true 
            },
            { 
                name: '🆔 ID ZPay', 
                value: data.id || '—', 
                inline: false 
            }
        ];

        // 👤 Nome do cliente
        if (data.donorName) {
            fields.push({ name: '👤 Cliente', value: data.donorName, inline: true });
        }

        // 📧 Email (se o ZPay mandar)
        if (data.donorEmail || data.email) {
            fields.push({ name: '📧 E-mail', value: data.donorEmail || data.email, inline: true });
        }

        // 📱 Telefone (se o ZPay mandar)
        if (data.donorPhone || data.phone) {
            fields.push({ name: '📱 Telefone', value: data.donorPhone || data.phone, inline: true });
        }

        // 🪪 CPF / documento (se o ZPay mandar)
        if (data.donorDocument || data.document || data.donorDocument) {
            fields.push({ name: '🪪 CPF', value: data.donorDocument || data.document, inline: true });
        }

        // 📝 Descrição / mensagem
        if (data.message) {
            fields.push({ name: '📝 Descrição', value: data.message, inline: false });
        }

        // 🔎 Origem (api, checkout, etc)
        if (data.origin) {
            fields.push({ name: '🔎 Origem', value: data.origin, inline: true });
        }

        // 🆔 ID da transação do cliente (se o ZPay mandar)
        if (data.clientTransactionId) {
            fields.push({ name: '🔗 Ref. Cliente', value: data.clientTransactionId, inline: true });
        }

        // 🕒 Data do pagamento (convertida pro fuso de Brasília)
        if (data.paidAt) {
            fields.push({
                name: '🕒 Pago em',
                value: new Date(data.paidAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                inline: false
            });
        }

        // 📅 Data de criação (convertida pro fuso de Brasília)
        if (data.createdAt) {
            fields.push({
                name: '📅 Criado em',
                value: new Date(data.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                inline: false
            });
        }

        // 🎯 Alvo (se vier no message, tipo "Acesso Completo - Veriscan @fulano")
        if (data.message && data.message.includes('@')) {
            const match = data.message.match(/@([\w.\-_]+)/);
            if (match) {
                fields.push({ name: '🎯 Alvo', value: '@' + match[1], inline: true });
            }
        }

        // ---------- Envia pro Discord ----------
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

        return res.status(200).json({ ok: true });

    } catch (error) {
        console.error('❌ Erro no webhook ZPay:', error.message);
        return res.status(200).json({ ok: true, error: error.message });
    }
};
