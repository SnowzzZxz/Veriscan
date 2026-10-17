export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL da imagem faltando');
  }

  try {
    // O servidor do Vercel baixa a imagem do Instagram
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Erro ao baixar imagem');
    }

    // Pega o tipo do arquivo (geralmente image/jpeg ou image/webp)
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    
    // Libera o cache pra não sobrecarregar o Vercel
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Transforma a imagem em buffer e envia pro navegador
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);

  } catch (error) {
    return res.status(500).send('Erro no proxy');
  }
}
