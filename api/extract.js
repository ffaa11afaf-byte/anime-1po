<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SeaStream - المشغل النظيف</title>
    <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
    <style>
        body { background-color: #0f0f12; color: #fff; font-family: sans-serif; margin: 0; padding: 15px; display: flex; flex-direction: column; align-items: center; }
        .player-container { width: 100%; max-width: 800px; background: #1a1a24; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a35; }
        .controls-box { margin-top: 15px; width: 100%; max-width: 800px; display: flex; gap: 10px; }
        input { flex: 1; padding: 12px; background: #18181c; border: 1px solid #333; color: #fff; border-radius: 6px; text-align: left; direction: ltr; }
        button { padding: 12px 20px; background: #ff9800; border: none; color: #000; font-weight: bold; border-radius: 6px; cursor: pointer; }
        #statusMsg { margin-top: 10px; color: #ff9800; font-size: 0.9rem; }
    </style>
</head>
<body>

    <h2>🎥 مشغل SeaStream النظيف</h2>

    <div class="player-container">
        <video id="cleanPlayer" controls playsinline poster="https://i.ibb.co/ksB7CMLK/P964379864.png">
            <source id="videoSource" src="" type="video/mp4" />
        </video>
    </div>

    <div class="controls-box">
        <input type="text" id="embedUrlInput" placeholder="ضع رابط الـ Embed هنا (مثل stape.me/e/...)" value="https://stape.me/e/y082mPgKmKCy8o">
        <button onclick="extractAndPlay()">تشغيل الفيديو</button>
    </div>

    <div id="statusMsg"></div>

    <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
    <script>
        const player = new Plyr('#cleanPlayer', { ratio: '16:9' });

        async function extractAndPlay() {
            const embedUrl = document.getElementById('embedUrlInput').value.trim();
            const statusMsg = document.getElementById('statusMsg');

            if(!embedUrl) return alert('يرجى وضع رابط Embed صالح');

            statusMsg.innerText = "جاري فك التشفير واستخراج الفيديو الصافي...";

            try {
                // استدلاء الـ API بالمسار المباشر
                const response = await fetch(`/api/extract?url=${encodeURIComponent(embedUrl)}`);
                const data = await response.json();

                if (data.status === 'success' && data.videoUrl) {
                    statusMsg.innerText = "تم الاستخراج بنجاح! جاري التشغيل...";
                    
                    const videoElement = document.getElementById('cleanPlayer');
                    const sourceElement = document.getElementById('videoSource');

                    sourceElement.src = data.videoUrl;
                    videoElement.load();
                    player.play();
                } else {
                    statusMsg.innerText = "فشل استخراج الفيديو: " + (data.message || "خطأ غير معروف");
                }
            } catch (err) {
                console.error(err);
                statusMsg.innerText = "حدث خطأ أثناء الاتصال بالـ API الوسيط";
            }
        }
    </script>
</body>
</html>
