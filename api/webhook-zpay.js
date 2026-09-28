// =====================================================
// 🔔 WEBHOOK DO ZPAY → Discord (canal PIX-APROVADO)
// =====================================================

const DISCORD_PIX_APROVADO = 'https://discord.com/api/webhooks/1553603832603217971/PKsNHVIYchZi_O8uYSpHAygEtv2Em_MIT-K9Rf1UBXwSuOD0QzZBV4IxbhARiubMeDbA';

module.exports = async (req, res) => {
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

        // ⏭️ Filtro: ignora eventos com mais de 1 hora
        if (data.paidAt) {
            const agora = Date.now();
            const pago = new Date(data.paidAt).getTime();
            const diffMinutos = (agora - pago) / 1000 / 60;
            if (diffMinutos > 60) {
                console.log('⏭️ Evento antigo ignorado:', data.id);
                return res.status(200).json({ ok: true, ignored: 'old' });
            }
        }

        // ---------- Extrai dados do message ----------
        // Formato esperado: "Acesso Completo - Veriscan | @fulano | João Silva | joao@email.com | 123.456.789-00 | (11) 99999-9999"
        const message = data.message || '';
        const partes = message.split(' | ').map(s => s.trim()).filter(Boolean);

        // Tenta identificar cada parte
        let alvo = '—';
        let nomeCompleto = data.donorName || '—';
        let email = '—';
        let cpf = '—';
        let telefone = '—';
        let descricao = message;

        partes.forEach(p => {
            if (p.startsWith('@')) {
                alvo = p;
            } else if (p.includes('@') && p.includes('.')) {
                email = p;
            } else if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(p)) {
                cpf = p;
            } else if (/\(\d{2}\)\s*\d{4,5}-?\d{4}/.test(p) || /^\d{10,11}$/.test(p.replace(/\D/g, ''))) {
                telefone = p;
            }
        });

        // Se achou um nome que não é o "Acesso Completo...", usa como nome
        const nomeLinha = partes.find(p => 
            !p.startsWith('Acesso Completo') && 
            !p.startsWith('@') && 
            !p.includes('@') && 
            !/\d/.test(p)
        );
        if (nomeLinha && nomeLinha !== data.donorName) {
            nomeCompleto = data.donorName || nomeLinha;
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
                name: '🎯 Alvo', 
                value: alvo, 
                inline: true 
            },
            { 
                name: '👤 Nome', 
                value: nomeCompleto, 
                inline: false 
            },
            { 
                name: '📧 E-mail', 
                value: email, 
                inline: true 
            },
            { 
                name: '🪪 CPF', 
                value: cpf, 
                inline: true 
            },
            { 
                name: '📱 Telefone', 
                value: telefone, 
                inline: true 
            },
            { 
                name: '🆔 ID ZPay', 
                value: data.id || '—', 
                inline: false 
            }
        ];

        // Adiciona a descrição completa se quiser
        if (descricao && descricao.length < 200) {
            fields.push({ name: '📝 Descrição', value: descricao, inline: false });
        }

        // 🕒 Data do pagamento (Brasília)
        if (data.paidAt) {
            fields.push({
                name: '🕒 Pago em',
                value: new Date(data.paidAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                inline: false
            });
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
