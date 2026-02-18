if (typeof window.currentViewDate === 'undefined') {
    window.currentViewDate = new Date();
}

window.render_att_view = async function(user) {
    const container = document.getElementById('main-content');
    if (!container) return;

    const myUserId = user?.uid || user?.empId || "101"; 
    const uBranchId = user?.branch || "-OiGtIvyH7ddD8J6fONr"; 
    const viewDate = window.currentViewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1; 
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    container.innerHTML = `<div class="flex items-center justify-center py-40"><div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div></div>`;

    try {
        // Sirf Staff attendance path se data fetch ho raha hai
        const dbPath = `attendance/${monthKey}/staff/${uBranchId}/${myUserId}`;
        const attSnap = await db.ref(dbPath).once('value');
        const userMonthData = attSnap.val() || {};

        let stats = { P: 0, A: 0 };
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();

        let calendarHtml = '';
        for (let i = 0; i < firstDay; i++) calendarHtml += `<div></div>`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
            const isSunday = new Date(year, month - 1, day).getDay() === 0;
            
            // Naye path structure ke mutabiq status check
            const status = userMonthData[dateStr] || null;

            let style = "bg-slate-50 text-slate-400 border-transparent";
            let icon = `<span class="text-xs font-bold">${day}</span>`;

            if (status === 'P') {
                style = "bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105";
                icon = `<i data-lucide="check" class="w-4 h-4" stroke-width="4"></i>`;
                stats.P++;
            } 
            else if (status === 'A') {
                style = "bg-rose-500 text-white shadow-lg shadow-rose-100";
                icon = `<i data-lucide="x" class="w-4 h-4" stroke-width="4"></i>`;
                stats.A++;
            }
            else if (isSunday) {
                style = "bg-rose-50 text-rose-500 border-rose-100";
                icon = `<span class="text-[9px] font-black">SUN</span>`;
            }

            calendarHtml += `
                <div class="flex flex-col items-center justify-center p-1">
                    <div class="w-10 h-10 ${style} border rounded-2xl flex items-center justify-center transition-all">
                        ${icon}
                    </div>
                </div>`;
        }

        container.innerHTML = `
            <div class="mt-6 px-6 pb-12 max-w-md mx-auto animate-fade">
                <div class="flex items-center justify-between mb-8 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                    <button onclick="window.changeMonth(-1, '${encodeURIComponent(JSON.stringify(user))}')" class="p-3 bg-slate-50 rounded-2xl text-slate-600 active:bg-blue-500 active:text-white transition-all">
                        <i data-lucide="chevron-left" class="w-5 h-5"></i>
                    </button>
                    <div class="text-center">
                        <h2 class="text-lg font-black text-slate-800 leading-none">${monthName}</h2>
                        <p class="text-[10px] font-bold text-blue-500 uppercase tracking-tighter mt-1">${year} ATTENDANCE</p>
                    </div>
                    <button onclick="window.changeMonth(1, '${encodeURIComponent(JSON.stringify(user))}')" class="p-3 bg-slate-50 rounded-2xl text-slate-600 active:bg-blue-500 active:text-white transition-all">
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-8">
                    <div class="bg-white border-b-4 border-emerald-500 rounded-3xl p-5 shadow-sm text-center">
                        <span class="text-3xl font-black text-slate-800">${stats.P}</span>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Days Present</p>
                    </div>
                    <div class="bg-white border-b-4 border-rose-500 rounded-3xl p-5 shadow-sm text-center">
                        <span class="text-3xl font-black text-slate-800">${stats.A}</span>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Days Absent</p>
                    </div>
                </div>

                <div class="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-50">
                    <div class="grid grid-cols-7 gap-1 mb-4">
                        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `
                            <div class="text-[10px] font-black ${d === 'Sun' ? 'text-rose-400' : 'text-slate-300'} text-center uppercase">${d}</div>
                        `).join('')}
                    </div>
                    <div class="grid grid-cols-7 gap-y-2">
                        ${calendarHtml}
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="p-10 text-center text-slate-500 uppercase font-bold text-xs">Error loading path: ${monthKey}</div>`;
    }
};

window.changeMonth = function(offset, userJson) {
    const user = JSON.parse(decodeURIComponent(userJson));
    window.currentViewDate.setMonth(window.currentViewDate.getMonth() + offset);
    window.render_att_view(user);
};