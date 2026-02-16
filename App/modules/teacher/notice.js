window.render_notice = function(user) {
    const mainContent = document.getElementById('main-content');
    
    // 1. UI Container Setup
    mainContent.innerHTML = `
        <div id="notice-list" class="space-y-6 pb-32 pt-4">
            <div class="glass-card flex flex-col items-center justify-center py-10 opacity-50">
                <div class="loader mb-4"></div>
                <p class="text-[10px] font-black uppercase tracking-widest">Fetching Staff Notices...</p>
            </div>
        </div>
    `;

    // 2. Helper to get Branch Name from Foundation Data
    const getBranchName = async (branchId) => {
        if (!branchId) return "ALL";
        // Agar ID direct naam hai (purana data), toh wahi return karega
        if (!branchId.startsWith('-')) return branchId; 
        
        try {
            const snap = await db.ref(`foundation/branches/${branchId}/name`).once('value');
            return snap.val() || branchId;
        } catch (e) {
            return branchId;
        }
    };

    // 3. Main Logic
    db.ref('notices').on('value', async (snapshot) => {
        const noticeList = document.getElementById('notice-list');
        if (!noticeList) return;

        // Teacher ki branch ka asli naam nikaalte hain
        const teacherBranchName = await getBranchName(user.branch);
        let filteredData = [];

        snapshot.forEach(child => {
            const n = child.val();
            
            // FILTERING LOGIC:
            // - Target: STAFF ya BOTH hona chahiye
            const isForStaff = (n.target === 'STAFF' || n.target === 'BOTH');
            
            // - Branch: Agar notice 'ALL' ke liye hai, ya teacher ki branch name se match karta hai
            const branchMatch = (n.branch === 'ALL' || n.branch === teacherBranchName);

            if (isForStaff && branchMatch) {
                filteredData.push({ ...n, id: child.key });
            }
        });

        // SORTING: Pinned First, then Latest Timestamp
        filteredData.sort((a, b) => {
            const aPinned = a.pinned === true || a.pinned === 'true';
            const bPinned = b.pinned === true || b.pinned === 'true';
            if (aPinned !== bPinned) return bPinned ? 1 : -1;
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        // 4. Rendering HTML
        if (filteredData.length === 0) {
            noticeList.innerHTML = `
                <div class="glass-card flex flex-col items-center justify-center py-20 opacity-50 text-center">
                    <div class="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                        <i data-lucide="megaphone-off" class="w-8 h-8 text-slate-300"></i>
                    </div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No Notices for ${teacherBranchName} Staff</p>
                </div>`;
        } else {
            let html = "";
            filteredData.forEach(notice => {
                const hasImage = notice.images && notice.images.length > 0;
                const postTime = notice.fullTime ? notice.fullTime.split(',')[1] : (notice.time || '--:--');

                html += `
                <div class="relative animate__animated animate__fadeInUp">
                    ${notice.pinned ? `<div class="absolute -inset-[1px] bg-gradient-to-r from-orange-400 to-rose-500 rounded-[32px] blur-[2px] opacity-20"></div>` : ''}
                    
                    <div class="relative bg-white border border-slate-100 shadow-sm rounded-[30px] overflow-hidden">
                        
                        <div class="px-6 pt-6 pb-3 flex items-center justify-between">
                            <div class="flex gap-2">
                                ${notice.pinned ? `
                                    <div class="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                        <i data-lucide="pin" class="w-3 h-3 fill-white rotate-45"></i>
                                        <span class="text-[9px] font-black uppercase tracking-widest">Pinned</span>
                                    </div>
                                ` : ''}
                                ${notice.priority === 'IMPORTANT' ? `
                                    <div class="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                        <span class="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse"></span>
                                        <span class="text-[9px] font-black uppercase tracking-widest">Urgent</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                ${notice.date}
                            </div>
                        </div>

                        <div class="px-6 pb-4">
                            <h3 class="text-xl font-extrabold text-slate-800 leading-tight mb-2">${notice.title}</h3>
                            <p class="text-slate-500 text-[13.5px] leading-relaxed font-medium whitespace-pre-line">${notice.msg}</p>
                        </div>

                        ${hasImage ? `
                        <div class="px-5 pb-4">
                            <div onclick="App.viewNoticeImage('${notice.images[0]}')" class="cursor-pointer relative rounded-2xl overflow-hidden aspect-video border-2 border-white shadow-sm bg-slate-50">
                                <img src="${notice.images[0]}" class="w-full h-full object-cover" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                    <div class="flex items-center gap-2 text-white/90">
                                        <i data-lucide="maximize" class="w-4 h-4"></i>
                                        <span class="text-[8px] font-black uppercase tracking-widest">View Attachment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="px-6 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                    ${notice.sender.charAt(0)}
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-slate-800 uppercase leading-none">${notice.sender}</p>
                                    <p class="text-[9px] font-bold text-orange-600 uppercase mt-1 tracking-tighter">${notice.designation}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                                <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i>
                                <span class="text-[9px] font-black text-slate-600 uppercase tracking-tighter">${postTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            });
            noticeList.innerHTML = html;
        }
        if (window.lucide) lucide.createIcons();
    });
};

// Image Previewer (matching student module style)
App.viewNoticeImage = (url) => {
    Swal.fire({
        html: `<img src="${url}" class="w-full rounded-[25px] shadow-2xl" /><button onclick="Swal.close()" class="mt-6 w-12 h-12 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white mx-auto flex items-center justify-center"><i data-lucide="x"></i></button>`,
        showConfirmButton: false,
        background: 'transparent',
        backdrop: 'rgba(0,0,0,0.95)',
        didOpen: () => { if (window.lucide) lucide.createIcons(); }
    });
};