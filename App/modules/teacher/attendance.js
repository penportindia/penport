window.render_att_take = async function(user) {
    const container = document.getElementById('main-content');
    const branchName = App.state.branchName || "MAIN"; 
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-4 pb-32 px-2 md:px-4 animate-fade">
        
        <div class="flex gap-1 p-1 bg-slate-200/50 backdrop-blur-md rounded-2xl w-fit mx-auto shadow-inner border border-white/50 sticky top-2 z-30">
            <button onclick="switchTab('mark')" id="tab-mark" class="px-8 md:px-12 py-2.5 rounded-xl font-black text-[11px] md:text-xs transition-all bg-white text-blue-600 shadow-sm">
                MARK ATTENDANCE
            </button>
            <button onclick="switchTab('report')" id="tab-report" class="px-8 md:px-12 py-2.5 rounded-xl font-black text-[11px] md:text-xs transition-all text-slate-500">
                REPORT
            </button>
        </div>

        <div id="section-mark" class="space-y-4">
            <div class="glass-card p-3 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 border border-white/40">
                <div class="col-span-1">
                    <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Class</label>
                    <select id="att-class" class="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-slate-700 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20"></select>
                </div>
                <div class="col-span-1">
                    <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Section</label>
                    <select id="att-section" class="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-slate-700 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20"></select>
                </div>
                <div class="col-span-1">
                    <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Date</label>
                    <input type="date" id="att-date" value="${todayStr}" class="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-slate-700 text-[11px] pointer-events-none opacity-60">
                </div>
                <div class="col-span-1 flex items-end">
                    <button onclick="fetchStudentList('${branchName}')" class="w-full bg-blue-600 text-white p-3.5 rounded-xl font-black text-[10px] shadow-lg uppercase active:scale-95 transition-all">
                        LOAD
                    </button>
                </div>
            </div>

            <div id="mark-controls" class="hidden flex items-center gap-2 px-1">
                <div class="relative flex-1">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"></i>
                    <input type="text" id="att-search" onkeyup="filterStudents()" placeholder="Search Name, Roll or Folio..." 
                           class="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm outline-none font-bold text-[11px] text-slate-600">
                </div>
                <button onclick="markAllPresent()" class="bg-emerald-500 text-white px-4 py-3 rounded-xl font-black text-[10px] shadow-md uppercase active:scale-95">
                    ALL P
                </button>
            </div>

            <div id="attendance-list-container" class="space-y-2">
                <div class="p-16 text-center opacity-40">
                    <i data-lucide="users" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
                    <p class="text-[10px] font-black uppercase tracking-widest">Select Details Above</p>
                </div>
            </div>
        </div>

        <div id="section-report" class="hidden space-y-4">
            <div class="glass-card p-4 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div class="col-span-1">
                    <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Report Date</label>
                    <input type="date" id="rep-date" value="${todayStr}" class="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-slate-700 text-[11px]">
                </div>
                <div class="col-span-1">
                    <button onclick="generateReport()" class="w-full bg-slate-900 text-white p-3.5 rounded-xl font-black text-[10px] shadow-xl uppercase active:scale-95">
                        View
                    </button>
                </div>
            </div>
            <div id="report-stats" class="hidden grid grid-cols-3 gap-2"></div>
            <div id="report-content" class="space-y-2"></div>
        </div>
    </div>`;

    lucide.createIcons();
    initAttLogic(branchName);
};

// Optimized Logic with .orderByChild()
window.fetchStudentList = async function(branchName) {
    const cls = document.getElementById('att-class').value;
    const sec = document.getElementById('att-section').value;
    const date = document.getElementById('att-date').value;
    const month = date.substring(0, 7);

    if(!cls || !sec) return Swal.fire('Wait!', 'Select Class & Section', 'info');

    const container = document.getElementById('attendance-list-container');
    container.innerHTML = `<div class="p-20 text-center"><div class="loader mx-auto"></div></div>`;

    try {
        // Optimized: Sirf usi branch ke students fetch honge
        const [stdSnap, attSnap] = await Promise.all([
            db.ref('student').orderByChild('academic/branch').equalTo(branchName).once('value'),
            db.ref(`attendance/${month}/${date}/student/${cls}/${sec}`).once('value')
        ]);

        let students = [];
        stdSnap.forEach(c => {
            const d = c.val();
            // Branch upar query ho gayi, ab sirf class aur section filter karna hai
            if(d.academic?.class === cls && d.academic?.section === sec) {
                students.push({ folio: c.key, ...d });
            }
        });

        if(students.length === 0) return container.innerHTML = `<div class="p-10 text-center text-rose-500 font-black text-xs">NO STUDENTS FOUND</div>`;

        const existingRecords = attSnap.val() || {};
        document.getElementById('mark-controls').classList.remove('hidden');

        container.innerHTML = `
        <div class="grid grid-cols-1 gap-2 pb-10">
            ${students.sort((a,b) => (a.academic?.rollNo || 0) - (b.academic?.rollNo || 0)).map(s => {
                const savedStatus = existingRecords[s.folio] || '';
                // Updated Search Attribute: Name + Folio + Roll
                return `
                <div class="att-row bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm" 
                     data-folio="${s.folio}" 
                     data-status="${savedStatus}"
                     data-search="${s.profile.studentName} ${s.folio} ${s.academic?.rollNo || ''}">
                    <div class="flex-1 min-w-0 pr-2">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black">#${s.academic.rollNo || '0'}</span>
                            <p class="font-black text-slate-800 text-[12px] uppercase truncate">${s.profile.studentName}</p>
                        </div>
                        <div class="flex flex-wrap gap-x-3">
                            <p class="text-[9px] font-bold text-slate-400 uppercase">F: ${s.parents?.father?.name || '---'}</p>
                            <p class="text-[9px] font-bold text-blue-500/60 uppercase">Folio: ${s.folio}</p>
                        </div>
                    </div>
                    <div class="flex gap-1 shrink-0">
                        <button onclick="markStatus(this, 'P')" class="m-btn w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-slate-50 font-black text-xs transition-all ${savedStatus === 'P' ? 'bg-emerald-500 text-white border-transparent shadow-lg' : 'text-slate-300'}">P</button>
                        <button onclick="markStatus(this, 'A')" class="m-btn w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-slate-50 font-black text-xs transition-all ${savedStatus === 'A' ? 'bg-rose-500 text-white border-transparent shadow-lg' : 'text-slate-300'}">A</button>
                        <button onclick="markStatus(this, 'L')" class="m-btn w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-slate-50 font-black text-xs transition-all ${savedStatus === 'L' ? 'bg-amber-500 text-white border-transparent shadow-lg' : 'text-slate-300'}">L</button>
                    </div>
                </div>`;
            }).join('')}
        </div>
        
        <div class="sticky bottom-4 z-40 bg-white/10 backdrop-blur-md p-2 rounded-3xl border border-white/40">
            <button onclick="saveAttendance('${cls}', '${sec}', '${date}')" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-2xl hover:bg-black active:scale-95 uppercase tracking-widest text-[11px]">
                Save Today's Attendance
            </button>
        </div>`;
        lucide.createIcons();
    } catch(e) { console.error(e); }
};

// --- Baki functions ditto bilkul same ---

async function initAttLogic(branchName) {
    const classSelect = document.getElementById('att-class');
    const sectionSelect = document.getElementById('att-section');
    try {
        const snap = await db.ref('foundation/classes').once('value');
        let classHtml = '<option value="">Class</option>';
        snap.forEach(c => {
            if(c.val().branch === branchName) {
                classHtml += `<option value="${c.val().className}" data-sections="${c.val().sections}">${c.val().className}</option>`;
            }
        });
        classSelect.innerHTML = classHtml;
        classSelect.onchange = (e) => {
            const secs = e.target.options[e.target.selectedIndex].getAttribute('data-sections')?.split(',') || [];
            sectionSelect.innerHTML = secs.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('');
        };
    } catch(e) { console.error(e); }

    window.switchTab = (tab) => {
        const isMark = tab === 'mark';
        document.getElementById('section-mark').classList.toggle('hidden', !isMark);
        document.getElementById('section-report').classList.toggle('hidden', isMark);
        document.getElementById('tab-mark').className = isMark ? 'px-8 md:px-12 py-2.5 rounded-xl font-black text-[11px] md:text-xs bg-white text-blue-600 shadow-sm' : 'px-8 md:px-12 py-2.5 rounded-xl font-black text-[11px] md:text-xs text-slate-500';
        document.getElementById('tab-report').className = !isMark ? 'px-8 md:px-12 py-2.5 rounded-xl font-black text-[11px] md:text-xs bg-white text-blue-600 shadow-sm' : 'px-8 md:px-12 py-2.5 rounded-xl font-black text-[11px] md:text-xs text-slate-500';
    };
}

window.markStatus = function(btn, status) {
    const row = btn.closest('.att-row');
    row.querySelectorAll('.m-btn').forEach(b => {
        b.classList.remove('bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'text-white', 'border-transparent', 'shadow-lg');
        b.classList.add('text-slate-300', 'border-slate-50');
    });
    const colors = { 'P': 'bg-emerald-500', 'A': 'bg-rose-500', 'L': 'bg-amber-500' };
    btn.classList.add(colors[status], 'text-white', 'border-transparent', 'shadow-lg');
    btn.classList.remove('text-slate-300', 'border-slate-50');
    row.setAttribute('data-status', status);
};

window.markAllPresent = function() {
    document.querySelectorAll('.att-row').forEach(row => {
        if(row.style.display !== 'none') {
            const pBtn = row.querySelector('.m-btn:first-child');
            markStatus(pBtn, 'P');
        }
    });
};

window.filterStudents = function() {
    const q = document.getElementById('att-search').value.toLowerCase();
    document.querySelectorAll('.att-row').forEach(row => {
        const searchPool = row.getAttribute('data-search').toLowerCase();
        row.style.display = searchPool.includes(q) ? 'flex' : 'none';
    });
};

window.saveAttendance = async function(cls, sec, date) {
    const month = date.substring(0, 7);
    const rows = document.querySelectorAll('.att-row');
    const records = {}; 
    let count = 0;
    rows.forEach(r => {
        const status = r.getAttribute('data-status');
        if(status && status !== "") {
            records[r.getAttribute('data-folio')] = status;
            count++;
        }
    });
    if(count < rows.length) {
        return Swal.fire({ title: 'Incomplete!', text: `Sirf ${count} bachon ki attendance lagi hai. Sabhi ${rows.length} bachon ko mark karein.`, icon: 'warning' });
    }
    try {
        Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await db.ref(`attendance/${month}/${date}/student/${cls}/${sec}`).set(records);
        Swal.fire('Success!', 'Attendance Updated Successfully', 'success');
        App.navigate('home');
    } catch(e) { Swal.fire('Error', e.message, 'error'); }
};

window.generateReport = async function() {
    const date = document.getElementById('rep-date').value;
    const month = date.substring(0, 7);
    const cls = document.getElementById('att-class').value;
    const sec = document.getElementById('att-section').value;
    const stats = document.getElementById('report-stats');
    const content = document.getElementById('report-content');
    if(!cls || !sec) return Swal.fire('Notice', 'Select Class/Section first', 'info');
    content.innerHTML = `<div class="p-10 text-center"><div class="loader mx-auto"></div></div>`;
    try {
        const branchName = App.state.branchName || "MAIN";
        const [attSnap, stdSnap] = await Promise.all([
            db.ref(`attendance/${month}/${date}/student/${cls}/${sec}`).once('value'),
            db.ref('student').orderByChild('academic/branch').equalTo(branchName).once('value')
        ]);
        const records = attSnap.val();
        if(!records) { 
            stats.classList.add('hidden'); 
            return content.innerHTML = `<div class="p-10 text-center text-rose-500 font-black text-[10px] uppercase">No Record Found</div>`; 
        }
        let p=0, a=0, l=0;
        Object.values(records).forEach(v => { if(v==='P') p++; if(v==='A') a++; if(v==='L') l++; });
        stats.classList.remove('hidden');
        stats.innerHTML = `
            <div class="bg-white p-3 rounded-2xl border-b-4 border-emerald-500 text-center shadow-sm"><p class="text-[8px] font-black text-slate-400">P</p><h1 class="text-xl font-black text-emerald-600">${p}</h1></div>
            <div class="bg-white p-3 rounded-2xl border-b-4 border-rose-500 text-center shadow-sm"><p class="text-[8px] font-black text-slate-400">A</p><h1 class="text-xl font-black text-rose-600">${a}</h1></div>
            <div class="bg-white p-3 rounded-2xl border-b-4 border-amber-500 text-center shadow-sm"><p class="text-[8px] font-black text-slate-400">L</p><h1 class="text-xl font-black text-amber-600">${l}</h1></div>`;
        let html = '';
        stdSnap.forEach(s => {
            const status = records[s.key];
            if(status) {
                html += `
                <div class="flex justify-between items-center p-3.5 bg-white rounded-2xl border border-slate-50 shadow-sm">
                    <div class="min-w-0 pr-2">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[10px] font-black text-blue-600">#${s.val().academic?.rollNo || '0'}</span>
                            <p class="font-black text-slate-800 text-[11px] uppercase truncate">${s.val().profile?.studentName}</p>
                        </div>
                        <p class="text-[9px] font-bold text-slate-400 uppercase">F: ${s.val().parents?.father?.name} | Folio: ${s.key}</p>
                    </div>
                    <span class="px-4 py-1.5 rounded-xl font-black text-[10px] ${status === 'P' ? 'bg-emerald-50 text-emerald-600' : status === 'A' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}">${status}</span>
                </div>`;
            }
        });
        content.innerHTML = html;
    } catch(e) { console.error(e); }
};