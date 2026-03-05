let homeworkCurrentUploadXHRs = {};
let homeworkUploadedImageUrls = [];
let allBranches = [];
let activeBranchName = '';
let homeworkListener = null;
let feedListener = null;

window.render_homework = async function (user) {
    if (window.homeworkListener) {
        db.ref(`homework/${window.activeBranchName || ''}`).off('value');
    }
    
    window.homeworkCurrentUploadXHRs = {};
    window.homeworkUploadedImageUrls = [];
    window.activeBranchName = '';
    
    const mainContent = document.getElementById('main-content');
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
            .branch-select-master { 
                width: 100%; padding: 16px; 
                background: rgba(255,255,255,0.12);
                border: 1.5px solid rgba(255,255,255,0.2); 
                border-radius: 20px; 
                color: #ffffff; 
                font-weight: 800; font-size: 16px; outline: none; cursor: pointer;
                transition: 0.3s; appearance: none;
            }
            .branch-select-master option {
                color: #1e293b;
                background-color: #ffffff;
                padding: 10px;
            }
            .branch-select-master:focus { border-color: var(--erp-primary); background: rgba(255,255,255,0.2); }
            .date-strip { 
                background: var(--glass-bg); backdrop-filter: blur(12px);
                padding: 16px 22px; border-radius: 26px; 
                box-shadow: var(--erp-card-shadow); margin-bottom: 24px; 
                display: flex; align-items: center; justify-content: space-between; 
                border: 1px solid rgba(226, 232, 240, 0.8); position: sticky; top: 10px; z-index: 50; 
            }
            .date-input { border: none; font-size: 17px; font-weight: 800; color: var(--erp-dark); outline: none; background: transparent; cursor: pointer; }
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
            .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 22px; border-top: 2px solid #f8fafc; }
            .attach-btn-main { 
                background: #f1f5f9; color: #475569; padding: 14px 20px; 
                border-radius: 16px; display: flex; align-items: center; gap: 10px; 
                font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;
            }
            .attach-btn-main:hover { background: #e2e8f0; transform: scale(1.02); }
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
                <select id="f-section" class="hw-select" onchange="loadAdminFeed()">
                    <option value="ALL">All Sections</option>
                </select>
            </div>
            <div id="homework-list" class="pb-32"></div>
        </div>
    `;
    
    await loadAdminBranches();
    lucide.createIcons();
};

async function loadAdminBranches() {
    try {
        const branchSnap = await db.ref('foundation/branches').once('value');
        const select = document.getElementById('master-branch-select');
        let options = '';
        
        branchSnap.forEach(b => {
            const name = b.val().name;
            options += `<option value="${name}">${name}</option>`;
        });
        
        select.innerHTML = options || '<option value="">No Branches Found</option>';
        
        if (branchSnap.exists()) {
            const branches = branchSnap.val();
            const firstBranchName = Object.values(branches)[0]?.name || '';
            if (firstBranchName) {
                window.activeBranchName = firstBranchName;
                switchBranch(firstBranchName);
            }
        }
    } catch (error) {
        document.getElementById('master-branch-select').innerHTML = '<option value="">Load Error</option>';
        console.error("Admin Load Error:", error);
    }
}

window.switchBranch = async function (branchName) {
    if (!branchName) return;
    
    window.activeBranchName = branchName;
    await populateClassFilters();
    checkDateAndLoad();
};

window.checkDateAndLoad = function () {
    const selectedDate = document.getElementById('hw-filter-date').value;
    const today = new Date().toISOString().split('T')[0];
    const addBtn = document.getElementById('coord-add-btn');
    
    if (selectedDate !== today) {
        addBtn.className = 'add-btn disabled';
        addBtn.innerHTML = `<i data-lucide="lock" class="w-6 h-6"></i>`;
    } else {
        addBtn.className = 'add-btn enabled';
        addBtn.innerHTML = `<i data-lucide="plus" class="w-7 h-7"></i>`;
    }
    
    lucide.createIcons();
    loadAdminFeed();
};

window.loadAdminFeed = function () {
    const listDiv = document.getElementById('homework-list');
    const selDate = document.getElementById('hw-filter-date').value;
    const selClass = document.getElementById('f-class').value;
    const selSection = document.getElementById('f-section').value;
    
    if (window.homeworkListener) {
        db.ref(`homework/${window.activeBranchName}`).off('value', window.homeworkListener);
        window.homeworkListener = null;
    }
    
    listDiv.innerHTML = '<div class="text-center py-8 opacity-50"><i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-2 animate-spin"></i>Loading...</div>';
    lucide.createIcons();
    
    window.feedListener = db.ref(`homework/${window.activeBranchName}`).on('value', (snap) => {
        if (!snap.exists()) {
            listDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-40">
                    <i data-lucide="ghost" class="w-12 h-12 mb-3"></i>
                    <div class="font-black text-[10px] uppercase tracking-widest">No Homework Found</div>
                </div>`;
            lucide.createIcons();
            return;
        }

        let items = [];
        snap.forEach(child => {
            const hw = child.val();
            if (hw.fullDate === selDate &&
                (selClass === "ALL" || hw.className === selClass) &&
                (selSection === "ALL" || hw.section === selSection)) {
                items.push({ ...hw, id: child.key });
            }
        });

        const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);
        const html = sortedItems.map(hw => {
            const mediaCount = (hw.images?.length || 0) + (hw.videos?.length || 0);
            return `
            <div class="hw-card">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex gap-1.5">
                        <span class="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Class ${hw.className}</span>
                        <span class="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">${hw.section}</span>
                    </div>
                    <div class="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                        <i data-lucide="shield-check" class="w-3 h-3"></i> MASTER CONTROL
                    </div>
                </div>
                <div class="mb-4">
                    <h3 class="text-xl font-black text-slate-900 leading-tight mb-1 tracking-tight">${hw.subject}</h3>
                    <div class="flex items-center gap-1.5 text-indigo-600 mb-3">
                        <i data-lucide="book-open" class="w-3 h-3"></i>
                        <span class="text-[10px] font-bold uppercase tracking-tight">${hw.book || 'General Task'}</span>
                    </div>
                    <p class="task-content line-clamp-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">${hw.task}</p>
                </div>
                <div class="flex flex-col gap-1 mb-4">
                    <div class="flex items-center gap-1.5 opacity-60">
                        <i data-lucide="user" class="w-3 h-3"></i>
                        <span class="text-[9px] font-bold uppercase tracking-tighter text-slate-500">Posted by: ${hw.teacherName}</span>
                    </div>
                    ${hw.editedBy ? `
                        <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-2 rounded-xl border border-emerald-100">
                            <i data-lucide="refresh-ccw" class="w-3.5 h-3.5"></i>
                            <span class="text-[9px] font-bold uppercase tracking-tighter text-emerald-600">Modified by: ${hw.editedBy}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer">
                    <button onclick='viewAttachments(${JSON.stringify(hw)})' class="attach-btn-main">
                        <i data-lucide="files" class="w-4 h-4"></i>
                        <span>${mediaCount > 0 ? mediaCount + ' Assets' : 'No Media'}</span>
                    </button>
                    <div class="flex gap-2">
                        <button onclick="editHw('${hw.id}')" class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 active:scale-95">
                            <i data-lucide="edit-3" class="w-4.5 h-4.5"></i>
                        </button>
                        <button onclick="deleteHw('${hw.id}')" class="w-10 h-10 flex items-center justify-center text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 active:scale-95">
                            <i data-lucide="trash-2" class="w-4.5 h-4.5"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

        listDiv.innerHTML = sortedItems.length > 0 ? html : `
            <div class="flex flex-col items-center justify-center py-20 opacity-30">
                <i data-lucide="clipboard-list" class="w-12 h-12 mb-2 text-slate-400"></i>
                <div class="font-black text-[10px] uppercase">No Assignments Found</div>
            </div>`;
        lucide.createIcons();
    });
};

window.editHw = async (id) => {
    try {
        const snapshot = await db.ref(`homework/${window.activeBranchName}/${id}`).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const originalTeacher = { name: data.teacherName, phone: data.teacherPhone };
            openHomeworkModal(id, data, originalTeacher);
        }
    } catch (error) {
        console.error('Error loading homework:', error);
    }
};

window.deleteHw = async (id) => {
    const result = await Swal.fire({
        title: 'Confirm Admin Deletion?',
        text: `This assignment will be permanently removed from ${window.activeBranchName} database.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        confirmButtonText: 'CONFIRM DELETE',
        cancelButtonText: 'KEEP RECORD',
        customClass: { popup: 'rounded-[35px]' }
    });

    if (result.isConfirmed) {
        try {
            await db.ref(`homework/${window.activeBranchName}/${id}`).remove();
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
};

window.openHomeworkModal = async function (editId = null, existingData = null, originalTeacher = null) {
    window.homeworkUploadedImageUrls = existingData ? (existingData.images || []) : [];
    
    try {
        const classSnap = await db.ref('foundation/classes').once('value');
        let classOptions = '<option value="" disabled selected>Select Class</option>';
        
        classSnap.forEach(c => {
            if (c.val().branch === window.activeBranchName) {
                classOptions += `<option value="${c.val().className}" data-sections="${c.val().sections}">${c.val().className}</option>`;
            }
        });

        const { value: formValues } = await Swal.fire({
            title: editId ? 'Edit Task' : 'New Task',
            confirmButtonText: 'PUBLISH',
            confirmButtonColor: '#000000',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            width: '450px',
            padding: '1rem',
            customClass: {
                popup: 'rounded-[35px] border-none shadow-2xl',
                title: 'text-2xl font-bold text-slate-800 pt-2',
                confirmButton: 'w-full py-4 rounded-2xl text-sm font-semibold mb-2 shadow-none',
                cancelButton: 'w-full py-3 rounded-2xl text-sm font-semibold text-slate-400 bg-transparent'
            },
            html: `
                <div class="text-left">
                    <div class="mb-8 px-1 text-center">
                        <span class="text-[10px] font-black tracking-[3px] text-slate-400 uppercase bg-slate-100 px-4 py-1.5 rounded-full">
                            ${window.activeBranchName}
                        </span>
                    </div>
                    <div class="space-y-4 mb-6">
                        <select id="pop-class" class="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-black transition-all appearance-none" onchange="syncFields(this)">
                            ${classOptions}
                        </select>
                        <div class="grid grid-cols-2 gap-4">
                            <select id="pop-section" class="h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-black transition-all appearance-none">
                                <option value="">Section</option>
                            </select>
                            <select id="pop-subject" class="h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-black transition-all appearance-none" onchange="syncBooks(this.value)">
                                <option value="">Subject</option>
                            </select>
                        </div>
                        <select id="pop-book" class="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-black transition-all appearance-none">
                            <option value="">Resource / Book</option>
                        </select>
                    </div>
                    <div class="mb-6">
                        <textarea id="pop-task" class="w-full p-5 rounded-[25px] border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-black transition-all min-h-[250px] resize-none leading-relaxed" 
                                    placeholder="Describe the homework task here...">${existingData?.task || ''}</textarea>
                    </div>
                    <div class="space-y-4">
                        <input type="file" id="pop-images" multiple accept="image/*,application/pdf" class="hidden" onchange="handleImageUpload(this)">
                        <div id="upload-status-box" class="space-y-3">
                            ${window.homeworkUploadedImageUrls.map((url, i) => `
                                <div class="upload-status-item" id="old-img-${i}">
                                    <img src="${url}" class="w-12 h-12 rounded-xl object-cover border border-slate-50">
                                    <span class="flex-grow text-[12px] font-bold text-slate-600 tracking-tight">Attached Media ${i + 1}</span>
                                    <button onclick="removeImageFromQueue('${url}', 'old-img-${i}')" class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 text-2xl transition-colors">×</button>
                                </div>`).join('')}
                        </div>
                        <div id="dynamic-url-container" class="space-y-3"></div>
                        <div class="grid grid-cols-2 gap-4 pt-2">
                            <button onclick="document.getElementById('pop-images').click()" 
                                    class="bg-white border-2 border-slate-100 py-4 rounded-2xl text-[11px] font-black text-slate-800 hover:border-black hover:bg-black hover:text-white active:scale-95 transition-all uppercase tracking-widest">
                                Add Image/PDF
                            </button>
                            <button type="button" onclick="addUrlRow()" 
                                    class="bg-white border-2 border-slate-100 py-4 rounded-2xl text-[11px] font-black text-slate-800 hover:border-black hover:bg-black hover:text-white active:scale-95 transition-all uppercase tracking-widest">
                                Add Link
                            </button>
                        </div>
                    </div>
                </div>`,
            didOpen: () => {
                if (existingData) {
                    const classEl = document.getElementById('pop-class');
                    classEl.value = existingData.className;
                    syncFields(classEl).then(() => {
                        document.getElementById('pop-section').value = existingData.section;
                        document.getElementById('pop-subject').value = existingData.subject;
                        syncBooks(existingData.subject).then(() => {
                            document.getElementById('pop-book').value = existingData.book;
                        });
                    });
                    if (existingData.videos?.length > 0) {
                        existingData.videos.forEach(v => addUrlRow(v));
                    }
                }
                lucide.createIcons();
            },
            preConfirm: () => {
                const data = {
                    className: document.getElementById('pop-class').value,
                    section: document.getElementById('pop-section').value,
                    subject: document.getElementById('pop-subject').value,
                    book: document.getElementById('pop-book').value,
                    task: document.getElementById('pop-task').value,
                    videos: Array.from(document.querySelectorAll('.extra-link')).map(el => el.value).filter(v => v.trim()),
                    images: window.homeworkUploadedImageUrls,
                    fullDate: document.getElementById('hw-filter-date')?.value || new Date().toISOString().split('T')[0]
                };
                
                if (!data.className || !data.subject || !data.task.trim()) {
                    Swal.showValidationMessage('Please fill all mandatory fields');
                    return false;
                }
                return data;
            }
        });

        if (formValues) {
            saveHw(formValues, editId, originalTeacher);
        }
    } catch (error) {
        console.error('Modal error:', error);
    }
};

async function saveHw(data, editId, originalTeacher = null) {
    const payload = { 
        ...data, 
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    
    if (editId && originalTeacher) {
        payload.teacherName = originalTeacher.name;
        payload.teacherPhone = originalTeacher.phone;
        payload.editedBy = App.state.user.name;
    } else {
        payload.teacherName = App.state.user.name;
        payload.teacherPhone = App.state.user.phone;
    }

    try {
        const branchRef = db.ref(`homework/${window.activeBranchName}`);
        if (editId) {
            await branchRef.child(editId).update(payload);
        } else {
            await branchRef.push(payload);
        }
        Swal.fire({ 
            icon: 'success', 
            title: 'Published Successfully', 
            showConfirmButton: false, 
            timer: 1000 
        });
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

async function populateClassFilters() {
    const fClass = document.getElementById('f-class');
    try {
        const classSnap = await db.ref('foundation/classes').once('value');
        let options = '<option value="ALL">All Classes</option>';
        
        classSnap.forEach(c => {
            if (c.val().branch === window.activeBranchName) {
                options += `<option value="${c.val().className}" data-sections="${c.val().sections}">${c.val().className}</option>`;
            }
        });
        
        fClass.innerHTML = options;
    } catch (error) {
        fClass.innerHTML = '<option value="ALL">Load Error</option>';
    }
}

window.syncSectionFilter = function (el) {
    const sections = el.options[el.selectedIndex].getAttribute('data-sections')?.split(',') || [];
    let html = '<option value="ALL">All Sections</option>';
    
    sections.forEach(s => { 
        if (s.trim()) html += `<option value="${s.trim()}">${s.trim()}</option>`; 
    });
    
    document.getElementById('f-section').innerHTML = html;
    loadAdminFeed();
};

window.syncFields = async function (el) {
    const className = el.value;
    const sections = el.options[el.selectedIndex].getAttribute('data-sections')?.split(',') || [];
    document.getElementById('pop-section').innerHTML = sections.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('');

    try {
        const subSnap = await db.ref(`foundation/subjects/${className}`).once('value');
        let subHtml = '<option value="">Subject</option>';
        
        subSnap.forEach(s => { 
            subHtml += `<option value="${s.val().name}">${s.val().name}</option>`; 
        });
        
        document.getElementById('pop-subject').innerHTML = subHtml;
    } catch (error) {
        document.getElementById('pop-subject').innerHTML = '<option value="">Load Error</option>';
    }
};

window.syncBooks = async function (subjectName) {
    const className = document.getElementById('pop-class').value;
    if (!className || !subjectName) return;
    
    try {
        const subSnap = await db.ref(`foundation/subjects/${className}`).once('value');
        let bookHtml = '<option value="">Book Selection</option>';

        subSnap.forEach(s => {
            if (s.val().name === subjectName && s.val().books) {
                s.val().books.forEach(b => {
                    bookHtml += `<option value="${b.title}">${b.title}</option>`;
                });
            }
        });
        
        bookHtml += `<option value="NOTEBOOK">NOTEBOOK</option>`;
        document.getElementById('pop-book').innerHTML = bookHtml;
    } catch (error) {
        document.getElementById('pop-book').innerHTML = '<option value="">Load Error</option>';
    }
};

window.handleImageUpload = function (input) {
    const container = document.getElementById('upload-status-box');
    
    Array.from(input.files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire('File too large', `${file.name} exceeds 10MB limit.`, 'warning');
            return;
        }

        const upId = 'up-' + Math.random().toString(36).substr(2, 9);
        const row = document.createElement('div');
        row.id = upId;
        row.className = 'upload-status-item';
        row.innerHTML = `
            <div class="prog-container">
                <div class="prog-fill" id="fill-${upId}"></div>
            </div>
            <div id="status-${upId}" class="text-[11px] font-black">0%</div>`;
        container.appendChild(row);

        window.togglePublishBtn(false);

        const xhr = new XMLHttpRequest();
        window.homeworkCurrentUploadXHRs[upId] = xhr;

        const now = new Date();
        const monthShort = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const yyyy = now.getFullYear();
        const unique4 = Math.floor(1000 + Math.random() * 9000);
        const newName = `HW-${monthShort}-${yyyy}-${unique4}`;
        const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
        const finalName = extension ? `${newName}.${extension}` : newName;

        const renamedFile = new File([file], finalName, { type: file.type });
        const fd = new FormData();
        fd.append('file', renamedFile);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, true);

        xhr.upload.onprogress = e => {
            if (!e.lengthComputable) return;
            const pc = Math.round((e.loaded / e.total) * 100);
            const fill = document.getElementById(`fill-${upId}`);
            const status = document.getElementById(`status-${upId}`);
            if (fill) fill.style.width = pc + '%';
            if (status) status.textContent = pc + '%';
        };

        xhr.onload = () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (xhr.status === 200 && res.secure_url) {
                    window.homeworkUploadedImageUrls.push(res.secure_url);
                    const isPDF = file.type === 'application/pdf';
                    const previewHTML = isPDF ? `
                        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 border-2 border-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13a1 1 0 0 1-1-1V3.5zM8 13h1.5a1.5 1.5 0 0 1 0 3H9v2H8v-5zm1 1v1h.5a.5.5 0 0 0 0-1H9zm3-1h1.5a1.5 1.5 0 0 1 0 3H13v2h-1v-5zm1 1v1h.5a.5.5 0 0 0 0-1H13zm3 4h-1v-5h1a2 2 0 0 1 0 4h-.5v1zm0-4v2h.5a1 1 0 0 0 0-2H16z"/>
                            </svg>
                        </div>` : 
                        `<img src="${res.secure_url}" class="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500">`;

                    document.getElementById(upId).innerHTML = `
                        ${previewHTML}
                        <span class="flex-grow text-[10px] font-black text-indigo-600 uppercase">UPLOADED</span>
                        <button onclick="removeImageFromQueue('${res.secure_url}', '${upId}')" class="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold">×</button>`;
                } else {
                    document.getElementById(upId).innerHTML = `<span class="text-red-500 text-[12px]">Upload Failed</span>`;
                }
            } catch (error) {
                document.getElementById(upId).innerHTML = `<span class="text-red-500 text-[12px]">Parse Error</span>`;
            }

            delete window.homeworkCurrentUploadXHRs[upId];
            if (Object.keys(window.homeworkCurrentUploadXHRs).length === 0) {
                window.togglePublishBtn(true);
            }
        };

        xhr.onerror = () => {
            document.getElementById(upId).innerHTML = `<span class="text-red-500 text-[12px]">Network Error</span>`;
            delete window.homeworkCurrentUploadXHRs[upId];
            window.togglePublishBtn(true);
        };

        xhr.send(fd);
    });
    
    input.value = '';
};

window.togglePublishBtn = (ready) => {
    const btn = document.querySelector('.swal2-confirm');
    if (btn) {
        btn.disabled = !ready;
        btn.style.opacity = ready ? "1" : "0.5";
        btn.innerHTML = ready ? "PUBLISH TASK" : '<i class="fa fa-spinner fa-spin"></i> UPLOADING...';
    }
};

window.removeImageFromQueue = (url, rowId) => {
    window.homeworkUploadedImageUrls = window.homeworkUploadedImageUrls.filter(u => u !== url);
    const el = document.getElementById(rowId);
    if (el) el.remove();
    
    if (Object.keys(window.homeworkCurrentUploadXHRs).length === 0) {
        window.togglePublishBtn(true);
    }
};

window.addUrlRow = (val = "") => {
    const div = document.createElement('div');
    div.className = 'flex gap-3 mb-3 items-center';
    div.innerHTML = `
        <input type="text" class="hw-select extra-link" placeholder="Paste Resource URL (YouTube/Drive)" value="${val}">
        <button type="button" onclick="this.parentElement.remove()" class="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center font-bold">×</button>`;
    document.getElementById('dynamic-url-container').appendChild(div);
};

window.viewAttachments = function (hw) {
   window.downloadFile = function(url, filename) {
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isAndroid) {
            window.location.href = url;
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    let html = `<div class="grid grid-cols-1 gap-3 p-1" style="max-height:75vh; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">`;

    if (hw.images?.length > 0) {
        hw.images.forEach((url, i) => {
            const isPDF = url.toLowerCase().includes('.pdf');
            const fileName = isPDF ? `Doc_${i+1}.pdf` : `Img_${i+1}.jpg`;
            
            if (isPDF) {
                html += `
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div class="p-3 border-b border-slate-50 flex items-center gap-3 bg-rose-50/50">
                        <div class="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-md shadow-rose-200">
                            <i data-lucide="file-text" class="text-white w-4 h-4"></i>
                        </div>
                        <div class="flex-grow">
                            <div class="text-[11px] font-bold text-slate-800 uppercase tracking-tight">PDF Document</div>
                            <div class="text-[9px] text-slate-500 font-medium">In-app Preview Enabled</div>
                        </div>
                    </div>
                    <div class="aspect-[3/4] w-full bg-slate-100">
                        <iframe src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true" class="w-full h-full border-none"></iframe>
                    </div>
                    <div class="p-3 bg-white border-t border-slate-50">
                        <button onclick="downloadFile('${url}', '${fileName}')" class="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                            <i data-lucide="download" class="w-4 h-4"></i> Download PDF
                        </button>
                    </div>
                </div>`;
            } else {
                html += `
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div class="p-3 border-b border-slate-50 flex items-center gap-3 bg-blue-50/50">
                        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
                            <i data-lucide="image" class="text-white w-4 h-4"></i>
                        </div>
                        <div class="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Image Preview</div>
                    </div>
                    <div class="p-2 bg-slate-50">
                        <img src="${url}" class="w-full h-auto rounded-xl shadow-inner" loading="lazy">
                    </div>
                    <div class="p-3 bg-white border-t border-slate-50">
                        <button onclick="downloadFile('${url}', '${fileName}')" class="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                            <i data-lucide="download" class="w-4 h-4"></i> Download Image
                        </button>
                    </div>
                </div>`;
            }
        });
    }

    if (hw.videos?.length > 0) {
        hw.videos.forEach(v => {
            html += `
            <div class="bg-indigo-600 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-transform cursor-pointer" onclick="window.open('${v}', '_blank')">
                <div class="w-10 h-10 bg-indigo-500/50 rounded-xl flex items-center justify-center border border-indigo-400">
                    <i data-lucide="play-circle" class="text-white w-6 h-6"></i>
                </div>
                <div class="flex-grow overflow-hidden">
                    <div class="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">Video Lesson</div>
                    <div class="text-[11px] font-medium text-white truncate block decoration-none">${v}</div>
                </div>
                <i data-lucide="external-link" class="text-white/50 w-4 h-4"></i>
            </div>`;
        });
    }

    html += `</div>`;

    Swal.fire({
        html: html,
        showConfirmButton: false,
        showCloseButton: true,
        background: '#f8fafc',
        width: '95%',
        position: 'bottom',
        customClass: { popup: 'rounded-[25px] border-none shadow-2xl !mb-6' },
        didOpen: () => lucide.createIcons()
    });
};

function resetHomeworkMenu() {
    if (window.homeworkListener) {
        db.ref(`homework/${window.activeBranchName}`).off('value', window.homeworkListener);
    }
    if (window.feedListener) {
        db.ref(`homework/${window.activeBranchName}`).off('value', window.feedListener);
    }
    
    window.homeworkListener = null;
    window.feedListener = null;

    Object.values(window.homeworkCurrentUploadXHRs).forEach(xhr => xhr.abort());
    window.homeworkCurrentUploadXHRs = {};
    window.homeworkUploadedImageUrls = [];

    window.activeBranchName = '';
    allBranches = [];

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = '';
    }

    Swal.close();
}
