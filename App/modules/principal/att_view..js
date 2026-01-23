/**
 * THE WINGS - Staff Attendance Module
 * Logic: PRO-MAX DEEP SCAN (Branch + Folio)
 * UI: DITTO STUDENT VERSION (Ultra Clean)
 */

if (typeof window.currentViewDate === 'undefined') {
    window.currentViewDate = new Date();
}

window.render_att_view = async function(user) {
    const container = document.getElementById('main-content');
    if (!container) return;

    // --- STEP 1: DEEP FOLIO DISCOVERY (Preserved Logic) ---
    let sFolio = null;
    if (user) {
        sFolio = user.folio || 
                 (user.profile && user.profile.folio) || 
                 user.employeeId || 
                 user.empId || 
                 user.id;
    }

    if (!sFolio) {
        container.innerHTML = `
            <div class="mt-20 p-8 text-center bg-white rounded-[2.5rem] shadow-xl border border-rose-50 max-w-xs mx-auto">
                <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="shield-alert" class="w-8 h-8"></i>
                </div>
                <h3 class="text-slate-800 font-black text-lg tracking-tight">Folio Missing</h3>
                <p class="text-slate-400 text-[10px] mt-2 uppercase tracking-widest leading-relaxed">
                    Kripya Admin se sampark karein.
                </p>
            </div>`;
        lucide.createIcons();
        return;
    }

    const viewDate = window.currentViewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    // --- UI: STUDENT DITTO LOADING ---
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-40">
            <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>`;

    try {
        const snapshot = await db.ref(`attendance/${monthKey}`).once('value');
        const monthData = snapshot.val() || {};
        
        let stats = { P: 0, A: 0, L: 0 };
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let calendarHtml = '';
        for (let i = 0; i < firstDay; i++) {
            calendarHtml += `<div class="aspect-square"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
            let status = null;

            // --- STEP 2: DATA EXTRACTION (Preserved Logic) ---
            if (monthData[dateStr] && monthData[dateStr].staff) {
                const branches = monthData[dateStr].staff;
                Object.values(branches).forEach(staffList => {
                    if (staffList[sFolio]) status = staffList[sFolio];
                    else if (staffList[String(sFolio)]) status = staffList[String(sFolio)];
                });
            }

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

        // --- UI: STUDENT DITTO FINAL INTERFACE ---
        container.innerHTML = `
            <div class="mt-20 px-5 pb-10 max-w-md mx-auto">
                
                <div class="bg-white rounded-[2.5rem] p-3 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between mb-8">
                    <button id="prevBtn" class="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-600 active:bg-blue-600 active:text-white transition-all">
                        <i data-lucide="chevron-left" class="w-6 h-6"></i>
                    </button>
                    
                    <h2 class="text-xl font-black text-slate-800 tracking-tight capitalize">${monthName} ${year}</h2>
                    
                    <button id="nextBtn" class="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-600 active:bg-blue-600 active:text-white transition-all">
                        <i data-lucide="chevron-right" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-3 mb-10">
                    ${renderStatCard(stats.P, 'Present', 'emerald', 'user-check')}
                    ${renderStatCard(stats.A, 'Absent', 'rose', 'user-x')}
                    ${renderStatCard(stats.L, 'Leave', 'amber', 'clock')}
                </div>

                <div class="bg-white rounded-[3rem] p-7 shadow-2xl shadow-slate-200/40 border border-slate-50">
                    <div class="grid grid-cols-7 gap-1 mb-6">
                        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `
                            <div class="text-[10px] font-black ${d === 'Sun' ? 'text-rose-400' : 'text-slate-300'} text-center uppercase tracking-widest">${d}</div>
                        `).join('')}
                    </div>
                    
                    <div class="grid grid-cols-7 gap-y-3">
                        ${calendarHtml}
                    </div>
                </div>

                <p class="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-8">EMP ID: ${sFolio}</p>
            </div>
        `;

        // Event Listeners
        document.getElementById('prevBtn').onclick = () => { window.currentViewDate.setMonth(window.currentViewDate.getMonth() - 1); window.render_att_view(user); };
        document.getElementById('nextBtn').onclick = () => { window.currentViewDate.setMonth(window.currentViewDate.getMonth() + 1); window.render_att_view(user); };

        lucide.createIcons();

    } catch (error) {
        console.error("Attendance Error:", error);
    }
};

// Helper function for Stat Cards (Student Version Look)
function renderStatCard(val, label, color, icon) {
    const bgMap = { emerald: 'bg-emerald-100 text-emerald-600', rose: 'bg-rose-100 text-rose-600', amber: 'bg-amber-100 text-amber-600' };
    return `
        <div class="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex flex-col items-center">
            <div class="w-8 h-8 ${bgMap[color]} rounded-full flex items-center justify-center mb-2">
                 <i data-lucide="${icon}" class="w-4 h-4"></i>
            </div>
            <span class="text-lg font-black text-slate-800">${val}</span>
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">${label}</span>
        </div>`;
}