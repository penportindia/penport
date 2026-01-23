/**
 * Full-Proof Student Homework Module
 * Handles: Multiple Images, Multiple Videos, 100% Transparent Header, Preview Modal
 * Path: modules/student/homework.js
 */

window.render_homework = async function(userData) {
    const container = document.getElementById('main-content');
    const branch = userData.academic.branch || 'MAIN';
    const studentClass = userData.academic.class;
    const studentSection = userData.academic.section;

    let selectedDate = new Date().toISOString().split('T')[0];

    const style = document.createElement('style');
    style.innerHTML = `
        .date-chip { flex: 0 0 58px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .date-chip.active { background: #0f172a !important; color: white !important; transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; scroll-snap-type: x mandatory; }
        .hw-card { border-radius: 24px; background: white; border: 1px solid #f1f5f9; position: relative; overflow: hidden; }
        .hw-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--subject-color, #2563eb); }
        .compact-header { background: white; border-radius: 20px; border: 1px solid #e2e8f0; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        
        /* Multi-Image Scroller within Card */
        .img-mini-stack { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .img-mini-item { width: 45px; height: 45px; border-radius: 10px; object-fit: cover; border: 2px solid #f1f5f9; flex-shrink: 0; cursor: pointer; }
        
        /* Modal Overlay */
        #img-preview-overlay { transition: opacity 0.3s ease; }
        #img-preview-overlay.hidden { display: none; opacity: 0; }
    `;
    document.head.appendChild(style);

    container.innerHTML = `
        <div class="space-y-4 pb-28">
            <div class="sticky top-0 z-30 -mx-2 px-2 bg-transparent pb-3 pt-2">
                <div class="compact-header mb-4 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <i data-lucide="book-open" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p id="selected-date-label" class="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Today</p>
                            <h1 class="text-sm font-black text-slate-800 tracking-tight uppercase">Homework</h1>
                        </div>
                    </div>
                    <div class="relative active-scale">
                        <input type="date" id="calendar-input" value="${selectedDate}" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10">
                        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                            <i data-lucide="calendar" class="w-4 h-4"></i>
                        </div>
                    </div>
                </div>
                <div id="date-scroller" class="flex gap-2.5 overflow-x-auto scroll-hide py-1">
                    ${generateMobileDateStrip(selectedDate)}
                </div>
            </div>

            <div id="homework-list" class="space-y-4"></div>
        </div>

        <div id="img-preview-overlay" class="hidden fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
            <button onclick="closePreview()" class="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center">
                <i data-lucide="x" class="w-6 h-6"></i>
            </button>
            <img id="preview-img-tag" src="" class="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl">
        </div>
    `;

    window.openPreview = (url) => {
        document.getElementById('preview-img-tag').src = url;
        document.getElementById('img-preview-overlay').classList.remove('hidden');
        lucide.createIcons();
    };
    window.closePreview = () => document.getElementById('img-preview-overlay').classList.add('hidden');

    document.getElementById('calendar-input').addEventListener('change', (e) => updateActiveDate(e.target.value));

    fetchHomework(selectedDate);

    async function fetchHomework(dateStr) {
        const listContainer = document.getElementById('homework-list');
        listContainer.innerHTML = `<div class="py-20 flex flex-col items-center"><div class="loader mb-4"></div><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</p></div>`;

        try {
            const hwRef = db.ref(`homework/${branch}`);
            const snapshot = await hwRef.orderByChild('fullDate').equalTo(dateStr).once('value');
            const list = [];
            snapshot.forEach(child => {
                const data = child.val();
                if (data.className === studentClass && data.section === studentSection) {
                    list.push({ id: child.key, ...data });
                }
            });
            renderHomeworkItems(list, dateStr);
        } catch (e) {
            listContainer.innerHTML = `<div class="p-10 text-center text-rose-500 font-bold">Failed to load data</div>`;
        }
    }

    function renderHomeworkItems(list, dateStr) {
        const listContainer = document.getElementById('homework-list');
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('selected-date-label').innerText = (dateStr === todayStr) ? "Today" : new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (list.length === 0) {
            listContainer.innerHTML = `<div class="py-16 text-center"><h3 class="text-slate-400 font-black text-xs uppercase tracking-widest">No Homework</h3></div>`;
            return;
        }

        let html = '';
        list.forEach(hw => {
            const colors = getSubjectColor(hw.subject);
            
            // Handle Multiple Images
            let imageSection = '';
            if (hw.images && Array.isArray(hw.images)) {
                imageSection = `<div class="img-mini-stack scroll-hide mb-4">
                    ${hw.images.map(img => `<img src="${img}" onclick="window.openPreview('${img}')" class="img-mini-item shadow-sm active:scale-90 transition-transform" />`).join('')}
                </div>`;
            }

            // Handle Multiple Videos
            let videoButtons = '';
            if (hw.videos && Array.isArray(hw.videos)) {
                videoButtons = hw.videos.map((vid, index) => `
                    <button onclick="window.open('${vid}', '_blank')" class="flex-1 bg-rose-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-rose-100">
                        <i data-lucide="youtube" class="w-4 h-4"></i>
                        <span class="text-[9px] font-black uppercase tracking-widest">Part ${index + 1}</span>
                    </button>
                `).join('');
            }

            html += `
                <div class="hw-card shadow-sm p-5" style="--subject-color: ${colors.primary}">
                    <div class="flex justify-between items-start mb-4">
                        <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest" style="background: ${colors.secondary}; color: ${colors.primary}">
                            ${hw.subject}
                        </span>
                        <p class="text-[10px] font-extrabold uppercase text-slate-400">${hw.date}</p>
                    </div>

                    <h4 class="text-base font-bold text-slate-800 leading-snug mb-4">${hw.task}</h4>

                    ${imageSection}

                    <div class="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                        <div class="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm text-[10px] font-black text-slate-600 border border-slate-100 uppercase">
                            ${hw.teacherName ? hw.teacherName.charAt(0) : 'T'}
                        </div>
                        <div class="flex-1">
                            <p class="text-[10px] font-black text-slate-800 leading-none">${hw.teacherName || 'Faculty'}</p>
                            <p class="text-[8px] text-slate-400 font-bold uppercase mt-1">Teacher</p>
                        </div>
                        ${hw.book ? `<span class="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase">${hw.book}</span>` : ''}
                    </div>

                    <div class="flex flex-wrap gap-2.5">
                        ${videoButtons}
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
        lucide.createIcons();
    }

    function getSubjectColor(sub) {
        const s = sub.toUpperCase();
        if(s.includes('MATH')) return { primary: '#f59e0b', secondary: '#fffbeb' };
        if(s.includes('SCIENCE')) return { primary: '#10b981', secondary: '#ecfdf5' };
        if(s.includes('ENGLISH')) return { primary: '#6366f1', secondary: '#eef2ff' };
        if(s.includes('HINDI')) return { primary: '#ef4444', secondary: '#fef2f2' };
        return { primary: '#2563eb', secondary: '#eff6ff' };
    }

    function generateMobileDateStrip(selected) {
        let html = '';
        const today = new Date();
        for (let i = 0; i < 15; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const isActive = dStr === selected;
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            html += `
                <div onclick="window.updateActiveDate('${dStr}')" class="date-chip flex-shrink-0 flex flex-col items-center py-3.5 rounded-[20px] bg-white border border-slate-100 cursor-pointer ${isActive ? 'active' : 'text-slate-400'}">
                    <span class="text-[8px] font-black uppercase mb-1">${dayName}</span>
                    <span class="text-sm font-black">${d.getDate()}</span>
                </div>`;
        }
        return html;
    }

    window.updateActiveDate = (dateStr) => {
        document.getElementById('calendar-input').value = dateStr;
        document.getElementById('date-scroller').innerHTML = generateMobileDateStrip(dateStr);
        const activeChip = document.querySelector('.date-chip.active');
        if(activeChip) activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        fetchHomework(dateStr);
    };
};