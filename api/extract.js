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

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://streamtape.com/'
            }
        });

        const html = await response.text();

        const match = html.match(/document\.getElementById\('robotlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*'([^']+)'/);
        
        if (match) {
            const part1 = match[1];
            const part2 = match[2].substring(3);
            const directVideoUrl = `https:${part1}${part2}&stream=1`;

            return res.status(200).json({
                status: 'success',
                server: 'Streamtape',
                videoUrl: directVideoUrl
            });
        }

        return res.status(422).json({
            status: 'error',
            message: 'تعذر فك تشفير الفيديو، قد يكون الرابط محذوفاً أو تغير التشفير'
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'حدث خطأ في السيرفر الوسيط: ' + error.message
        });
    }
}
