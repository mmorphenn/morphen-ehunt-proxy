# Morphen EHunt Proxy — Kurulum

## 1. GitHub'a yükle
Bu klasörü (api/ehunt.js + package.json) yeni bir GitHub repo'suna yükle.
Örnek isim: `morphen-ehunt-proxy`
Repo public veya private olabilir, fark etmez.

## 2. Vercel'e bağla
1. vercel.com'a git, GitHub hesabınla giriş yap
2. "Add New Project" → az önce oluşturduğun repo'yu seç
3. Framework olarak "Other" seçili kalsın, ayar değiştirme
4. "Deploy" butonuna bas — birkaç saniyede biter

## 3. API key'i ekle (ÇOK ÖNEMLİ — bunu atlarsan çalışmaz)
1. Vercel projende → Settings → Environment Variables
2. Key: `EHUNT_API_KEY`
   Value: `vip_bae4...ea02f330` (senin gerçek key'in — panelden kopyala)
3. Save
4. Deployments sekmesine git → en son deployment'ın yanındaki "..." → Redeploy
   (env variable eklemek otomatik redeploy tetiklemez, elle yapman lazım)

## 4. URL'ini al
Deploy bitince Vercel sana bir adres verir, örn:
`https://morphen-ehunt-proxy.vercel.app`

Gerçek endpoint'in şu olacak:
`https://morphen-ehunt-proxy.vercel.app/api/ehunt`

## 5. Suite'ten nasıl çağrılır
```js
const res = await fetch('https://morphen-ehunt-proxy.vercel.app/api/ehunt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'items',       // 'items' | 'stores' | 'category'
    params: {
      search_key: 'wedding ring',
      page_num: 1,
      page_size: 20
    }
  })
});
const data = await res.json();
```

## Not
`api/ehunt.js` içindeki `ALLOWED_ORIGINS` listesi şu an sadece
`https://mmorphenn.github.io` adresine izin veriyor. Suite'i farklı bir
adreste test edersen (örn. localhost) o adresi de listeye eklemen gerekir,
yoksa CORS hatası alırsın (aynı önceki hata gibi, ama bu sefer bizim proxy'den).
