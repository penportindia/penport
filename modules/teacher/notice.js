window.render_notice = async function(user) {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div id="notice-list" class="space-y-6 pb-32 pt-4 px-4">
            <div class="glass-card flex flex-col items-center justify-center py-20 opacity-50">
                <div class="loader mb-4 border-t-orange-600"></div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Syncing Staff Stream...</p>
            </div>
        </div>
    `;

    if (typeof foundationData === 'undefined' || Object.keys(foundationData).length === 0) {
        const snap = await db.ref('foundation').once('value');
        window.foundationData = snap.val() || {};
    }

    const userBranchId = user.branch;
    const userBranchName = foundationData.branches?.[userBranchId]?.name || userBranchId;

    db.ref('notices').orderByChild('timestamp').limitToLast(20).once('value', (snapshot) => {
        const noticeList = document.getElementById('notice-list');
        if (!noticeList) return;

        let filteredData = [];
        snapshot.forEach(child => {
            const n = child.val();
            const isForStaff = (n.target === 'STAFF' || n.target === 'ALL');
            const branchMatch = (n.branch === 'ALL' || n.branch === userBranchName);

            if (isForStaff && branchMatch) {
                filteredData.push({ ...n, id: child.key });
            }
        });

        filteredData.sort((a, b) => {
            const aPinned = a.pinned === true || a.pinned === 1;
            const bPinned = b.pinned === true || b.pinned === 1;
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return b.timestamp - a.timestamp;
        });

        if (filteredData.length === 0) {
            noticeList.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 bg-slate-50 rounded-[25px] flex items-center justify-center mb-4">
                        <i data-lucide="bell-off" class="w-8 h-8 text-slate-300"></i>
                    </div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notices for your branch</p>
                </div>`;
        } else {
            let html = "";
            filteredData.forEach(n => {
                const postTime = n.fullTime ? n.fullTime : (n.date || '');
                const isPinned = n.pinned === true || n.pinned === 1;
                
                const attachmentsHTML = n.images?.map((url, index) => {
                    const isPDF = url.toLowerCase().includes('.pdf');
                    const fileName = `${(n.title || 'notice').replace(/\s+/g, '_')}_${index + 1}${isPDF ? '.pdf' : '.jpg'}`;
                    
                    return `
                        <div onclick="downloadFile('${url}', '${fileName}')" class="group relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer active:scale-95 transition-transform">
                            ${isPDF ? `
                                <div class="w-full h-full flex flex-col items-center justify-center text-rose-500 bg-rose-50">
                                    <i data-lucide="file-text" class="w-6 h-6"></i>
                                    <span class="text-[7px] font-black mt-1">PDF</span>
                                </div>
                            ` : `
                                <img src="${url}" class="w-full h-full object-cover" loading="lazy">
                                <div class="absolute inset-0 bg-black/20 opacity-0 group-active:opacity-100 flex items-center justify-center transition-opacity">
                                    <i data-lucide="download" class="w-4 h-4 text-white"></i>
                                </div>
                            `}
                        </div>`;
                }).join('') || '';

                html += `
                <div class="relative animate__animated animate__fadeInUp">
                    ${isPinned ? `<div class="absolute -inset-[1.5px] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] opacity-10 blur-[1px]"></div>` : ''}
                    <div class="relative bg-white border border-slate-100 shadow-sm rounded-[30px] overflow-hidden">
                        <div class="px-6 pt-6 pb-3 flex items-center justify-end">
                            <div class="flex gap-2">
                                ${isPinned ? `
                                    <div class="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                        <i data-lucide="pin" class="w-3 h-3 rotate-45"></i>
                                        <span class="text-[9px] font-black uppercase">Pinned</span>
                                    </div>` : ''}
                                <div class="${n.priority === 'IMPORTANT' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'} border px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                    <span class="text-[9px] font-black uppercase tracking-widest">${n.priority || 'GENERAL'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="px-6 pb-4">
                            <h3 class="text-lg font-extrabold text-slate-800 leading-tight mb-2">${n.title}</h3>
                            <p class="text-slate-500 text-[13px] leading-relaxed font-medium whitespace-pre-line">${n.msg}</p>
                        </div>
                        ${n.images ? `<div class="px-6 pb-4 flex flex-wrap gap-3">${attachmentsHTML}</div>` : ''}
                        <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white text-xs font-black">
                                    ${(n.sender || 'A').charAt(0)}
                                </div>
                                <div>
                                    <p class="text-[10px] font-black text-slate-800 uppercase leading-none">${n.sender}</p>
                                    <p class="text-[9px] font-bold text-blue-600 uppercase mt-1">${n.designation}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-[9px] font-black text-slate-400 uppercase">${postTime}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
            noticeList.innerHTML = html;
        }
        if (window.lucide) lucide.createIcons();
    });
};

window.downloadFile = async function(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        Swal.fire({ icon: 'success', title: 'Downloaded', toast: true, position: 'bottom', showConfirmButton: false, timer: 1500 });
    } catch (e) {
        window.open(url, '_blank');
    }
};