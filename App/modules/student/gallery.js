if (!window.__GALLERY_INIT__) {
window.__GALLERY_INIT__ = true;

window.socialUtils = window.socialUtils || {
    timeAgo: (ts) => {
        const ms = Date.now() - ts;
        const sec = Math.floor(ms / 1000);
        if (sec < 60) return "Just now";
        const min = Math.floor(sec / 60);
        if (min < 60) return min + "m ago";
        const hr = Math.floor(min / 60);
        if (hr < 24) return hr + "h ago";
        return Math.floor(hr / 24) + "d ago";
    },
    downloadImage: async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename || 'wings-academy-photo.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
            window.open(downloadUrl, '_blank');
        }
    }
};

window.lastLoadedTimestamp = window.lastLoadedTimestamp || null;
window.isLoadingMore = window.isLoadingMore || false;
window.currentUserPhone = window.currentUserPhone || null;

window.render_gallery = function(user) {
    const container = document.getElementById('main-content');
    const myPhone = String(user?.phone ?? '9100000000').replace(/\+/g, '');
    window.currentUserPhone = myPhone;
    window.currentUserName = user.name || "User"; 

    container.innerHTML = `
        <style>
            .post-card { border-radius: 40px; background: white; border: 1px solid #f1f5f9; margin-bottom: 2rem; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .img-grid-item { border-radius: 30px; border: 4px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); cursor: zoom-in; }
            #full-preview-modal { z-index: 1000; display: none; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); }
            .download-badge { background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.2); }
        </style>

        <div class="max-w-md mx-auto mt-[25px] pb-40 animate-in fade-in duration-700">
            <div id="social-feed" class="space-y-2 px-4"></div>
        </div>

        <div id="full-preview-modal" class="fixed inset-0 flex flex-col items-center justify-center p-6">
            <button onclick="closeFullPreview()" class="absolute top-10 right-10 text-white p-4">
                <i data-lucide="x" class="w-10 h-10"></i>
            </button>
            <div class="mb-10">
                <button id="download-btn-dynamic"
                class="download-badge px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3">
                    Download
                </button>
            </div>
            <div class="w-full max-w-4xl h-[60vh] flex items-center justify-center">
                <img id="full-preview-img" src="" class="max-w-full max-h-full object-contain rounded-3xl shadow-2xl">
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
    loadFeed(myPhone);
};

window.openFullPreview = (url) => {
    const modal = document.getElementById('full-preview-modal');
    const img = document.getElementById('full-preview-img');
    const dlBtn = document.getElementById('download-btn-dynamic');

    img.src = url;
    modal.style.display = 'flex';

    dlBtn.onclick = () => window.open(url, '_blank');

    if (window.lucide) lucide.createIcons();
};

window.closeFullPreview = () => {
    document.getElementById('full-preview-modal').style.display = 'none';
};

function loadFeed(myPhone) {
    db.ref('social_feed').orderByChild('timestamp').limitToLast(15).on('value', snap => {
        let posts = [];
        snap.forEach(c => { posts.push({ id: c.key, ...c.val() }); });
        posts.sort((a, b) => b.timestamp - a.timestamp);
        renderPosts(posts, myPhone, true);
    });
}

function renderPosts(posts, myPhone) {
    const feed = document.getElementById('social-feed');
    if (!feed) return;

    let html = '';

    posts.forEach(post => {
        const userName = post.userName || 'User';
        const ytId = post.youtubeId;

        const ytEmbedUrl = ytId
            ? `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&iv_load_policy=3`
            : null;

        html += `
        <div class="post-card p-2">

            <div class="flex items-center gap-4 p-4">
                <div class="w-10 h-10 rounded-[18px] bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                    ${userName.charAt(0).toUpperCase()}
                </div>

                <div class="flex-1">
                    <h4 class="text-[14px] font-black text-slate-800">${userName}</h4>
                    <p class="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        ${window.socialUtils.timeAgo(post.timestamp)}
                    </p>
                </div>
            </div>

            ${post.caption ? `
                <div class="px-6 pb-4 text-[14px] font-bold text-slate-600">
                    ${post.caption}
                </div>
            ` : ''}

            ${post.images && post.images.length ? `
                <div class="px-4 pb-4">
                    <div class="${getGridClass(post.images.length)} rounded-[30px] overflow-hidden gap-1">
                        ${post.images.map((img, i) => `
                            <img src="${img}" onclick="openFullPreview('${img}')"
                            class="w-full h-full object-cover img-grid-item ${getSpanClass(post.images.length, i)}">
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${ytEmbedUrl ? `
                <div class="px-4 pb-4">
                    <div class="rounded-[30px] overflow-hidden aspect-video bg-black">
                        <iframe class="w-full h-full"
                            src="${ytEmbedUrl}"
                            frameborder="0"
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            ` : ''}

        </div>`;
    });

    feed.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

function getGridClass(count) {
    return count === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-1";
}

function getSpanClass(count, index) { 
    if (count === 3 && index === 0) return "col-span-2 h-52";
    return count === 1 ? "h-80" : "h-40"; 
}

}