window.render_att_take = async function(user) {
    const container = document.getElementById('main-content');
    const myUserId = App.state.user?.uid || "101"; 
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
    <div class="max-w-md mx-auto space-y-4 pb-44 px-3 mt-4 animate-fade">
        
        <div class="flex gap-1 p-1.5 bg-slate-200/60 backdrop-blur-xl rounded-2xl w-full shadow-inner border border-white/50 sticky top-0 z-50">
            <button onclick="switchTab('mark')" id="tab-mark" class="flex-1 py-3 rounded-xl font-black text-[11px] transition-all bg-white text-blue-600 shadow-sm uppercase tracking-wider">
                Marking
            </button>
            <button onclick="switchTab('report')" id="tab-report" class="flex-1 py-3 rounded-xl font-black text-[11px] transition-all text-slate-500 uppercase tracking-wider">
                History
            </button>
        </div>

        <div class="flex p-1 bg-slate-100 rounded-2xl w-full border border-slate-200 shadow-sm">
            <button id="btn-mode-student" onclick="toggleAttMode('student')" class="flex-1 py-2.5 rounded-xl font-black text-[10px] transition-all bg-blue-600 text-white shadow-lg uppercase">Student</button>
            <button id="btn-mode-staff" onclick="toggleAttMode('staff')" class="flex-1 py-2.5 rounded-xl font-black text-[10px] transition-all text-slate-500 uppercase">Staff</button>
            <input type="hidden" id="current-mode" value="student">
        </div>

        <div id="filter-card" class="glass-card p-5 grid grid-cols-2 gap-3 border border-white/40 shadow-2xl rounded-[2rem] bg-white/90">
            <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">Select Branch</label>
                <select id="master-branch-select" class="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></select>
            </div>
            
            <div id="wrapper-class" class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">Class</label>
                <select id="att-class" class="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></select>
            </div>
            <div id="wrapper-section" class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">Section</label>
                <select id="att-section" class="w-full p-4 rounded-2xl bg-slate-100 border-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select</option>
                </select>
            </div>

            <div id="wrapper-report-date" class="col-span-2 hidden">
                <label class="block text-[10px] font-black text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">Target Date</label>
                <input type="date" id="att-date-history" value="${todayStr}" class="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold text-sm text-slate-700">
            </div>

            <div class="col-span-2">
                <button onclick="fetchAction()" class="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-xs shadow-xl uppercase active:scale-95 transition-all tracking-widest">
                    VIEW ROSTER
                </button>
            </div>
        </div>

        <div id="section-mark" class="space-y-4">
            <div id="mark-controls" class="hidden space-y-3">
                <input type="text" id="att-search" onkeyup="filterRows()" placeholder=" Search " 
                       class="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm outline-none font-bold text-sm text-slate-600">
                
                <div class="flex gap-2">
                    <button onclick="markAllP()" class="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg uppercase tracking-wider">Mark All Present</button>
                    <button id="quick-save-btn" onclick="triggerSave()" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] shadow-lg uppercase tracking-wider">Save</button>
                </div>
            </div>
            <div id="list-container" class="space-y-3"></div>
        </div>

        <div id="section-report" class="hidden space-y-4">
            <div id="report-stats" class="grid grid-cols-2 gap-3"></div>
            <div id="report-list" class="space-y-3 pb-20"></div>
        </div>
    </div>`;

    await loadMasterBranches();
};

async function loadMasterBranches() {
    const bSelect = document.getElementById('master-branch-select');
    const branchSnap = await db.ref(`foundation/branches`).once('value');
    let options = '';
    branchSnap.forEach(b => {
        options += `<option value="${b.key}" data-name="${b.val().name}">${b.val().name}</option>`;
    });
    bSelect.innerHTML = options;
    bSelect.onchange = () => populateClasses();
    populateClasses();
}

async function populateClasses() {
    const bSelect = document.getElementById('master-branch-select');
    const branchName = bSelect.options[bSelect.selectedIndex]?.getAttribute('data-name');
    const clsSelect = document.getElementById('att-class');
    const secSelect = document.getElementById('att-section');
    
    const snap = await db.ref('foundation/classes').once('value');
    let html = '<option value="">Class</option>';
    snap.forEach(c => {
        if(c.val().branch === branchName) {
            html += `<option value="${c.val().className}" data-secs="${c.val().sections}">${c.val().className}</option>`;
        }
    });
    clsSelect.innerHTML = html;
    clsSelect.onchange = (e) => {
        const secs = e.target.options[e.target.selectedIndex].getAttribute('data-secs')?.split(',') || [];
        secSelect.innerHTML = secs.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('');
    };
}

window.fetchAction = async function() {
    const bSelect = document.getElementById('master-branch-select');
    const bId = bSelect.value;
    const bName = bSelect.options[bSelect.selectedIndex].getAttribute('data-name');
    const mode = document.getElementById('current-mode').value;
    const isMarkTab = !document.getElementById('section-mark').classList.contains('hidden');
    const date = isMarkTab ? new Date().toISOString().split('T')[0] : document.getElementById('att-date-history').value;
    const month = date.substring(0, 7);
    
    const container = isMarkTab ? document.getElementById('list-container') : document.getElementById('report-list');
    container.innerHTML = '<div class="p-20 text-center"><div class="loader mx-auto"></div></div>';

    try {
        let members = [];
        let dbPath = "";

        if(mode === 'student') {
            const cls = document.getElementById('att-class').value;
            const sec = document.getElementById('att-section').value;
            if(!cls || !sec) return Swal.fire('Wait', 'Select Class/Section', 'warning');
            dbPath = `attendance/${month}/student/${cls}/${sec}`;
            
            const stdSnap = await db.ref('student').orderByChild('academic/branch').equalTo(bName).once('value');
            stdSnap.forEach(s => {
                const d = s.val();
                if(d.academic?.class === cls && d.academic?.section === sec) {
                    members.push({ id: s.key, name: d.profile?.studentName, roll: parseInt(d.academic?.rollNo) || 999, info: `F: ${d.parents?.father?.name || '---'}`, sub: `Folio: ${s.key}` });
                }
            });
            members.sort((a, b) => a.roll - b.roll);
        } else {
            dbPath = `attendance/${month}/staff/${bId}`;
            const empSnap = await db.ref('employees').once('value');
            empSnap.forEach(e => {
                const d = e.val();
                if(d.status === 'active' && (d.branch === bId || d.branch === 'all' || !d.branch)) {
                    members.push({ id: e.key, name: d.name, roll: parseInt(d.empId) || 0, sub: d.designation || 'Staff', info: `Emp ID: ${d.empId || 'N/A'} | ${d.phone || '---'}` });
                }
            });
            members.sort((a, b) => a.roll - b.roll);
        }

        const attSnap = await db.ref(dbPath).once('value');
        const allRecords = attSnap.val() || {};
        
        // Filter out status for ONLY the selected date
        const filteredSavedData = {};
        Object.keys(allRecords).forEach(id => {
            if(allRecords[id] && allRecords[id][date]) {
                filteredSavedData[id] = allRecords[id][date];
            }
        });

        window.currentAttPath = dbPath; 
        window.currentDateKey = date;

        if(!isMarkTab) renderReportView(members, filteredSavedData);
        else renderMarkView(members, filteredSavedData);

    } catch(e) { console.error(e); }
};

function renderMarkView(members, savedAtt) {
    const container = document.getElementById('list-container');
    if(members.length === 0) {
        document.getElementById('mark-controls').classList.add('hidden');
        return container.innerHTML = '<p class="p-10 text-center font-bold text-rose-500 bg-rose-50 rounded-3xl uppercase text-[10px]">No Staff/Students Found</p>';
    }

    document.getElementById('mark-controls').classList.remove('hidden');
    container.innerHTML = members.map(m => {
        const s = savedAtt[m.id] || '';
        const isAdmin = m.id === App.state.user?.uid ? '<span class="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[7px] font-black">YOU</span>' : '';
        return `
        <div class="att-row p-4 rounded-[1.8rem] bg-white border border-slate-100 flex items-center justify-between shadow-sm animate-fade-up" 
              data-id="${m.id}" data-status="${s}" data-search="${m.name} ${m.roll} ${m.id}">
            <div class="min-w-0 flex-1 pr-3">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="bg-slate-800 text-white px-2 py-0.5 rounded-lg text-[8px] font-black">#${m.roll === 999 ? 'NA' : m.roll}</span>
                    <p class="font-black text-slate-800 text-[13px] uppercase truncate">${m.name}${isAdmin}</p>
                </div>
                <p class="text-[9px] font-bold text-slate-400 uppercase leading-tight">${m.info}</p>
                <p class="text-[9px] font-black text-blue-500 mt-1 uppercase opacity-50">${m.sub}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="setStatus(this, 'P')" class="m-btn w-12 h-12 rounded-2xl font-black text-sm transition-all ${s === 'P' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-300'}">P</button>
                <button onclick="setStatus(this, 'A')" class="m-btn w-12 h-12 rounded-2xl font-black text-sm transition-all ${s === 'A' ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-300'}">A</button>
            </div>
        </div>`;
    }).join('');
}

window.setStatus = (btn, s) => {
    const row = btn.closest('.att-row');
    row.querySelectorAll('.m-btn').forEach(b => b.className = "m-btn w-12 h-12 rounded-2xl font-black text-sm bg-slate-100 text-slate-300 transition-all");
    btn.className = `m-btn w-12 h-12 rounded-2xl font-black text-sm transition-all text-white shadow-lg scale-105 ${s === 'P' ? 'bg-emerald-500' : 'bg-rose-500'}`;
    row.setAttribute('data-status', s);
};

window.triggerSave = () => {
    if(!window.currentAttPath || !window.currentDateKey) return;
    saveAll(window.currentAttPath, window.currentDateKey);
};

window.saveAll = async function(path, date) {
    const rows = document.querySelectorAll('.att-row');
    let count = 0;

    try {
        Swal.fire({ title: 'Synchronizing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        for (let r of rows) {
            const id = r.getAttribute('data-id');
            const status = r.getAttribute('data-status');
            if(!status) throw new Error('Please mark all');
            
            // Save inside the ID at specific date key
            await db.ref(`${path}/${id}/${date}`).set(status);
            count++;
        }

        await Swal.fire('Success', 'Attendance Recorded', 'success');
        App.navigate('home');
    } catch(e) { Swal.fire('Incomplete', e.message, 'warning'); }
};

window.toggleAttMode = function(mode) {
    document.getElementById('current-mode').value = mode;
    const isStudent = (mode === 'student');
    document.getElementById('wrapper-class').style.display = isStudent ? 'block' : 'none';
    document.getElementById('wrapper-section').style.display = isStudent ? 'block' : 'none';
    
    document.getElementById('btn-mode-student').className = isStudent ? 'flex-1 py-2.5 rounded-xl font-black text-[10px] bg-blue-600 text-white shadow-lg uppercase' : 'flex-1 py-2.5 rounded-xl font-black text-[10px] text-slate-500 uppercase';
    document.getElementById('btn-mode-staff').className = !isStudent ? 'flex-1 py-2.5 rounded-xl font-black text-[10px] bg-blue-600 text-white shadow-lg uppercase' : 'flex-1 py-2.5 rounded-xl font-black text-[10px] text-slate-500 uppercase';
    document.getElementById('list-container').innerHTML = '';
    document.getElementById('mark-controls').classList.add('hidden');
};

window.switchTab = (tab) => {
    const isMark = tab === 'mark';
    document.getElementById('section-mark').classList.toggle('hidden', !isMark);
    document.getElementById('section-report').classList.toggle('hidden', isMark);
    document.getElementById('wrapper-report-date').classList.toggle('hidden', isMark);
    document.getElementById('tab-mark').className = isMark ? 'flex-1 py-3 rounded-xl font-black text-[11px] bg-white text-blue-600 shadow-sm uppercase' : 'flex-1 py-3 rounded-xl font-black text-[11px] text-slate-500 uppercase';
    document.getElementById('tab-report').className = !isMark ? 'flex-1 py-3 rounded-xl font-black text-[11px] bg-white text-blue-600 shadow-sm uppercase' : 'flex-1 py-3 rounded-xl font-black text-[11px] text-slate-500 uppercase';
    document.getElementById('list-container').innerHTML = '';
};

window.filterRows = () => {
    const v = document.getElementById('att-search').value.toLowerCase();
    document.querySelectorAll('.att-row').forEach(r => {
        r.style.display = r.getAttribute('data-search').toLowerCase().includes(v) ? 'flex' : 'none';
    });
};

window.markAllP = () => {
    document.querySelectorAll('.att-row').forEach(r => {
        if(r.style.display !== 'none') setStatus(r.querySelector('.m-btn:first-child'), 'P');
    });
};

function renderReportView(members, attData) {
    const listCont = document.getElementById('report-list');
    const statsCont = document.getElementById('report-stats');
    document.getElementById('mark-controls').classList.add('hidden');
    
    if(!attData || Object.keys(attData).length === 0) {
        statsCont.innerHTML = '';
        return listCont.innerHTML = '<div class="p-10 text-center text-rose-500 font-bold bg-rose-50 rounded-3xl uppercase text-[10px]">No History Records</div>';
    }

    let p=0, a=0, html='';
    members.forEach(m => {
        const status = attData[m.id];
        if(!status) return;
        if(status==='P') p++; if(status==='A') a++;
        html += `
        <div class="flex justify-between items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div class="min-w-0 flex-1">
                <p class="font-black text-slate-800 text-xs uppercase truncate">${m.name}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase">#${m.roll} | ${m.sub}</p>
            </div>
            <span class="px-4 py-2 rounded-xl font-black text-[10px] ${status === 'P' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
                ${status === 'P' ? 'PRESENT' : 'ABSENT'}
            </span>
        </div>`;
    });

    statsCont.innerHTML = `
        <div class="bg-emerald-50 p-4 rounded-3xl text-center border border-emerald-100">
            <p class="text-[9px] font-black text-emerald-600 uppercase">Present</p>
            <h1 class="text-xl font-black text-emerald-700">${p}</h1>
        </div>
        <div class="bg-rose-50 p-4 rounded-3xl text-center border border-rose-100">
            <p class="text-[9px] font-black text-rose-600 uppercase">Absent</p>
            <h1 class="text-xl font-black text-rose-700">${a}</h1>
        </div>`;
    listCont.innerHTML = html;
}
