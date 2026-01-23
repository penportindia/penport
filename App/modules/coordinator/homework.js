// ==========================================
// 1. CONFIGURATION & GLOBAL STATE
// ==========================================
const IMGBB_API_KEY = 'b33ef9ccbcde8a00fa17a8d1913fad7c';
let currentUploadXHRs = {}; 
let uploadedImageUrls = []; 
let activeBranchName = ""; 

window.render_homework = async function(user) {
    const mainContent = document.getElementById('main-content');
    
    // A. Resolve Branch Name (As per User Logic)
    try {
        const branchSnap = await db.ref('foundation/branches').once('value');
        if (branchSnap.exists()) {
            branchSnap.forEach(b => {
                if (b.key === user.branch || b.val().name === user.branch) {
                    activeBranchName = b.val().name;
                }
            });
        }
    } catch (e) { 
        console.error("Branch Resolve Error", e); 
        activeBranchName = user.branch;
    }

    // B. Advanced Professional CSS (Premium UI)
    const styleInject = `
        <style>
            :root { 
                --glass-bg: rgba(255, 255, 255, 0.95);
                --erp-primary: #4f46e5;
                --erp-dark: #1e293b;
                --erp-accent: #f59e0b;
                --erp-card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            }

            /* Main Layout */
            .module-container { padding: 16px; max-width: 800px; margin: 0 auto; animation: fadeIn 0.5s ease; }
            
            /* Sticky Header */
            .date-strip { 
                background: var(--glass-bg); backdrop-filter: blur(10px);
                padding: 16px 20px; border-radius: 24px; 
                box-shadow: var(--erp-card-shadow); margin-bottom: 24px; 
                display: flex; align-items: center; justify-content: space-between; 
                border: 1px solid rgba(226, 232, 240, 0.8); position: sticky; top: 10px; z-index: 50; 
            }
            .date-input { border: none; font-size: 16px; font-weight: 800; color: var(--erp-dark); outline: none; background: transparent; cursor: pointer; }
            
            /* Add Button State */
            .add-btn { 
                width: 50px; height: 50px; border-radius: 18px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                display: flex; align-items: center; justify-content: center; border:none; 
            }
            .add-btn.enabled { background: var(--erp-dark); color: white; cursor: pointer; transform: rotate(0deg); }
            .add-btn.enabled:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
            .add-btn.disabled { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; pointer-events: none; }
            .add-btn.disabled i { opacity: 0.5; }

            /* Filter System */
            .filter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
            .hw-select { 
                width: 100%; padding: 15px; background: white; border: 1.5px solid #f1f5f9; 
                border-radius: 18px; font-weight: 700; font-size: 14px; color: #334155;
                outline: none; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .hw-select:focus { border-color: var(--erp-primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

            /* Professional Card Design */
            .hw-card { 
                background: white; border-radius: 30px; padding: 24px; 
                box-shadow: var(--erp-card-shadow); border: 1px solid #f8fafc;
                margin-bottom: 20px; position: relative; overflow: hidden;
                transition: transform 0.3s ease;
            }
            .hw-card::before {
                content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 6px;
                background: linear-gradient(to bottom, var(--erp-primary), #c084fc);
            }
            .hw-card:hover { transform: translateY(-4px); }
            
            .coord-badge { 
                position: absolute; top: 20px; right: 20px; background: #f5f3ff; color: #7c3aed; 
                font-size: 9px; font-weight: 900; padding: 6px 12px; border-radius: 10px; 
                text-transform: uppercase; border: 1px solid #ddd6fe;
            }
            
            .class-label { 
                background: #f8fafc; color: #64748b; font-size: 10px; font-weight: 800; 
                padding: 5px 12px; border-radius: 8px; border: 1px solid #f1f5f9; 
            }

            .edit-by-tag { 
                font-size: 10px; font-weight: 800; color: #b45309; background: #fffbeb; 
                padding: 4px 10px; border-radius: 8px; display: inline-flex; align-items: center; 
                gap: 5px; margin-top: 10px; border: 1px solid #fef3c7; 
            }

            .task-content { color: #475569; font-size: 15px; font-weight: 500; line-height: 1.6; margin: 18px 0; }

            /* Bottom Actions */
            .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 18px; border-t: 1.5px solid #f8fafc; }
            .attach-btn-main { 
                background: #f1f5f9; color: #475569; padding: 12px 18px; 
                border-radius: 14px; display: flex; align-items: center; gap: 8px; 
                font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s;
            }
            .attach-btn-main:hover { background: #e2e8f0; }
            
            /* SweetAlert Overrides */
            .swal2-popup { border-radius: 35px !important; padding: 1.5em !important; }
            .hw-textarea { 
                width: 100%; padding: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; 
                border-radius: 20px; font-weight: 600; font-size: 14px; outline: none; resize: none;
            }

            /* Uploaders */
            .upload-status-item { 
                background: white; border: 1px solid #f1f5f9; border-radius: 18px; 
                padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.03);
            }
            .prog-container { flex-grow: 1; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
            .prog-fill { height: 100%; background: var(--erp-primary); width: 0%; transition: width 0.3s ease; }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        </style>
    `;

    const today = new Date().toISOString().split('T')[0];

    mainContent.innerHTML = styleInject + `
        <div class="module-container">
            <div class="date-strip">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-indigo-50 rounded-xl">
                        <i data-lucide="shield-check" class="w-5 h-5 text-indigo-600"></i>
                    </div>
                    <input type="date" id="hw-filter-date" class="date-input" value="${today}" onchange="checkDateAndLoad()">
                </div>
                <button id="coord-add-btn" onclick="openHomeworkModal()" class="add-btn enabled">
                    <i data-lucide="plus" class="w-6 h-6"></i>
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

            <div id="homework-list" class="pb-24"></div>
        </div>
    `;

    await populateClassFilters();
    lucide.createIcons();
    checkDateAndLoad();
};

// ==========================================
// 2. LOGIC & FEED (Dynamic Rendering)
// ==========================================
window.checkDateAndLoad = function() {
    const selectedDate = document.getElementById('hw-filter-date').value;
    const today = new Date().toISOString().split('T')[0];
    const addBtn = document.getElementById('coord-add-btn');

    if (selectedDate !== today) {
        addBtn.classList.replace('enabled', 'disabled');
        addBtn.innerHTML = `<i data-lucide="lock" class="w-5 h-5"></i>`;
    } else {
        addBtn.classList.replace('disabled', 'enabled');
        addBtn.innerHTML = `<i data-lucide="plus" class="w-6 h-6"></i>`;
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
            listDiv.innerHTML = `<div class="py-20 text-center opacity-30 font-black text-xs uppercase tracking-widest">No Homework Records Found</div>`;
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
                <span class="coord-badge">Full Access</span>
                
                <div class="flex flex-wrap gap-2 mb-3">
                    <span class="class-label">CLASS ${hw.className}</span>
                    <span class="class-label">SEC ${hw.section}</span>
                    <span class="class-label" style="color: #6366f1;">${hw.book || 'Default'}</span>
                </div>
                
                <h3 class="text-xl font-black text-slate-800 leading-tight">${hw.subject}</h3>
                
                <div class="flex flex-col gap-1 mt-2">
                    <span class="text-[11px] font-black text-indigo-500 uppercase tracking-tight">Post by: ${hw.teacherName}</span>
                    ${hw.editedBy ? `
                        <div class="edit-by-tag">
                            <i data-lucide="refresh-ccw" class="w-3 h-3"></i> Modified by: ${hw.editedBy}
                        </div>
                    ` : ''}
                </div>

                <div class="task-content">${hw.task}</div>

                <div class="card-footer pt-5 border-t border-slate-50">
                    <div onclick='viewAttachments(${JSON.stringify(hw)})' class="attach-btn-main">
                        <i data-lucide="layers" class="w-5 h-5"></i> 
                        MEDIA ASSETS (${(hw.images?.length || 0) + (hw.videos?.length || 0)})
                    </div>
                    
                    <div class="flex gap-2">
                        <button onclick="editHw('${hw.id}')" class="p-3 text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition">
                            <i data-lucide="pencil-line" class="w-5 h-5"></i>
                        </button>
                        <button onclick="deleteHw('${hw.id}')" class="p-3 text-rose-600 bg-rose-50 rounded-2xl hover:bg-rose-100 transition">
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
// 3. DATABASE OPERATIONS (Ownership Protected)
// ==========================================
async function saveHw(data, editId, originalTeacher = null) {
    let payload = { ...data, timestamp: Date.now() };

    if (editId && originalTeacher) {
        // COORDINATOR EDITING: User logic - persistent teacher info
        payload.teacherName = originalTeacher.name;
        payload.teacherPhone = originalTeacher.phone;
        payload.editedBy = App.state.user.name; 
    } else {
        // NEW ENTRY: Use current logged in coordinator details
        payload.teacherName = App.state.user.name;
        payload.teacherPhone = App.state.user.phone;
        payload.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }

    try {
        const branchRef = db.ref(`homework/${activeBranchName}`);
        if(editId) await branchRef.child(editId).update(payload);
        else await branchRef.push(payload);
        
        Swal.fire({ icon: 'success', title: 'Publication Successful', showConfirmButton: false, timer: 1000 });
    } catch (e) { 
        Swal.fire('Error', e.message, 'error'); 
    }
}

window.editHw = (id) => {
    db.ref(`homework/${activeBranchName}/${id}`).once('value', s => { 
        if(s.exists()) {
            const data = s.val();
            // Logic: Capture original info to pass back on save
            const originalTeacher = { name: data.teacherName, phone: data.teacherPhone };
            openHomeworkModal(id, data, originalTeacher);
        }
    });
};

window.deleteHw = (id) => {
    Swal.fire({
        title: 'Confirm Deletion?',
        text: "This assignment will be removed from all student records.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'YES, DELETE',
        cancelButtonText: 'CANCEL'
    }).then(r => { 
        if(r.isConfirmed) db.ref(`homework/${activeBranchName}/${id}`).remove(); 
    });
};

// ==========================================
// 4. MODAL & UI HELPERS (Premium Components)
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
        title: editId ? 'Update Assignment' : 'New Assignment',
        confirmButtonText: 'PUBLISH TASK',
        confirmButtonColor: '#1e293b',
        showCancelButton: true,
        cancelButtonText: 'DISCARD',
        width: '95%',
        html: `
            <div class="text-left py-2">
                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 ml-1 uppercase">Target Audience</label>
                    <select id="pop-class" class="hw-select" onchange="syncFields(this)">${classOptions}</select>
                    <div class="flex gap-3">
                        <select id="pop-section" class="hw-select"><option value="">Section</option></select>
                        <select id="pop-subject" class="hw-select" onchange="syncBooks(this.value)"><option value="">Subject</option></select>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 ml-1 uppercase">Book Reference</label>
                    <select id="pop-book" class="hw-select"><option value="">Select Book</option></select>
                </div>

                <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 ml-1 uppercase">Task Description</label>
                    <textarea id="pop-task" class="hw-textarea" style="height:120px" placeholder="Enter task details here...">${existingData?.task || ''}</textarea>
                </div>

                <div class="p-5 bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-200">
                    <input type="file" id="pop-images" multiple accept="image/*" class="hidden" onchange="handleImageUpload(this)">
                    <button onclick="document.getElementById('pop-images').click()" class="bg-white border-none shadow-sm p-4 rounded-2xl text-[10px] font-black w-full mb-4 text-slate-600">
                        <i data-lucide="camera" class="w-4 h-4 inline mr-1"></i> ATTACH CAMERA PHOTOS
                    </button>
                    
                    <div id="upload-status-box">
                        ${uploadedImageUrls.map((url, i) => `
                            <div class="upload-status-item" id="old-img-${i}">
                                <img src="${url}" class="w-10 h-10 rounded-lg object-cover">
                                <span class="flex-grow text-[9px] font-bold text-slate-400">STORED FILE</span>
                                <button onclick="removeImageFromQueue('${url}', 'old-img-${i}')" class="w-8 h-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold">×</button>
                            </div>`).join('')}
                    </div>
                    
                    <div id="dynamic-url-container"></div>
                    <button type="button" onclick="addUrlRow()" class="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase mt-2">
                        + ADD EXTERNAL LINK
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
            if(!data.className || !data.subject || !data.task) return Swal.showValidationMessage('Basic details are required!');
            return data;
        }
    });

    if (formValues) saveHw(formValues, editId, originalTeacher);
};

// ==========================================
// 5. UTILITY FUNCTIONS (Dynamic Sync)
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
        row.innerHTML = `<div class="prog-container"><div class="prog-fill" id="fill-${upId}"></div></div><div id="status-${upId}" class="text-[10px] font-bold">0%</div>`;
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
                    <img src="${res.data.url}" class="w-10 h-10 rounded-lg object-cover border-2 border-indigo-500">
                    <span class="flex-grow text-[9px] font-black text-indigo-600 uppercase">File Verified</span>
                    <button onclick="removeImageFromQueue('${res.data.url}', '${upId}')" class="w-8 h-8 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center font-bold">×</button>`;
            }
            delete currentUploadXHRs[upId];
            if (Object.keys(currentUploadXHRs).length === 0) togglePublishBtn(true);
        };
        xhr.send(fd);
    });
};

window.togglePublishBtn = (ready) => { 
    const btn = document.querySelector('.swal2-confirm'); 
    if (btn) { btn.disabled = !ready; btn.style.opacity = ready ? "1" : "0.5"; btn.innerText = ready ? "PUBLISH TASK" : "UPLOADING..."; } 
};

window.removeImageFromQueue = (url, rowId) => { 
    uploadedImageUrls = uploadedImageUrls.filter(u => u !== url); 
    document.getElementById(rowId).remove(); 
};

window.addUrlRow = (val = "") => { 
    const div = document.createElement('div'); 
    div.className = 'flex gap-2 mb-2 items-center'; 
    div.innerHTML = `<input type="text" class="hw-select extra-link mb-0" placeholder="https://..." value="${val}"><button type="button" onclick="this.parentElement.remove()" class="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center font-bold">×</button>`; 
    document.getElementById('dynamic-url-container').appendChild(div); 
};

window.viewAttachments = (hw) => {
    let html = `<div class="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto p-3">`;
    if(hw.images) hw.images.forEach(u => html += `<div class="p-3 bg-white border rounded-[30px] shadow-sm"><img src="${u}" class="w-full rounded-2xl mb-3 shadow-inner"><a href="${u}" target="_blank" class="block w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl text-center">DOWNLOAD ORIGINAL</a></div>`);
    if(hw.videos) hw.videos.forEach(v => html += `<a href="${v}" target="_blank" class="block p-5 bg-indigo-50 text-indigo-700 font-bold rounded-2xl text-[11px] border border-indigo-100 truncate shadow-sm">🔗 RESOURCE LINK: ${v}</a>`);
    html += `</div>`;
    Swal.fire({ title: 'Task Attachments', html, showConfirmButton: false, customClass: { popup: 'rounded-[40px]' } });
};