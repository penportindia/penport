window.render_notice = function(user) {
    const mainContent = document.getElementById('main-content');
    
    // Header removed, clean container for modern look
    mainContent.innerHTML = `
        <div id="notice-list" class="space-y-8 px-6 pb-40 pt-8 max-w-2xl mx-auto"></div>
    `;

    db.ref('notices').on('value', (snapshot) => {
        const noticeList = document.getElementById('notice-list');
        if (!noticeList) return;

        let filteredData = [];
        snapshot.forEach(child => {
            const n = child.val();
            
            // FULL PROOF FILTERING (Using your JSON keys)
            const isForStudent = (n.target === 'STUDENT' || n.target === 'BOTH');
            const branchMatch = (n.branch === 'ALL' || n.branch === user.academic.branch);
            const classMatch = (n.class === 'ALL' || n.class === user.academic.class);
            const sectionMatch = (n.section === 'ALL' || n.section === user.academic.section);

            if (isForStudent && branchMatch && classMatch && sectionMatch) {
                filteredData.push({ ...n, id: child.key });
            }
        });

        // --- THE PERFECT SORTING LOGIC ---
        filteredData.sort((a, b) => {
            // 1. Pinned hamesha top par (Booleans direct compare)
            if (a.pinned !== b.pinned) {
                return b.pinned ? 1 : -1;
            }
            // 2. Latest hamesha upar (Numeric timestamp compare)
            return b.timestamp - a.timestamp;
        });

        if (filteredData.length === 0) {
            noticeList.innerHTML = `
                <div class="flex flex-col items-center justify-center py-32 opacity-50">
                    <div class="w-20 h-20 bg-slate-100 rounded-[35px] flex items-center justify-center mb-6">
                        <i data-lucide="bell-off" class="w-8 h-8 text-slate-400"></i>
                    </div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Announcements</p>
                </div>`;
        } else {
            let html = "";
            filteredData.forEach(notice => {
                const isImportant = notice.priority === 'IMPORTANT';
                const hasImage = notice.images && notice.images.length > 0;
                
                // Extracting time from fullTime string (e.g., "13:33" from "20 Jan 2026, 13:33")
                const postTime = notice.fullTime ? notice.fullTime.split(',')[1] : '--:--';

                html += `
                <div class="relative group animate__animated animate__fadeInUp">
                    
                    ${notice.pinned ? `
                    <div class="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[36px] blur-sm opacity-20"></div>
                    ` : ''}

                    <div class="relative bg-white border border-slate-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] rounded-[35px] overflow-hidden transition-all duration-300">
                        
                        <div class="px-8 pt-8 pb-4 flex items-center justify-between">
                            <div class="flex flex-wrap gap-2">
                                ${notice.pinned ? `
                                    <div class="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-2xl shadow-lg">
                                        <i data-lucide="pin" class="w-3 h-3 fill-white rotate-45"></i>
                                        <span class="text-[9px] font-black uppercase tracking-widest">Pinned</span>
                                    </div>
                                ` : ''}

                                ${isImportant ? `
                                    <div class="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-2xl border border-rose-100/30">
                                        <span class="relative flex h-1.5 w-1.5">
                                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                          <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
                                        </span>
                                        <span class="text-[9px] font-black uppercase tracking-widest">Urgent</span>
                                    </div>
                                ` : ''}

                                <div class="flex items-center gap-2 bg-slate-50 text-slate-400 px-4 py-1.5 rounded-2xl border border-slate-100">
                                    <i data-lucide="calendar-days" class="w-3 h-3"></i>
                                    <span class="text-[9px] font-bold uppercase tracking-widest">${notice.date}</span>
                                </div>
                            </div>
                        </div>

                        <div class="px-8 pb-5">
                            <h3 class="text-2xl font-extrabold text-slate-800 leading-tight mb-3">${notice.title}</h3>
                            <p class="text-slate-500 text-[14px] leading-relaxed font-medium whitespace-pre-line opacity-90">${notice.msg}</p>
                        </div>

                        ${hasImage ? `
                        <div class="px-6 pb-5">
                            <div onclick="App.viewNoticeImage('${notice.images[0]}')" 
                                 class="cursor-pointer relative rounded-[30px] overflow-hidden aspect-video bg-slate-100 border-2 border-white shadow-sm hover:brightness-95 transition-all">
                                <img src="${notice.images[0]}" class="w-full h-full object-cover" />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                    <div class="flex items-center gap-2 text-white/90">
                                        <i data-lucide="maximize-2" class="w-4 h-4"></i>
                                        <span class="text-[9px] font-black uppercase tracking-widest">View Image</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-md">
                                    ${notice.sender.charAt(0)}
                                </div>
                                <div>
                                    <h5 class="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none">${notice.sender}</h5>
                                    <p class="text-[9px] font-bold text-indigo-500 uppercase mt-1 tracking-tighter">${notice.designation}</p>
                                </div>
                            </div>

                            <div class="flex flex-col items-end">
                                <span class="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Time</span>
                                <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <i data-lucide="clock" class="w-3 h-3 text-indigo-400"></i>
                                    <span class="text-[10px] font-black text-slate-600 uppercase tracking-tighter">${postTime}</span>
                                </div>
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

/**
 * FULL PROOF IMAGE PREVIEWER (Clean, No Buttons)
 */
App.viewNoticeImage = (url) => {
    Swal.fire({
        html: `
            <div class="flex flex-col items-center">
                <img src="${url}" class="w-full rounded-[35px] shadow-2xl" />
                <button onclick="Swal.close()" class="mt-8 w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-all">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
        `,
        showConfirmButton: false,
        background: 'transparent',
        backdrop: 'rgba(15, 23, 42, 0.97)',
        showClass: { popup: 'animate__animated animate__zoomIn animate__faster' },
        hideClass: { popup: 'animate__animated animate__zoomOut animate__faster' },
        didOpen: () => { if (window.lucide) lucide.createIcons(); }
    });
};