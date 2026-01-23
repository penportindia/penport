window.render_att_take = async function(user) {
    const container = document.getElementById('main-content');
    const myBranchId = App.state.user?.branch || "-OiGtIvyH7ddD8J6fONr";
    const myUserId = App.state.user?.uid || "101"; 
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-4 pb-32 px-2 md:px-4 animate-fade">
        
        <div class="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl shadow-xl border-b-4 border-blue-600">
            <div>
                <p class="text-sm font-black uppercase" id="branch-display">Loading...</p>
            </div>
            <div class="text-right">
                <p id="live-clock" class="text-[10px] font-bold text-slate-400"></p>
                <p class="text-[9px] font-black text-blue-400 uppercase tracking-tighter">${todayStr}</p>
            </div>
        </div>

        <div class="flex gap-1 p-1 bg-slate-200/50 backdrop-blur-md rounded-2xl w-fit mx-auto shadow-inner border border-white/50">
            <button onclick="switchTab('mark')" id="tab-mark" class="px-8 py-2.5 rounded-xl font-black text-[11px] transition-all bg-white text-blue-600 shadow-sm">MARK ATTENDANCE</button>
            <button onclick="switchTab('report')" id="tab-report" class="px-8 py-2.5 rounded-xl font-black text-[11px] transition-all text-slate-500">VIEW REPORTS</button>
        </div>

        <div class="flex p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
            <button id="btn-mode-student" onclick="toggleAttMode('student')" class="px-10 py-2 rounded-xl font-black text-[10px] transition-all bg-blue-600 text-white shadow-md">STUDENT</button>
            <button id="btn-mode-staff" onclick="toggleAttMode('staff')" class="px-10 py-2 rounded-xl font-black text-[10px] transition-all text-slate-500">STAFF</button>
            <input type="hidden" id="current-mode" value="student">
        </div>

        <div class="glass-card p-3 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 border border-white/40">
            <div id="wrapper-class">
                <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase">Class</label>
                <select id="att-class" class="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-slate-700 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20"></select>
            </div>
            <div id="wrapper-section">
                <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase">Section</label>
                <select id="att-section" class="w-full p-3 rounded-xl bg-slate-50 border-none font-bold text-slate-700 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20"></select>
            </div>
            <div>
                <label class="block text-[9px] font-black text-slate-400 mb-1 uppercase">Selection Date</label>
                <input type="date" id="att-date" value="${todayStr}" class="w-full p-3 rounded-xl bg-slate-100 border-none font-bold text-slate-500 text-[11px] outline-none pointer-events-none opacity-60">
            </div>
            <div class="flex items-end">
                <button onclick="fetchAction('${myBranchId}', '${myUserId}')" class="w-full bg-blue-600 text-white p-3.5 rounded-xl font-black text-[10px] shadow-lg uppercase active:scale-95 transition-all">
                    Load 
                </button>
            </div>
        </div>

        <div id="section-mark" class="space-y-4">
            <div id="mark-controls" class="hidden flex items-center gap-2 px-1">
                <input type="text" id="att-search" onkeyup="filterRows()" placeholder="Search Name, Roll or Folio..." class="flex-1 p-3 rounded-xl bg-white border border-slate-100 shadow-sm font-bold text-xs outline-none">
                <button onclick="markAllP()" class="bg-emerald-500 text-white px-4 py-3 rounded-xl font-black text-[10px] shadow-md uppercase">Mark All P</button>
            </div>
            <div id="list-container" class="space-y-2"></div>
        </div>

        <div id="section-report" class="hidden space-y-4">
            <div id="report-stats" class="grid grid-cols-3 gap-2"></div>
            <div id="report-list" class="space-y-2"></div>
        </div>
    </div>`;

    db.ref(`foundation/branches/${myBranchId}/name`).once('value').then(snap => {
        const bName = snap.val() || "MAIN";
        document.getElementById('branch-display').innerText = `${bName} BRANCH`;
        populateClasses(bName);
        window.currentBranchName = bName; 
    });

    lucide.createIcons();
    
    if(window.attClockInterval) clearInterval(window.attClockInterval);
    window.attClockInterval = setInterval(() => {
        const clock = document.getElementById('live-clock');
        if(clock) clock.innerText = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    }, 1000);
};

window.switchTab = (tab) => {
    const isMark = tab === 'mark';
    const dateInput = document.getElementById('att-date');
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('section-mark').classList.toggle('hidden', !isMark);
    document.getElementById('section-report').classList.toggle('hidden', isMark);
    
    if(isMark) {
        dateInput.value = today;
        dateInput.classList.add('pointer-events-none', 'opacity-60', 'bg-slate-100');
        dateInput.classList.remove('bg-white');
    } else {
        dateInput.classList.remove('pointer-events-none', 'opacity-60', 'bg-slate-100');
        dateInput.classList.add('bg-white');
    }

    document.getElementById('tab-mark').className = isMark ? 'px-8 py-2.5 rounded-xl font-black text-[11px] bg-white text-blue-600 shadow-sm' : 'px-8 py-2.5 rounded-xl font-black text-[11px] text-slate-500';
    document.getElementById('tab-report').className = !isMark ? 'px-8 py-2.5 rounded-xl font-black text-[11px] bg-white text-blue-600 shadow-sm' : 'px-8 py-2.5 rounded-xl font-black text-[11px] text-slate-500';
    
    document.getElementById('list-container').innerHTML = '';
    document.getElementById('report-list').innerHTML = '';
    document.getElementById('report-stats').innerHTML = '';
};

async function populateClasses(branchName) {
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

window.toggleAttMode = function(mode) {
    document.getElementById('current-mode').value = mode;
    const isStudent = (mode === 'student');
    document.getElementById('wrapper-class').style.display = isStudent ? 'block' : 'none';
    document.getElementById('wrapper-section').style.display = isStudent ? 'block' : 'none';
    
    document.getElementById('btn-mode-student').className = isStudent ? 'px-10 py-2 rounded-xl font-black text-[10px] bg-blue-600 text-white shadow-lg' : 'px-10 py-2 rounded-xl font-black text-[10px] text-slate-500';
    document.getElementById('btn-mode-staff').className = !isStudent ? 'px-10 py-2 rounded-xl font-black text-[10px] bg-blue-600 text-white shadow-lg' : 'px-10 py-2 rounded-xl font-black text-[10px] text-slate-500';
};

window.fetchAction = async function(bId, uId) {
    const mode = document.getElementById('current-mode').value;
    const date = document.getElementById('att-date').value;
    const isMarkTab = !document.getElementById('section-mark').classList.contains('hidden');
    const today = new Date().toISOString().split('T')[0];
    
    if(isMarkTab && date !== today) {
        return Swal.fire('Access Denied', 'You can only mark attendance for today!', 'error');
    }

    const container = isMarkTab ? document.getElementById('list-container') : document.getElementById('report-list');
    container.innerHTML = '<div class="loader mx-auto my-10"></div>';

    try {
        let members = [];
        let dbPath = "";
        const bName = window.currentBranchName;

        if(mode === 'student') {
            const cls = document.getElementById('att-class').value;
            const sec = document.getElementById('att-section').value;
            if(!cls || !sec) return Swal.fire('Wait!', 'Select Class & Section', 'warning');
            
            dbPath = `attendance/${date.substring(0,7)}/${date}/student/${cls}/${sec}`;
            
            // OPTIMIZED QUERY
            const stdSnap = await db.ref('student').orderByChild('academic/branch').equalTo(bName).once('value');
            stdSnap.forEach(s => {
                const d = s.val();
                if(d.academic?.class === cls && d.academic?.section === sec) {
                    members.push({ id: s.key, name: d.profile?.studentName, info: `F: ${d.parents?.father?.name}`, roll: d.academic?.rollNo || '0', sub: `Folio: ${s.key}` });
                }
            });
        } else {
            dbPath = `attendance/${date.substring(0,7)}/${date}/staff/${bId}`;
            // OPTIMIZED QUERY
            const empSnap = await db.ref('employees').orderByChild('branch').equalTo(bId).once('value');
            empSnap.forEach(e => {
                const d = e.val();
                if(d.branch === bId && e.key !== uId && d.status === 'active') {
                    members.push({ id: e.key, name: d.name, roll: d.empId || 'S', sub: d.designation, info: `P: ${d.phone || "N/A"}` });
                }
            });
        }

        const attSnap = await db.ref(dbPath).once('value');
        const savedData = attSnap.val() || {};

        if(!isMarkTab) renderReportView(members, savedData);
        else renderMarkView(members, savedData, dbPath);

    } catch(e) { console.error(e); }
};

function renderMarkView(members, savedAtt, path) {
    const container = document.getElementById('list-container');
    if(members.length === 0) return container.innerHTML = '<p class="p-10 text-center font-black text-rose-500 text-[10px]">NO RECORDS FOUND</p>';

    document.getElementById('mark-controls').classList.remove('hidden');
    container.innerHTML = members.map(m => {
        const s = savedAtt[m.id] || '';
        // SEARCH ATTRIBUTE UPDATED: Name + Roll + Folio (m.id)
        return `
        <div class="att-row bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm" 
             data-id="${m.id}" data-status="${s}" data-search="${m.name} ${m.roll} ${m.id}">
            <div class="min-w-0 pr-2">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">${m.roll}</span>
                    <span class="text-slate-400 font-bold text-[9px] uppercase">${m.sub}</span>
                </div>
                <p class="font-black text-slate-800 text-[11px] uppercase truncate">${m.name}</p>
                <p class="text-[9px] font-bold text-slate-500 uppercase">${m.info}</p>
            </div>
            <div class="flex gap-1">
                ${['P', 'A', 'L'].map(status => `
                    <button onclick="setStatus(this, '${status}')" class="m-btn w-10 h-10 rounded-xl border-2 border-slate-50 font-black text-[10px] transition-all ${s === status ? (status==='P'?'bg-emerald-500 text-white border-transparent shadow-md':status==='A'?'bg-rose-500 text-white border-transparent shadow-md':'bg-amber-500 text-white border-transparent shadow-md') : 'text-slate-300'}">${status}</button>
                `).join('')}
            </div>
        </div>`;
    }).join('') + `<button onclick="saveAll('${path}')" class="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl uppercase tracking-widest text-[11px]">Save Today's Attendance</button>`;
}

function renderReportView(members, attData) {
    const listCont = document.getElementById('report-list');
    const statsCont = document.getElementById('report-stats');
    document.getElementById('mark-controls').classList.add('hidden');
    
    if(!attData || Object.keys(attData).length === 0) {
        statsCont.innerHTML = '';
        return listCont.innerHTML = '<p class="p-10 text-center font-black text-rose-500 text-[10px]">NO RECORD FOUND FOR THIS DATE</p>';
    }

    let p=0, a=0, l=0, html='';
    members.forEach(m => {
        const status = attData[m.id];
        if(!status) return;
        if(status==='P') p++; if(status==='A') a++; if(status==='L') l++;
        html += `
        <div class="flex justify-between items-center p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div class="min-w-0 pr-2">
                <p class="font-black text-[11px] text-slate-700 uppercase">${m.name}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase">Roll: ${m.roll} | ${m.sub}</p>
            </div>
            <span class="px-4 py-2 rounded-xl font-black text-[10px] ${status === 'P' ? 'bg-emerald-50 text-emerald-600' : status === 'A' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}">${status}</span>
        </div>`;
    });

    statsCont.innerHTML = `
        <div class="bg-white p-3 rounded-2xl border-b-4 border-emerald-500 text-center"><h1 class="text-lg font-black text-emerald-600">${p}</h1><p class="text-[8px] font-bold text-slate-400">PRESENT</p></div>
        <div class="bg-white p-3 rounded-2xl border-b-4 border-rose-500 text-center"><h1 class="text-lg font-black text-rose-600">${a}</h1><p class="text-[8px] font-bold text-slate-400">ABSENT</p></div>
        <div class="bg-white p-3 rounded-2xl border-b-4 border-amber-500 text-center"><h1 class="text-lg font-black text-amber-600">${l}</h1><p class="text-[8px] font-bold text-slate-400">LEAVE</p></div>`;
    listCont.innerHTML = html;
}

window.setStatus = (btn, s) => {
    const row = btn.closest('.att-row');
    row.querySelectorAll('.m-btn').forEach(b => b.className = "m-btn w-10 h-10 rounded-xl border-2 border-slate-50 font-black text-[10px] text-slate-300");
    const colors = { 'P': 'bg-emerald-500', 'A': 'bg-rose-500', 'L': 'bg-amber-500' };
    btn.className = `m-btn w-10 h-10 rounded-xl border-2 border-transparent text-white font-black shadow-lg ${colors[s]}`;
    row.setAttribute('data-status', s);
};

window.saveAll = async function(path) {
    const today = new Date().toISOString().split('T')[0];
    if(!path.includes(today)) {
        return Swal.fire('Security Alert', 'You are trying to save attendance for a different date. Access Blocked!', 'error');
    }

    const rows = document.querySelectorAll('.att-row');
    const data = {};
    let count = 0;

    rows.forEach(r => { 
        const status = r.getAttribute('data-status');
        if(status && status !== "") {
            data[r.getAttribute('data-id')] = status;
            count++;
        }
    });

    if(count < rows.length) return Swal.fire('Wait!', `Only ${count}/${rows.length} marked. Mark everyone!`, 'warning');

    try {
        Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await db.ref(path).set(data);
        Swal.fire('Success', 'Attendance saved successfully', 'success');
        App.navigate('home');
    } catch(e) { Swal.fire('Error', e.message, 'error'); }
};

window.filterRows = () => {
    const v = document.getElementById('att-search').value.toLowerCase();
    document.querySelectorAll('.att-row').forEach(r => {
        const searchPool = r.getAttribute('data-search').toLowerCase();
        r.style.display = searchPool.includes(v) ? 'flex' : 'none';
    });
};

window.markAllP = () => {
    document.querySelectorAll('.att-row').forEach(r => {
        if(r.style.display !== 'none') {
            const b = r.querySelector('.m-btn:first-child');
            if(b) setStatus(b, 'P');
        }
    });
};