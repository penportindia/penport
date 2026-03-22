const socialUtils = {
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
            Swal.fire('Error', 'Download failed. Try long-press on image.', 'error');
        }
    }
};

let lastLoadedTimestamp = null;
let isLoadingMore = false;
let currentUserPhone = null;

window.render_gallery = function(user) {
    const container = document.getElementById('main-content');
    let phoneRaw = user.phone || user.contact?.phone1;
    if (!phoneRaw) {
        alert("User phone not found!");
        return;
    }
    const myPhone = phoneRaw.toString().replace(/\+/g,'');
    currentUserPhone = myPhone;
    window.currentUserName = user.name || "User"; 
    container.innerHTML = `
        <style>
            .post-card { border-radius: 40px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: white; border: 1px solid #f1f5f9; margin-bottom: 2rem; }
            .post-card:active { transform: scale(0.98); }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .img-grid-item { border-radius: 30px; border: 4px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); cursor: zoom-in; }
            .action-btn { transition: all 0.2s ease; cursor: pointer; }
            .action-btn:active { transform: scale(1.3); }
            
            /* Full Preview Modal */
            #full-preview-modal { z-index: 1000; display: none; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); }
            .download-badge { background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.2); }
        </style>

        <div class="max-w-md mx-auto mt-[25px] pb-40 animate-in fade-in duration-700">
            <div id="social-feed" class="space-y-2 px-4">
                <div class="flex flex-col items-center py-20 opacity-20">
                    <div class="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p class="font-black tracking-[0.4em] text-[10px] uppercase">Authenticating Feed</p>
                </div>
            </div>
        </div>

        <div id="full-preview-modal" class="fixed inset-0 flex flex-col items-center justify-center p-6">
            <button onclick="closeFullPreview()" class="absolute top-10 right-10 text-white p-4"><i data-lucide="x" class="w-10 h-10"></i></button>
            <div class="w-full max-w-4xl h-[70vh] flex items-center justify-center">
                <img id="full-preview-img" src="" class="max-w-full max-h-full object-contain rounded-3xl shadow-2xl">
            </div>
            <div class="mt-10 flex gap-4">
                <button id="download-btn-dynamic" class="download-badge px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all">
                    <i data-lucide="download"></i> Download High Quality
                </button>
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
    dlBtn.onclick = () => socialUtils.downloadImage(url, `wings_academy_${Date.now()}.jpg`);
    
    if(window.lucide) lucide.createIcons();
};

window.closeFullPreview = () => {
    document.getElementById('full-preview-modal').style.display = 'none';
};

function loadFeed(myPhone) {
    const feed = document.getElementById('social-feed');
    if (!feed) return;

    db.ref('social_feed')
        .orderByChild('timestamp')
        .limitToLast(15)
        .on('value', snap => {
            let posts = [];

            snap.forEach(c => {
                posts.push({ id: c.key, ...c.val() });
            });

            posts.sort((a, b) => b.timestamp - a.timestamp);

            if (posts.length > 0) {
                lastLoadedTimestamp = posts[posts.length - 1].timestamp;
            }

            renderPosts(posts, myPhone, true);
        });
}

function renderPosts(posts, myPhone, isFirstLoad = false) {
    const feed = document.getElementById('social-feed');
    if (!feed) return;

    let html = '';

    posts.forEach(post => {
        const likes = post.likes || {};
        const isLiked = !!likes[myPhone];
        const comments = post.comments || {};
        const commentCount = Object.keys(comments).length;
        const userName = post.userName || 'User';

        html += `
        <div class="post-card p-2 sm:p-4 animate-in fade-in slide-in-from-bottom-10 duration-500 mb-4 bg-white rounded-3xl shadow-sm">
            <div class="flex items-center gap-4 p-4">
                <div class="w-12 h-12 rounded-[22px] bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                    ${userName.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1">
                    <h4 class="text-[15px] font-black text-slate-800">${userName}</h4>
                    <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        ${socialUtils.timeAgo(post.timestamp)}
                    </p>
                </div>
            </div>

            ${post.caption ? `<div class="px-6 pb-6 text-[15px] font-bold text-slate-600 leading-relaxed">${post.caption}</div>` : ''}

            ${post.images && post.images.length > 0 ? `
                <div class="px-6 pb-6">
                    <div class="${getGridClass(post.images.length)} rounded-3xl overflow-hidden gap-1">
                        ${post.images.map((img, i) => `
                            <img loading="lazy" src="${img}" onclick="openFullPreview('${img}')"
                                class="w-full h-full object-cover img-grid-item ${getSpanClass(post.images.length, i)}">
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${post.youtubeId ? `
                <div class="px-6 pb-6">
                    <div class="rounded-[40px] overflow-hidden shadow-2xl aspect-video border-4 border-white">
                        <iframe class="w-full h-full" src="https://www.youtube.com/embed/${post.youtubeId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>
            ` : ''}

            <div class="mx-4 mb-4 bg-slate-50/80 rounded-[30px] p-2 flex items-center justify-between">
                <div class="flex gap-2">
                    <button onclick="toggleLike('${post.id}', '${myPhone}')" 
                        class="action-btn flex items-center gap-2 px-6 py-3 rounded-full transition-all ${isLiked ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400'}">
                        <i data-lucide="heart" class="w-5 h-5 ${isLiked ? 'fill-white' : ''}"></i>
                        <span class="text-xs font-black">${Object.keys(likes).length}</span>
                    </button>
                    <button onclick="toggleCommentsSection('${post.id}')" 
                        class="action-btn flex items-center gap-2 px-6 py-3 text-slate-400">
                        <i data-lucide="message-circle" class="w-5 h-5"></i>
                        <span class="text-xs font-black">${commentCount}</span>
                    </button>
                </div>
            </div>

            <div id="comment-box-${post.id}" class="hidden p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top duration-300">
                <div id="comments-list-${post.id}" class="space-y-4 mb-6 max-h-60 overflow-y-auto no-scrollbar">
                    ${renderComments(post.comments)}
                </div>
                <div class="flex gap-3 bg-slate-50 p-2 rounded-[25px] border border-slate-100">
                    <input type="text" id="input-${post.id}" placeholder="Write a comment..." 
                        class="flex-1 bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 px-4">
                    <button onclick="postComment('${post.id}', '${myPhone}')" 
                        class="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                        <i data-lucide="send" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>`;
    });

    if (isFirstLoad) feed.innerHTML = html;
    else feed.innerHTML += html;

    if (window.lucide) lucide.createIcons();
}

async function loadMorePosts() {
    if (isLoadingMore || !lastLoadedTimestamp) return;

    isLoadingMore = true;

    const snap = await db.ref('social_feed')
        .orderByChild('timestamp')
        .endAt(lastLoadedTimestamp - 1)
        .limitToLast(15)
        .once('value');

    let posts = [];

    snap.forEach(c => {
        posts.push({ id: c.key, ...c.val() });
    });

    posts.sort((a, b) => b.timestamp - a.timestamp);

    if (posts.length > 0) {
        lastLoadedTimestamp = posts[posts.length - 1].timestamp;
        renderPosts(posts, currentUserPhone, false);
    }

    isLoadingMore = false;
}

function renderComments(comments) {
    if (!comments) return '<div class="text-center py-6 opacity-20 font-black text-[10px] uppercase tracking-widest">No conversation yet</div>';
    return Object.values(comments).sort((a,b) => b.timestamp - a.timestamp).map(c => `
        <div class="flex gap-4 animate-in slide-in-from-left duration-300">
            <div class="bg-slate-100 text-[10px] font-black text-slate-500 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">${(c.name || 'U').charAt(0)}</div>
            <div class="bg-slate-50 rounded-[25px] px-5 py-4 flex-1 border border-white shadow-sm">
                <div class="flex justify-between items-center mb-1">
                    <p class="text-[11px] font-black text-slate-900">${c.name}</p>
                    <p class="text-[8px] font-bold text-slate-300 uppercase">${socialUtils.timeAgo(c.timestamp)}</p>
                </div>
                <p class="text-[12px] text-slate-500 font-bold leading-relaxed">${c.text}</p>
            </div>
        </div>
    `).join('');
}

async function postComment(postId, phone) {
    const input = document.getElementById(`input-${postId}`);
    if (!input.value.trim()) return;

    await db.ref(`social_feed/${postId}/comments`).push({
        name: window.currentUserName,
        text: input.value.trim(),
        timestamp: Date.now()
    });
    input.value = '';
}

function toggleCommentsSection(id) {
    const box = document.getElementById(`comment-box-${id}`);
    box.classList.toggle('hidden');
}

function toggleLike(postId, phone) {
    const ref = db.ref(`social_feed/${postId}/likes/${phone}`);
    ref.once('value', snap => {
        if (snap.exists()) ref.remove();
        else ref.set(true);
    });
}

function getGridClass(count) {
    if (count === 1) return "grid grid-cols-1";
    if (count === 2) return "grid grid-cols-2 gap-2";
    return "grid grid-cols-2 gap-2";
}

function getSpanClass(count, index) {
    if (count === 3 && index === 0) return "col-span-2 h-60";
    if (count === 1) return "h-96";
    return "h-40";
}

let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadMorePosts();
        }
    }, 100);
});