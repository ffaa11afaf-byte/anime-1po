// api/extract.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: 'error', message: 'يرجى تزويد رابط Embed' });
    }

    try {
        let targetUrl = url.replace('stape.me', 'streamtape.com');

        // طلب الصفحة مع محاكاة متصفح هاتف حقيقي لتجاوز الحماية
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const html = await response.text();

        // فك التشفير عبر البحث عن السلسلة الموزعة داخل الـ DOM
        const robotMatch = html.match(/document\.getElementById\('robotlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*'([^']+)'/);
        
        if (robotMatch) {
            const part1 = robotMatch[1];
            const part2 = robotMatch[2].substring(3);
            const directVideoUrl = `https:${part1}${part2}&stream=1`;

            return res.status(200).json({
                status: 'success',
                server: 'Streamtape',
                videoUrl: directVideoUrl
            });
        }

        // محاولة استخراج النمط الاحتياطي
        const streamLinkMatch = html.match(/id="norobotlink"[^>]*>([^<]+)/);
        if(streamLinkMatch) {
             return res.status(200).json({
                status: 'success',
                server: 'Streamtape Alt',
                videoUrl: `https:${streamLinkMatch[1]}&stream=1`
            });
        }

        return res.status(422).json({
            status: 'error',
            message: 'السيرفر حظر الطلب تلقائياً (Bot Protection). يُنصح بتجربة سيرفر Voe.sx أو Doodstream كبديل أكثر استقراراً.'
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء فك التشفير: ' + error.message
        });
    }
}
