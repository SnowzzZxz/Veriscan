export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { u } = req.query;

  if (!u || typeof u !== 'string') {
    return res.status(400).json({ error: 'username_obrigatorio' });
  }

  try {
    // Tenta fazer a requisição fingindo ser um navegador normal
    const response = await fetch(`https://viuspy.site/api/instagram.php?tipo=perfil&username=${encodeURIComponent(u)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://viuspy.site/',
        'Origin': 'https://viuspy.site'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'erro_viuspy', status: response.status });
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ error: 'falha_conexao', detail: error.message });
  }
}
