if (!window.__GALLERY_INIT__) {
    window.__GALLERY_INIT__ = true;

    window.socialUtils = {
        timeAgo: (ts) => {
            const ms = Date.now() - ts;
            const sec = Math.floor(ms / 1000);
            if (sec < 60) return "Just now";
            const min = Math.floor(sec / 60);
            if (min < 60) return min + "m ago";
            const hr = Math.floor(min / 60);
            if (hr < 24) return hr + "h ago";
            return Math.floor(hr / 24) + "d ago";
        }
    };

    window.render_gallery = function(user) {
        const container = document.getElementById('main-content');
        const myPhone = String(user?.phone ?? '9100000000').replace(/\+/g, '');
        
        container.innerHTML = `
            <style>
                .post-card { border-radius: 40px; background: white; border: 1px solid #f1f5f9; margin-bottom: 2rem; overflow: hidden; }
                .img-grid-item { border-radius: 30px; border: 4px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); cursor: zoom-in; transition: transform 0.2s; }
                .img-grid-item:active { transform: scale(0.98); }
                #full-preview-modal { z-index: 1000; display: none; background: rgba(0,0,0,0.95); backdrop-filter: blur(15px); position: fixed; inset: 0; }
                .composer-inline { background: white; border-radius: 45px; padding: 25px; margin: 0 1rem 30px 1rem; box-shadow: 0 20px 40px rgba(0,0,0,0.04); display: none; }
                .no-border-input { border: none !important; outline: none !important; box-shadow: none !important; }
                .floating-post-btn { 
                    position: fixed; bottom: 120px; right: 25px; z-index: 100; 
                    background: #4f46e5; color: white; width: 65px; height: 65px; 
                    border-radius: 24px; display: flex; align-items: center; justify-content: center; 
                    box-shadow: 0 15px 30px rgba(79, 70, 229, 0.4); cursor: pointer; 
                }
                .yt-indicator { background: #ff0000; color: white; border-radius: 20px; padding: 10px; display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
            </style>

            <div class="max-w-md mx-auto mt-[25px] pb-40 animate-in fade-in duration-700">
                <div class="floating-post-btn" onclick="toggleComposer()">
                    <i data-lucide="square-pen" class="w-7 h-7"></i>
                </div>

                <div id="inline-composer" class="composer-inline animate-in slide-in-from-top duration-300">
                    <div class="flex items-center justify-between mb-6">
                        <button id="publish-btn" onclick="publishPost('${user.name}', '${myPhone}')" 
                            class="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-90 transition-all">Post</button>
                    </div>

                    <div class="space-y-4">
                        <textarea id="post-caption" placeholder="What's happening?" 
                            class="w-full no-border-input text-lg font-bold text-slate-800 placeholder:text-slate-200 resize-none min-h-[120px] bg-transparent"></textarea>
                        
                        <div id="yt-preview-box" class="hidden rounded-[30px] overflow-hidden aspect-video relative">
                            <div class="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white">
                                <div class="yt-indicator"><i data-lucide="play-circle"></i> Video Linked</div>
                            </div>
                        </div>

                        <div id="media-preview" class="grid grid-cols-3 gap-2 empty:hidden rounded-[25px] overflow-hidden bg-slate-50 p-2"></div>

                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-3 bg-slate-50/50 p-4 rounded-[22px] border border-slate-100">
                                <i data-lucide="link" class="text-indigo-500 w-5 h-5"></i>
                                <input type="text" id="youtube-url" oninput="handleYTPreview(this.value)" placeholder="Paste YouTube Link" 
                                    class="bg-transparent no-border-input text-xs flex-1 font-bold text-slate-700">
                            </div>

                            <input type="file" id="multi-img" multiple accept="image/*" class="hidden" onchange="handleImagePreview(this)">
                            <button onclick="document.getElementById('multi-img').click()" 
                                class="w-full py-6 border-2 border-dashed border-slate-100 rounded-[30px] text-slate-400 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                                <i data-lucide="image" class="w-5 h-5"></i>
                                <span class="text-[9px] font-black uppercase tracking-[0.2em]">Add Photos</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="social-feed" class="space-y-4 px-4"></div>
            </div>

            <div id="full-preview-modal" class="flex flex-col items-center justify-center p-6">
                <button onclick="closeFullPreview()" class="absolute top-10 right-10 text-white p-4">
                    <i data-lucide="x" class="w-10 h-10"></i>
                </button>
                <div class="mb-10">
                    <button id="view-new-tab" class="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3">
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
        if (window.lucide) lucide.createIcons();
    };

    window.handleYTPreview = (url) => {
        const box = document.getElementById('yt-preview-box');
        const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^& \n?]+)/)?.[1];
        box.classList.toggle('hidden', !id);
        if (window.lucide) lucide.createIcons();
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
        const viewBtn = document.getElementById('view-new-tab');
        img.src = url;
        modal.style.display = 'flex';
        viewBtn.onclick = () => window.open(url, '_blank');
        if (window.lucide) lucide.createIcons();
    };

    window.closeFullPreview = () => { 
        document.getElementById('full-preview-modal').style.display = 'none'; 
    };

    window.publishPost = async function(name, phone) {
        const btn = document.getElementById('publish-btn');
        const caption = document.getElementById('post-caption').value;
        const files = document.getElementById('multi-img').files;
        const ytUrl = document.getElementById('youtube-url').value;

        if (!caption && files.length === 0 && !ytUrl) return;

        btn.disabled = true;
        btn.innerHTML = "Upload...";

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
                position: 'center',
                showConfirmButton: false,
                timer: 3000
            });

        } catch (e) {
            Swal.fire('Error', 'Check connection', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = "Publish";
        }
    };

    function loadFeed(myPhone) {
        db.ref('social_feed').orderByChild('timestamp').limitToLast(20).on('value', snap => {
            const feed = document.getElementById('social-feed');
            if (!feed) return;
            let posts = [];
            snap.forEach(c => { posts.push({ id: c.key, ...c.val() }); });
            posts.sort((a, b) => b.timestamp - a.timestamp);
            
            feed.innerHTML = posts.map(post => {
                const imageGrid = post.images?.length ? `
                    <div class="px-4 pb-4">
                        <div class="grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 rounded-[30px] overflow-hidden">
                            ${post.images.map((img, i) => `
                                <img src="${img}" onclick="openFullPreview('${img}')" 
                                    class="w-full ${post.images.length === 1 ? 'h-72' : 'h-40'} object-cover img-grid-item ${post.images.length === 3 && i === 0 ? 'col-span-2 h-52' : ''}">
                            `).join('')}
                        </div>
                    </div>` : '';

                return `
                    <div class="post-card animate-in fade-in slide-in-from-bottom-4">
                        <div class="flex items-center gap-4 p-5">
                            <div class="w-11 h-11 rounded-[20px] bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                                ${post.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div class="flex-1">
                                <h4 class="text-[15px] font-black text-slate-800">${post.userName}</h4>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    ${window.socialUtils.timeAgo(post.timestamp)}
                                </p>
                            </div>
                            ${post.userPhone === myPhone ? `<button onclick="deletePost('${post.id}')" class="text-slate-300 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
                        </div>
                        ${post.caption ? `<div class="px-6 pb-4 text-[14px] font-bold text-slate-600 leading-relaxed">${post.caption}</div>` : ''}
                        ${imageGrid}
                        ${post.youtubeId ? `<div class="px-4 pb-4"><div class="rounded-[30px] overflow-hidden aspect-video bg-black"><iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${post.youtubeId}" frameborder="0" allowfullscreen></iframe></div></div>` : ''}
                    </div>`;
            }).join('');
            if (window.lucide) lucide.createIcons();
        });
    }

    window.deletePost = async function(id) {
        const res = await Swal.fire({ title: 'Delete?', text: "Post will be removed", icon: 'warning', showCancelButton: true });
        if (res.isConfirmed) db.ref(`social_feed/${id}`).remove();
    };
}