let noticeCurrentUploadXHRs = {};
let noticeTempImages = [];
let foundationData = {};
let allNotices = [];
let noticeListenerRefs = [];

const noticeStyles = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
            --primary: #4318FF; --primary-light: #F4F7FE; --important: #EE5D50;
            --success: #01B574; --bg: #F4F7FE; --text-main: #1B254B;
            --text-sec: #707EAE; --white: #FFFFFF; --border: #E9EDF7;
        }
        .erp-notice-panel { background: var(--bg); min-height: 100vh; padding: 20px; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-main); }
        .header-module { background: var(--white); border-radius: 20px; padding: 15px; margin-bottom: 20px; box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.03); }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .header-top h1 { font-size: 22px; font-weight: 800; margin: 0; }
        .search-box { flex: 1; min-width: 100%; }
        .search-box input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: var(--primary-light); font-weight: 600; outline: none; }
        .btn-create { background: var(--primary); color: white; padding: 10px 18px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .notice-stream { display: flex; flex-direction: column; gap: 15px; }
        .notice-card { background: var(--white); border-radius: 20px; padding: 20px; border: 1px solid var(--border); position: relative; }
        .notice-card.is-pinned { border: 2px solid var(--primary); }
        .pin-badge { position: absolute; top: 15px; right: 20px; background: var(--primary); color: white; padding: 4px 10px; border-radius: 20px; font-size: 9px; font-weight: 800; }
        .tag-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
        .tag { padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
        .tag-gen { background: var(--primary-light); color: var(--primary); }
        .tag-imp { background: #FFEEF0; color: var(--important); }
        .tag-branch { background: #E6FAF5; color: var(--success); }
        .tag-audience { background: #F4F7FE; color: #1B254B; border: 1px solid var(--border); }
        .notice-title { font-size: 18px; font-weight: 800; margin-bottom: 6px; color: var(--text-main); }
        .notice-content { font-size: 13px; color: var(--text-sec); line-height: 1.5; margin-bottom: 15px; white-space: pre-wrap; }
        .attachment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 15px; }
        .download-item { position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8f9ff; }
        .download-item img { width: 100%; height: 100%; object-fit: cover; }
        .download-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; opacity: 0; transition: 0.2s; }
        .download-item:active .download-overlay { opacity: 1; }
        .pdf-box { text-align: center; color: var(--important); font-weight: 800; font-size: 10px; }
        .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
        .sender-info { display: flex; align-items: center; gap: 8px; }
        .avatar-small { width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; }
        .sender-det b { font-size: 12px; display: block; line-height: 1.2; }
        .sender-det span { font-size: 10px; color: var(--text-sec); display: block; }
        .action-btns { display: flex; gap: 6px; }
        .btn-circle { width: 35px; height: 35px; border-radius: 10px; border: none; display: flex; align-items: center; justify-content: center; }
        .btn-pin { background: var(--primary-light); color: var(--text-sec); }
        .btn-pin.active { background: var(--primary); color: white; }
        .btn-del { background: #FFEEF0; color: var(--important); }
        .upload-status-item { display: flex; align-items: center; gap: 8px; background: #fff; padding: 10px; border-radius: 10px; border: 1px solid var(--border); margin-top: 5px; }
        .prog-container { flex: 1; height: 6px; background: #eee; border-radius: 10px; overflow: hidden; }
        .prog-fill { height: 100%; background: var(--primary); width: 0%; transition: 0.2s; }
        .input-v3 { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--primary-light); font-weight: 600; font-size: 13px; margin-bottom: 10px; }
        .field-label { font-size: 10px; font-weight: 800; color: var(--text-sec); text-transform: uppercase; margin-bottom: 5px; display: block; }
        .clean-mobile-modal { border-radius: 16px !important; }
        .notice-form-container { text-align: left; }
        .form-group { margin-bottom: 16px; }
        .label-text { font-size: 13px; font-weight: 500; color: #666; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-field { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #E5E5E5; background: #F9F9F9; font-size: 15px; color: #333; box-sizing: border-box; transition: all 0.2s ease; outline: none; -webkit-appearance: none; }
        .input-field:focus { border-color: #007AFF; background: #fff; }
        .input-field:disabled { opacity: 0.7; cursor: not-allowed; background: #eee; }
        .row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .upload-box { border: 1px dashed #CCC; background: #FAFAFA; padding: 15px; border-radius: 10px; text-align: center; margin-top: 5px; }
        .upload-btn { background: #FFF; border: 1px solid #DDD; padding: 8px 16px; border-radius: 6px; font-size: 13px; color: #444; font-weight: 500; }
        #upload-status-box { margin-top: 10px; display: flex; gap: 5px; flex-wrap: 5px; flex-wrap: wrap; }
    </style>`;

const noticeHTML = `
    <div class="erp-notice-panel">
        <div class="header-module">
            <div class="header-top">
                <h1>Notice Board</h1>
                <button onclick="openNoticeModal()" class="btn-create"><i data-lucide="plus"></i> New</button>
            </div>
            <div class="search-box"><input type="text" id="noticeSearch" placeholder="Search notices..." oninput="applyFilters()"></div>
        </div>
        <div id="notice-feed" class="notice-stream"></div>
    </div>`;

window.render_notice = async function(user) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (Object.keys(foundationData).length === 0) {
        const snap = await db.ref('foundation').once('value');
        foundationData = snap.val() || {};
    }

    mainContent.innerHTML = noticeStyles + noticeHTML;
    initNoticeListener();
};

function initNoticeListener() {
    noticeListenerRefs.forEach(({ref, eventType, callback}) => ref.off(eventType, callback));
    noticeListenerRefs = [];

    const noticeRef = db.ref('notices');
    const query = noticeRef.orderByChild('timestamp').limitToLast(30);
    allNotices = [];

    query.on('child_added', snap => {
        const notice = { id: snap.key, ...snap.val() };
        if (!allNotices.find(n => n.id === notice.id)) {
            allNotices.push(notice);
            applyFilters();
        }
    });
    noticeListenerRefs.push({ ref: query, eventType: 'child_added', callback: snap => {
        const notice = { id: snap.key, ...snap.val() };
        if (!allNotices.find(n => n.id === notice.id)) {
            allNotices.push(notice);
            applyFilters();
        }
    }});

    noticeRef.on('child_removed', snap => {
        allNotices = allNotices.filter(n => n.id !== snap.key);
        applyFilters();
    });
    noticeListenerRefs.push({ ref: noticeRef, eventType: 'child_removed', callback: snap => {
        allNotices = allNotices.filter(n => n.id !== snap.key);
        applyFilters();
    }});

    noticeRef.on('child_changed', snap => {
        const index = allNotices.findIndex(n => n.id === snap.key);
        if (index > -1) {
            allNotices[index] = { id: snap.key, ...snap.val() };
            applyFilters();
        }
    });
    noticeListenerRefs.push({ ref: noticeRef, eventType: 'child_changed', callback: snap => {
        const index = allNotices.findIndex(n => n.id === snap.key);
        if (index > -1) {
            allNotices[index] = { id: snap.key, ...snap.val() };
            applyFilters();
        }
    }});
}

window.applyFilters = function() {
    const searchTerm = (document.getElementById('noticeSearch')?.value || "").toLowerCase();
    const userBranchId = App?.state?.user?.branch;
    const userBranchName = foundationData.branches?.[userBranchId]?.name || userBranchId;
    const isSuperAdmin = App?.state?.user?.role === "SUPER_ADMIN";

    let filtered = allNotices.filter(n => {
        const matchesSearch = (n.title?.toLowerCase().includes(searchTerm)) || 
                             (n.msg?.toLowerCase().includes(searchTerm));
        const hasAccess = isSuperAdmin || 
                         (n.branch === "ALL") || 
                         (n.branch === userBranchName);
        return matchesSearch && hasAccess;
    });

    filtered.sort((a, b) => (b.pinned - a.pinned) || (b.timestamp - a.timestamp));
    renderFeed(filtered);
};

window.downloadFile = async function(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        Swal.fire({ icon: 'success', title: 'Downloading...', toast: true, position: 'bottom', showConfirmButton: false, timer: 1500 });
    } catch (e) {
        window.open(url, '_blank');
    }
};

function renderFeed(data) {
    const feed = document.getElementById('notice-feed');
    if (!feed) return;
    if (!data.length) {
        feed.innerHTML = `<div style="text-align:center; padding:40px;">No records found</div>`;
        return;
    }

    const userBranch = App?.state?.user?.branch;
    const isSuperAdmin = App?.state?.user?.role === "SUPER_ADMIN";

    feed.innerHTML = data.map(n => createNoticeCard(n, isSuperAdmin, userBranch)).join('');
    lucide.createIcons();
}

function createNoticeCard(n, isSuperAdmin, userBranch) {
    const canControl = isSuperAdmin || (n.branch === userBranch);
    const attachmentsHTML = (n.images || []).map((url, index) => {
        const isPDF = url.toLowerCase().includes('.pdf');
        const fileName = `${(n.title || 'notice').replace(/\s+/g, '_')}_${index + 1}${isPDF ? '.pdf' : '.jpg'}`;
        return `
            <div class="download-item" onclick="downloadFile('${url}', '${fileName}')">
                ${isPDF ? `
                    <div class="pdf-box"><i data-lucide="file-text" style="width:30px; height:30px"></i><br>PDF</div>
                ` : `
                    <img src="${url}">
                    <div class="download-overlay"><i data-lucide="download"></i></div>
                `}
            </div>`;
    }).join('');

    let scopeLabel = n.branch;
    if (n.class && n.class !== 'ALL') scopeLabel += ` • ${n.class}`;
    if (n.section && n.section !== 'ALL') scopeLabel += ` (${n.section})`;

    return `
        <div class="notice-card ${n.pinned ? 'is-pinned' : ''}">
            ${n.pinned ? `<div class="pin-badge">PINNED</div>` : ''}
            <div class="tag-row">
                <span class="tag ${n.priority === 'IMPORTANT' ? 'tag-imp' : 'tag-gen'}">${n.priority}</span>
                <span class="tag tag-branch">${scopeLabel}</span>
                <span class="tag tag-audience">${n.target || 'ALL'}</span>
            </div>
            <h2 class="notice-title">${n.title}</h2>
            <p class="notice-content">${n.msg}</p>
            <div class="attachment-grid">${attachmentsHTML}</div>
            <div class="card-footer">
                <div class="sender-info">
                    <div class="avatar-small">${(n.sender || 'A').charAt(0)}</div>
                    <div class="sender-det">
                        <b>${n.sender || 'Admin'}</b>
                        <span style="font-weight:700; color:var(--primary)">${n.designation || 'Staff'}</span>
                        <span>${n.fullTime}</span>
                    </div>
                </div>
                <div class="action-btns">
                    ${canControl ? `
                        <button onclick="togglePin('${n.id}', ${n.pinned})" class="btn-circle btn-pin ${n.pinned ? 'active' : ''}">
                            <i data-lucide="pin" style="width:16px"></i>
                        </button>
                        <button onclick="deleteNotice('${n.id}')" class="btn-circle btn-del">
                            <i data-lucide="trash-2" style="width:16px"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>`;
}

window.togglePin = (id, cur) => {
    db.ref('notices').child(id).once('value', snap => {
        const notice = snap.val();
        if (App?.state?.user?.role === "SUPER_ADMIN" || notice.branch === App?.state?.user?.branch) {
            db.ref('notices').child(id).update({ pinned: !cur });
        }
    });
};

window.deleteNotice = (id) => {
    db.ref('notices').child(id).once('value', snap => {
        const notice = snap.val();
        if (App?.state?.user?.role === "SUPER_ADMIN" || notice.branch === App?.state?.user?.branch) {
            Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true }).then(r => {
                if (r.isConfirmed) db.ref('notices').child(id).remove();
            });
        }
    });
};

window.openNoticeModal = async function() {
    noticeTempImages = [];
    noticeCurrentUploadXHRs = {};

    const userBranchId = App?.state?.user?.branch;
    const userBranchName = foundationData.branches?.[userBranchId]?.name || userBranchId;
    const isSuperAdmin = App?.state?.user?.role === "SUPER_ADMIN";

    const branchOptions = isSuperAdmin 
        ? `<option value="ALL">All Branches</option>` + Object.values(foundationData.branches || {}).map(b => `<option value="${b.name}">${b.name}</option>`).join('')
        : `<option value="${userBranchName}">${userBranchName}</option>`;

    const { value: form } = await Swal.fire({
        title: '<span style="font-size:1.1rem; font-weight:600; color:#111;">Create Notice</span>',
        width: '95%', padding: '1.25rem', confirmButtonText: 'Publish', confirmButtonColor: '#007AFF',
        showCloseButton: true, background: '#ffffff',
        customClass: { popup: 'clean-mobile-modal', confirmButton: 'clean-confirm-btn' },
        html: `
            <div class="notice-form-container">
                <div class="row-grid form-group">
                    <div>
                        <label class="label-text">Branch</label>
                        <select id="sw-branch" class="input-field" ${!isSuperAdmin ? 'disabled' : ''} onchange="syncFieldsV4()">
                            ${branchOptions}
                        </select>
                    </div>
                    <div>
                        <label class="label-text">Audience</label>
                        <select id="sw-target" class="input-field" onchange="syncFieldsV4()">
                            <option value="ALL">Everyone</option>
                            <option value="STAFF">Staff</option>
                            <option value="STUDENTS">Students</option>
                        </select>
                    </div>
                </div>
                <div id="v3-sub-filters" class="row-grid form-group" style="display:none;">
                    <div>
                        <label class="label-text">Class</label>
                        <select id="sw-class" class="input-field" onchange="loadSectionsV4(this.value)"></select>
                    </div>
                    <div>
                        <label class="label-text">Section</label>
                        <select id="sw-section" class="input-field"></select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="label-text">Priority</label>
                    <select id="sw-priority" class="input-field">
                        <option value="GENERAL">General</option>
                        <option value="IMPORTANT">Important</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="label-text">Title</label>
                    <input type="text" id="sw-title" class="input-field" placeholder="Notice Headline">
                </div>
                <div class="form-group">
                    <label class="label-text">Message</label>
                    <textarea id="sw-msg" class="input-field" style="height:250px; resize:none;" placeholder="Write message here..."></textarea>
                </div>
                <div class="form-group">
                    <label class="label-text">Attachments</label>
                    <div class="upload-box">
                        <input type="file" id="sw-files" multiple accept="image/*,application/pdf" style="display:none" onchange="handleImageUpload(this)">
                        <button type="button" onclick="document.getElementById('sw-files').click()" class="upload-btn">Add Files</button>
                        <div id="upload-status-box"></div>
                    </div>
                </div>
            </div>`,
        preConfirm: () => {
            const data = {
                branch: isSuperAdmin ? document.getElementById('sw-branch').value : userBranchName,
                target: document.getElementById('sw-target').value,
                class: document.getElementById('sw-class')?.value || 'ALL',
                section: document.getElementById('sw-section')?.value || 'ALL',
                priority: document.getElementById('sw-priority').value,
                title: document.getElementById('sw-title').value,
                msg: document.getElementById('sw-msg').value,
                images: noticeTempImages,
                pinned: false,
                timestamp: Date.now(),
                fullTime: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
                sender: App?.state?.user?.name || "Admin",
                designation: App?.state?.user?.designation || "Admin"
            };
            if (!data.title?.trim() || !data.msg?.trim()) return Swal.showValidationMessage('Required fields missing');
            if (Object.keys(noticeCurrentUploadXHRs).length > 0) return Swal.showValidationMessage('Uploading...');
            return data;
        }
    });

    if (form) {
        await db.ref('notices').push(form);
        Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 2000 }).fire({ icon: 'success', title: 'Notice Sent' });
    }
};

window.syncFieldsV4 = function() {
    const target = document.getElementById('sw-target')?.value;
    const branch = document.getElementById('sw-branch')?.value;
    const subFilters = document.getElementById('v3-sub-filters');
    if (target === 'STUDENTS') {
        subFilters.style.display = 'grid';
        loadClassesV4(branch);
    } else {
        subFilters.style.display = 'none';
    }
};

window.loadClassesV4 = function(branch) {
    let html = '<option value="ALL">All Classes</option>';
    let uniqueClasses = new Set();
    
    Object.values(foundationData.classes || {}).forEach(c => { 
        if (branch === 'ALL' || c.branch === branch) {
            uniqueClasses.add(c.className);
        }
    });
    
    Array.from(uniqueClasses).sort().forEach(cls => {
        html += `<option value="${cls}">${cls}</option>`;
    });

    const clsSel = document.getElementById('sw-class');
    if (clsSel) {
        clsSel.innerHTML = html;
        loadSectionsV4('ALL');
    }
};

window.loadSectionsV4 = function(className) {
    const secSel = document.getElementById('sw-section');
    const branch = document.getElementById('sw-branch')?.value;
    if (!secSel) return;
    if (className === 'ALL') { 
        secSel.innerHTML = '<option value="ALL">All Sections</option>'; 
        return; 
    }
    
    let html = '<option value="ALL">All Sections</option>';
    let uniqueSections = new Set();

    Object.values(foundationData.classes || {}).forEach(c => {
        if (c.className === className && (branch === 'ALL' || c.branch === branch)) {
            c.sections.split(',').forEach(s => uniqueSections.add(s.trim()));
        }
    });

    Array.from(uniqueSections).sort().forEach(s => html += `<option value="${s}">${s}</option>`);
    secSel.innerHTML = html;
};

window.handleImageUpload = function(input) {
    const container = document.getElementById('upload-status-box');
    if (!container) return;
    
    Array.from(input.files).forEach(file => {
        const upId = 'up-' + Math.random().toString(36).substr(2, 9);

        const now = new Date();
        const mmm = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][now.getMonth()];
        const yyyy = now.getFullYear();
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        const newBaseName = `NOTE-${mmm}-${yyyy}-${rand4}`;

        const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
        const finalFileName = extension ? `${newBaseName}.${extension}` : newBaseName;
        const renamedFile = new File([file], finalFileName, { type: file.type });

        const row = document.createElement('div');
        row.id = upId; 
        row.className = 'upload-status-item';
        row.innerHTML = `<div class="prog-container"><div class="prog-fill" id="fill-${upId}"></div></div><span id="status-${upId}" style="font-size:10px">0%</span>`;
        container.appendChild(row);

        const xhr = new XMLHttpRequest();
        noticeCurrentUploadXHRs[upId] = xhr;
        
        const fd = new FormData();
        fd.append('file', renamedFile);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, true);
        
        xhr.upload.onprogress = e => {
            const pc = Math.round((e.loaded / e.total) * 100);
            const fillEl = document.getElementById(`fill-${upId}`);
            const statusEl = document.getElementById(`status-${upId}`);
            if (fillEl) fillEl.style.width = pc + '%';
            if (statusEl) statusEl.textContent = pc + '%';
        };

        xhr.onload = () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (res.secure_url) {
                    noticeTempImages.push(res.secure_url);
                    const rowEl = document.getElementById(upId);
                    if (rowEl) {
                        rowEl.innerHTML = `<span style="color:var(--success); font-size:11px; font-weight:700">✓ ${finalFileName}</span><button onclick="removeImgV4('${upId}', '${res.secure_url}')" style="margin-left:auto; border:none; background:none; color:red; font-weight:800">×</button>`;
                    }
                }
            } catch (e) {}
            delete noticeCurrentUploadXHRs[upId];
        };
        xhr.send(fd);
    });
};

window.removeImgV4 = (divId, url) => {
    noticeTempImages = noticeTempImages.filter(i => i !== url);
    const el = document.getElementById(divId);
    if (el) el.remove();
};

function resetNoticeModule() {
    noticeListenerRefs.forEach(({ref, eventType, callback}) => ref.off(eventType, callback));
    noticeListenerRefs = [];
    noticeTempImages = [];
    allNotices = [];
    Object.values(noticeCurrentUploadXHRs).forEach(xhr => xhr.abort());
    noticeCurrentUploadXHRs = {};
}