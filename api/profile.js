export default async function handler(req, res) {
  // Libera o CORS pro seu site acessar essa rota
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { u } = req.query;

  if (!u || typeof u !== 'string') {
    return res.status(400).json({ error: 'username_obrigatorio' });
  }

  try {
    // O Vercel (servidor) chama o viuspy, então o CORS não se aplica aqui.
    const response = await fetch(`https://viuspy.site/api/instagram.php?tipo=perfil&username=${encodeURIComponent(u)}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'erro_viuspy' });
    }

    const data = await response.json();
    
    // Repassa o JSON do viuspy para o seu HTML
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(500).json({ error: 'falha_conexao', detail: error.message });
  }
}
