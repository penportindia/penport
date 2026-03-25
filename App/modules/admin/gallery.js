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
                Swal.fire('Error', 'Download failed.', 'error');
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
                
                .composer-inline { background: white; border-radius: 45px; padding: 25px; margin-bottom: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.04); display: none; border: none; }
                .no-border-input { border: none !important; outline: none !important; ring: 0 !important; box-shadow: none !important; }
                
                .floating-post-btn { 
                    position: fixed; 
                    bottom: 120px; 
                    right: 25px; 
                    z-index: 100; 
                    background: #4f46e5; 
                    color: white; 
                    width: 65px; 
                    height: 65px; 
                    border-radius: 24px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    box-shadow: 0 15px 30px rgba(79, 70, 229, 0.4); 
                    cursor: pointer; 
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                }
                .floating-post-btn:active { transform: scale(0.85); }
            </style>

            <div class="max-w-md mx-auto mt-[25px] pb-40 animate-in fade-in duration-700">
                
                <div class="floating-post-btn" onclick="toggleComposer()">
                    <i data-lucide="square-pen" class="w-7 h-7"></i>
                </div>

                <div id="inline-composer" class="mx-4 composer-inline animate-in slide-in-from-top duration-300">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-lg font-black text-slate-900">Post Studio</h2>
                        <button id="publish-btn" onclick="publishPost('${user.name}', '${user.phone}')" 
                            class="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 active:scale-90 transition-all">Publish</button>
                    </div>

                    <div class="space-y-4">
                        <textarea id="post-caption" placeholder="What's happening?" 
                            class="w-full no-border-input text-lg font-bold text-slate-800 placeholder:text-slate-200 resize-none min-h-[120px] no-scrollbar bg-transparent"></textarea>
                        
                        <div id="yt-preview-box" class="hidden rounded-[30px] overflow-hidden aspect-video relative">
                            <div class="absolute inset-0 bg-rose-600 flex flex-col items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>
                                <span class="text-[8px] font-black uppercase tracking-widest">Video Attached</span>
                            </div>
                        </div>

                        <div id="media-preview" class="grid grid-cols-3 gap-2 empty:hidden rounded-[25px] overflow-hidden bg-slate-50 p-2"></div>

                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-3 bg-slate-50/50 p-4 rounded-[22px]">
                                <i data-lucide="link" class="text-rose-500 w-5 h-5"></i>
                                <input type="text" id="youtube-url" oninput="handleYTPreview(this.value)" placeholder="Paste YouTube Link" 
                                    class="bg-transparent no-border-input text-xs flex-1 font-bold text-slate-700">
                            </div>

                            <input type="file" id="multi-img" multiple accept="image/*" class="hidden" onchange="handleImagePreview(this)">
                            <button onclick="document.getElementById('multi-img').click()" 
                                class="w-full py-6 border-2 border-dashed border-slate-100 rounded-[30px] text-slate-300 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                                <i data-lucide="images" class="w-5 h-5"></i>
                                <span class="text-[9px] font-black uppercase tracking-[0.2em]">Add Photos</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="social-feed" class="space-y-2 px-4"></div>
            </div>

            <div id="full-preview-modal" class="fixed inset-0 flex flex-col items-center justify-center p-6">
                <button onclick="closeFullPreview()" class="absolute top-10 right-10 text-white p-4"><i data-lucide="x" class="w-10 h-10"></i></button>
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

    window.toggleComposer = () => {
        const comp = document.getElementById('inline-composer');
        const isHidden = comp.style.display === 'none' || comp.style.display === '';
        comp.style.display = isHidden ? 'block' : 'none';
        if (isHidden) window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.handleYTPreview = (url) => {
        const box = document.getElementById('yt-preview-box');
        const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/)?.[1];
        box.classList.toggle('hidden', !id);
    };

    window.handleImagePreview = (input) => {
        const preview = document.getElementById('media-preview');
        preview.innerHTML = '';
        [...input.files].forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML += `<div class="aspect-square"><img src="${e.target.result}" class="w-full h-full object-cover rounded-xl"></div>`;
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
        dlBtn.onclick = async () => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();

                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'wings-photo.jpg';

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                window.URL.revokeObjectURL(blobUrl);
            } catch (e) {
                const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
                window.open(downloadUrl, '_blank');
            }
        };
        if(window.lucide) lucide.createIcons();
    };

    window.closeFullPreview = () => { document.getElementById('full-preview-modal').style.display = 'none'; };

    async function publishPost(name, phone) {
        const btn = document.getElementById('publish-btn');
        const caption = document.getElementById('post-caption').value;
        const files = document.getElementById('multi-img').files;
        const ytUrl = document.getElementById('youtube-url').value;

        if (!caption && files.length === 0 && !ytUrl) return;

        btn.disabled = true;
        btn.innerHTML = "Wait...";

        try {
            let uploadedUrls = [];

            for (let file of files) {
                const now = new Date();
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const unique5 = Math.floor(10000 + Math.random() * 90000);

                const baseName = `GALL-${yyyy}-${mm}-${unique5}`;

                const extension = file.name.includes('.')
                    ? file.name.split('.').pop()
                    : '';

                const finalName = extension ? `${baseName}.${extension}` : baseName;

                const renamedFile = new File([file], finalName, {
                    type: file.type
                });

                const formData = new FormData();
                formData.append('file', renamedFile);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

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
                timestamp: Date.now()
            });

            document.getElementById('post-caption').value = '';
            document.getElementById('multi-img').value = '';
            document.getElementById('youtube-url').value = '';
            document.getElementById('media-preview').innerHTML = '';
            document.getElementById('yt-preview-box').classList.add('hidden');
            toggleComposer();

            Swal.fire({
                icon: 'success',
                title: 'Posted!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });

        } catch (e) {
            Swal.fire('Error', 'Check connection', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = "Publish";
        }
    }

    function loadFeed(myPhone) {
        db.ref('social_feed').orderByChild('timestamp').limitToLast(15).on('value', snap => {
            let posts = [];
            snap.forEach(c => { posts.push({ id: c.key, ...c.val() }); });
            posts.sort((a, b) => b.timestamp - a.timestamp);
            renderPosts(posts, myPhone, true);
        });
    }

    function renderPosts(posts, myPhone, isFirstLoad = false) {
        const feed = document.getElementById('social-feed');
        if (!feed) return;

        let html = '';

        posts.forEach(post => {
            const userName = post.userName || 'User';
            const ytId = post.youtubeId;

            const ytEmbedUrl = ytId
                ? `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&iv_load_policy=3&controls=1`
                : null;

            html += `
            <div class="post-card p-2 animate-in fade-in duration-500">

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

                    ${post.userPhone === myPhone ? `
                        <button onclick="deletePost('${post.id}')" class="text-slate-200 p-2">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
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
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

    function getGridClass(count) { return count === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-1"; }
    function getSpanClass(count, index) { 
        if (count === 3 && index === 0) return "col-span-2 h-52";
        return count === 1 ? "h-80" : "h-40"; 
    }

    async function deletePost(id) {
        const res = await Swal.fire({ title: 'Delete?', showCancelButton: true });
        if (res.isConfirmed) db.ref(`social_feed/${id}`).remove();
    }
}