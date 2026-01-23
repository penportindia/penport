// ==========================================
// 1. CONFIGURATION & GLOBAL STATE
// ==========================================
const IMGBB_API_KEY = 'b33ef9ccbcde8a00fa17a8d1913fad7c';
let currentUploadXHRs = {}; 
let uploadedImageUrls = []; 
let activeBranchName = ""; 
let allBranches = [];

window.render_homework = async function(user) {
    const mainContent = document.getElementById('main-content');
    
    // ==========================================
    // 2. ADVANCED PROFESSIONAL CSS (PREMIUM UI)
    // ==========================================
    const styleInject = `
        <style>
            :root { 
                --glass-bg: rgba(255, 255, 255, 0.95);
                --erp-primary: #4f46e5;
                --erp-dark: #1e293b;
                --erp-accent: #f59e0b;
                --erp-card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            }

            .module-container { padding: 16px; max-width: 800px; margin: 0 auto; animation: fadeIn 0.5s ease; }
            
            /* Admin Branch Switcher Panel */
            .admin-master-panel {
                background: linear-gradient(135deg, #0f172a, #1e293b);
                padding: 24px; border-radius: 30px; margin-bottom: 24px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.1);
                position: relative; overflow: hidden;
            }
            .admin-master-panel::after {
                content: 'ADMIN'; position: absolute; right: -10px; bottom: -10px;
                font-size: 60px; font-weight: 900; color: rgba(255,255,255,0.03);
            }
            .admin-label { color: #94a3b8; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            
            /* FIX: Branch Select Color Improvements */
            .branch-select-master { 
                width: 100%; padding: 16px; 
                background: rgba(255,255,255,0.12); /* Thoda jyada visible background */
                border: 1.5px solid rgba(255,255,255,0.2); 
                border-radius: 20px; 
                color: #ffffff; /* Main text white hi rakha hai kyunki background dark hai */
                font-weight: 800; font-size: 16px; outline: none; cursor: pointer;
                transition: 0.3s; appearance: none;
            }
            
            /* FIX: Dropdown khulne par options ka color (Aapka main issue yahan tha) */
            .branch-select-master option {
                color: #1e293b; /* Dropdown list ke andar text dark dikhega */
                background-color: #ffffff; /* Dropdown list ka background white rahega */
                padding: 10px;
            }

            .branch-select-master:focus { border-color: var(--erp-primary); background: rgba(255,255,255,0.2); }

            /* Sticky Header Logic */
            .date-strip { 
                background: var(--glass-bg); backdrop-filter: blur(12px);
                padding: 16px 22px; border-radius: 26px; 
                box-shadow: var(--erp-card-shadow); margin-bottom: 24px; 
                display: flex; align-items: center; justify-content: space-between; 
                border: 1px solid rgba(226, 232, 240, 0.8); position: sticky; top: 10px; z-index: 50; 
            }
            .date-input { border: none; font-size: 17px; font-weight: 800; color: var(--erp-dark); outline: none; background: transparent; cursor: pointer; }
            
            /* Buttons & Actions */
            .add-btn { 
                width: 54px; height: 54px; border-radius: 20px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                display: flex; align-items: center; justify-content: center; border:none; 
            }
            .add-btn.enabled { background: var(--erp-dark); color: white; cursor: pointer; }
            .add-btn.enabled:hover { transform: scale(1.08) rotate(90deg); background: var(--erp-primary); }
            .add-btn.disabled { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; opacity: 0.7; }

            .filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
            .hw-select { 
                width: 100%; padding: 16px; background: white; border: 1.8px solid #f1f5f9; 
                border-radius: 20px; font-weight: 700; font-size: 14px; color: #334155;
                outline: none; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
            }
            .hw-select:focus { border-color: var(--erp-primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

            /* Professional Card Design */
            .hw-card { 
                background: white; border-radius: 35px; padding: 28px; 
                box-shadow: var(--erp-card-shadow); border: 1px solid #f8fafc;
                margin-bottom: 22px; position: relative; overflow: hidden;
                transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .hw-card::before {
                content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 7px;
                background: linear-gradient(to bottom, var(--erp-primary), #818cf8);
            }
            .hw-card:hover { transform: translateY(-6px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.08); }
            
            .coord-badge { 
                position: absolute; top: 24px; right: 24px; background: #eef2ff; color: #4338ca; 
                font-size: 10px; font-weight: 900; padding: 7px 14px; border-radius: 12px; 
                text-transform: uppercase; border: 1px solid #e0e7ff; letter-spacing: 0.5px;
            }
            
            .class-label { 
                background: #f8fafc; color: #475569; font-size: 11px; font-weight: 800; 
                padding: 6px 14px; border-radius: 10px; border: 1px solid #f1f5f9; 
            }

            .edit-by-tag { 
                font-size: 11px; font-weight: 800; color: #92400e; background: #fffbeb; 
                padding: 6px 12px; border-radius: 10px; display: inline-flex; align-items: center; 
                gap: 6px; margin-top: 12px; border: 1px solid #fef3c7; 
            }

            .task-content { color: #334155; font-size: 16px; font-weight: 500; line-height: 1.7; margin: 20px 0; }

            /* Bottom Actions */
            .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 22px; border-top: 2px solid #f8fafc; }
            .attach-btn-main { 
                background: #f1f5f9; color: #475569; padding: 14px 20px; 
                border-radius: 16px; display: flex; align-items: center; gap: 10px; 
                font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;
            }
            .attach-btn-main:hover { background: #e2e8f0; transform: scale(1.02); }
            
            /* Uploaders & Modal */
            .hw-textarea { 
                width: 100%; padding: 18px; background: #f8fafc; border: 2px solid #e2e8f0; 
                border-radius: 24px; font-weight: 600; font-size: 15px; outline: none; resize: none; transition: 0.3s;
            }
            .hw-textarea:focus { border-color: var(--erp-primary); background: white; }

            .upload-status-item { 
                background: white; border: 1.5px solid #f1f5f9; border-radius: 20px; 
                padding: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 15px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            }
            .prog-container { flex-grow: 1; height: 100%; background: #f1f5f9; border-radius: 12px; overflow: hidden; }
            .prog-fill { height: 10px; background: var(--erp-primary); width: 0%; transition: width 0.4s ease; }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            
            /* Scrollbar */
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        </style>
    `;

    const today = new Date().toISOString().split('T')[0];

    mainContent.innerHTML = styleInject + `
        <div class="module-container">
            <div class="admin-master-panel">
                <span class="admin-label">
                    <i data-lucide="layout-grid" class="w-4 h-4"></i> Administrative Control
                </span>
                <div class="relative">
                    <select id="master-branch-select" class="branch-select-master" onchange="switchBranch(this.value)">
                        <option value="">Syncing All Branches...</option>
                    </select>
                </div>
            </div>

            <div class="date-strip">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-indigo-50 rounded-2xl">
                        <i data-lucide="calendar" class="w-6 h-6 text-indigo-600"></i>
                    </div>
                    <input type="date" id="hw-filter-date" class="date-input" value="${today}" onchange="checkDateAndLoad()">
                </div>
                <button id="coord-add-btn" onclick="openHomeworkModal()" class="add-btn enabled">
                    <i data-lucide="plus" class="w-7 h-7"></i>
                </button>
            </div>

            <div class="filter-row">
                <select id="f-class" class="hw-select" onchange="syncSectionFilter(this)">
                    <option value="ALL">All Classes</option>
                </select>
                <select id="f-section" class="hw-select" onchange="loadCoordinatorFeed()">
                    <option value="ALL">All Sections</option>
                </select>
            </div>

            <div id="homework-list" class="pb-32"></div>
        </div>
    `;

    await loadAdminBranches();
    lucide.createIcons();
};

// ==========================================
// 3. MASTER LOGIC (ADMIN/PRINCIPAL)
// ==========================================
async function loadAdminBranches() {
    try {
        const branchSnap = await db.ref('foundation/branches').once('value');
        const select = document.getElementById('master-branch-select');
        let options = '';
        
        branchSnap.forEach(b => {
            const name = b.val().name;
            options += `<option value="${name}">${name}</option>`;
        });
        
        select.innerHTML = options;
        if(branchSnap.exists()) {
            activeBranchName = Object.values(branchSnap.val())[0].name;
            switchBranch(activeBranchName);
        }
    } catch (e) { console.error("Admin Load Error", e); }
}

window.switchBranch = async function(branchName) {
    activeBranchName = branchName;
    await populateClassFilters();
    checkDateAndLoad(); 
};

// ==========================================
// 4. CORE ENGINE (FEED & LOGIC)
// ==========================================
window.checkDateAndLoad = function() {
    const selectedDate = document.getElementById('hw-filter-date').value;
    const today = new Date().toISOString().split('T')[0];
    const addBtn = document.getElementById('coord-add-btn');

    if (selectedDate !== today) {
        addBtn.classList.replace('enabled', 'disabled');
        addBtn.innerHTML = `<i data-lucide="lock" class="w-6 h-6"></i>`;
    } else {
        addBtn.classList.replace('disabled', 'enabled');
        addBtn.innerHTML = `<i data-lucide="plus" class="w-7 h-7"></i>`;
    }
    lucide.createIcons();
    loadCoordinatorFeed();
};

window.loadCoordinatorFeed = function() {
    const listDiv = document.getElementById('homework-list');
    const selDate = document.getElementById('hw-filter-date').value;
    const selClass = document.getElementById('f-class').value;
    const selSection = document.getElementById('f-section').value;

    db.ref(`homework/${activeBranchName}`).on('value', (snap) => {
        if (!snap.exists()) {
            listDiv.innerHTML = `
                <div class="py-32 text-center opacity-40">
                    <i data-lucide="folder-open" class="w-16 h-16 mx-auto mb-4"></i>
                    <p class="font-black text-xs uppercase tracking-[0.2em]">Zero Records Found in ${activeBranchName}</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        let items = [];
        snap.forEach(child => {
            const hw = child.val();
            if (hw.fullDate === selDate && (selClass === "ALL" || hw.className === selClass) && (selSection === "ALL" || hw.section === selSection)) {
                items.push({...hw, id: child.key});
            }
        });

        listDiv.innerHTML = items.sort((a,b) => b.timestamp - a.timestamp).map(hw => `
            <div class="hw-card">
                <span class="coord-badge">Master Control</span>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="class-label">CLASS ${hw.className}</span>
                    <span class="class-label">SEC ${hw.section}</span>
                    <span class="class-label" style="color: #6366f1; background: #f5f3ff;">${hw.book || 'Default'}</span>
                </div>
                
                <h3 class="text-2xl font-black text-slate-800 leading-tight mb-2">${hw.subject}</h3>
                
                <div class="flex flex-col gap-1">
                    <span class="text-[11px] font-black text-indigo-500 uppercase tracking-tighter">By: ${hw.teacherName}</span>
                    ${hw.editedBy ? `
                        <div class="edit-by-tag">
                            <i data-lucide="user-cog" class="w-3 h-3"></i> ${hw.editedBy}
                        </div>
                    ` : ''}
                </div>

                <div class="task-content">${hw.task}</div>

                <div class="card-footer">
                    <div onclick='viewAttachments(${JSON.stringify(hw)})' class="attach-btn-main">
                        <i data-lucide="layers" class="w-5 h-5"></i> 
                        MEDIA ASSETS (${(hw.images?.length || 0) + (hw.videos?.length || 0)})
                    </div>
                    
                    <div class="flex gap-3">
                        <button onclick="editHw('${hw.id}')" class="p-4 text-indigo-600 bg-indigo-50 rounded-[20px] hover:bg-indigo-100 transition shadow-sm">
                            <i data-lucide="pencil" class="w-5 h-5"></i>
                        </button>
                        <button onclick="deleteHw('${hw.id}')" class="p-4 text-rose-600 bg-rose-50 rounded-[20px] hover:bg-rose-100 transition shadow-sm">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    });
};

// ==========================================
// 5. DATABASE OPERATIONS (ADMIN PERSISTENCE)
// ==========================================
async function saveHw(data, editId, originalTeacher = null) {
    let payload = { ...data, timestamp: Date.now() };

    if (editId && originalTeacher) {
        // Principal editing existing entry
        payload.teacherName = originalTeacher.name;
        payload.teacherPhone = originalTeacher.phone;
        payload.editedBy = "Admin " + App.state.user.name; 
    } else {
        // Admin posting fresh for a branch
        payload.teacherName = App.state.user.name + " (Admin)";
        payload.teacherPhone = App.state.user.phone;
        payload.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }

    try {
        const branchRef = db.ref(`homework/${activeBranchName}`);
        if(editId) await branchRef.child(editId).update(payload);
        else await branchRef.push(payload);
        
        Swal.fire({ 
            icon: 'success', 
            title: 'Assignment Synchronized', 
            text: `Data pushed to ${activeBranchName} successfully.`,
            showConfirmButton: false, 
            timer: 1500,
            customClass: { popup: 'rounded-[30px]' }
        });
    } catch (e) { 
        Swal.fire('Sync Error', e.message, 'error'); 
    }
}

window.editHw = (id) => {
    db.ref(`homework/${activeBranchName}/${id}`).once('value', s => { 
        if(s.exists()) {
            const data = s.val();
            const originalTeacher = { name: data.teacherName, phone: data.teacherPhone };
            openHomeworkModal(id, data, originalTeacher);
        }
    });
};

window.deleteHw = (id) => {
    Swal.fire({
        title: 'Confirm Admin Deletion?',
        text: `This assignment will be permanently removed from ${activeBranchName} database.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'CONFIRM DELETE',
        cancelButtonText: 'KEEP RECORD',
        customClass: { popup: 'rounded-[35px]' }
    }).then(r => { 
        if(r.isConfirmed) db.ref(`homework/${activeBranchName}/${id}`).remove(); 
    });
};

// ==========================================
// 6. MODAL & DYNAMIC FORM SYSTEM
// ==========================================
window.openHomeworkModal = async function(editId = null, existingData = null, originalTeacher = null) {
    uploadedImageUrls = existingData ? (existingData.images || []) : [];
    
    const classSnap = await db.ref('foundation/classes').once('value');
    let classOptions = '<option value="">Choose Class</option>';
    classSnap.forEach(c => { 
        if(c.val().branch === activeBranchName) 
            classOptions += `<option value="${c.val().className}" data-sections="${c.val().sections}">${c.val().className}</option>`; 
    });

    const { value: formValues } = await Swal.fire({
        title: editId ? 'Administrative Edit' : 'Create Branch Task',
        confirmButtonText: 'PUBLISH TASK',
        confirmButtonColor: '#1e293b',
        showCancelButton: true,
        width: '95%',
        html: `
            <div class="text-left py-2" style="max-height: 70vh; overflow-y: auto; padding: 5px;">
                <div class="mb-5">
                    <div class="flex items-center gap-2 mb-2 ml-1">
                         <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">Target: ${activeBranchName}</span>
                    </div>
                    <select id="pop-class" class="hw-select mb-3" onchange="syncFields(this)">${classOptions}</select>
                    <div class="flex gap-3">
                        <select id="pop-section" class="hw-select"><option value="">Section</option></select>
                        <select id="pop-subject" class="hw-select" onchange="syncBooks(this.value)"><option value="">Subject</option></select>
                    </div>
                </div>

                <div class="mb-5">
                    <label class="text-[11px] font-black text-slate-400 ml-1 uppercase mb-2 block">Curriculum Reference</label>
                    <select id="pop-book" class="hw-select"><option value="">Select Resource/Book</option></select>
                </div>

                <div class="mb-6">
                    <label class="text-[11px] font-black text-slate-400 ml-1 uppercase mb-2 block">Assignment Details</label>
                    <textarea id="pop-task" class="hw-textarea" style="height:140px" placeholder="Explain the homework task in detail...">${existingData?.task || ''}</textarea>
                </div>

                <div class="p-6 bg-slate-50 rounded-[35px] border-2 border-dashed border-slate-200">
                    <input type="file" id="pop-images" multiple accept="image/*" class="hidden" onchange="handleImageUpload(this)">
                    <button onclick="document.getElementById('pop-images').click()" class="bg-white border-none shadow-sm p-4 rounded-2xl text-[11px] font-black w-full mb-5 text-slate-600 flex items-center justify-center gap-2">
                        <i data-lucide="camera" class="w-5 h-5"></i> CAPTURE / UPLOAD MEDIA
                    </button>
                    
                    <div id="upload-status-box">
                        ${uploadedImageUrls.map((url, i) => `
                            <div class="upload-status-item" id="old-img-${i}">
                                <img src="${url}" class="w-12 h-12 rounded-xl object-cover">
                                <span class="flex-grow text-[10px] font-black text-slate-400">REMOTE ASSET</span>
                                <button onclick="removeImageFromQueue('${url}', 'old-img-${i}')" class="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold">×</button>
                            </div>`).join('')}
                    </div>
                    
                    <div id="dynamic-url-container"></div>
                    <button type="button" onclick="addUrlRow()" class="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[11px] font-black uppercase mt-3 hover:bg-indigo-100 transition">
                        + ATTACH DIGITAL RESOURCE LINK
                    </button>
                </div>
            </div>`,
        didOpen: () => {
            lucide.createIcons();
            if(existingData) {
                const clEl = document.getElementById('pop-class'); clEl.value = existingData.className;
                syncFields(clEl).then(() => {
                    document.getElementById('pop-section').value = existingData.section;
                    document.getElementById('pop-subject').value = existingData.subject;
                    syncBooks(existingData.subject).then(() => { document.getElementById('pop-book').value = existingData.book; });
                });
                if(existingData.videos) existingData.videos.forEach(v => addUrlRow(v));
                else addUrlRow();
            } else { addUrlRow(); }
        },
        preConfirm: () => {
            const data = {
                className: document.getElementById('pop-class').value,
                section: document.getElementById('pop-section').value,
                subject: document.getElementById('pop-subject').value,
                book: document.getElementById('pop-book').value,
                task: document.getElementById('pop-task').value,
                videos: Array.from(document.querySelectorAll('.extra-link')).map(el => el.value).filter(v => v.trim() !== ""),
                images: uploadedImageUrls,
                fullDate: document.getElementById('hw-filter-date').value
            };
            if(!data.className || !data.subject || !data.task) return Swal.showValidationMessage('Class, Subject & Task are mandatory!');
            return data;
        }
    });

    if (formValues) saveHw(formValues, editId, originalTeacher);
};

// ==========================================
// 7. UTILITY & SYNC HELPERS (COMPLETION)
// ==========================================
async function populateClassFilters() {
    const fClass = document.getElementById('f-class');
    const classSnap = await db.ref('foundation/classes').once('value');
    let options = '<option value="ALL">All Classes</option>';
    classSnap.forEach(c => { 
        if (c.val().branch === activeBranchName) 
            options += `<option value="${c.val().className}" data-sections="${c.val().sections}">${c.val().className}</option>`; 
    });
    fClass.innerHTML = options;
}

window.syncSectionFilter = function(el) {
    const sections = el.options[el.selectedIndex].getAttribute('data-sections')?.split(',') || [];
    let html = '<option value="ALL">All Sections</option>';
    sections.forEach(s => { if(s.trim()) html += `<option value="${s.trim()}">${s.trim()}</option>`; });
    document.getElementById('f-section').innerHTML = html;
    loadCoordinatorFeed();
};

window.syncFields = async function(el) {
    const className = el.value;
    const sections = el.options[el.selectedIndex].getAttribute('data-sections')?.split(',') || [];
    document.getElementById('pop-section').innerHTML = sections.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('');
    
    const subSnap = await db.ref(`foundation/subjects/${className}`).once('value');
    let subHtml = '<option value="">Subject</option>';
    subSnap.forEach(s => { subHtml += `<option value="${s.val().name}">${s.val().name}</option>`; });
    document.getElementById('pop-subject').innerHTML = subHtml;
};

window.syncBooks = async function(subjectName) {
    const className = document.getElementById('pop-class').value;
    const subSnap = await db.ref(`foundation/subjects/${className}`).once('value');
    let bookHtml = '<option value="">Book Selection</option>';
    subSnap.forEach(s => { 
        if(s.val().name === subjectName && s.val().books) 
            s.val().books.forEach(b => { bookHtml += `<option value="${b.title}">${b.title}</option>`; }); 
    });
    document.getElementById('pop-book').innerHTML = bookHtml;
};

window.handleImageUpload = function(input) {
    const container = document.getElementById('upload-status-box');
    Array.from(input.files).forEach(file => {
        const upId = 'up-' + Math.random().toString(36).substr(2, 9);
        const row = document.createElement('div');
        row.id = upId; row.className = 'upload-status-item';
        row.innerHTML = `<div class="prog-container"><div class="prog-fill" id="fill-${upId}"></div></div><div id="status-${upId}" class="text-[11px] font-black">0%</div>`;
        container.appendChild(row);
        
        togglePublishBtn(false);
        const xhr = new XMLHttpRequest();
        currentUploadXHRs[upId] = xhr;
        const fd = new FormData(); fd.append('image', file);
        
        xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, true);
        xhr.upload.onprogress = (e) => {
            const pc = Math.round((e.loaded / e.total) * 100);
            const fill = document.getElementById(`fill-${upId}`);
            if(fill) fill.style.width = pc + '%';
            const status = document.getElementById(`status-${upId}`);
            if(status) status.innerText = pc + '%';
        };
        xhr.onload = () => {
            const res = JSON.parse(xhr.responseText);
            if(res.success) {
                uploadedImageUrls.push(res.data.url);
                document.getElementById(upId).innerHTML = `
                    <img src="${res.data.url}" class="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500">
                    <span class="flex-grow text-[10px] font-black text-indigo-600 uppercase">Cloud Link Verified</span>
                    <button onclick="removeImageFromQueue('${res.data.url}', '${upId}')" class="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold">×</button>`;
            }
            delete currentUploadXHRs[upId];
            if (Object.keys(currentUploadXHRs).length === 0) togglePublishBtn(true);
        };
        xhr.send(fd);
    });
};

window.togglePublishBtn = (ready) => { 
    const btn = document.querySelector('.swal2-confirm'); 
    if (btn) { 
        btn.disabled = !ready; 
        btn.style.opacity = ready ? "1" : "0.5"; 
        btn.innerHTML = ready ? "PUBLISH TASK" : `<i class="fa fa-spinner fa-spin"></i> UPLOADING...`; 
    } 
};

window.removeImageFromQueue = (url, rowId) => { 
    uploadedImageUrls = uploadedImageUrls.filter(u => u !== url); 
    const el = document.getElementById(rowId);
    if(el) el.remove(); 
};

window.addUrlRow = (val = "") => { 
    const div = document.createElement('div'); 
    div.className = 'flex gap-3 mb-3 items-center animate-fadeIn'; 
    div.innerHTML = `
        <input type="text" class="hw-select extra-link mb-0" placeholder="Paste Resource URL (YouTube/Drive)" value="${val}">
        <button type="button" onclick="this.parentElement.remove()" class="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center font-bold">×</button>`; 
    document.getElementById('dynamic-url-container').appendChild(div); 
};

window.viewAttachments = (hw) => {
    let html = `<div class="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto p-4">`;
    if(hw.images) hw.images.forEach(u => html += `
        <div class="p-4 bg-white border rounded-[30px] shadow-sm">
            <img src="${u}" class="w-full rounded-2xl mb-4 shadow-inner">
            <a href="${u}" target="_blank" class="block w-full py-4 bg-slate-900 text-white text-[11px] font-black rounded-2xl text-center">OPEN FULL RESOLUTION</a>
        </div>`);
    if(hw.videos) hw.videos.forEach(v => html += `
        <a href="${v}" target="_blank" class="block p-6 bg-indigo-50 text-indigo-700 font-black rounded-2xl text-[12px] border border-indigo-100 truncate shadow-sm flex items-center gap-3">
            <i data-lucide="external-link" class="w-5 h-5"></i> RESOURCE: ${v}
        </a>`);
    html += `</div>`;
    Swal.fire({ 
        title: 'Task Media & Links', 
        html, 
        showConfirmButton: false, 
        customClass: { popup: 'rounded-[45px]' },
        didOpen: () => lucide.createIcons()
    });
};