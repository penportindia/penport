// ==========================================
// 1. CONFIGURATION & GLOBAL STATE
// ==========================================
const IMGBB_API_KEY = 'b33ef9ccbcde8a00fa17a8d1913fad7c';
let currentUploadXHRs = {}; 
let uploadedImageUrls = []; 
let activeBranchName = ""; 

window.render_homework = async function(user) {
    const mainContent = document.getElementById('main-content');
    const teacherPhone = user.phone;
    const userRole = user.role || "teacher"; 

    // Branch Resolution
    try {
        const branchSnap = await db.ref('foundation/branches').once('value');
        if (branchSnap.exists()) {
            branchSnap.forEach(b => {
                if (b.key === user.branch || b.val().name === user.branch) {
                    activeBranchName = b.val().name;
                }
            });
        }
    } catch (e) { activeBranchName = user.branch; }

    const styleInject = `
        <style>
            .date-strip { background: white; padding: 12px 16px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border: 1px solid #f1f5f9; position: sticky; top: 10px; z-index: 50; }
            .date-input { border: none; font-size: 16px; font-weight: 800; color: #1e293b; outline: none; background: transparent; cursor: pointer; }
            
            .hw-card { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); border-left: 6px solid #f59e0b; margin-bottom: 16px; position: relative; border: 1px solid #f1f5f9; transition: 0.3s; }
            .owner-badge { position: absolute; top: 15px; right: 15px; background: #ecfdf5; color: #059669; font-size: 8px; font-weight: 900; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
            
            .modified-tag { font-size: 9px; font-weight: 800; color: #b45309; background: #fffbeb; padding: 4px 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; border: 1px solid #fef3c7; }

            .btn-add-hw { background: #0f172a; color: white; border: none; padding: 12px; width: 48px; height: 48px; border-radius: 14px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
            .btn-add-hw:disabled { background: #e2e8f0 !important; color: #94a3b8 !important; cursor: not-allowed; }

            .attach-btn-main { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 14px; display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: 0.2s; }
            
            .upload-status-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; }
            .prog-container { flex-grow: 1; height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
            .prog-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); width: 0%; transition: width 0.3s; }
            
            .hw-select, .hw-textarea { width: 100%; padding: 14px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 14px; font-weight: 700; font-size: 14px; margin-bottom: 12px; outline: none; }
            .remove-prev-btn { background: #fee2e2; color: #ef4444; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        </style>
    `;

    const today = new Date().toISOString().split('T')[0];
    mainContent.innerHTML = styleInject + `
        <div class="p-4">
            <div class="date-strip">
                <div class="flex items-center gap-2">
                    <i data-lucide="calendar" class="w-5 h-5 text-amber-500"></i>
                    <input type="date" id="hw-filter-date" class="date-input" value="${today}" onchange="loadTeacherFeed('${teacherPhone}')">
                </div>
                <button id="add-hw-btn" onclick="openHomeworkModal()" class="btn-add-hw shadow-lg">
                    <i data-lucide="plus" class="w-6 h-6"></i>
                </button>
            </div>
            <div id="homework-list" class="pb-24"></div>
        </div>
    `;
    lucide.createIcons();
    loadTeacherFeed(teacherPhone);
};

// ==========================================
// 2. FEED RENDERING (Same as Coordinator Card Control)
// ==========================================
window.loadTeacherFeed = function(phone) {
    const listDiv = document.getElementById('homework-list');
    const selDate = document.getElementById('hw-filter-date').value;
    const addBtn = document.getElementById('add-hw-btn');
    const today = new Date().toISOString().split('T')[0];

    // Lock Add Button for back/future dates
    addBtn.disabled = (selDate !== today);
    addBtn.style.opacity = (selDate !== today) ? "0.3" : "1";

    db.ref(`homework/${activeBranchName}`).on('value', (snap) => {
        if (!snap.exists()) {
            listDiv.innerHTML = `<div class="p-20 text-center opacity-30 font-black text-xs uppercase">No Data</div>`;
            return;
        }

        let html = '';
        let items = [];
        snap.forEach(child => {
            const hw = child.val();
            // Sirf teacher ka apna aur selected date ka data
            if (hw.fullDate === selDate && hw.teacherPhone === phone) {
                items.push({...hw, id: child.key});
            }
        });

        items.sort((a,b) => b.timestamp - a.timestamp).forEach(hw => {
            const totalMedia = (hw.images?.length || 0) + (hw.videos?.length || 0);
            html += `
                <div class="hw-card">
                    <span class="owner-badge">MY POST</span>
                    <div class="flex gap-2 mb-2">
                        <span class="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">CLASS ${hw.className}</span>
                        <span class="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">SEC ${hw.section}</span>
                    </div>
                    <h3 class="text-lg font-black text-slate-800 leading-tight">${hw.subject}</h3>
                    <p class="text-[10px] font-bold text-amber-600 mb-2 uppercase">Book: ${hw.book || 'N/A'}</p>
                    
                    ${hw.editedBy ? `
                        <div class="modified-tag">
                            <i data-lucide="user-check" class="w-3 h-3"></i> Modified by Coordinator: ${hw.editedBy}
                        </div>
                    ` : ''}

                    <p class="text-slate-600 text-sm font-medium my-4">${hw.task}</p>
                    
                    <div class="flex justify-between items-center pt-4 border-t border-slate-50">
                        <div onclick='viewAttachments(${JSON.stringify(hw)})' class="attach-btn-main">
                            <i data-lucide="layers" class="w-5 h-5"></i> 
                            MEDIA ASSETS (${(hw.images?.length || 0) + (hw.videos?.length || 0)})
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editHw('${hw.id}')" class="p-2 text-blue-500 bg-blue-50 rounded-xl"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                            <button onclick="deleteHw('${hw.id}')" class="p-2 text-rose-500 bg-rose-50 rounded-xl"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                    <div class="mt-3 text-[9px] font-black text-slate-400 uppercase">By: ${hw.teacherName}</div>
                </div>`;
        });

        listDiv.innerHTML = items.length > 0 ? html : `<div class="p-20 text-center opacity-20 font-black text-xs uppercase">No Tasks Available</div>`;
        lucide.createIcons();
    });
};

// ==========================================
// 3. ATTACHMENT MODAL (Ditto Same Control)
// ==========================================
window.viewAttachments = function(hw) {
    let html = `<div class="popup-gallery" style="display: grid; grid-template-columns: 1fr; gap: 15px; max-height: 450px; overflow-y: auto; padding: 5px;">`;
    if(hw.images) {
        hw.images.forEach(url => {
            html += `
                <div class="pop-img-card border rounded-xl p-2 mb-2">
                    <img src="${url}" class="rounded-lg w-full mb-2">
                    <a href="${url}" target="_blank" class="block bg-slate-900 text-white text-[10px] p-2 text-center rounded-lg font-bold">VIEW FULL IMAGE</a>
                </div>`;
        });
    }
    if(hw.videos) {
        hw.videos.forEach(v => {
            html += `<a href="${v}" target="_blank" class="block p-4 bg-blue-50 text-blue-700 rounded-2xl text-[11px] font-bold mb-2 truncate border border-blue-100">🔗 LINK: ${v}</a>`;
        });
    }
    html += `</div>`;
    Swal.fire({ title: 'Attachments', html, showConfirmButton: false });
};

// ==========================================
// 4. SAVE & EDIT LOGIC (Modified By Logic)
// ==========================================
async function saveHw(data, editId, originalInfo = null) {
    let payload = { ...data, timestamp: Date.now() };

    if (editId && originalInfo) {
        payload.teacherName = originalInfo.teacherName;
        payload.teacherPhone = originalInfo.teacherPhone;
        // Edit logic for modified-by tag
        if (App.state.user.role === 'coordinator' && App.state.user.phone !== originalInfo.teacherPhone) {
            payload.editedBy = App.state.user.name;
        }
    } else {
        payload.teacherName = App.state.user.name;
        payload.teacherPhone = App.state.user.phone;
        payload.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }

    try {
        if(editId) await db.ref(`homework/${activeBranchName}/${editId}`).update(payload);
        else await db.ref(`homework/${activeBranchName}`).push(payload);
        Swal.fire({ icon: 'success', title: 'Done!', showConfirmButton: false, timer: 1000 });
    } catch (e) { Swal.fire('Error', e.message, 'error'); }
}

window.editHw = (id) => {
    db.ref(`homework/${activeBranchName}/${id}`).once('value', s => { 
        if(s.exists()) {
            const d = s.val();
            openHomeworkModal(id, d, { teacherName: d.teacherName, teacherPhone: d.teacherPhone });
        }
    });
};

window.deleteHw = (id) => {
    Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' })
    .then(r => { if(r.isConfirmed) db.ref(`homework/${activeBranchName}/${id}`).remove(); });
};

// ==========================================
// 5. INPUT MODAL (Ditto Same UI)
// ==========================================
window.openHomeworkModal = async function(editId = null, existingData = null, originalInfo = null) {
    uploadedImageUrls = existingData ? (existingData.images || []) : [];
    
    const classSnap = await db.ref('foundation/classes').once('value');
    let classOptions = '<option value="">Choose Class</option>';
    classSnap.forEach(c => { 
        if(c.val().branch === activeBranchName) 
            classOptions += `<option value="${c.val().className}" data-sections="${c.val().sections}">${c.val().className}</option>`; 
    });

    const { value: formValues } = await Swal.fire({
        title: editId ? 'Update' : 'New Homework',
        confirmButtonText: 'PUBLISH',
        confirmButtonColor: '#0f172a',
        showCancelButton: true,
        html: `
            <div class="text-left">
                <select id="pop-class" class="hw-select" onchange="syncFields(this)">${classOptions}</select>
                <div class="flex gap-2">
                    <select id="pop-section" class="hw-select"><option value="">Section</option></select>
                    <select id="pop-subject" class="hw-select" onchange="syncBooks(this.value)"><option value="">Subject</option></select>
                </div>
                <select id="pop-book" class="hw-select"><option value="">Book</option></select>
                <textarea id="pop-task" class="hw-textarea" style="height:120px" placeholder="Details...">${existingData?.task || ''}</textarea>
                
                <div class="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <input type="file" id="pop-images" multiple accept="image/*" class="hidden" onchange="handleImageUpload(this)">
                    <button onclick="document.getElementById('pop-images').click()" class="bg-white border p-3 rounded-xl text-[10px] font-black w-full mb-3 shadow-sm">+ ADD PHOTOS</button>
                    <div id="upload-status-box">
                        ${uploadedImageUrls.map((url, i) => `
                            <div class="upload-status-item" id="old-img-${i}">
                                <img src="${url}" class="w-10 h-10 rounded-lg object-cover">
                                <div class="flex-grow text-[9px] font-bold text-slate-400">STORED</div>
                                <button onclick="removeImageFromQueue('${url}', 'old-img-${i}')" class="remove-prev-btn">×</button>
                            </div>`).join('')}
                    </div>
                    <div id="dynamic-url-container"></div>
                    <button type="button" onclick="addUrlRow()" class="w-full py-2 mt-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">+ ADD LINK</button>
                </div>
            </div>`,
        didOpen: () => {
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
            if(!data.className || !data.subject || !data.task) return Swal.showValidationMessage('Required!');
            return data;
        }
    });

    if (formValues) saveHw(formValues, editId, originalInfo);
};

// HELPERS (Upload, Sync, etc.)
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
            document.getElementById(`fill-${upId}`).style.width = pc + '%';
            document.getElementById(`status-${upId}`).innerText = pc + '%';
        };
        xhr.onload = () => {
            const res = JSON.parse(xhr.responseText);
            if(res.success) {
                uploadedImageUrls.push(res.data.url);
                document.getElementById(upId).innerHTML = `<img src="${res.data.url}" class="w-10 h-10 rounded-lg object-cover border-2 border-green-500"><div class="flex-grow text-[9px] font-bold text-green-600">UPLOADED</div><button onclick="removeImageFromQueue('${res.data.url}', '${upId}')" class="remove-prev-btn">×</button>`;
            }
            delete currentUploadXHRs[upId];
            if (Object.keys(currentUploadXHRs).length === 0) togglePublishBtn(true);
        };
        xhr.send(fd);
    });
};

window.togglePublishBtn = (ready) => { const btn = document.querySelector('.swal2-confirm'); if(btn) { btn.disabled = !ready; btn.style.opacity = ready ? "1" : "0.5"; } };
window.removeImageFromQueue = (url, id) => { uploadedImageUrls = uploadedImageUrls.filter(u => u !== url); document.getElementById(id)?.remove(); };
window.addUrlRow = (val = "") => { const div = document.createElement('div'); div.className = 'flex gap-2 mt-2'; div.innerHTML = `<input type="text" class="hw-select extra-link mb-0" placeholder="URL..." value="${val}"><button type="button" onclick="this.parentElement.remove()" class="remove-prev-btn">×</button>`; document.getElementById('dynamic-url-container').appendChild(div); };
window.syncFields = async function(el) { const className = el.value; const sections = el.options[el.selectedIndex].getAttribute('data-sections')?.split(',') || []; document.getElementById('pop-section').innerHTML = sections.map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join(''); const subSnap = await db.ref(`foundation/subjects/${className}`).once('value'); let subHtml = '<option value="">Subject</option>'; subSnap.forEach(s => { subHtml += `<option value="${s.val().name}">${s.val().name}</option>`; }); document.getElementById('pop-subject').innerHTML = subHtml; };
window.syncBooks = async function(subjectName) { const className = document.getElementById('pop-class').value; const subSnap = await db.ref(`foundation/subjects/${className}`).once('value'); let bookHtml = '<option value="">Book</option>'; subSnap.forEach(s => { if(s.val().name === subjectName && s.val().books) s.val().books.forEach(b => { bookHtml += `<option value="${b.title}">${b.title}</option>`; }); }); document.getElementById('pop-book').innerHTML = bookHtml; };