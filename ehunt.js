// Morphen — EHunt API Proxy
// Bu fonksiyon, EHunt API key'ini tarayıcıdan gizler ve CORS engelini aşar.
// Suite tarayıcıdan buraya istek atar, bu fonksiyon sunucudan EHunt'a istek atar.

// Suite'in yayınlandığı domain(ler) — sadece buradan gelen isteklere izin verilir.
const ALLOWED_ORIGINS = [
  'https://mmorphenn.github.io'
];

const ENDPOINT_MAP = {
  items: '/api/v1/items',
  stores: '/api/v1/stores',
  category: '/api/v1/get-category-tree'
};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const originOk = ALLOWED_ORIGINS.includes(origin);
  if (originOk) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Morphen-Secret');

  // Tarayıcı preflight isteği
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
  }

  // Origin eşleşmiyorsa isteği burada tamamen kes — eskiden sadece CORS header'ı atlanıyordu,
  // ama istek yine de EHunt'a gidip kredi harcıyordu. curl/script ile doğrudan çağrıları engelle.
  if (!originOk) {
    return res.status(403).json({ error: 'Bu origin\'den isteğe izin verilmiyor.' });
  }

  // Ek koruma katmanı: paylaşılan anahtar. Tarayıcıda görünür olduğu için tam bir "sır" değil,
  // ama URL'i bulan/otomatik tarayan araçların işini zorlaştırır.
  const sharedSecret = process.env.MORPHEN_SHARED_SECRET;
  if (sharedSecret && req.headers['x-morphen-secret'] !== sharedSecret) {
    return res.status(403).json({ error: 'Geçersiz istek imzası.' });
  }

  const { endpoint, params } = req.body || {};

  const path = ENDPOINT_MAP[endpoint];
  if (!path) {
    return res.status(400).json({
      error: 'Geçersiz endpoint. "items", "stores" veya "category" kullan.'
    });
  }

  const apiKey = process.env.EHUNT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'EHUNT_API_KEY ortam değişkeni tanımlı değil. Vercel proje ayarlarından ekle ve yeniden deploy et.'
    });
  }

  try {
    const ehuntRes = await fetch(`https://api.ehunt.ai${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VIP-TOKEN': apiKey
      },
      body: JSON.stringify(params || {})
    });

    const text = await ehuntRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(ehuntRes.status).json(data);
  } catch (err) {
    return res.status(502).json({
      error: "EHunt API'ye ulaşılamadı.",
      detail: err.message
    });
  }
}
