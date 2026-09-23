export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Token ou código não fornecido' });
  }

  const cleanToken = refresh_token.trim();
  const isCode = cleanToken.startsWith('TG-');
  const grantType = isCode ? 'authorization_code' : 'refresh_token';

  const clientId = "5408499095968669";
  const clientSecret = process.env.MELI_CLIENT_SECRET ? process.env.MELI_CLIENT_SECRET.trim() : '';

  if (!clientSecret) {
    return res.status(500).json({ error: 'MELI_CLIENT_SECRET não foi configurada na Vercel.' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: grantType,
    redirect_uri: 'https://api-mercadolivre-nu.vercel.app'
  });

  if (isCode) {
    params.append('code', cleanToken);
  } else {
    params.append('refresh_token', cleanToken);
  }

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao comunicar com a API do Mercado Livre', details: error.message });
  }
}
