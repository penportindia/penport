function render_events(user) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = loadingUI();

    const eventsRef = db.ref("calendar_events");

    eventsRef.once("value", snap => {
        if (!snap.exists()) {
            return mainContent.innerHTML = emptyState();
        }

        const data = snap.val();
        let events = Object.keys(data).map(date => ({
            date,
            ...data[date]
        }));

        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        const today = new Date();
        renderUI(events, today.getMonth(), today.getFullYear(), true); 
    }, () => {
        mainContent.innerHTML = errorState();
    });
}

function renderUI(events, month, year, isDefaultView = false) {
    const mainContent = document.getElementById('main-content');
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = events.filter(ev => {
        const d = new Date(ev.date);
        if (isDefaultView) {
            return d >= today; 
        }
        return d.getMonth() === month && d.getFullYear() === year;
    });

    let html = `
    <div class="min-h-screen bg-[#F8FAFC] pb-12">
        <div class="relative overflow-hidden bg-indigo-700 px-6 pt-10 pb-16 rounded-b-[50px] shadow-2xl">
            <div class="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-600 rounded-full opacity-20"></div>
            <div class="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-indigo-800 rounded-full opacity-30"></div>
            
            <div class="relative z-10 flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-black text-white tracking-tight">
                        ${isDefaultView ? 'Upcoming' : monthName}
                    </h1>
                    <p class="text-indigo-200 font-medium text-sm mt-1">
                        ${isDefaultView ? '' : `${year} Schedule`}
                    </p>
                </div>
                <button onclick="openMonthPicker(${month}, ${year})" 
                    class="group w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center transition-all active:scale-90">
                    <i data-lucide="layout-grid" class="w-7 h-7 text-white group-hover:rotate-90 transition-transform"></i>
                </button>
            </div>
        </div>

        <div class="px-6 -mt-8 space-y-5 relative z-20">
            ${filtered.length ? '' : `
                <div class="bg-white p-10 rounded-[32px] text-center shadow-sm border border-slate-100">
                    <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="calendar-dashed" class="w-8 h-8 text-slate-300"></i>
                    </div>
                    <p class="text-slate-400 font-bold">No events found</p>
                </div>
            `}
            
            ${filtered.map(ev => {
                const d = new Date(ev.date);
                const isToday = isSameDate(d, new Date());
                const isPast = d < today;

                return `
                <div class="group relative bg-white rounded-[32px] p-5 flex items-center gap-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-white hover:border-indigo-100 transition-all">
                    <div class="flex flex-col items-center justify-center w-16 h-16 rounded-[22px] transition-transform group-hover:scale-105 
                        ${isToday ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : isPast ? 'bg-slate-100' : 'bg-indigo-50'}">
                        <span class="text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-indigo-200' : isPast ? 'text-slate-400' : 'text-indigo-400'}">
                            ${d.toLocaleString('default', { weekday: 'short' })}
                        </span>
                        <span class="text-xl font-black ${isToday ? 'text-white' : isPast ? 'text-slate-400' : 'text-indigo-900'}">
                            ${d.getDate()}
                        </span>
                    </div>

                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-extrabold text-slate-800 text-base leading-tight">${ev.title || 'Event'}</h3>
                        </div>
                        <p class="text-xs font-medium text-slate-400 line-clamp-1">${ev.desc || 'No description'}</p>
                        
                        <div class="flex items-center gap-3 mt-3">
                            ${isToday ? '<span class="text-[9px] font-black text-white bg-emerald-500 px-2 py-1 rounded-md uppercase">Today</span>' : ''}
                            ${isPast ? '<span class="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">Completed</span>' : ''}
                        </div>
                    </div>

                    <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <i data-lucide="arrow-up-right" class="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors"></i>
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>`;

    mainContent.innerHTML = html;
    if (window.lucide) lucide.createIcons();
    window.__eventsData = events;
}

function openMonthPicker(currentMonth, currentYear) {
    let html = `<div class="grid grid-cols-3 gap-4 p-2">`;
    for (let i = 0; i < 12; i++) {
        const name = new Date(0, i).toLocaleString('default', { month: 'short' });
        const isCurrent = i === currentMonth;
        html += `
        <button onclick="selectMonth(${i}, ${currentYear})"
            class="group py-5 rounded-[24px] text-center transition-all active:scale-90 ${isCurrent ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-indigo-50'}">
            <span class="block text-xs font-black uppercase tracking-widest ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}">${name}</span>
        </button>`;
    }
    html += `</div>`;

    Swal.fire({
        title: '<p class="text-xl font-black text-slate-800">Browse Calendar</p>',
        html,
        showConfirmButton: false,
        background: '#fff',
        padding: '2rem',
        borderRadius: '40px',
        width: '95%',
        showCloseButton: true
    });
}

function selectMonth(month, year) {
    Swal.close();
    renderUI(window.__eventsData || [], month, year, false); 
}

function isSameDate(d1, d2) {
    return d1.toDateString() === d2.toDateString();
}

function loadingUI() {
    return `
    <div class="flex flex-col items-center justify-center min-h-screen bg-white">
        <div class="relative w-20 h-20">
            <div class="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
    </div>`;
}

function emptyState() {
    return `
    <div class="flex flex-col items-center justify-center min-h-screen px-10 text-center bg-[#F8FAFC]">
        <h2 class="text-2xl font-black text-slate-800 mb-2">No Data</h2>
        <p class="text-slate-400">Calendar is empty.</p>
    </div>`;
}

function errorState() {
    return `
    <div class="flex flex-col items-center justify-center min-h-screen text-center px-10">
        <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
            <i data-lucide="alert-circle" class="w-10 h-10"></i>
        </div>
        <button onclick="location.reload()" class="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold">Retry</button>
    </div>`;
}