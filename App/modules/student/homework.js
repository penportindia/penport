window.render_homework = async function (userData) {
    const container = document.getElementById('main-content');
    const branch = userData.academic.branch || 'MAIN';
    const studentClass = userData.academic.class;
    const studentSection = userData.academic.section;
    let selectedDate = new Date().toISOString().split('T')[0];

    const style = document.createElement('style');
    style.innerHTML = `
        .date-strip { background: white; padding: 12px 16px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #f1f5f9; position: sticky; top: 10px; z-index: 50; }
        .date-input { border: none; font-size: 16px; font-weight: 800; color: #1e293b; outline: none; background: transparent; cursor: pointer; }
        .hw-card-main { background: white; border-radius: 28px; p-5 mb-4 shadow-sm border border-slate-100 relative overflow-hidden active:scale-[0.98] transition-transform; }
        .subject-tag { background: #4f46e5; color: white; text-[9px] font-black px-3 py-1 rounded-full uppercase; }
        .section-tag { background: #0f172a; color: white; text-[9px] font-black px-3 py-1 rounded-full uppercase; }
        .asset-btn-student { display: flex; align-items: center; gap: 2px; background: #0f172a; color: white; px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-md; border:none; }
    `;
    document.head.appendChild(style);

    container.innerHTML = `
        <div class="p-4">
            <div class="date-strip">
                <div class="flex items-center gap-2">
                    <i data-lucide="calendar" class="w-5 h-5 text-amber-500"></i>
                    <div>
                        <p id="today-label" class="text-[8px] font-black text-amber-600 uppercase leading-none mb-1">Today</p>
                        <input type="date" id="hw-filter-date" class="date-input" value="${selectedDate}">
                    </div>
                </div>
                <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <i data-lucide="book-marked" class="w-5 h-5"></i>
                </div>
            </div>
            <div id="homework-list" class="pb-24"></div>
        </div>
    `;

    const fetchHomework = async (dateStr) => {
        const listDiv = document.getElementById('homework-list');
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Update Today Label
        document.getElementById('today-label').innerText = (dateStr === todayStr) ? "Today" : "Selected Date";
        
        listDiv.innerHTML = `<div class="py-20 flex flex-col items-center opacity-40"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div></div>`;

        try {
            // Bandwidth Optimization: Sirf zaruri fields fetch ho rahi hain query se
            const snapshot = await db.ref(`homework/${branch}`).orderByChild('fullDate').equalTo(dateStr).once('value');
            let html = '';
            let items = [];

            snapshot.forEach(child => {
                const hw = child.val();
                if (hw.className === studentClass && hw.section === studentSection) {
                    items.push({ ...hw, id: child.key });
                }
            });

            if (items.length === 0) {
                listDiv.innerHTML = `<div class="flex flex-col items-center justify-center py-20 opacity-30"><i data-lucide="clipboard-list" class="w-12 h-12 mb-2 text-slate-400"></i><div class="font-black text-[10px] uppercase">No Assignments</div></div>`;
                lucide.createIcons();
                return;
            }

            items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).forEach(hw => {
                const mediaCount = (hw.images?.length || 0) + (hw.videos?.length || 0);
                html += `
                <div class="bg-white rounded-[28px] p-5 mb-4 shadow-sm border border-slate-100 relative overflow-hidden active:scale-[0.98] transition-transform">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex gap-1.5">
                            <span class="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Class ${hw.className}</span>
                            <span class="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">${hw.section}</span>
                        </div>
                        <div class="flex items-center gap-1 text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">
                            <i data-lucide="clock" class="w-3 h-3"></i> ${hw.date || ''}
                        </div>
                    </div>

                    <div class="mb-4">
                        <h3 class="text-xl font-black text-slate-900 leading-tight mb-1 tracking-tight">${hw.subject}</h3>
                        <div class="flex items-center gap-1.5 text-amber-600 mb-3">
                            <i data-lucide="book-open" class="w-3 h-3"></i>
                            <span class="text-[10px] font-bold uppercase tracking-tight">${hw.book || 'General Task'}</span>
                        </div>
                        <p class="text-slate-600 text-[13px] leading-relaxed font-medium bg-slate-50/50 p-3 rounded-2xl border border-slate-50">${hw.task}</p>
                    </div>

                    ${hw.editedBy ? `
                        <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-2 rounded-xl mb-4 border border-emerald-100">
                            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                            <span class="text-[9px] font-bold uppercase tracking-tighter">Verified by Admin</span>
                        </div>
                    ` : ''}

                    <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                        <button onclick='window.viewAttachments(${JSON.stringify({images: hw.images, videos: hw.videos})})' class="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-md">
                            <i data-lucide="files" class="w-4 h-4"></i>
                            <span class="text-[10px] font-black uppercase tracking-widest">${mediaCount > 0 ? mediaCount + ' Assets' : 'No Media'}</span>
                        </button>
                        <div class="text-right">
                            <span class="block text-[8px] font-bold uppercase text-slate-400">Teacher</span>
                            <span class="text-[10px] font-black text-slate-800 uppercase">${hw.teacherName || 'Faculty'}</span>
                        </div>
                    </div>
                </div>`;
            });
            listDiv.innerHTML = html;
            lucide.createIcons();
        } catch (e) { console.error(e); }
    };

    window.viewAttachments = function (hw) {
        window.downloadFile = async function(url, name) {
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const bUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = bUrl;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(bUrl);
                document.body.removeChild(a);
            } catch (e) {
                window.open(url, '_blank');
            }
        };

        let html = `<div class="grid grid-cols-1 gap-4 p-1" style="max-height:75vh; overflow-y:auto;">`;

        if (hw.images) {
            hw.images.forEach((url, i) => {
                const isPDF = url.toLowerCase().includes('.pdf');
                const fileName = isPDF ? `Doc_${i+1}.pdf` : `Img_${i+1}.jpg`;
                
                html += `
                <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div class="p-4 flex items-center justify-between ${isPDF ? 'bg-rose-50/50' : 'bg-blue-50/50'}">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 ${isPDF ? 'bg-rose-500' : 'bg-blue-500'} rounded-lg flex items-center justify-center">
                                <i data-lucide="${isPDF ? 'file-text' : 'image'}" class="text-white w-4 h-4"></i>
                            </div>
                            <span class="text-[11px] font-bold text-slate-700 uppercase tracking-tight">${isPDF ? 'PDF' : 'Image'}</span>
                        </div>
                    </div>

                    ${isPDF ? 
                        `<iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true" class="w-full h-[320px] border-none"></iframe>` : 
                        `<div class="p-2"><img src="${url}" class="w-full h-auto rounded-2xl"></div>`
                    }

                    <div class="p-3 bg-white">
                        <button onclick="downloadFile('${url}', '${fileName}')" 
                            class="w-full py-3 bg-slate-900 active:bg-black text-white rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                            <i data-lucide="download" class="w-4 h-4"></i>
                            Download File
                        </button>
                    </div>
                </div>`;
            });
        }

        if (hw.videos) {
            hw.videos.forEach(v => {
                html += `
                <div onclick="window.open('${v}', '_blank')" class="bg-indigo-600 rounded-3xl p-5 flex items-center gap-4 shadow-md active:scale-95 transition-transform">
                    <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                        <i data-lucide="play" class="text-white fill-white w-4 h-4"></i>
                    </div>
                    <div class="flex-grow overflow-hidden text-left">
                        <div class="text-[10px] text-indigo-100 font-bold uppercase tracking-widest opacity-80">Video Class</div>
                        <div class="text-[12px] font-semibold text-white truncate">${v}</div>
                    </div>
                    <i data-lucide="external-link" class="text-white/50 w-4 h-4"></i>
                </div>`;
            });
        }

        html += `</div>`;

        Swal.fire({
            html: html,
            showConfirmButton: false,
            showCloseButton: true,
            background: '#f8fafc',
            width: '95%',
            position: 'bottom',
            customClass: { popup: 'rounded-[25px] border-none shadow-2xl !mb-6 animate__animated animate__slideInUp' },
            didOpen: () => lucide.createIcons()
        });
    };

    document.getElementById('hw-filter-date').addEventListener('change', (e) => fetchHomework(e.target.value));
    fetchHomework(selectedDate);
    lucide.createIcons();
};