// ============================================================
// 🔔 WEBHOOKS — Veriscan
// ============================================================

const WEBHOOKS = {
  perfilBuscado: 'https://discord.com/api/webhooks/1553867532966830241/yjvqT3vuTMS7JAcx2dIyGEkJNG534mBr_rXCVwqU35DyJwRew5n8ACEZfHyLqoWvag6_'
};

function detectarDispositivo() {
  const ua = navigator.userAgent;
  let navegador = 'Desconhecido';
  if (ua.includes('Firefox')) navegador = 'Firefox';
  else if (ua.includes('Edg')) navegador = 'Edge';
  else if (ua.includes('Chrome')) navegador = 'Chrome';
  else if (ua.includes('Safari')) navegador = 'Safari';

  let sistema = 'Desconhecido';
  if (/Windows NT 10/.test(ua)) sistema = 'Windows 10/11';
  else if (/Android/.test(ua)) sistema = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) sistema = 'iOS';
  else if (/Mac OS X/.test(ua)) sistema = 'macOS';
  else if (/Linux/.test(ua)) sistema = 'Linux';

  const mob = /iPhone|iPad|iPod|Android/i.test(ua);

  return { navegador, sistema, mob };
}

async function notificarPerfilDigitado(usernameDigitado) {
  try {
    const link = 'https://instagram.com/' + usernameDigitado;
    const { navegador, sistema, mob } = detectarDispositivo();

    await fetch(WEBHOOKS.perfilBuscado, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Perfil Buscado 🔎',
        embeds: [{
          title: '🔎 Novo Perfil Buscado',
          color: 0xab58f4,
          url: link,
          fields: [
            { name: '👤 Perfil', value: '@' + usernameDigitado, inline: true },
            { name: '📱 Dispositivo', value: mob ? '📱 Mobile' : '💻 Desktop', inline: true },
            { name: '🖥️ Sistema', value: sistema, inline: true },
            { name: '🌐 Navegador', value: navegador, inline: true },
            { name: '🕒 Horário', value: new Date().toLocaleString('pt-BR'), inline: false }
          ],
          footer: { text: 'Veriscan' },
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (e) {
    console.warn('Webhook falhou:', e);
  }
}

async function notificarAcessoVIP(username) {
  try {
    const { navegador, sistema, mob } = detectarDispositivo();
    await fetch(WEBHOOKS.perfilBuscado, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'VIP 🎯',
        embeds: [{
          title: '🎯 Cliente clicou em VIP',
          color: 0x22c55e,
          fields: [
            { name: '👤 Perfil', value: '@' + username, inline: true },
            { name: '📱 Dispositivo', value: mob ? '📱 Mobile' : '💻 Desktop', inline: true },
            { name: '🖥️ Sistema', value: sistema, inline: true },
            { name: '🌐 Navegador', value: navegador, inline: true },
            { name: '🕒 Horário', value: new Date().toLocaleString('pt-BR'), inline: false }
          ],
          footer: { text: 'Veriscan' },
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (e) {
    console.warn('Webhook falhou:', e);
  }
}
