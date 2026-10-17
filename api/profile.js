export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { u } = req.query;
  if (!u) return res.status(400).json({ error: 'username_obrigatorio' });

  try {
    const r = await fetch(`https://instagram-looter2.p.rapidapi.com/profile2?username=${encodeURIComponent(u)}`, {
      headers: {
        'x-rapidapi-host': 'instagram-looter2.p.rapidapi.com',
        'x-rapidapi-key': '20923299a2mshc59a2cc30d91795p16b825jsn037592da1cf7'
      }
    });
    const d = await r.json();
    return res.status(200).json(d);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
