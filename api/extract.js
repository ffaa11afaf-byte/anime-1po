// api/extract.js
const axios = require('axios');

export default async function handler(req, res) {
    // السماح بالوصول من أي مكان (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'يرجى تزويد رابط Embed' });
    }

    try {
        // 1. إرسال طلب محاكي لمتصفح حقيقي مع Referer ممتاز
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://streamtape.com/',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = response.data;

        // 2. محرك فك تشفير Streamtape المباشر
        if (url.includes('streamtape') || url.includes('stape')) {
            // البحث عن المتغيرات المشفّرة داخل عنصر robotlink
            const match = html.match(/document\.getElementById\('robotlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*'([^']+)'/);
            
            if (match) {
                const part1 = match[1];
                const part2 = match[2].substring(3); // تخطي أول 3 محارف مشفرة
                const directVideoUrl = `https:${part1}${part2}&stream=1`;

                return res.status(200).json({
                    status: 'success',
                    server: 'Streamtape',
                    videoUrl: directVideoUrl,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                        'Referer': 'https://streamtape.com/'
                    }
                });
            }
        }

        // إذا لم يتم فك التشفير أو كان السيرفر غير مدعوم حالياً
        return res.status(422).json({
            status: 'error',
            message: 'تعذر فك تشفير الرابط أو أن السيرفر غير مدعوم بعد'
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'حدث خطأ في الاتصال بالسيرفر المصدر',
            details: error.message
        });
    }
}
