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
        // طلب صفحة Voe.sx
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://voe.sx/'
            }
        });

        const html = await response.text();

        // 1. البحث عن روابط MP4 المباشرة في الصفحة
        const mp4Match = html.match(/'hls':\s*'([^']+)'/) || html.match(/\['src'\]\s*=\s*'([^']+)'/) || html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]+/);

        if (mp4Match) {
            return res.status(200).json({
                status: 'success',
                server: 'Voe.sx',
                videoUrl: mp4Match[1] || mp4Match[0]
            });
        }

        // 2. فك شفرة Base64 لنظام Voe الجديد إذا كان الملف مشفراً
        const b64Match = html.match(/let\s+sources\s*=\s*\{"hls":\s*"([^"]+)"/);
        if (b64Match) {
            const decodedUrl = Buffer.from(b64Match[1], 'base64').toString('utf-8');
            return res.status(200).json({
                status: 'success',
                server: 'Voe.sx (Decoded)',
                videoUrl: decodedUrl
            });
        }

        return res.status(422).json({
            status: 'error',
            message: 'تعذر استخراج الرابط المباشر من Voe.sx'
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'حدث خطأ في السيرفر الوسيط: ' + error.message
        });
    }
}
