/*
=============================================================================
API /api/aprovar-pix
=============================================================================

Força a aprovação de um PIX pendente na ZPay.

POST:
  /api/aprovar-pix
  Body: { "paymentId": "6aa445e6..." }
=============================================================================
*/

const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    try {
        const { paymentId } = req.body || {};

        if (!paymentId) {
            return res.status(400).json({
                ok: false,
                error: 'paymentId obrigatório'
            });
        }

        const CLIENT_ID     = process.env.ZPAY_CLIENT_ID;
        const CLIENT_SECRET = process.env.ZPAY_CLIENT_SECRET;
        const ZPAY_API_URL  = process.env.ZPAY_API_URL || 'https://zpaysolution.com/api/v1';

        if (!CLIENT_ID || !CLIENT_SECRET) {
            return res.status(500).json({
                ok: false,
                error: 'Credenciais ZPay não configuradas'
            });
        }

        console.log('🎯 Aprovando PIX:', paymentId);

        const response = await axios.post(
            `${ZPAY_API_URL}/payments/${encodeURIComponent(paymentId)}/approve`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'client-id': CLIENT_ID,
                    'client-secret': CLIENT_SECRET
                }
            }
        );

        console.log('✅ PIX aprovado:', response.data);

        return res.status(200).json({
            ok: true,
            data: response.data
        });

    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message || 'Erro desconhecido';

        console.error('❌ Erro ao aprovar PIX:', status, message);

        if (status === 409) {
            return res.status(409).json({
                ok: false,
                error: 'PIX ainda está pendente ou já foi processado'
            });
        }

        if (status === 404) {
            return res.status(404).json({
                ok: false,
                error: 'PIX não encontrado'
            });
        }

        return res.status(status).json({
            ok: false,
            error: message
        });
    }
};
