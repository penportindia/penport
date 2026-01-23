/**
 * THE WINGS - Student Attendance (ULTRA CLEAN VERSION)
 * Card Stats | Premium Header | Minimal UI
 */

if (typeof window.currentViewDate === 'undefined') {
    window.currentViewDate = new Date();
}

window.render_att = async function(user) {
    const container = document.getElementById('main-content');
    const viewDate = window.currentViewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-40">
            <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>`;

    try {
        const snapshot = await db.ref(`attendance/${monthKey}`).once('value');
        const monthData = snapshot.val() || {};
        
        const { class: sClass, section: sSec } = user.academic;
        const sFolio = user.profile.folio;

        let stats = { P: 0, A: 0, L: 0 };
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let calendarHtml = '';
        for (let i = 0; i < firstDay; i++) {
            calendarHtml += `<div class="aspect-square"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
            const status = monthData[dateStr]?.student?.[sClass]?.[sSec]?.[sFolio];
            const isSunday = new Date(year, month, day).getDay() === 0;

            let style = "bg-slate-50 text-slate-400 border-transparent";
            let icon = `<span class="text-xs font-bold">${day}</span>`;

            if (isSunday) {
                style = "bg-rose-100 text-rose-500 border-rose-200/50";
                icon = `<span class="text-[9px] font-black">SUN</span>`;
            } else if (status === 'P') {
                style = "bg-emerald-500 text-white shadow-lg shadow-emerald-200";
                icon = `<i data-lucide="check" class="w-3.5 h-3.5" stroke-width="4"></i>`;
                stats.P++;
            } else if (status === 'A') {
                style = "bg-rose-500 text-white shadow-lg shadow-rose-200";
                icon = `<i data-lucide="x" class="w-3.5 h-3.5" stroke-width="4"></i>`;
                stats.A++;
            } else if (status === 'L') {
                style = "bg-amber-400 text-white shadow-lg shadow-amber-200";
                icon = `<span class="text-[10px] font-black">L</span>`;
                stats.L++;
            }

            calendarHtml += `
                <div class="flex flex-col items-center justify-center p-1">
                    <div class="w-full aspect-square max-w-[42px] ${style} border rounded-[15px] flex items-center justify-center transition-all duration-300 active:scale-75">
                        ${icon}
                    </div>
                </div>`;
        }

        container.innerHTML = `
            <div class="mt-20 px-5 pb-10">
                
                <div class="bg-white rounded-[2.5rem] p-3 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between mb-8">
                    <button onclick="changeMonth(-1, '${encodeURIComponent(JSON.stringify(user))}')" 
                        class="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-600 active:bg-blue-600 active:text-white transition-all">
                        <i data-lucide="chevron-left" class="w-6 h-6"></i>
                    </button>
                    
                    <h2 class="text-xl font-black text-slate-800 tracking-tight capitalize">${monthName} ${year}</h2>
                    
                    <button onclick="changeMonth(1, '${encodeURIComponent(JSON.stringify(user))}')" 
                        class="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-600 active:bg-blue-600 active:text-white transition-all">
                        <i data-lucide="chevron-right" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-3 mb-10">
                    <div class="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col items-center">
                        <div class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                             <i data-lucide="user-check" class="w-4 h-4"></i>
                        </div>
                        <span class="text-lg font-black text-slate-800">${stats.P}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Present</span>
                    </div>

                    <div class="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col items-center">
                        <div class="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
                             <i data-lucide="user-x" class="w-4 h-4"></i>
                        </div>
                        <span class="text-lg font-black text-slate-800">${stats.A}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Absent</span>
                    </div>

                    <div class="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col items-center">
                        <div class="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                             <i data-lucide="clock" class="w-4 h-4"></i>
                        </div>
                        <span class="text-lg font-black text-slate-800">${stats.L}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Leave</span>
                    </div>
                </div>

                <div class="bg-white rounded-[3rem] p-7 shadow-2xl shadow-slate-200/40 border border-slate-50">
                    <div class="grid grid-cols-7 gap-1 mb-6">
                        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `
                            <div class="text-[10px] font-black ${d === 'Sun' ? 'text-rose-400' : 'text-slate-300'} text-center uppercase">${d}</div>
                        `).join('')}
                    </div>
                    
                    <div class="grid grid-cols-7 gap-y-3">
                        ${calendarHtml}
                    </div>
                </div>

            </div>
        `;

        lucide.createIcons();

    } catch (error) {
        console.error("Attendance Error:", error);
    }
};

window.changeMonth = function(diff, encodedUser) {
    const user = JSON.parse(decodeURIComponent(encodedUser));
    window.currentViewDate.setMonth(window.currentViewDate.getMonth() + diff);
    window.render_att(user);
};