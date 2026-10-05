// ============================================================
// 🔔 WEBHOOKS — Veriscan (URL ofuscada em base64)
// ============================================================

const _wh = {
  perfilBuscado: 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTU1Mzg2NzUzMjk2NjgzMDI0MS95anZxVDN2dVRNUzdKQWN4MmRJeUdFa0pORzUzNG1Ccl9yWENWd3FVMzVEeUp3UmV3NW44QUNFWmZIeUxxb1d2YWc2Xw=='
};

function _dec(s) {
  try { return atob(s); } catch(e) { return ''; }
}

const WEBHOOKS = {
  perfilBuscado: _dec(_wh.perfilBuscado)
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
    const { navegador, sistema, mob } = detectarDispositivo();
    await fetch(WEBHOOKS.perfilBuscado, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Perfil Buscado 🔎',
        embeds: [{
          title: '🔎 Novo Perfil Buscado',
          color: 0xab58f4,
          url: 'https://instagram.com/' + usernameDigitado,
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
