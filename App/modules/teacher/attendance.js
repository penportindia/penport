window.render_att_take = async function(user) {
    const container = document.getElementById('main-content');
    const branchName = App.state.branchName || "MAIN"; 
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
    <div class="max-w-md mx-auto space-y-4 pb-44 px-3 mt-6 animate-fade">
        <div class="flex gap-1 p-1.5 bg-slate-200/60 backdrop-blur-xl rounded-2xl w-full shadow-inner border border-white/50 sticky top-2 z-30">
            <button onclick="switchTab('mark')" id="tab-mark" class="flex-1 py-3 rounded-xl font-black text-[11px] transition-all bg-white text-blue-600 shadow-sm uppercase tracking-wider">
                MARKING
            </button>
            <button onclick="switchTab('report')" id="tab-report" class="flex-1 py-3 rounded-xl font-black text-[11px] transition-all text-slate-500 uppercase tracking-wider">
                HISTORY
            </button>
        </div>

        <div id="section-mark" class="space-y-4">
            <div class="glass-card p-5 grid grid-cols-2 gap-4 border border-white/40 shadow-2xl rounded-[2rem] bg-white/90">
                <div class="col-span-1">
                    <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">Class</label>
                    <select id="att-class" class="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500"></select>
                </div>
                <div class="col-span-1">
                    <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">Section</label>
                    <select id="att-section" class="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500">
                        <option value="">Select</option>
                    </select>
                </div>
                <div class="col-span-2">
                    <button onclick="fetchStudentList('${branchName}')" class="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-xs shadow-lg shadow-blue-100 uppercase active:scale-95 transition-all">
                        VIEW ROSTER
                    </button>
                </div>
            </div>

            <div id="mark-controls" class="hidden space-y-3">
                <input type="text" id="att-search" onkeyup="filterStudents()" placeholder="Search Name or Roll No..." 
                       class="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none font-bold text-sm text-slate-600">
                <div class="flex gap-2">
                    <button onclick="markAllPresent()" class="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg shadow-emerald-100 uppercase">
                        Mark All Present
                    </button>
                    <button id="btn-save-inline" class="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg uppercase">
                        Save
                    </button>
                </div>
            </div>

            <div id="attendance-list-container" class="space-y-3"></div>
        </div>

        <div id="section-report" class="hidden space-y-4">
            <div class="glass-card p-5 space-y-4 bg-white/90 rounded-[2rem] shadow-xl border border-white/40">
                <div>
                    <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase">Select Date</label>
                    <input type="date" id="rep-date" value="${todayStr}" class="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-sm text-slate-700">
                </div>
                <button onclick="generateReport()" class="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black text-xs shadow-xl uppercase active:scale-95">
                    VIEW REPORT
                </button>
            </div>
            <div id="report-stats" class="hidden grid grid-cols-2 gap-3"></div>
            <div id="report-content" class="space-y-3 pb-20"></div>
        </div>
    </div>`;

    lucide.createIcons();
    initAttLogic(branchName);
};

async function initAttLogic(branchName) {
    const classSelect = document.getElementById('att-class');
    const sectionSelect = document.getElementById('att-section');
    
    try {
        const snap = await db.ref('foundation/classes').once('value');
        let classHtml = '<option value="">Class</option>';
        snap.forEach(c => {
            if (c.val().branch === branchName) {
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
        document.getElementById('tab-mark').className = isMark ? 'flex-1 py-3 rounded-xl font-black text-[11px] transition-all bg-white text-blue-600 shadow-sm uppercase tracking-wider' : 'flex-1 py-3 rounded-xl font-black text-[11px] transition-all text-slate-500 uppercase tracking-wider';
        document.getElementById('tab-report').className = !isMark ? 'flex-1 py-3 rounded-xl font-black text-[11px] transition-all bg-white text-blue-600 shadow-sm uppercase tracking-wider' : 'flex-1 py-3 rounded-xl font-black text-[11px] transition-all text-slate-500 uppercase tracking-wider';
    };
}

window.fetchStudentList = async function(branchName) {
    const cls = document.getElementById('att-class').value;
    const sec = document.getElementById('att-section').value;
    if(!cls || !sec) return Swal.fire('Action Required', 'Please select both Class and Section.', 'warning');

    const container = document.getElementById('attendance-list-container');
    container.innerHTML = `<div class="p-20 text-center"><div class="loader mx-auto"></div></div>`;

    try {
        const date = new Date().toISOString().split('T')[0];
        const month = date.substring(0, 7);
        const [stdSnap, attSnap] = await Promise.all([
            db.ref('student').once('value'),
            db.ref(`attendance/${month}/student/${cls}/${sec}`).once('value')
        ]);

        let students = [];
        stdSnap.forEach(c => {
            const d = c.val();
            if(d.academic?.branch === branchName && d.academic?.class === cls && d.academic?.section === sec) {
                students.push({ folio: c.key, ...d });
            }
        });

        students.sort((a, b) => (parseInt(a.academic?.rollNo) || 999) - (parseInt(b.academic?.rollNo) || 999));

        const allRecords = attSnap.val() || {};
        document.getElementById('mark-controls').classList.remove('hidden');
        document.getElementById('btn-save-inline').onclick = () => saveAttendance(cls, sec, date);

        let html = `<div class="space-y-3 pb-20">`;
        students.forEach(s => {
            const savedStatus = allRecords[s.folio] ? allRecords[s.folio][date] : '';
            html += `
            <div class="att-row p-4 rounded-[1.8rem] bg-white border border-slate-100 flex items-center justify-between shadow-sm" 
                 data-folio="${s.folio}" data-status="${savedStatus || ''}"
                 data-search="${s.profile.studentName} ${s.folio} ${s.academic?.rollNo || ''} ${s.parents?.father?.name || ''}">
                <div class="flex-1 min-w-0 pr-3">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-slate-800 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">#${s.academic?.rollNo || 'NA'}</span>
                        <p class="font-black text-slate-800 text-[13px] uppercase truncate">${s.profile.studentName}</p>
                    </div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Father: ${s.parents?.father?.name || '---'}</p>
                    <p class="text-[9px] font-black text-blue-500/40 mt-1 uppercase">Folio: ${s.folio}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="markStatus(this, 'P')" class="m-btn w-12 h-12 rounded-2xl font-black text-sm transition-all ${savedStatus === 'P' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}">P</button>
                    <button onclick="markStatus(this, 'A')" class="m-btn w-12 h-12 rounded-2xl font-black text-sm transition-all ${savedStatus === 'A' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}">A</button>
                </div>
            </div>`;
        });
        container.innerHTML = html + `</div>`;
    } catch(e) { console.error(e); }
};

window.generateReport = async function() {
    const date = document.getElementById('rep-date').value;
    const cls = document.getElementById('att-class').value;
    const sec = document.getElementById('att-section').value;
    const month = date.substring(0, 7);
    const stats = document.getElementById('report-stats');
    const content = document.getElementById('report-content');

    if(!cls || !sec) return Swal.fire('Information', 'Please select Class and Section first.', 'info');
    content.innerHTML = `<div class="p-10 text-center"><div class="loader mx-auto"></div></div>`;

    try {
        const stdSnap = await db.ref('student').once('value');
        const attSnap = await db.ref(`attendance/${month}/student/${cls}/${sec}`).once('value');
        const records = attSnap.val() || {};

        let reportData = [];
        let p=0, a=0;

        stdSnap.forEach(s => {
            const data = s.val();
            const folio = s.key;
            if(data.academic?.class === cls && data.academic?.section === sec) {
                const status = records[folio]?.[date] || null;
                if(status) {
                    if(status === 'P') p++; else a++;
                    reportData.push({
                        folio: folio,
                        name: data.profile?.studentName,
                        roll: data.academic?.rollNo || 999,
                        father: data.parents?.father?.name || '---',
                        status: status
                    });
                }
            }
        });

        if(reportData.length === 0) {
            stats.classList.add('hidden');
            return content.innerHTML = `<div class="p-10 text-center text-rose-500 font-bold uppercase bg-rose-50 rounded-3xl">No Records Found</div>`;
        }

        reportData.sort((x, y) => parseInt(x.roll) - parseInt(y.roll));

        stats.classList.remove('hidden');
        stats.innerHTML = `
            <div class="bg-emerald-50 p-4 rounded-3xl text-center border border-emerald-100 shadow-sm">
                <p class="text-[10px] font-black text-emerald-600 uppercase">Present</p>
                <h1 class="text-2xl font-black text-emerald-700">${p}</h1>
            </div>
            <div class="bg-rose-50 p-4 rounded-3xl text-center border border-rose-100 shadow-sm">
                <p class="text-[10px] font-black text-rose-600 uppercase">Absent</p>
                <h1 class="text-2xl font-black text-rose-700">${a}</h1>
            </div>`;

        let html = '';
        reportData.forEach(item => {
            html += `
            <div class="flex justify-between items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-[9px] font-black text-white bg-slate-800 px-1.5 py-0.5 rounded">#${item.roll == 999 ? 'NA' : item.roll}</span>
                        <p class="font-black text-slate-800 text-xs uppercase truncate">${item.name}</p>
                    </div>
                    <p class="text-[10px] font-bold text-slate-500 uppercase leading-tight">Father: ${item.father}</p>
                    <p class="text-[9px] font-black text-blue-500/30 uppercase">Folio: ${item.folio}</p>
                </div>
                <div class="ml-3">
                    <span class="px-4 py-2 rounded-xl font-black text-[11px] ${item.status === 'P' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
                        ${item.status === 'P' ? 'PRESENT' : 'ABSENT'}
                    </span>
                </div>
            </div>`;
        });
        content.innerHTML = html;
    } catch(e) { console.error(e); }
};

window.markStatus = function(btn, status) {
    const row = btn.closest('.att-row');
    row.querySelectorAll('.m-btn').forEach(b => b.className = 'm-btn w-12 h-12 rounded-2xl font-black text-sm bg-slate-100 text-slate-300 transition-all');
    btn.className = `m-btn w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-lg ${status === 'P' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`;
    row.setAttribute('data-status', status);
};

window.markAllPresent = function() {
    document.querySelectorAll('.att-row').forEach(row => {
        if(row.style.display !== 'none') markStatus(row.querySelector('.m-btn:first-child'), 'P');
    });
};

window.filterStudents = function() {
    const q = document.getElementById('att-search').value.toLowerCase();
    document.querySelectorAll('.att-row').forEach(row => {
        row.style.display = row.getAttribute('data-search').toLowerCase().includes(q) ? 'flex' : 'none';
    });
};

window.saveAttendance = async function(cls, sec, date) {
    const month = date.substring(0, 7);
    const rows = document.querySelectorAll('.att-row');

    try {
        Swal.fire({ title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        for (let r of rows) {
            const folio = r.getAttribute('data-folio');
            const status = r.getAttribute('data-status');
            if (!status) throw new Error('Please mark all');
            
            await db.ref(`attendance/${month}/student/${cls}/${sec}/${folio}/${date}`).set(status);
        }

        await Swal.fire('Success', 'Attendance Recorded', 'success');
        App.navigate('home');
    } catch(e) {
        Swal.fire('Incomplete Data', e.message, 'error');
    }
};