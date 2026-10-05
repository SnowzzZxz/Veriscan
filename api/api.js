// ============================================================
// 🔌 APIS EM CASCATA — Veriscan
// ============================================================

const APIS = [
  {
    nome: 'Looter MCP',
    host: 'instagram-looter2.p.rapidapi.com',
    key:  '223f5f17a8mshd2346639777aea7p15b3d6jsn6e6a3424645b',
    buildUrl: (u) => `https://instagram-looter2.p.rapidapi.com/profile2?username=${encodeURIComponent(u)}`
  },
  {
    nome: 'Stable',
    host: 'instagram-scraper-stable-api.p.rapidapi.com',
    key:  'cd0089e6c8msh1618a66089e0734p18a81ejsn7028d767d6fe',
    buildUrl: (u) => `https://instagram-scraper-stable-api.p.rapidapi.com/ig_get_fb_profile_hover.php?username_or_url=${encodeURIComponent(u)}`
  },
  {
    nome: 'Looter Nova',
    host: 'instagram-looter2.p.rapidapi.com',
    key:  '616c6d0667mshadf757fba9cc993p176c9djsn862a5812f871',
    buildUrl: (u) => `https://instagram-looter2.p.rapidapi.com/profile2?username=${encodeURIComponent(u)}`
  },
  {
    nome: 'Looter Antiga',
    host: 'instagram-looter2.p.rapidapi.com',
    key:  'e3cd2d0d2fmsh0dced0acd30a539p1c7338jsn42c4ecbbcca6',
    buildUrl: (u) => `https://instagram-looter2.p.rapidapi.com/profile2?username=${encodeURIComponent(u)}`
  },
  {
    nome: 'Looter Nova 2',
    host: 'instagram-looter2.p.rapidapi.com',
    key:  '950eac8e3cmsh6ffa910eedbc232p1928f0jsnd7fe057ba05b',
    buildUrl: (u) => `https://instagram-looter2.p.rapidapi.com/profile2?username=${encodeURIComponent(u)}`
  }
];

let API_OK = null;
try {
  const saved = localStorage.getItem('ig_api_ok');
  if (saved) API_OK = JSON.parse(saved);
} catch(e){}

async function tentarAPI(api, username) {
  const url = api.buildUrl(username);
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': api.host,
        'x-rapidapi-key':  api.key
      }
    });
    if (r.status === 429 || r.status === 403 || r.status === 401) {
      console.warn(`[${api.nome}] ❌ HTTP ${r.status}`);
      return null;
    }
    if (!r.ok) { console.warn(`[${api.nome}] ❌ HTTP ${r.status}`); return null; }
    const d = await r.json();
    if (d.error || d.message) { console.warn(`[${api.nome}] ❌`, d.error || d.message); return null; }
    const user = d.user_data || (d.data && d.data.user) || d.data || d;
    if (user && (user.username || user.pk || user.id || user.full_name)) {
      console.log(`✅ [${api.nome}] OK`);
      return user;
    }
    console.warn(`[${api.nome}] ❌ formato inválido`);
    return null;
  } catch (e) {
    console.warn(`[${api.nome}] ❌ erro rede:`, e.message);
    return null;
  }
}

async function buscarPerfil(u) {
  if (API_OK) {
    const api = APIS.find(a => a.nome === API_OK.nome);
    if (api) {
      const r = await tentarAPI(api, u);
      if (r) { console.log('✅ API salva:', api.nome); return normalizar(r, u); }
    }
    try { localStorage.removeItem('ig_api_ok'); } catch(e){}
    API_OK = null;
  }
  console.log('🔄 Testando APIs em cascata...');
  for (const api of APIS) {
    console.log(`  → tentando [${api.nome}]`);
    const r = await tentarAPI(api, u);
    if (r) {
      API_OK = { nome: api.nome };
      try { localStorage.setItem('ig_api_ok', JSON.stringify(API_OK)); } catch(e){}
      console.log('🎯 API ESCOLHIDA:', api.nome);
      return normalizar(r, u);
    }
  }
  console.warn('❌ Todas as APIs falharam');
  return null;
}

function normalizar(user, usernameFallback) {
  const u = user.user || (user.data && user.data.user) || user;

  let foto = '';
  if (typeof u.profile_pic_url === 'string' && u.profile_pic_url.startsWith('http')) foto = u.profile_pic_url;
  else if (u.hd_profile_pic_url_info && u.hd_profile_pic_url_info.url) foto = u.hd_profile_pic_url_info.url;
  else if (u.profile_pic_url_hd && typeof u.profile_pic_url_hd === 'string') foto = u.profile_pic_url_hd;
  else if (u.profile_picture && typeof u.profile_picture === 'string') foto = u.profile_picture;
  else foto = 'https://unavatar.io/instagram/' + usernameFallback;

  const bioRaw =
    u.biography || u.bio || u.about || u.description ||
    u.biography_text || u.bio_text || u.about_biography ||
    u.edge_about || u.user?.biography || u.user?.bio || '';
  const bio = (typeof bioRaw === 'string' && bioRaw.trim() && bioRaw.trim() !== 'null') ? bioRaw.trim() : '';

  const seguidores = u.follower_count || u.followers_count || u.followers || u.edge_followed_by?.count || 0;
  const seguindo   = u.following_count || u.following || u.edge_follow?.count || 0;
  const posts      = u.media_count || u.posts_count || u.posts || u.edge_owner_to_timeline_media?.count || 0;
  const nome       = u.full_name || u.name || u.username || usernameFallback;

  return {
    username:        u.username || usernameFallback,
    full_name:       nome,
    biography:       bio,
    profile_pic_url: foto,
    follower_count:  seguidores,
    following_count: seguindo,
    media_count:     posts,
    id:              u.id || u.pk,
    pk:              u.pk || u.id,
    is_verified:     u.is_verified || false,
    is_private:      u.is_private  || false
  };
}
