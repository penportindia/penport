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

window.render_gallery = function(user) {
    const container = document.getElementById('main-content');
    const myPhone = (user.phone || '9100000000').replace(/\+/g,'');
    window.currentUserName = user.name || "User"; 
    container.innerHTML = `
        <style>
            .post-card { border-radius: 40px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: white; border: 1px solid #f1f5f9; margin-bottom: 2rem; }
            .post-card:active { transform: scale(0.98); }
            .composer-backdrop { backdrop-filter: blur(25px); background: rgba(255, 255, 255, 0.8); transition: all 0.3s ease; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .img-grid-item { border-radius: 30px; border: 4px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); cursor: zoom-in; }
            .action-btn { transition: all 0.2s ease; cursor: pointer; }
            .action-btn:active { transform: scale(1.3); }
            
            /* Full Preview Modal */
            #full-preview-modal { z-index: 1000; display: none; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); }
            .download-badge { background: rgba(255,255,255,0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.2); }
        </style>

        <div class="max-w-md mx-auto mt-[25px] pb-40 animate-in fade-in duration-700">
            <div class="mx-6 mb-10 group" onclick="openComposer()">
                <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[35px] shadow-2xl shadow-slate-200 flex items-center justify-between cursor-pointer overflow-hidden relative">
                    <div class="relative z-10 flex items-center gap-4">
                        <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                            <i data-lucide="plus-circle" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-white font-bold text-sm">Create New Post</p>
                            <p class="text-slate-400 text-[10px] font-medium">Photos, YouTube & Thoughts</p>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" class="text-white/20 group-hover:translate-x-2 transition-transform"></i>
                    <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                </div>
            </div>

            <div id="social-feed" class="space-y-2 px-4">
                <div class="flex flex-col items-center py-20 opacity-20">
                    <div class="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p class="font-black tracking-[0.4em] text-[10px] uppercase">Authenticating Feed</p>
                </div>
            </div>
        </div>

        <div id="composer-modal" class="fixed inset-x-0 bottom-0 z-[200] composer-backdrop hidden overflow-y-auto" style="top: -60px;">
            <div class="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-6">
                <div class="bg-white w-full max-w-lg rounded-t-[50px] sm:rounded-[50px] shadow-2xl p-8 animate-in slide-in-from-bottom duration-500">
                    <div class="flex justify-between items-center mb-10">
                        <button onclick="closeComposer()" class="text-slate-400 font-black text-xs uppercase tracking-widest">Close</button>
                        <h2 class="text-lg font-black text-slate-900">Post Studio</h2>
                        <button id="publish-btn" onclick="publishPost('${user.name}', '${user.phone}')" 
                            class="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 active:scale-90 transition-all">Publish</button>
                    </div>

                    <div class="space-y-6">
                        <textarea id="post-caption" placeholder="Share your academy moment..." 
                            class="w-full border-none focus:ring-0 text-xl font-bold text-slate-800 placeholder:text-slate-200 resize-none min-h-[150px] no-scrollbar"></textarea>
                        
                        <div id="yt-preview-box" class="hidden rounded-[40px] overflow-hidden shadow-2xl aspect-video relative group">
                             <div class="absolute inset-0 bg-rose-600 flex flex-col items-center justify-center text-white">
                                <i data-lucide="youtube" class="w-12 h-12 mb-2 animate-pulse"></i>
                                <span class="text-xs font-black uppercase tracking-widest">Video Ready</span>
                             </div>
                        </div>

                        <div id="media-preview" class="grid grid-cols-3 gap-3 empty:hidden rounded-[30px] overflow-hidden bg-slate-50 p-2"></div>

                        <div class="grid grid-cols-1 gap-4 pt-6">
                            <div class="flex items-center gap-4 bg-slate-50 p-5 rounded-[25px] border border-slate-100 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                                <i data-lucide="link-2" class="text-rose-500 w-6 h-6"></i>
                                <input type="text" id="youtube-url" oninput="handleYTPreview(this.value)" placeholder="YouTube Video URL" class="bg-transparent border-none focus:ring-0 text-sm flex-1 font-bold text-slate-700">
                            </div>

                            <input type="file" id="multi-img" multiple accept="image/*" class="hidden" onchange="handleImagePreview(this)">
                            <button onclick="document.getElementById('multi-img').click()" 
                                class="w-full py-10 border-4 border-dashed border-slate-100 rounded-[40px] text-slate-300 flex flex-col items-center gap-3 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all">
                                <div class="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-inherit"><i data-lucide="image-plus"></i></div>
                                <span class="text-[10px] font-black uppercase tracking-[0.3em]">Add Multiple Photos</span>
                            </button>
                        </div>
                    </div>
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


window.openComposer = () => { document.getElementById('composer-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
window.closeComposer = () => { document.getElementById('composer-modal').classList.add('hidden'); document.body.style.overflow = 'auto'; };

window.handleYTPreview = (url) => {
    const box = document.getElementById('yt-preview-box');
    const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/)?.[1];
    box.classList.toggle('hidden', !id);
    if(window.lucide) lucide.createIcons();
};

window.handleImagePreview = (input) => {
    const preview = document.getElementById('media-preview');
    preview.innerHTML = '';
    [...input.files].forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML += `
                <div class="relative aspect-square animate-in zoom-in duration-300">
                    <img src="${e.target.result}" class="w-full h-full object-cover rounded-2xl shadow-sm">
                </div>`;
        };
        reader.readAsDataURL(file);
    });
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


async function publishPost(name, phone) {
    const btn = document.getElementById('publish-btn');
    const caption = document.getElementById('post-caption').value;
    const files = document.getElementById('multi-img').files;
    const ytUrl = document.getElementById('youtube-url').value;

    if (!caption && files.length === 0 && !ytUrl) return;

    btn.disabled = true;
    btn.innerHTML = `<i class="animate-spin w-4 h-4" data-lucide="loader"></i>`;
    if(window.lucide) lucide.createIcons();

    try {
        let uploadedUrls = [];
        for (let file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            uploadedUrls.push(data.secure_url);
        }

        let ytId = ytUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/)?.[1];

        await db.ref('social_feed').push({
            userName: name,
            userPhone: phone,
            caption: caption,
            images: uploadedUrls,
            youtubeId: ytId || null,
            timestamp: Date.now(),
            likes: {}
        });

        document.getElementById('post-caption').value = '';
        document.getElementById('multi-img').value = '';
        document.getElementById('youtube-url').value = '';
        document.getElementById('media-preview').innerHTML = '';
        document.getElementById('yt-preview-box').classList.add('hidden');
        closeComposer();
        
        Swal.fire({ icon: 'success', title: 'Post Published!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (e) {
        Swal.fire('Upload Failed', 'Please check your connection', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = "Publish";
    }
}

function loadFeed(myPhone) {
    const feed = document.getElementById('social-feed');
    db.ref('social_feed').orderByChild('timestamp').on('value', (snap) => {
        let html = '';
        const posts = [];
        
        if (!snap.exists()) {
            feed.innerHTML = `<div class="py-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest">The Timeline is Empty</div>`;
            return;
        }

        snap.forEach(c => {
            posts.push({ id: c.key, ...c.val() });
        });
        
        posts.sort((a, b) => b.timestamp - a.timestamp);

        posts.forEach(post => {
            const likes = post.likes || {};
            const isLiked = likes[myPhone];
            const comments = post.comments || {};
            const commentCount = Object.keys(comments).length;

            html += `
                <div class="post-card p-2 sm:p-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <div class="flex items-center gap-4 p-4">
                        <div class="w-12 h-12 rounded-[22px] bg-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                            ${(post.userName || 'U').charAt(0)}
                        </div>
                        <div class="flex-1">
                            <h4 class="text-[15px] font-black text-slate-800">${post.userName}</h4>
                            <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest">${socialUtils.timeAgo(post.timestamp)}</p>
                        </div>
                        ${post.userPhone && post.userPhone.includes(myPhone) ? 
                            `<button onclick="deletePost('${post.id}')" class="text-slate-200 hover:text-rose-500 p-2 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
                    </div>

                    ${post.caption ? `<div class="px-6 pb-6 text-[15px] font-bold text-slate-600 leading-relaxed">${post.caption}</div>` : ''}

                    ${post.images && post.images.length > 0 ? `
                        <div class="px-6 pb-6">
                            <div class="${getGridClass(post.images.length)}">
                                ${post.images.map((img, i) => `
                                    <img src="${img}" onclick="openFullPreview('${img}')"
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
                                class="action-btn flex items-center gap-2 px-6 py-3 rounded-full ${isLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-slate-400'}">
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
                                class="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                <i data-lucide="send" class="w-5 h-5"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        feed.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    });
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
    if (count === 3) return "grid grid-cols-2 gap-2";
    return "grid grid-cols-2 gap-2";
}

function getSpanClass(count, index) {
    if (count === 3 && index === 0) {
        return "col-span-2 h-60";
    }
    if (count === 1) return "h-96";
    return "h-40";
}

async function deletePost(id) {
    const res = await Swal.fire({
        title: 'Delete this moment?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#f1f5f9',
        confirmButtonText: 'Yes, delete it!',
        customClass: { popup: 'rounded-[40px]' }
    });
    if (res.isConfirmed) db.ref(`social_feed/${id}`).remove();
}